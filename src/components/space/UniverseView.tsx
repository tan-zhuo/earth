import { useEffect, useRef } from 'react'
import {
  AdditiveBlending, BufferGeometry, Color, Float32BufferAttribute, PerspectiveCamera,
  Points, PointsMaterial, Scene, Vector3, WebGLRenderer,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useTranslation } from 'react-i18next'
import { UNIVERSE_FACTS } from '../../data/space'
import { useAppStore } from '../../store/useAppStore'
import FactCard from './FactCard'

const CLUSTERS = 130
const R = 95

/** 著名星系与大尺度结构标注（示意位置，非真实坐标） */
const LANDMARKS: { nameZh: string; nameEn: string; pos: [number, number, number]; color: string }[] = [
  { nameZh: '仙女座星系 M31', nameEn: 'Andromeda Galaxy M31', pos: [5, 1.5, 3], color: '#fbbf24' },
  { nameZh: '三角座星系 M33', nameEn: 'Triangulum Galaxy M33', pos: [-4, -1, 5], color: '#fbbf24' },
  { nameZh: '室女座星系团', nameEn: 'Virgo Cluster', pos: [16, 4, -9], color: '#7dd3fc' },
  { nameZh: '后发座星系团', nameEn: 'Coma Cluster', pos: [-22, 7, 15], color: '#7dd3fc' },
  { nameZh: '拉尼亚凯亚超星系团', nameEn: 'Laniakea Supercluster', pos: [11, -5, 8], color: '#a5b4fc' },
  { nameZh: '夏普利超星系团', nameEn: 'Shapley Supercluster', pos: [-34, 9, -22], color: '#a5b4fc' },
  { nameZh: '史隆长城', nameEn: 'Sloan Great Wall', pos: [42, -12, 26], color: '#c4b5fd' },
  { nameZh: '武仙-北冕座长城', nameEn: 'Hercules–Corona Borealis Great Wall', pos: [-58, 16, 42], color: '#c4b5fd' },
  { nameZh: '牧夫座空洞', nameEn: 'Boötes Void', pos: [26, 22, -48], color: '#64748b' },
]

/** 可观测宇宙视图：宇宙网（星系团 + 纤维结构）点云，每个点代表一个星系 */
export default function UniverseView() {
  const containerRef = useRef<HTMLDivElement>(null)
  const labelsRef = useRef<HTMLDivElement>(null)
  const { i18n } = useTranslation()
  const zh = i18n.language.startsWith('zh')

  useEffect(() => {
    const el = containerRef.current
    const labelLayer = labelsRef.current
    if (!el || !labelLayer) return

    const scene = new Scene()
    const camera = new PerspectiveCamera(55, el.clientWidth / el.clientHeight, 0.1, 3000)
    camera.position.set(0, 55, 170)
    const renderer = new WebGLRenderer({ antialias: true })
    renderer.setSize(el.clientWidth, el.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.appendChild(renderer.domElement)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.minDistance = 40
    controls.maxDistance = 500

    // 滚轮穿越尺度：缩到最小回到银河系（已是最大尺度，无下一级）
    const mountedAt = performance.now()
    let jumped = false
    const onScaleCross = () => {
      if (jumped || performance.now() - mountedAt < 800) return
      if (camera.position.length() <= 44) {
        jumped = true
        useAppStore.getState().setView('galaxy')
      }
    }
    controls.addEventListener('change', onScaleCross)

    const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5

    // 星系团中心（球内均匀采样）
    const centers: Vector3[] = []
    for (let i = 0; i < CLUSTERS; i++) {
      const v = new Vector3(gauss() * 2, gauss() * 2, gauss() * 2)
      if (v.length() === 0) v.set(1, 0, 0)
      v.normalize().multiplyScalar(Math.cbrt(Math.random()) * R)
      centers.push(v)
    }

    const pts: number[] = []
    const cols: number[] = []
    const cWhite = new Color('#dbeafe')
    const cBlue = new Color('#93b4f8')
    const cWarm = new Color('#f5d9a8')
    const push = (v: Vector3, c: Color, jitter = 1) => {
      pts.push(v.x + gauss() * jitter, v.y + gauss() * jitter, v.z + gauss() * jitter)
      cols.push(c.r, c.g, c.b)
    }

    // 团块
    for (const c of centers) {
      const n = 50 + Math.floor(Math.random() * 110)
      const col = Math.random() < 0.25 ? cWarm : Math.random() < 0.5 ? cWhite : cBlue
      for (let i = 0; i < n; i++) push(c, col, 4.5)
    }
    // 纤维：连接每个团与其最近的两个团
    for (const c of centers) {
      const nearest = centers
        .filter((o) => o !== c)
        .sort((a, b) => a.distanceTo(c) - b.distanceTo(c))
        .slice(0, 2)
      for (const n of nearest) {
        const steps = 26
        for (let i = 1; i < steps; i++) {
          const v = c.clone().lerp(n, i / steps)
          push(v, cBlue, 2.2)
        }
      }
    }

    const geo = new BufferGeometry()
    geo.setAttribute('position', new Float32BufferAttribute(pts, 3))
    geo.setAttribute('color', new Float32BufferAttribute(cols, 3))
    const web = new Points(
      geo,
      new PointsMaterial({ size: 0.55, sizeAttenuation: true, vertexColors: true, blending: AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.75 }),
    )
    scene.add(web)

    // 标注：银河系 + 著名星系与大尺度结构
    const mkLabel = (text: string, color: string, size = 12) => {
      const s = document.createElement('span')
      s.innerHTML = `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${color};box-shadow:0 0 8px ${color};margin-right:5px;vertical-align:middle"></span>${text}`
      s.style.cssText +=
        `;position:absolute;transform:translate(-50%,-50%);font-size:${size}px;font-family:system-ui;color:#e2e8f0;text-shadow:0 0 5px rgba(2,6,23,.95);pointer-events:none;white-space:nowrap`
      labelLayer.appendChild(s)
      return s
    }
    const labels: { span: HTMLSpanElement; pos: Vector3 }[] = [
      { span: mkLabel(zh ? '银河系在这里' : 'You are here (Milky Way)', '#fbbf24', 13), pos: new Vector3(0, 0, 0) },
      ...LANDMARKS.map((l) => ({
        span: mkLabel(zh ? l.nameZh : l.nameEn, l.color, 11),
        pos: new Vector3(...l.pos),
      })),
    ]

    let raf = 0
    const tick = () => {
      web.rotation.y += 0.0003
      web.updateMatrixWorld()
      for (const { span, pos } of labels) {
        // 标注点随宇宙网整体旋转
        const v = pos.clone().applyMatrix4(web.matrixWorld).project(camera)
        const visible = v.z < 1
        span.style.display = visible ? 'block' : 'none'
        if (visible) {
          span.style.left = `${((v.x + 1) / 2) * el.clientWidth}px`
          span.style.top = `${((1 - v.y) / 2) * el.clientHeight}px`
        }
      }
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
      el.removeChild(renderer.domElement)
      labels.forEach((l) => l.span.remove())
    }
  }, [zh])

  return (
    <>
      <div ref={containerRef} className="absolute inset-0 z-0" />
      <div ref={labelsRef} className="pointer-events-none absolute inset-0 z-10 overflow-hidden" />
      <FactCard facts={UNIVERSE_FACTS} />
    </>
  )
}
