import { useEffect, useRef } from 'react'
import Globe from 'globe.gl'
import type { GlobeInstance } from 'globe.gl'
import { useTranslation } from 'react-i18next'
import { MOON_FACTS, MOON_SITES } from '../../data/space'
import type { MoonSite } from '../../data/space'
import { useAppStore } from '../../store/useAppStore'
import FactCard from './FactCard'

/** 月球视图：globe.gl 渲染月面 + 历史着陆点标记 */
export default function MoonView() {
  const containerRef = useRef<HTMLDivElement>(null)
  const globeRef = useRef<GlobeInstance | null>(null)
  const { i18n } = useTranslation()
  const langRef = useRef(i18n.language)
  langRef.current = i18n.language

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const world = new Globe(el, { animateIn: true })
      .width(el.clientWidth)
      .height(el.clientHeight)
      .globeImageUrl('/space/moon.jpg')
      .backgroundImageUrl('/textures/night-sky.png')
      .atmosphereColor('#94a3b8')
      .atmosphereAltitude(0.06)
    globeRef.current = world
    world.controls().autoRotate = true
    world.controls().autoRotateSpeed = 0.5
    world.pointOfView({ lat: 10, lng: 0, altitude: 2.2 }, 0)

    // 滚轮缩小到底 → 从月球拉远进入太阳系
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

  // 着陆点标记（HTML 图层，原生渲染中文）
  useEffect(() => {
    const world = globeRef.current
    if (!world) return
    const zh = i18n.language.startsWith('zh')
    world
      .htmlElementsData(MOON_SITES as unknown as object[])
      .htmlLat((d) => (d as MoonSite).lat)
      .htmlLng((d) => (d as MoonSite).lng)
      .htmlAltitude(0.015)
      .htmlElement((d) => {
        const s = d as MoonSite
        const div = document.createElement('div')
        div.style.cssText = 'display:flex;flex-direction:column;align-items:center;pointer-events:none'
        div.innerHTML = `
          <span style="width:7px;height:7px;border-radius:50%;background:#fbbf24;box-shadow:0 0 8px #fbbf24"></span>
          <span style="margin-top:2px;font-size:10px;font-family:system-ui;color:#fde68a;white-space:nowrap;
            text-shadow:0 0 4px rgba(2,6,23,.95)">${zh ? s.nameZh : s.nameEn} · ${s.yearLabel}</span>`
        return div
      })
  }, [i18n.language])

  return (
    <>
      <div ref={containerRef} className="absolute inset-0 z-0" />
      <FactCard facts={MOON_FACTS} />
    </>
  )
}
