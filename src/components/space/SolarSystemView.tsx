import { useEffect, useRef, useState } from 'react'
import {
  AmbientLight, BackSide, CanvasTexture, DoubleSide, Group, LineBasicMaterial, LineLoop,
  Mesh, MeshBasicMaterial, MeshPhongMaterial, PerspectiveCamera, PointLight, Raycaster,
  RingGeometry, Scene, SphereGeometry, Sprite, SpriteMaterial, SRGBColorSpace, TextureLoader,
  Vector2, Vector3, WebGLRenderer, BufferGeometry, Float32BufferAttribute,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useTranslation } from 'react-i18next'
import { PLANETS, SUN_FACTS, SOLAR_NOTE } from '../../data/space'
import { useAppStore } from '../../store/useAppStore'
import FactCard from './FactCard'

/** 生成太阳光晕贴图（径向渐变，避免外部资源） */
function makeGlowTexture(): CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, 'rgba(255,200,80,0.85)')
  g.addColorStop(0.4, 'rgba(255,140,40,0.28)')
  g.addColorStop(1, 'rgba(255,120,20,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  return new CanvasTexture(c)
}

/** 太阳系视图：行星沿压缩轨道公转，点击天体查看资料 */
export default function SolarSystemView() {
  const containerRef = useRef<HTMLDivElement>(null)
  const labelsRef = useRef<HTMLDivElement>(null)
  const [selectedId, setSelectedId] = useState<string>('sun')
  const { i18n } = useTranslation()
  const zh = i18n.language.startsWith('zh')

  useEffect(() => {
    const el = containerRef.current
    const labelLayer = labelsRef.current
    if (!el || !labelLayer) return

    const scene = new Scene()
    const camera = new PerspectiveCamera(50, el.clientWidth / el.clientHeight, 0.1, 8000)
    camera.position.set(0, 90, 210)
    const renderer = new WebGLRenderer({ antialias: true })
    renderer.setSize(el.clientWidth, el.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.minDistance = 40
    controls.maxDistance = 600

    // 滚轮穿越尺度：缩到最小回到地球，拉到最大进入银河系（入场 800ms 免触发）
    const mountedAt = performance.now()
    let jumped = false
    const onScaleCross = () => {
      if (jumped || performance.now() - mountedAt < 800) return
      const d = camera.position.length()
      if (d <= 44) {
        jumped = true
        useAppStore.getState().setView('earth')
      } else if (d >= 590) {
        jumped = true
        useAppStore.getState().setView('galaxy')
      }
    }
    controls.addEventListener('change', onScaleCross)

    scene.add(new AmbientLight(0xffffff, 0.5))
    const sunLight = new PointLight(0xfff3d6, 2200, 0, 1.6)
    scene.add(sunLight)

    const loader = new TextureLoader()
    const loadTex = (url: string) => {
      const t = loader.load(url)
      t.colorSpace = SRGBColorSpace
      return t
    }

    // 星空背景天球
    const sky = new Mesh(
      new SphereGeometry(4000, 32, 32),
      new MeshBasicMaterial({ map: loadTex('/textures/night-sky.png'), side: BackSide }),
    )
    scene.add(sky)

    // 太阳 + 光晕
    const sun = new Mesh(new SphereGeometry(16, 64, 64), new MeshBasicMaterial({ map: loadTex('/space/sun.jpg') }))
    sun.userData.id = 'sun'
    scene.add(sun)
    const glow = new Sprite(new SpriteMaterial({ map: makeGlowTexture(), transparent: true, depthWrite: false }))
    glow.scale.setScalar(70)
    scene.add(glow)

    // 行星与轨道
    const clickable: Mesh[] = [sun]
    const planetMeshes: { id: string; mesh: Mesh; group: Group; dist: number; speed: number; angle: number }[] = []
    for (const p of PLANETS) {
      const group = new Group()
      scene.add(group)
      const mesh = new Mesh(
        new SphereGeometry(p.vRadius, 48, 48),
        new MeshPhongMaterial({ map: loadTex(p.texture), shininess: 8 }),
      )
      mesh.userData.id = p.id
      mesh.position.x = p.vDist
      group.add(mesh)
      clickable.push(mesh)

      if (p.hasRing) {
        // RingGeometry 默认 UV 不适配径向环形贴图，按半径重写 uv.x
        const inner = p.vRadius * 1.35
        const outer = p.vRadius * 2.35
        const ringGeo = new RingGeometry(inner, outer, 96)
        const pos = ringGeo.attributes.position
        const v = new Vector3()
        for (let i = 0; i < pos.count; i++) {
          v.fromBufferAttribute(pos, i)
          ringGeo.attributes.uv.setXY(i, (v.length() - inner) / (outer - inner), 0.5)
        }
        const ring = new Mesh(
          ringGeo,
          new MeshBasicMaterial({ map: loadTex('/space/saturn_ring.png'), side: DoubleSide, transparent: true, opacity: 0.95 }),
        )
        ring.rotation.x = Math.PI / 2 - 0.45
        mesh.add(ring)
      }

      // 轨道线
      const pts: number[] = []
      for (let i = 0; i <= 128; i++) {
        const a = (i / 128) * Math.PI * 2
        pts.push(Math.cos(a) * p.vDist, 0, Math.sin(a) * p.vDist)
      }
      const orbitGeo = new BufferGeometry()
      orbitGeo.setAttribute('position', new Float32BufferAttribute(pts, 3))
      scene.add(new LineLoop(orbitGeo, new LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.5 })))

      planetMeshes.push({
        id: p.id, mesh, group, dist: p.vDist,
        // 角速度按公转周期缩放（幂压缩让外行星仍可见运动）
        speed: 0.25 / Math.pow(p.periodYears, 0.65),
        angle: Math.random() * Math.PI * 2,
      })
    }

    // 屏幕投影标签
    const labelEls = new Map<string, HTMLSpanElement>()
    const mkLabel = (id: string, text: string) => {
      const span = document.createElement('span')
      span.textContent = text
      span.style.cssText =
        'position:absolute;transform:translate(-50%,-140%);font-size:11px;font-family:system-ui;' +
        'color:#cbd5e1;text-shadow:0 0 4px rgba(2,6,23,.9);pointer-events:none;white-space:nowrap'
      labelLayer.appendChild(span)
      labelEls.set(id, span)
    }
    mkLabel('sun', zh ? '太阳' : 'Sun')
    for (const p of PLANETS)
      mkLabel(
        p.id,
        p.id === 'earth'
          ? zh
            ? '地球 · 点击进入'
            : 'Earth · click to enter'
          : zh
            ? p.nameZh
            : p.nameEn,
      )

    const projectLabel = (id: string, worldPos: Vector3) => {
      const span = labelEls.get(id)
      if (!span) return
      const v = worldPos.clone().project(camera)
      const visible = v.z < 1
      span.style.display = visible ? 'block' : 'none'
      if (visible) {
        span.style.left = `${((v.x + 1) / 2) * el.clientWidth}px`
        span.style.top = `${((1 - v.y) / 2) * el.clientHeight}px`
      }
    }

    // 点击拾取
    const raycaster = new Raycaster()
    const onClick = (ev: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      const ndc = new Vector2(
        ((ev.clientX - rect.left) / rect.width) * 2 - 1,
        -((ev.clientY - rect.top) / rect.height) * 2 + 1,
      )
      raycaster.setFromCamera(ndc, camera)
      const hit = raycaster.intersectObjects(clickable, false)[0]
      if (!hit) return
      const id = hit.object.userData.id as string
      // 点击地球：直接落回地球视图
      if (id === 'earth') {
        useAppStore.getState().setView('earth')
        return
      }
      setSelectedId(id)
    }
    renderer.domElement.addEventListener('click', onClick)

    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      sun.rotation.y += dt * 0.02
      for (const pm of planetMeshes) {
        pm.angle += dt * pm.speed
        pm.mesh.position.set(Math.cos(pm.angle) * pm.dist, 0, Math.sin(pm.angle) * pm.dist)
        pm.mesh.rotation.y += dt * 0.3
        projectLabel(pm.id, pm.mesh.getWorldPosition(new Vector3()))
      }
      projectLabel('sun', new Vector3(0, 0, 0))
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
      renderer.domElement.removeEventListener('click', onClick)
      renderer.dispose()
      el.removeChild(renderer.domElement)
      labelEls.forEach((s) => s.remove())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zh])

  const facts =
    selectedId === 'sun'
      ? SUN_FACTS
      : (PLANETS.find((p) => p.id === selectedId)?.facts ?? SUN_FACTS)
  const withNote = { ...facts, noteZh: SOLAR_NOTE[0], noteEn: SOLAR_NOTE[1] }

  return (
    <>
      <div ref={containerRef} className="absolute inset-0 z-0" />
      <div ref={labelsRef} className="pointer-events-none absolute inset-0 z-10 overflow-hidden" />
      <FactCard facts={withNote} />
    </>
  )
}
