import { useEffect, useRef } from 'react'
import {
  AdditiveBlending, BufferGeometry, Color, Float32BufferAttribute, PerspectiveCamera,
  Points, PointsMaterial, Scene, Vector3, WebGLRenderer,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useTranslation } from 'react-i18next'
import { GALAXY_FACTS } from '../../data/space'
import { useAppStore } from '../../store/useAppStore'
import FactCard from './FactCard'

const STAR_COUNT = 42000
const BULGE_COUNT = 8000
const RADIUS = 70
const ARMS = 4
const SPIN = 0.055

/** 银河系视图：程序化棒旋星系粒子 + 太阳位置标记 */
export default function GalaxyView() {
  const containerRef = useRef<HTMLDivElement>(null)
  const labelsRef = useRef<HTMLDivElement>(null)
  const { i18n } = useTranslation()
  const zh = i18n.language.startsWith('zh')

  useEffect(() => {
    const el = containerRef.current
    const labelLayer = labelsRef.current
    if (!el || !labelLayer) return

    const scene = new Scene()
    const camera = new PerspectiveCamera(55, el.clientWidth / el.clientHeight, 0.1, 2000)
    camera.position.set(0, 62, 105)
    const renderer = new WebGLRenderer({ antialias: true })
    renderer.setSize(el.clientWidth, el.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.appendChild(renderer.domElement)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.minDistance = 30
    controls.maxDistance = 400

    // 滚轮穿越尺度：缩到最小回到太阳系，拉到最大进入可观测宇宙
    const mountedAt = performance.now()
    let jumped = false
    const onScaleCross = () => {
      if (jumped || performance.now() - mountedAt < 800) return
      const d = camera.position.length()
      if (d <= 33) {
        jumped = true
        useAppStore.getState().setView('solar')
      } else if (d >= 392) {
        jumped = true
        useAppStore.getState().setView('universe')
      }
    }
    controls.addEventListener('change', onScaleCross)

    // 旋臂星场
    const positions = new Float32Array((STAR_COUNT + BULGE_COUNT) * 3)
    const colors = new Float32Array((STAR_COUNT + BULGE_COUNT) * 3)
    const core = new Color('#ffe3b3')
    const mid = new Color('#a8cdff')
    const edge = new Color('#5d7fd6')
    const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5

    for (let i = 0; i < STAR_COUNT; i++) {
      const r = Math.pow(Math.random(), 0.72) * RADIUS
      const arm = i % ARMS
      const angle = (arm / ARMS) * Math.PI * 2 + r * SPIN + gauss() * 0.28
      const fan = 1 - (r / RADIUS) * 0.55
      const x = Math.cos(angle) * r + gauss() * 2.6 * fan
      const z = Math.sin(angle) * r + gauss() * 2.6 * fan
      const y = gauss() * 1.5 * fan
      positions.set([x, y, z], i * 3)
      const c = r < RADIUS * 0.25 ? core.clone().lerp(mid, r / (RADIUS * 0.25)) : mid.clone().lerp(edge, (r - RADIUS * 0.25) / (RADIUS * 0.75))
      colors.set([c.r, c.g, c.b], i * 3)
    }
    // 中心核球
    for (let i = 0; i < BULGE_COUNT; i++) {
      const idx = (STAR_COUNT + i) * 3
      positions.set([gauss() * 7, gauss() * 3.5, gauss() * 7], idx)
      colors.set([core.r, core.g, core.b], idx)
    }

    const geo = new BufferGeometry()
    geo.setAttribute('position', new Float32BufferAttribute(positions, 3))
    geo.setAttribute('color', new Float32BufferAttribute(colors, 3))
    const stars = new Points(
      geo,
      new PointsMaterial({ size: 0.28, sizeAttenuation: true, vertexColors: true, blending: AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.9 }),
    )
    scene.add(stars)

    // 标签：银心（人马座 A*）与太阳系位置（猎户臂，约半径 52%）
    const sunR = RADIUS * 0.52
    const sunAngle = (0 / ARMS) * Math.PI * 2 + sunR * SPIN
    const sunPos = new Vector3(Math.cos(sunAngle) * sunR, 0.5, Math.sin(sunAngle) * sunR)

    const mkLabel = (text: string, color: string) => {
      const span = document.createElement('span')
      span.innerHTML = `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};box-shadow:0 0 8px ${color};margin-right:5px;vertical-align:middle"></span>${text}`
      span.style.cssText +=
        ';position:absolute;transform:translate(-50%,-50%);font-size:12px;font-family:system-ui;' +
        `color:#e2e8f0;text-shadow:0 0 5px rgba(2,6,23,.95);pointer-events:none;white-space:nowrap`
      labelLayer.appendChild(span)
      return span
    }
    const sunLabel = mkLabel(zh ? '太阳系在这里' : 'You are here (Solar System)', '#fbbf24')
    const coreLabel = mkLabel(zh ? '人马座 A*（黑洞）' : 'Sagittarius A* (black hole)', '#f472b6')

    const project = (span: HTMLSpanElement, world: Vector3) => {
      const v = world.clone().applyMatrix4(stars.matrixWorld).project(camera)
      const visible = v.z < 1
      span.style.display = visible ? 'block' : 'none'
      if (visible) {
        span.style.left = `${((v.x + 1) / 2) * el.clientWidth}px`
        span.style.top = `${((1 - v.y) / 2) * el.clientHeight}px`
      }
    }

    let raf = 0
    const tick = () => {
      stars.rotation.y += 0.00045
      stars.updateMatrixWorld()
      project(sunLabel, sunPos)
      project(coreLabel, new Vector3(0, 0, 0))
      controls.update()
      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const ro = new ResizeObserver(() => {
      camera.aspect = el.clientWidth / el.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(el.clientWidth, el.clientHeight)
    })
    ro.observe(el)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      controls.removeEventListener('change', onScaleCross)
      renderer.dispose()
      renderer.forceContextLoss() // 立即释放 WebGL 上下文
      el.removeChild(renderer.domElement)
      sunLabel.remove()
      coreLabel.remove()
    }
  }, [zh])

  return (
    <>
      <div ref={containerRef} className="absolute inset-0 z-0" />
      <div ref={labelsRef} className="pointer-events-none absolute inset-0 z-10 overflow-hidden" />
      <FactCard facts={GALAXY_FACTS} />
    </>
  )
}
