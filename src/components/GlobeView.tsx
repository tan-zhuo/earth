import { useEffect, useRef } from 'react'
import Globe from 'globe.gl'
import type { GlobeInstance } from 'globe.gl'
import { feature } from 'topojson-client'
import type { Topology, GeometryCollection } from 'topojson-specification'
import type { Feature, Geometry } from 'geojson'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../store/useAppStore'
import { incomeGroupOf } from '../types'
import type { Country } from '../types'
import type { GdpEntry } from '../services/worldbank'
import { formatUsd } from '../utils/format'

type CountryFeature = Feature<Geometry, { name?: string }>

/** GDP 柱状图的单条数据 */
interface GdpBar extends GdpEntry {
  country: Country
}

/** 根据国家面积估算合适的观察高度（globe.gl 的 altitude，单位为地球半径倍数） */
function altitudeForArea(area: number): number {
  return Math.min(2.2, Math.max(0.5, Math.sqrt(area) / 1400))
}

const OVERVIEW_ALTITUDE = 2.5

/** 柱子颜色按世界银行收入分组着色（与详情面板徽章一致） */
const BAR_COLORS: Record<string, string> = {
  high: 'rgba(52, 211, 153, 0.8)',
  upperMiddle: 'rgba(56, 189, 248, 0.8)',
  lowerMiddle: 'rgba(251, 191, 36, 0.8)',
  low: 'rgba(251, 113, 133, 0.8)',
}
const BAR_COLOR_UNKNOWN = 'rgba(148, 163, 184, 0.7)'

