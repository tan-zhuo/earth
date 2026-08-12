import { useEffect, useRef } from 'react'
import Globe from 'globe.gl'
import type { GlobeInstance } from 'globe.gl'
import { TextureLoader, SRGBColorSpace, MeshPhongMaterial } from 'three'
import type { Mesh, Texture } from 'three'
import { feature } from 'topojson-client'
import type { Topology, GeometryCollection } from 'topojson-specification'
import type { Feature, Geometry } from 'geojson'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../store/useAppStore'
import { incomeGroupOf } from '../types'
import type { Country } from '../types'
import type { GdpEntry } from '../services/worldbank'
import { formatUsd } from '../utils/format'
import { PALEO_ERAS } from '../data/paleoEras'
import { PORTS, ROUTE_LEGS } from '../data/shippingRoutes'
import type { Port } from '../data/shippingRoutes'

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
  const timeTravel = useAppStore((s) => s.timeTravel)
  const eraIndex = useAppStore((s) => s.eraIndex)
  const showRoutes = useAppStore((s) => s.showRoutes)
  const featsRef = useRef<CountryFeature[]>([])

  /* ---- 时间旅行贴图交叉淡化所需的引用 ---- */
  /** ma → 已解码并上传 GPU 的贴图（key 0 = 现代夜景） */
  const paleoTexRef = useRef<Map<number, Texture>>(new Map())
  /** 叠加层网格（与地球共享几何体，用于 crossfade） */
  const paleoMeshRef = useRef<{ base: Mesh; overlay: Mesh } | null>(null)
  const fadeAnimRef = useRef(0)
  /** 当前应展示的时代 ma（异步加载完成后校验用） */
  const eraTargetRef = useRef<number | null>(null)
  const paleoPreloadedRef = useRef(false)

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
        featsRef.current = feats
        if (!useAppStore.getState().timeTravel) world.polygonsData(feats)
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
    if (!showGdpBars || !gdpAll || timeTravel) {
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
  }, [showGdpBars, gdpAll, countries, timeTravel])

  // 国旗图层：以 HTML 元素贴在各国质心，尺寸随国家面积微调，可点击选中
  useEffect(() => {
    const world = globeRef.current
    if (!world) return
    world
      .htmlElementsData(showFlags && !timeTravel ? (countries as unknown as object[]) : [])
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
  }, [showFlags, countries, timeTravel])

  // 航线图层：主要海运通道按枢纽港分段的动画弧线 + 港口标记
  useEffect(() => {
    const world = globeRef.current
    if (!world) return
    const zh = langRef.current.startsWith('zh')
    if (showRoutes && !timeTravel) {
      const portById = new Map(PORTS.map((p) => [p.id, p]))
      const arcs = ROUTE_LEGS.map((leg) => {
        const a = portById.get(leg.from)!
        const b = portById.get(leg.to)!
        return { ...leg, startLat: a.lat, startLng: a.lng, endLat: b.lat, endLng: b.lng }
      })
      world
        .arcsData(arcs as unknown as object[])
        .arcStartLat((d) => (d as { startLat: number }).startLat)
        .arcStartLng((d) => (d as { startLng: number }).startLng)
        .arcEndLat((d) => (d as { endLat: number }).endLat)
        .arcEndLng((d) => (d as { endLng: number }).endLng)
        .arcColor((d: object) => {
          const w = (d as { weight: number }).weight
          return w >= 3 ? 'rgba(56,189,248,0.9)' : w === 2 ? 'rgba(45,212,191,0.75)' : 'rgba(148,163,184,0.55)'
        })
        .arcStroke((d) => 0.25 + (d as { weight: number }).weight * 0.18)
        .arcAltitudeAutoScale(0.35)
        .arcDashLength(0.35)
        .arcDashGap(0.15)
        .arcDashAnimateTime(3000)
      world
        .labelsData(PORTS as unknown as object[])
        .labelLat((d) => (d as Port).lat)
        .labelLng((d) => (d as Port).lng)
        .labelText((d) => (zh ? (d as Port).nameZh : (d as Port).nameEn))
        .labelSize(0.7)
        .labelDotRadius(0.28)
        .labelColor(() => 'rgba(125,211,252,0.9)')
        .labelResolution(2)
    } else {
      world.arcsData([])
      world.labelsData([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRoutes, timeTravel, i18n.language])

  /** 加载并预处理某时代贴图：解码 + sRGB + 预上传 GPU，避免切换瞬间卡顿 */
  const loadEraTexture = async (world: GlobeInstance, ma: number): Promise<Texture> => {
    const cached = paleoTexRef.current.get(ma)
    if (cached) return cached
    const url = ma === 0 ? '/textures/earth-night.jpg' : `/paleo/${ma}.jpg`
    const tex = await new TextureLoader().loadAsync(url)
    tex.colorSpace = SRGBColorSpace
    world.renderer().initTexture(tex) // 提前上传 GPU，消除首次使用时的掉帧
    paleoTexRef.current.set(ma, tex)
    return tex
  }

  /** 找到地球表面网格并克隆出透明叠加层（共享几何体保证贴图完全对齐） */
  const ensurePaleoOverlay = (world: GlobeInstance): { base: Mesh; overlay: Mesh } | null => {
    if (paleoMeshRef.current) return paleoMeshRef.current
    let base: Mesh | undefined
    world.scene().traverse((o) => {
      const m = o as Mesh & { geometry?: { parameters?: { radius?: number } } }
      // 地球表面：半径 100 的 Phong 网格（同半径的大气层是 ShaderMaterial，需排除）
      if (
        !base &&
        m.isMesh &&
        m.geometry?.parameters?.radius === 100 &&
        (m.material as { type?: string })?.type === 'MeshPhongMaterial'
      )
        base = m
    })
    if (!base) return null
    const baseMat = base.material as MeshPhongMaterial
    if (baseMat.map) paleoTexRef.current.set(0, baseMat.map) // 现代夜景贴图入缓存
    const overlay = base.clone()
    // 不 clone 原材质（globe.gl 的材质含 null 颜色槽，clone 会崩溃），新建独立 Phong
    const overlayMat = new MeshPhongMaterial({ transparent: true, opacity: 0 })
    overlay.material = overlayMat
    overlay.renderOrder = 1
    base.parent?.add(overlay)
    paleoMeshRef.current = { base, overlay }
    return paleoMeshRef.current
  }

  /** 交叉淡化到目标贴图（可被新的切换随时打断） */
  const fadeToTexture = (tex: Texture) => {
    const meshes = paleoMeshRef.current
    if (!meshes) return
    const baseMat = meshes.base.material as MeshPhongMaterial
    const overlayMat = meshes.overlay.material as MeshPhongMaterial
    cancelAnimationFrame(fadeAnimRef.current)
    // 打断进行中的淡化：把上一个目标先落到底层，避免回跳
    if (overlayMat.opacity > 0 && overlayMat.map) {
      baseMat.map = overlayMat.map
      baseMat.needsUpdate = true
    }
    if (baseMat.map === tex) {
      overlayMat.opacity = 0
      return
    }
    overlayMat.map = tex
    overlayMat.needsUpdate = true
    overlayMat.opacity = 0
    const DURATION = 700
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / DURATION)
      overlayMat.opacity = p * p * (3 - 2 * p) // smoothstep 缓动
      if (p < 1) {
        fadeAnimRef.current = requestAnimationFrame(tick)
      } else {
        baseMat.map = tex
        baseMat.needsUpdate = true
        overlayMat.opacity = 0
      }
    }
    fadeAnimRef.current = requestAnimationFrame(tick)
  }

  // 时间旅行：预载全部时代贴图，切换时代时交叉淡化，隐藏国界（远古地球没有国家）
  useEffect(() => {
    const world = globeRef.current
    if (!world) return
    if (timeTravel) {
      world.polygonsData([])
      if (!ensurePaleoOverlay(world)) return
      // 首次进入：后台按顺序预载全部时代贴图（顺序加载避免 15 张图并发解码挤占主线程）
      if (!paleoPreloadedRef.current) {
        paleoPreloadedRef.current = true
        void (async () => {
          for (const era of PALEO_ERAS) {
            try {
              await loadEraTexture(world, era.ma)
            } catch {
              // 单张失败不影响其余预载
            }
          }
        })()
      }
      const ma = PALEO_ERAS[eraIndex].ma
      eraTargetRef.current = ma
      void loadEraTexture(world, ma)
        .then((tex) => {
          // 加载期间用户可能又切了时代，只展示最新目标
          if (eraTargetRef.current === ma) fadeToTexture(tex)
        })
        .catch(() => {})
    } else {
      eraTargetRef.current = null
      cancelAnimationFrame(fadeAnimRef.current)
      const meshes = paleoMeshRef.current
      const nightTex = paleoTexRef.current.get(0)
      if (meshes && nightTex) {
        ;(meshes.overlay.material as MeshPhongMaterial).opacity = 0
        const baseMat = meshes.base.material as MeshPhongMaterial
        baseMat.map = nightTex
        baseMat.needsUpdate = true
      }
      world.polygonsData(featsRef.current as object[])
    }
  }, [timeTravel, eraIndex])

  // z-0 创建层叠上下文，约束 globe.gl html 图层（国旗）不覆盖 UI 面板
  return <div ref={containerRef} className="absolute inset-0 z-0" />
}
