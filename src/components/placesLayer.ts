/**
 * 地名图层：城市（首都 / 省会 / 大城市）+ 选中国家的一级行政区。
 *
 * 几千个地名不能用 globe.gl 的 HTML 图层（每个都是一个 DOM 节点、逐帧改样式），
 * 这里改为一张 2D canvas 覆盖层：相机变化时把候选点投影到屏幕，按重要程度依次占位，
 * 互相重叠的直接跳过 —— 缩得越近，空间越多，地名自然越密。
 * 省级边界是 three 的线段（一次 draw call），跟地形一起起伏。
 */
import type { GlobeInstance } from 'globe.gl'
import type { Feature, Geometry } from 'geojson'
import type { LineBasicMaterial, LineSegments, PerspectiveCamera } from 'three'
import { Vector3 } from 'three'
import type { Lang } from '../i18n/pick'
import { buildDrapedBorders } from './terrainBorders'
import type { ElevationSampler } from '../data/terrain'

/** [lat, lng, 人口, 类别(0 首都/1 省会/2 城市), cca3, 中, 英, 日, 俄]（scripts/build-places.mjs） */
export type CityRow = [number, number, number, 0 | 1 | 2, string, string, string, string, string]

export interface AdminProps {
  zh: string
  en: string
  ja: string
  ru: string
  lat: number
  lng: number
  r: number
}
export type AdminFeature = Feature<Geometry, AdminProps>

/** 同时绘制的地名上限：再多就成了一片字 */
const MAX_LABELS = 180
/** 避让网格的格子边长（CSS 像素） */
const CELL = 64

interface Item {
  lat: number
  lng: number
  pos: Vector3
  /** 'region' = 省级区划名，其余为城市类别 */
  kind: 'region' | 0 | 1 | 2
  pop: number
  country: string
  names: Record<Lang, string>
  /** 缓存的文字宽度（语言变化时清空） */
  width?: number
}

interface Rect { l: number; t: number; r: number; b: number }

export interface PlacesLayerOptions {
  world: GlobeInstance
  canvas: HTMLCanvasElement
}

export interface PlacesLayer {
  setCities(rows: CityRow[]): void
  /** 选中国家的省级区划（null = 清除） */
  setRegions(country: string | null, feats: AdminFeature[] | null): void
  setLanguage(lang: Lang): void
  setEnabled(on: boolean): void
  /** 地形抬升：边界和地名贴着地形走 */
  setTerrain(sampler: ElevationSampler | null, exaggeration: number, baseLift: number): void
  dispose(): void
}

