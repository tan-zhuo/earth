import { useEffect, useRef } from 'react'
import {
  AdditiveBlending, BufferGeometry, Color, Float32BufferAttribute, Group, PerspectiveCamera,
  Points, PointsMaterial, Scene, Sprite, SpriteMaterial, Vector3, WebGLRenderer,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useTranslation } from 'react-i18next'
import { UNIVERSE_FACTS } from '../../data/space'
import { useAppStore } from '../../store/useAppStore'
import { makeStarTexture, makeGlowTexture, makeSpiralTexture } from '../../utils/spriteTextures'
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

/** 可观测宇宙视图：宇宙网——星系团核心（暖色椭圆星系）+ 纤维（蓝白旋涡星系）+ 空洞 */
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

    // 滚轮穿越尺度：缩到最小回到银河系（已是最大尺度，无下一级）。
    // 入场 800ms 免触发，到点后按当前距离复判一次（免触发期内越过阈值时不必再滚一次）
    let armed = false
    let jumped = false
    const onScaleCross = () => {
      if (jumped || !armed) return
      if (camera.position.length() <= 44) {
        jumped = true
        useAppStore.getState().setView('galaxy')
      }
    }
    controls.addEventListener('change', onScaleCross)
    const armTimer = window.setTimeout(() => {
      armed = true
      onScaleCross()
    }, 800)

    const web = new Group()
    scene.add(web)

    const starTex = makeStarTexture()
    const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5

    const addPoints = (positions: number[], colors: number[], size: number, opacity: number) => {
      const geo = new BufferGeometry()
      geo.setAttribute('position', new Float32BufferAttribute(positions, 3))
      geo.setAttribute('color', new Float32BufferAttribute(colors, 3))
      web.add(
        new Points(
          geo,
          new PointsMaterial({
            size, sizeAttenuation: true, map: starTex, vertexColors: true,
            blending: AdditiveBlending, depthWrite: false, transparent: true, opacity,
          }),
        ),
      )
    }

    // 星系团中心（球内均匀采样）
    const centers: Vector3[] = []
    for (let i = 0; i < CLUSTERS; i++) {
      const v = new Vector3(gauss() * 2, gauss() * 2, gauss() * 2)
      if (v.length() === 0) v.set(1, 0, 0)
      v.normalize().multiplyScalar(Math.cbrt(Math.random()) * R)
      centers.push(v)
    }

    const cElliptical = new Color('#ffd9a8') // 团核心的老年椭圆星系：暖黄
    const cSpiral = new Color('#c9dcff') // 纤维与外围的旋涡星系：蓝白
    const cFaint = new Color('#8aa4e8') // 远处暗弱星系
    const jitterColor = (c: Color, amt: number) =>
      c.clone().offsetHSL((Math.random() - 0.5) * 0.03, 0, (Math.random() - 0.5) * amt)

    // 1) 团核心：致密的暖色椭圆星系（大而亮）
    {
      const pos: number[] = []
      const col: number[] = []
      for (const c0 of centers) {
        const n = 16 + Math.floor(Math.random() * 26)
        for (let i = 0; i < n; i++) {
          pos.push(c0.x + gauss() * 2.4, c0.y + gauss() * 2.4, c0.z + gauss() * 2.4)
          const c = jitterColor(cElliptical, 0.25)
          col.push(c.r, c.g, c.b)
        }
      }
      addPoints(pos, col, 1.5, 0.9)
    }

    // 2) 团外围：蓝白旋涡星系（中等大小）
    {
      const pos: number[] = []
      const col: number[] = []
      for (const c0 of centers) {
        const n = 34 + Math.floor(Math.random() * 60)
        for (let i = 0; i < n; i++) {
          pos.push(c0.x + gauss() * 5.2, c0.y + gauss() * 5.2, c0.z + gauss() * 5.2)
          const c = jitterColor(Math.random() < 0.7 ? cSpiral : cFaint, 0.3)
          col.push(c.r, c.g, c.b)
        }
      }
      addPoints(pos, col, 0.85, 0.8)
    }

    // 3) 纤维：连接最近的两个团（暗弱蓝色星系串）
    {
      const pos: number[] = []
      const col: number[] = []
      for (const c0 of centers) {
        const nearest = centers
          .filter((o) => o !== c0)
          .sort((a, b) => a.distanceTo(c0) - b.distanceTo(c0))
          .slice(0, 2)
        for (const n of nearest) {
          const steps = 26
          for (let i = 1; i < steps; i++) {
            const v = c0.clone().lerp(n, i / steps)
            pos.push(v.x + gauss() * 2.0, v.y + gauss() * 2.0, v.z + gauss() * 2.0)
            const c = jitterColor(Math.random() < 0.6 ? cFaint : cSpiral, 0.35)
            col.push(c.r, c.g, c.b)
          }
        }
      }
      addPoints(pos, col, 0.55, 0.6)
    }

    // 4) 每个团中心一个"最亮团星系"（cD 星系辉光）
    {
      const cdTex = makeGlowTexture(255, 226, 180)
      for (const c0 of centers) {
        const s = new Sprite(new SpriteMaterial({ map: cdTex, transparent: true, opacity: 0.7, depthWrite: false }))
        s.position.copy(c0)
        s.scale.setScalar(2.6 + Math.random() * 2.4)
        web.add(s)
      }
    }

    // 5) 近处的"实体"旋涡星系：仙女座 M31 与三角座 M33（与标注对应）
    {
      const spiralTex = makeSpiralTexture()
      const m31 = new Sprite(new SpriteMaterial({ map: spiralTex, transparent: true, opacity: 0.95, depthWrite: false, rotation: 0.5 }))
      m31.position.set(5, 1.5, 3)
      m31.scale.set(7, 4.2, 1)
      web.add(m31)
      const m33 = new Sprite(new SpriteMaterial({ map: spiralTex, transparent: true, opacity: 0.8, depthWrite: false, rotation: -0.9 }))
      m33.position.set(-4, -1, 5)
      m33.scale.set(4, 2.6, 1)
      web.add(m33)
      // 银河系自己也是一个旋涡
      const mw = new Sprite(new SpriteMaterial({ map: spiralTex, transparent: true, opacity: 0.95, depthWrite: false, rotation: 1.2 }))
      mw.position.set(0, 0, 0)
      mw.scale.set(6, 3.8, 1)
      web.add(mw)
    }

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
      window.clearTimeout(armTimer)
      ro.disconnect()
      controls.removeEventListener('change', onScaleCross)
      renderer.dispose()
      renderer.forceContextLoss() // 立即释放 WebGL 上下文
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
