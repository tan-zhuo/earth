import { useEffect, useRef } from 'react'
import {
  AdditiveBlending, BufferGeometry, Color, Float32BufferAttribute, Group, NormalBlending,
  PerspectiveCamera, Points, PointsMaterial, Scene, Sprite, SpriteMaterial, Vector3, WebGLRenderer,
} from 'three'
import type { Blending } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useTranslation } from 'react-i18next'
import { GALAXY_FACTS } from '../../data/space'
import { useAppStore } from '../../store/useAppStore'
import { makeStarTexture, makeGlowTexture } from '../../utils/spriteTextures'
import FactCard from './FactCard'

const RADIUS = 70
const ARMS = 4
const SPIN = 0.055
const BAR_ANGLE = 0.45 // 中心棒的方位角

/** 银河系视图：多层恒星群 + 棒旋核球 + HII 星云 + 星团 + 尘埃带 */
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

    // 滚轮穿越尺度：缩到最小回到太阳系，拉到最大进入可观测宇宙。
    // 入场 800ms 免触发，到点后按当前距离复判一次（免触发期内越过阈值时不必再滚一次）
    let armed = false
    let jumped = false
    const onScaleCross = () => {
      if (jumped || !armed) return
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
    const armTimer = window.setTimeout(() => {
      armed = true
      onScaleCross()
    }, 800)

    const galaxy = new Group()
    scene.add(galaxy)

    const starTex = makeStarTexture()
    const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5

    const addPoints = (
      positions: number[], colors: number[], size: number, opacity: number,
      blending: Blending = AdditiveBlending, renderOrder = 0,
    ) => {
      const geo = new BufferGeometry()
      geo.setAttribute('position', new Float32BufferAttribute(positions, 3))
      geo.setAttribute('color', new Float32BufferAttribute(colors, 3))
      const pts = new Points(
        geo,
        new PointsMaterial({
          size, sizeAttenuation: true, map: starTex, vertexColors: true,
          blending, depthWrite: false, transparent: true, opacity,
        }),
      )
      pts.renderOrder = renderOrder
      galaxy.add(pts)
      return pts
    }

    /** 旋臂上的一个点（armBias 沿臂法向偏移，用于尘埃带） */
    const armPoint = (rPow: number, spread: number, armBias = 0) => {
      const r = Math.pow(Math.random(), rPow) * RADIUS
      const arm = Math.floor(Math.random() * ARMS)
      // 两条主臂更密：奇数臂 40% 概率丢给主臂
      const density = arm % 2 === 1 && Math.random() < 0.4 ? arm - 1 : arm
      const angle = (density / ARMS) * Math.PI * 2 + r * SPIN + armBias + gauss() * spread * (1 - (r / RADIUS) * 0.5)
      const fan = 1 - (r / RADIUS) * 0.55
      return {
        r,
        x: Math.cos(angle) * r + gauss() * 2.2 * fan,
        y: gauss() * 1.4 * fan,
        z: Math.sin(angle) * r + gauss() * 2.2 * fan,
      }
    }

    const cCore = new Color('#ffe3b3')
    const cMid = new Color('#aecdff')
    const cEdge = new Color('#6080d8')
    const cRed = new Color('#ffab7a')
    const cBlue = new Color('#c4d6ff')
    const mixByRadius = (r: number) =>
      r < RADIUS * 0.25
        ? cCore.clone().lerp(cMid, r / (RADIUS * 0.25))
        : cMid.clone().lerp(cEdge, (r - RADIUS * 0.25) / (RADIUS * 0.75))

    // 1) 盘面暗星（数量大、颗粒细，铺出星场底色）
    {
      const pos: number[] = []
      const col: number[] = []
      for (let i = 0; i < 30000; i++) {
        const p = armPoint(0.72, 0.3)
        pos.push(p.x, p.y, p.z)
        // 8% 红巨星、6% 蓝白亮星，其余按半径渐变
        const c = Math.random() < 0.08 ? cRed : Math.random() < 0.065 ? cBlue : mixByRadius(p.r)
        col.push(c.r, c.g, c.b)
      }
      addPoints(pos, col, 0.35, 0.6)
    }

    // 2) 旋臂亮星（大颗粒、偏蓝白，勾勒臂形）
    {
      const pos: number[] = []
      const col: number[] = []
      for (let i = 0; i < 7000; i++) {
        const p = armPoint(0.6, 0.12)
        pos.push(p.x, p.y, p.z)
        const c = cBlue.clone().lerp(cMid, Math.random() * 0.6)
        col.push(c.r, c.g, c.b)
      }
      addPoints(pos, col, 0.8, 0.85)
    }

    // 3) 棒旋核球（沿 BAR_ANGLE 拉长的暖色椭球）
    {
      const pos: number[] = []
      const col: number[] = []
      const cosB = Math.cos(BAR_ANGLE)
      const sinB = Math.sin(BAR_ANGLE)
      for (let i = 0; i < 9000; i++) {
        const bx = gauss() * 9.5
        const bz = gauss() * 3.6
        const by = gauss() * 2.8
        pos.push(bx * cosB - bz * sinB, by, bx * sinB + bz * cosB)
        const c = cCore.clone().lerp(new Color('#ffd28a'), Math.random() * 0.5)
        col.push(c.r, c.g, c.b)
      }
      addPoints(pos, col, 0.5, 0.85)
    }

    // 4) HII 恒星形成区（旋臂上的粉色星云斑）
    {
      const pos: number[] = []
      const col: number[] = []
      const cPink = new Color('#ff87b8')
      for (let i = 0; i < 320; i++) {
        const p = armPoint(0.55, 0.08)
        if (p.r < 12) continue
        pos.push(p.x, p.y, p.z)
        col.push(cPink.r, cPink.g, cPink.b)
      }
      addPoints(pos, col, 4.2, 0.16)
    }

    // 5) 疏散星团（旋臂内的蓝白色致密星群）
    {
      const pos: number[] = []
      const col: number[] = []
      for (let i = 0; i < 70; i++) {
        const c0 = armPoint(0.55, 0.1)
        if (c0.r < 10) continue
        const n = 12 + Math.floor(Math.random() * 9)
        for (let j = 0; j < n; j++) {
          pos.push(c0.x + gauss() * 0.8, c0.y + gauss() * 0.5, c0.z + gauss() * 0.8)
          const c = cBlue.clone().lerp(new Color('#ffffff'), Math.random() * 0.5)
          col.push(c.r, c.g, c.b)
        }
      }
      addPoints(pos, col, 0.55, 0.95)
    }

    // 6) 球状星团（银晕中的古老暖色星团，分布在盘面上下）
    {
      const pos: number[] = []
      const col: number[] = []
      const cGlob = new Color('#ffdca8')
      for (let i = 0; i < 45; i++) {
        const dir = new Vector3(gauss(), gauss() * 1.6, gauss())
        if (dir.length() === 0) continue
        dir.normalize().multiplyScalar(16 + Math.random() * 42)
        const n = 18 + Math.floor(Math.random() * 12)
        for (let j = 0; j < n; j++) {
          pos.push(dir.x + gauss() * 1.1, dir.y + gauss() * 1.1, dir.z + gauss() * 1.1)
          col.push(cGlob.r, cGlob.g, cGlob.b)
        }
      }
      addPoints(pos, col, 0.4, 0.8)
    }

    // 7) 尘埃带（旋臂内缘的暗色遮挡颗粒，普通混合以压暗背后星光）
    {
      const pos: number[] = []
      const col: number[] = []
      const cDust = new Color('#0d0805')
      for (let i = 0; i < 9000; i++) {
        const p = armPoint(0.6, 0.09, -0.055)
        if (p.r < 8) continue
        pos.push(p.x, p.y * 0.7, p.z)
        col.push(cDust.r, cDust.g, cDust.b)
      }
      addPoints(pos, col, 1.0, 0.4, NormalBlending, 2)
    }

    // 8) 银心光晕（大范围暖色辉光 + 明亮核心）
    const haloMat = new SpriteMaterial({ map: makeGlowTexture(255, 214, 156), transparent: true, opacity: 0.55, depthWrite: false })
    const halo = new Sprite(haloMat)
    halo.scale.setScalar(34)
    galaxy.add(halo)
    const coreMat = new SpriteMaterial({ map: makeGlowTexture(255, 240, 214), transparent: true, opacity: 0.9, depthWrite: false })
    const core = new Sprite(coreMat)
    core.scale.setScalar(9)
    galaxy.add(core)

    // 标签：银心（人马座 A*）与太阳系位置（猎户臂，约半径 52%）
    const sunR = RADIUS * 0.52
    const sunAngle = sunR * SPIN
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
      const v = world.clone().applyMatrix4(galaxy.matrixWorld).project(camera)
      const visible = v.z < 1
      span.style.display = visible ? 'block' : 'none'
      if (visible) {
        span.style.left = `${((v.x + 1) / 2) * el.clientWidth}px`
        span.style.top = `${((1 - v.y) / 2) * el.clientHeight}px`
      }
    }

    let raf = 0
    const tick = () => {
      galaxy.rotation.y += 0.00045
      galaxy.updateMatrixWorld()
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
      window.clearTimeout(armTimer)
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
