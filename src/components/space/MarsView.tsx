import { useEffect, useRef, useState } from 'react'
import Globe from 'globe.gl'
import type { GlobeInstance } from 'globe.gl'
import { useTranslation } from 'react-i18next'
import StructureScene from './StructureScene'
import FactCard from './FactCard'
import {
  MARS_STRUCTURE, MARS_STRUCTURE_FACTS, MARS_MAGNETIC_FACTS, MARS_SURFACE_FACTS, MARS_SITES,
} from '../../data/structures'
import type { MarsSite } from '../../data/structures'
import { useAppStore } from '../../store/useAppStore'

type Mode = 'surface' | 'structure' | 'magnetic'

/** 火星表面：globe.gl 渲染 + 着陆点标记 */
function MarsSurface() {
  const containerRef = useRef<HTMLDivElement>(null)
  const globeRef = useRef<GlobeInstance | null>(null)
  const { i18n } = useTranslation()

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const world = new Globe(el, { animateIn: true })
      .width(el.clientWidth)
      .height(el.clientHeight)
      .globeImageUrl('/space/mars.jpg')
      .backgroundImageUrl('/textures/night-sky.png')
      .atmosphereColor('#f97316')
      .atmosphereAltitude(0.08)
    globeRef.current = world
    world.controls().autoRotate = true
    world.controls().autoRotateSpeed = 0.5
    world.pointOfView({ lat: 10, lng: 60, altitude: 2.2 }, 0)

    // 滚轮缩小到底 → 从火星拉远进入太阳系
    const mountedAt = performance.now()
    world.onZoom((pov) => {
      if (performance.now() - mountedAt < 1200) return
      if (pov.altitude > 4.2) useAppStore.getState().setView('solar')
    })

    const ro = new ResizeObserver(() => world.width(el.clientWidth).height(el.clientHeight))
    ro.observe(el)
    return () => {
      ro.disconnect()
      world._destructor()
      globeRef.current = null
    }
  }, [])

  // 着陆点标记
  useEffect(() => {
    const world = globeRef.current
    if (!world) return
    const zh = i18n.language.startsWith('zh')
    world
      .htmlElementsData(MARS_SITES as unknown as object[])
      .htmlLat((d) => (d as MarsSite).lat)
      .htmlLng((d) => (d as MarsSite).lng)
      .htmlAltitude(0.015)
      .htmlElement((d) => {
        const s = d as MarsSite
        const div = document.createElement('div')
        div.style.cssText = 'display:flex;flex-direction:column;align-items:center;pointer-events:none'
        div.innerHTML = `
          <span style="width:7px;height:7px;border-radius:50%;background:#4ade80;box-shadow:0 0 8px #4ade80"></span>
          <span style="margin-top:2px;font-size:10px;font-family:system-ui;color:#bbf7d0;white-space:nowrap;
            text-shadow:0 0 4px rgba(2,6,23,.95)">${zh ? s.nameZh : s.nameEn} · ${s.yearLabel}</span>`
        return div
      })
  }, [i18n.language])

  return <div ref={containerRef} className="absolute inset-0 z-0" />
}

/** 火星视图：表面（着陆点）/ 内部结构 / 磁场 三种模式 */
export default function MarsView() {
  const { t } = useTranslation()
  const [mode, setMode] = useState<Mode>('surface')

  const facts =
    mode === 'surface' ? MARS_SURFACE_FACTS : mode === 'structure' ? MARS_STRUCTURE_FACTS : MARS_MAGNETIC_FACTS

  return (
    <>
      {mode === 'surface' ? (
        <MarsSurface />
      ) : (
        <StructureScene config={MARS_STRUCTURE} showField={mode === 'magnetic'} />
      )}
      <FactCard facts={facts} />

      {/* 模式切换 */}
      <div className="fixed inset-x-0 bottom-6 z-20 flex justify-center">
        <div className="flex overflow-hidden rounded-full border border-slate-700/60 bg-slate-900/80 backdrop-blur">
          {(['surface', 'structure', 'magnetic'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 text-xs font-medium transition ${
                mode === m ? 'bg-sky-500/15 text-sky-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t(`structureModes.${m}`)}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