export function createPlacesLayer({ world, canvas }: PlacesLayerOptions): PlacesLayer {
  const ctx = canvas.getContext('2d')!
  let cities: Item[] = []
  let regions: Item[] = []
  let regionFeats: AdminFeature[] | null = null
  let selectedCountry: string | null = null
  let lang: Lang = 'en'
  let enabled = false
  let sampler: ElevationSampler | null = null
  let exaggeration = 0
  let baseLift = 0
  let borders: LineSegments | null = null
  let dirty = true
  let raf = 0
  let lastSignature = ''

  const altitudeAt = (lat: number, lng: number) =>
    baseLift + 0.001 + (sampler && exaggeration ? (Math.max(0, sampler(lat, lng)) * exaggeration) / 6_371_000 : 0)

  const place = (item: Item) => {
    const { x, y, z } = world.getCoords(item.lat, item.lng, altitudeAt(item.lat, item.lng))
    item.pos.set(x, y, z)
  }

  const rebuildBorders = () => {
    if (borders) {
      borders.parent?.remove(borders)
      borders.geometry.dispose()
      ;(borders.material as LineBasicMaterial).dispose()
      borders = null
    }
    if (!enabled || !regionFeats) return
    borders = buildDrapedBorders(regionFeats, {
      sampler,
      exaggeration,
      baseLift: baseLift + 0.0012,
      toXYZ: (lat, lng, alt) => world.getCoords(lat, lng, alt),
      color: '#fde68a',
      opacity: 0.42,
    })
    borders.renderOrder = 3
    world.scene().add(borders)
  }

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      dirty = true
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  const fontOf = (item: Item) =>
    item.kind === 'region'
      ? '500 12px system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif'
      : item.kind === 0
        ? '600 12px system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif'
        : '11px system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif'

  /** 当前缩放下城市的最小人口门槛（选中国家内放宽） */
  const minPopulation = (altitude: number) =>
    altitude >= 1.6 ? Infinity
      : altitude >= 1.0 ? 5_000_000
        : altitude >= 0.6 ? 1_500_000
          : altitude >= 0.35 ? 500_000
            : altitude >= 0.2 ? 150_000
              : 0

  const projected = new Vector3()
  const toCamera = new Vector3()
  const draw = () => {
    resize()
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    ctx.clearRect(0, 0, w, h)
    if (!enabled || !w || !h) return

    const camera = world.camera() as PerspectiveCamera
    const camPos = camera.position
    // 按地球在屏幕上的实际像素半径换算"等效高度"（以 900px 高的桌面视口为基准），
    // 手机竖屏视野窄、相机拉得远，用真实高度会让地名永远不出现
    const radiusPx = (h / 2 / Math.tan((camera.fov * Math.PI) / 360)) * (100 / camPos.length())
    const altitude = 966 / radiusPx - 1
    const globalMin = minPopulation(altitude)
    const localMin = minPopulation(altitude) / 10

    const grid = new Map<number, Rect[]>()
    const keyOf = (cx: number, cy: number) => cx * 4096 + cy
    const collides = (r: Rect) => {
      for (let cx = Math.floor(r.l / CELL); cx <= Math.floor(r.r / CELL); cx++)
        for (let cy = Math.floor(r.t / CELL); cy <= Math.floor(r.b / CELL); cy++)
          for (const o of grid.get(keyOf(cx, cy)) ?? [])
            if (r.l < o.r && r.r > o.l && r.t < o.b && r.b > o.t) return true
      return false
    }
    const occupy = (r: Rect) => {
      for (let cx = Math.floor(r.l / CELL); cx <= Math.floor(r.r / CELL); cx++)
        for (let cy = Math.floor(r.t / CELL); cy <= Math.floor(r.b / CELL); cy++) {
          const k = keyOf(cx, cy)
          const list = grid.get(k)
          if (list) list.push(r)
          else grid.set(k, [r])
        }
    }

    const wanted = (item: Item) => {
      // 选中国家的区划名、首都、省会始终参与排布，挤不下的由避让自然淘汰
      if (item.kind === 'region') return true
      const local = item.country === selectedCountry
      if (local && item.kind !== 2) return true
      if (item.kind === 0) return altitude < 1.6
      return item.pop >= (local ? localMin : globalMin)
    }

    // 优先级：选中国家的首都 → 其省级区划名 → 其余首都与城市（已按人口排好）
    const ordered: Item[] = []
    for (const c of cities) if (c.country === selectedCountry && c.kind === 0) ordered.push(c)
    ordered.push(...regions)
    for (const c of cities) if (!(c.country === selectedCountry && c.kind === 0)) ordered.push(c)

    let drawn = 0
    ctx.textBaseline = 'middle'
    ctx.lineJoin = 'round'
    for (const item of ordered) {
      if (drawn >= MAX_LABELS) break
      if (!wanted(item)) continue
      // 背面与贴近地平线的点不画（掠射角下地名挤成一团）
      toCamera.subVectors(camPos, item.pos)
      if (toCamera.dot(item.pos) / (toCamera.length() * item.pos.length()) < 0.2) continue
      projected.copy(item.pos).project(camera)
      if (projected.z > 1) continue
      const x = ((projected.x + 1) / 2) * w
      const y = ((1 - projected.y) / 2) * h
      if (x < 0 || x > w || y < 60 || y > h - 40) continue

      const name = item.names[lang]
      ctx.font = fontOf(item)
      item.width ??= ctx.measureText(name).width
      const isRegion = item.kind === 'region'
      const dot = isRegion ? 0 : item.kind === 0 ? 3.5 : 2.5
      const left = isRegion ? x - item.width / 2 : x - dot
      const right = isRegion ? x + item.width / 2 : x + dot + 5 + item.width
      const rect = { l: left - 3, t: y - 9, r: right + 3, b: y + 9 }
      if (rect.l < 0 || rect.r > w || collides(rect)) continue
      occupy(rect)
      drawn++

      ctx.lineWidth = 3
      ctx.strokeStyle = 'rgba(2, 6, 23, 0.85)'
      if (isRegion) {
        ctx.textAlign = 'center'
        ctx.strokeText(name, x, y)
        ctx.fillStyle = 'rgba(253, 230, 138, 0.92)'
        ctx.fillText(name, x, y)
        continue
      }
      ctx.beginPath()
      ctx.arc(x, y, dot, 0, Math.PI * 2)
      ctx.fillStyle = item.kind === 0 ? '#fbbf24' : item.kind === 1 ? '#e2e8f0' : '#94a3b8'
      ctx.fill()
      ctx.lineWidth = 1.2
      ctx.stroke()
      ctx.lineWidth = 3
      ctx.textAlign = 'left'
      ctx.strokeText(name, x + dot + 5, y)
      ctx.fillStyle = item.kind === 0 ? '#fef3c7' : item.kind === 1 ? '#f1f5f9' : '#cbd5e1'
      ctx.fillText(name, x + dot + 5, y)
    }
  }

  const loop = () => {
    raf = requestAnimationFrame(loop)
    if (!enabled || document.hidden) return
    const camera = world.camera()
    const e = camera.matrixWorld.elements
    const p = camera.projectionMatrix.elements
    const signature = `${e[12].toFixed(2)},${e[13].toFixed(2)},${e[14].toFixed(2)},${e[0].toFixed(4)},${e[2].toFixed(4)},${e[9].toFixed(4)},${p[8].toFixed(4)},${p[9].toFixed(4)},${canvas.clientWidth}x${canvas.clientHeight}`
    if (!dirty && signature === lastSignature) return
    lastSignature = signature
    dirty = false
    draw()
  }
  raf = requestAnimationFrame(loop)

  const clearWidths = () => {
    for (const c of cities) c.width = undefined
    for (const r of regions) r.width = undefined
  }

  return {
    setCities(rows) {
      cities = rows.map((row) => {
        const item: Item = {
          lat: row[0], lng: row[1], pop: row[2], kind: row[3], country: row[4],
          names: { zh: row[5], en: row[6], ja: row[7], ru: row[8] },
          pos: new Vector3(),
        }
        place(item)
        return item
      })
      dirty = true
    },
    setRegions(country, feats) {
      selectedCountry = country
      regionFeats = feats
      regions = (feats ?? [])
        .map((f) => f.properties)
        .filter((p) => p.en)
        .sort((a, b) => a.r - b.r)
        .map((p) => {
          const item: Item = {
            lat: p.lat, lng: p.lng, pop: 0, kind: 'region', country: country ?? '',
            names: { zh: p.zh, en: p.en, ja: p.ja, ru: p.ru },
            pos: new Vector3(),
          }
          place(item)
          return item
        })
      rebuildBorders()
      dirty = true
    },
    setLanguage(next) {
      if (next === lang) return
      lang = next
      clearWidths()
      dirty = true
    },
    setEnabled(on) {
      if (on === enabled) return
      enabled = on
      rebuildBorders()
      dirty = true
      if (!on) ctx.clearRect(0, 0, canvas.width, canvas.height)
    },
    setTerrain(nextSampler, nextExaggeration, nextBaseLift) {
      sampler = nextSampler
      exaggeration = nextExaggeration
      baseLift = nextBaseLift
      cities.forEach(place)
      regions.forEach(place)
      rebuildBorders()
      dirty = true
    },
    dispose() {
      cancelAnimationFrame(raf)
      enabled = false
      rebuildBorders()
    },
  }
}
