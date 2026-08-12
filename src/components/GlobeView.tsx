import { useEffect, useRef } from 'react'
import Globe from 'globe.gl'
import type { GlobeInstance } from 'globe.gl'
import { feature } from 'topojson-client'
import type { Topology, GeometryCollection } from 'topojson-specification'
import type { Feature, Geometry } from 'geojson'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../store/useAppStore'
import type { Country } from '../types'

type CountryFeature = Feature<Geometry, { name?: string }>

/** 根据国家面积估算合适的观察高度（globe.gl 的 altitude，单位为地球半径倍数） */
function altitudeForArea(area: number): number {
  return Math.min(2.2, Math.max(0.5, Math.sqrt(area) / 1400))
}

const OVERVIEW_ALTITUDE = 2.5

export default function GlobeView() {
  const containerRef = useRef<HTMLDivElement>(null)
  const globeRef = useRef<GlobeInstance | null>(null)
  const hoverRef = useRef<CountryFeature | null>(null)
  const selectedRef = useRef<Country | null>(null)

  const selected = useAppStore((s) => s.selected)
  const autoRotate = useAppStore((s) => s.autoRotate)
  const select = useAppStore((s) => s.select)
  const byCcn3 = useAppStore((s) => s.byCcn3)

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
    world.controls().autoRotate = true
    world.controls().autoRotateSpeed = 0.4
    world.controls().minDistance = 130
    world.pointOfView({ lat: 25, lng: 105, altitude: OVERVIEW_ALTITUDE }, 0)

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

  return <div ref={containerRef} className="absolute inset-0" />
}