export default function GlobeView() {
  const containerRef = useRef<HTMLDivElement>(null)
  const globeRef = useRef<GlobeInstance | null>(null)
  const hoverRef = useRef<CountryFeature | null>(null)
  const selectedRef = useRef<Country | null>(null)

  const selected = useAppStore((s) => s.selected)
  const autoRotate = useAppStore((s) => s.autoRotate)
  const select = useAppStore((s) => s.select)
  const byCcn3 = useAppStore((s) => s.byCcn3)
  const countries = useAppStore((s) => s.countries)
  const showGdpBars = useAppStore((s) => s.showGdpBars)
  const showFlags = useAppStore((s) => s.showFlags)
  const gdpAll = useAppStore((s) => s.gdpAll)

  const { i18n } = useTranslation()

  // 供 globe.gl 的回调（非 React 上下文）读取最新状态
  const byCcn3Ref = useRef(byCcn3)
  byCcn3Ref.current = byCcn3
  const langRef = useRef(i18n.language)
  langRef.current = i18n.language

  /** 从 GeoJSON feature 找到对应的国家数据（feature.id 是 ISO numeric） */
  const countryOf = (f: CountryFeature): Country | undefined =>
    f.id != null ? byCcn3Ref.current.get(String(f.id).padStart(3, '0')) : undefined

  /** 重新应用多边形样式（globe.gl 设置访问器即触发重绘） */
  const applyStyles = (world: GlobeInstance) => {
    const isHover = (f: object) => f === hoverRef.current
    const isSelected = (f: object) => {
      const c = countryOf(f as CountryFeature)
      return !!c && c.cca3 === selectedRef.current?.cca3
    }
    world
      .polygonAltitude((f) => (isHover(f) || isSelected(f) ? 0.035 : 0.008))
      .polygonCapColor((f) => {
        if (isSelected(f)) return 'rgba(251, 191, 36, 0.55)' // 选中：琥珀色
        if (isHover(f)) return 'rgba(56, 189, 248, 0.45)' // 悬停：青色
        return 'rgba(56, 189, 248, 0.06)'
      })
      .polygonSideColor(() => 'rgba(2, 6, 23, 0.35)')
      .polygonStrokeColor((f) =>
        isHover(f) || isSelected(f) ? 'rgba(226, 232, 240, 0.9)' : 'rgba(148, 163, 184, 0.35)',
      )
      .polygonLabel((f) => {
        const cf = f as CountryFeature
        const c = countryOf(cf)
        const zh = langRef.current.startsWith('zh')
        const primary = c ? (zh ? c.nameZh : c.nameEn) : (cf.properties?.name ?? '')
        const secondary = c ? (zh ? c.nameEn : c.nameZh) : ''
        return `<div style="font-family:system-ui;padding:6px 10px;background:rgba(2,6,23,.85);
          border:1px solid rgba(56,189,248,.4);border-radius:8px;backdrop-filter:blur(4px)">
          <div style="font-size:14px;font-weight:600;color:#e2e8f0">${primary}</div>
          ${secondary ? `<div style="font-size:11px;color:#94a3b8">${secondary}</div>` : ''}
        </div>`
      })
  }

  // 初始化地球（仅一次）
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const world = new Globe(el, { animateIn: true })
      .width(el.clientWidth)
      .height(el.clientHeight)
      .globeImageUrl('/textures/earth-night.jpg')
      .backgroundImageUrl('/textures/night-sky.png')
      .atmosphereColor('#38bdf8')
      .atmosphereAltitude(0.18)
      .polygonsTransitionDuration(200)

    globeRef.current = world
    if (import.meta.env.DEV) (window as unknown as { __world?: GlobeInstance }).__world = world
    world.controls().autoRotate = true
    world.controls().autoRotateSpeed = 0.4
    world.controls().minDistance = 130
    world.pointOfView({ lat: 25, lng: 105, altitude: OVERVIEW_ALTITUDE }, 0)

    // 自转的实现是相机环绕（OrbitControls.autoRotate），若星空天球留在场景里，
    // 星星会跟着流动，暴露出“镜头在飞”。把天球挂到相机上后星空相对视角静止，
    // 画面上便只有地球在转 —— 视觉上等价于真正的地球自转，
    // 且不破坏 globe.gl 的经纬度飞行与拾取计算。
    const attachSkyToCamera = (): boolean => {
      const scene = world.scene()
      const sky = scene.children.find((o: unknown) => {
        const m = o as { isMesh?: boolean; material?: { side?: number } }
        return !!m.isMesh && m.material?.side === 1 // BackSide 的背景天球
      })
      if (!sky) return false
      const camera = world.camera()
      scene.add(camera) // 相机默认不在场景树中，加入后其子节点才会被渲染
      camera.add(sky)
      return true
    }
    // 背景贴图异步加载，轮询直到天球出现并挂载成功
    const skyTimer = window.setInterval(() => {
      if (attachSkyToCamera()) window.clearInterval(skyTimer)
    }, 200)

    applyStyles(world)

    world.onPolygonHover((f) => {
      hoverRef.current = (f as CountryFeature | null) ?? null
      el.style.cursor = f ? 'pointer' : 'grab'
      applyStyles(world)
    })
    world.onPolygonClick((f) => {
      const c = countryOf(f as CountryFeature)
      if (c) select(c)
    })

    // 加载国家边界（world-atlas TopoJSON → GeoJSON），剔除南极洲
    fetch('/data/countries-110m.json')
      .then((r) => r.json())
      .then((topo: Topology<{ countries: GeometryCollection<{ name?: string }> }>) => {
        const fc = feature(topo, topo.objects.countries)
        const feats = (fc.features as CountryFeature[]).filter(
          (f) => f.properties?.name !== 'Antarctica',
        )
        world.polygonsData(feats)
      })
      .catch((err) => console.error('加载国家边界失败', err))

    const ro = new ResizeObserver(() => {
      world.width(el.clientWidth).height(el.clientHeight)
    })
    ro.observe(el)

    return () => {
      window.clearInterval(skyTimer)
      ro.disconnect()
      world._destructor()
      globeRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 选中变化：飞行 + 高亮 + 暂停自转
  useEffect(() => {
    selectedRef.current = selected
    const world = globeRef.current
    if (!world) return
    applyStyles(world)
    world.controls().autoRotate = autoRotate && !selected
    if (selected) {
      world.pointOfView(
        { lat: selected.latlng[0], lng: selected.latlng[1], altitude: altitudeForArea(selected.area) },
        1200,
      )
    } else {
      const pov = world.pointOfView()
      world.pointOfView({ ...pov, altitude: OVERVIEW_ALTITUDE }, 1000)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, autoRotate])

  // 语言切换或国家数据就绪后，刷新悬停标签语言
  useEffect(() => {
    if (globeRef.current) applyStyles(globeRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language, byCcn3])

  // GDP 柱状图层：高度 = sqrt(GDP) 归一化（兼顾大小国可见性），颜色按收入分组
  useEffect(() => {
    const world = globeRef.current
    if (!world) return
    if (!showGdpBars || !gdpAll) {
      world.pointsData([])
      return
    }
    const bars: GdpBar[] = countries
      .filter((c) => gdpAll[c.cca3])
      .map((c) => ({ country: c, ...gdpAll[c.cca3] }))
    const maxSqrt = Math.max(...bars.map((b) => Math.sqrt(b.gdp)))
    world
      .pointsData(bars as unknown as object[])
      .pointLat((d) => (d as GdpBar).country.latlng[0])
      .pointLng((d) => (d as GdpBar).country.latlng[1])
      .pointAltitude((d) => 0.015 + (Math.sqrt((d as GdpBar).gdp) / maxSqrt) * 0.55)
      .pointRadius(0.45)
      .pointColor((d) => {
        const pc = (d as GdpBar).gdpPerCapita
        return pc == null ? BAR_COLOR_UNKNOWN : BAR_COLORS[incomeGroupOf(pc)]
      })
      .pointLabel((d) => {
        const b = d as GdpBar
        const zh = langRef.current.startsWith('zh')
        return `<div style="font-family:system-ui;padding:6px 10px;background:rgba(2,6,23,.85);
          border:1px solid rgba(56,189,248,.4);border-radius:8px">
          <div style="font-size:13px;font-weight:600;color:#e2e8f0">${zh ? b.country.nameZh : b.country.nameEn}</div>
          <div style="font-size:12px;color:#7dd3fc">GDP: ${formatUsd(b.gdp, langRef.current)} (${b.gdpYear})</div>
        </div>`
      })
  }, [showGdpBars, gdpAll, countries])

  // 国旗图层：以 HTML 元素贴在各国质心，尺寸随国家面积微调，可点击选中
  useEffect(() => {
    const world = globeRef.current
    if (!world) return
    world
      .htmlElementsData(showFlags ? (countries as unknown as object[]) : [])
      .htmlLat((d) => (d as Country).latlng[0])
      .htmlLng((d) => (d as Country).latlng[1])
      .htmlAltitude(0.012)
      .htmlElement((d) => {
        const c = d as Country
        const img = document.createElement('img')
        img.src = `https://flagcdn.com/w40/${c.cca2.toLowerCase()}.png`
        img.loading = 'lazy'
        const w = Math.max(12, Math.min(26, Math.sqrt(c.area || 1) / 80))
        img.style.width = `${w}px`
        img.style.borderRadius = '2px'
        img.style.border = '1px solid rgba(148,163,184,0.5)'
        img.style.cursor = 'pointer'
        img.style.pointerEvents = 'auto'
        img.onclick = () => select(c)
        return img
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFlags, countries])

  return <div ref={containerRef} className="absolute inset-0" />
}
