import { useEffect, useRef } from 'react'
import {
  AmbientLight, BackSide, CanvasTexture, DoubleSide, Group, Line, LineBasicMaterial, LineLoop,
  Mesh, MeshBasicMaterial, MeshPhongMaterial, PointLight, Raycaster, Points, PointsMaterial,
  RingGeometry, SphereGeometry, Sprite, SpriteMaterial, SRGBColorSpace, TextureLoader,
  Vector2, Vector3, BufferGeometry, Float32BufferAttribute,
} from 'three'
import { useTranslation } from 'react-i18next'
import { PLANETS, SOLAR_NOTE } from '../../data/space'
import { DEEP_SPACE_PROBES } from '../../data/spacecraft'
import SpaceExplorer, { useExplorer } from './SpaceExplorer'
import { SOLAR_ITEMS, SOLAR_LAYERS } from '../../data/spaceExplore'
import { createSpaceScene, createSpaceLabels, seededRandom } from './spaceScene'

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
  const { i18n } = useTranslation()
  const zh = i18n.language.startsWith('zh')
  const explorer = useExplorer(SOLAR_LAYERS)
  const { live } = explorer

  useEffect(() => {
    const el = containerRef.current
    const labelLayer = labelsRef.current
    if (!el || !labelLayer) return

    const runtime = createSpaceScene(el, live, 230)
    const { scene, camera, renderer } = runtime
    const random = seededRandom(8)
    const labels = createSpaceLabels(labelLayer, camera, id => explorer.select(id))
    const orbitGroup = new Group(), beltGroup = new Group(), guideGroup = new Group(), probeGroup = new Group()
    scene.add(orbitGroup, beltGroup, guideGroup, probeGroup)

    scene.add(new AmbientLight(0xffffff, 0.5))
    const sunLight = new PointLight(0xfff3d6, 2200, 0, 1.6)
    scene.add(sunLight)

    const loader = new TextureLoader()
    const loadTex = (url: string) => {
      const t = loader.load(url)
      t.colorSpace = SRGBColorSpace
      runtime.textures.add(t)
      return t
    }
    /** 贴图异步加载期间先用近似底色渲染，避免天体黑屏闪烁 */
    const texturedPhong = (url: string, baseColor: number) => {
      const mat = new MeshPhongMaterial({ color: baseColor, shininess: 8 })
      const texture = loader.load(url, (t) => {
        if (runtime.isDisposed()) { t.dispose(); return }
        t.colorSpace = SRGBColorSpace
        mat.map = t
        mat.color.set(0xffffff)
        mat.needsUpdate = true
      })
      runtime.textures.add(texture)
      return mat
    }
    const PLANET_BASE_COLORS: Record<string, number> = {
      mercury: 0x9c8e82, venus: 0xd9b27c, earth: 0x4a6fa5, mars: 0xb35a3c,
      jupiter: 0xc8a97e, saturn: 0xd8c393, uranus: 0x9fd4d9, neptune: 0x4f6fd8,
    }

    // 星空背景天球
    const sky = new Mesh(
      new SphereGeometry(4000, 32, 32),
      new MeshBasicMaterial({ map: loadTex('/textures/night-sky.png'), side: BackSide, color: '#354054' }),
    )
    scene.add(sky)

    // 太阳 + 光晕（贴图未就绪前用橙色底色）
    const sunMat = new MeshBasicMaterial({ color: 0xffa030 })
    const sunTexture = loader.load('/space/sun.jpg', (t) => {
      if (runtime.isDisposed()) { t.dispose(); return }
      t.colorSpace = SRGBColorSpace
      sunMat.map = t
      sunMat.color.set(0xffffff)
      sunMat.needsUpdate = true
    })
    runtime.textures.add(sunTexture)
    const sun = new Mesh(new SphereGeometry(16, 64, 64), sunMat)
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
        texturedPhong(p.texture, PLANET_BASE_COLORS[p.id] ?? 0x888888),
      )
      mesh.userData.id = p.id
      mesh.position.x = p.vDist
      group.add(mesh)
      clickable.push(mesh)

      // 拾取代理：行星在屏幕上只有二十来像素且一直在公转，直接点本体很容易点空
      // （用户反馈“要点两次才进得去”）。套一层不可见的大球专门接管点击。
      const pick = new Mesh(
        new SphereGeometry(Math.max(p.vRadius * 2.4, 5), 12, 12),
        new MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
      )
      pick.userData.id = p.id
      mesh.add(pick)
      clickable.push(pick)

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
      orbitGroup.add(new LineLoop(orbitGeo, new LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.5 })))

      planetMeshes.push({
        id: p.id, mesh, group, dist: p.vDist,
        // 角速度按公转周期缩放（幂压缩让外行星仍可见运动）
        speed: 0.25 / Math.pow(p.periodYears, 0.65),
        angle: PLANETS.indexOf(p) * 2.39996,
      })
    }

    labels.add('sun', zh ? '太阳' : 'Sun', '#fbbf24', () => new Vector3())
    for (const p of PLANETS) {
      const planet = planetMeshes.find(pm => pm.id === p.id)!
      labels.add(p.id, zh ? p.nameZh : p.nameEn, '#93c5fd', () => planet.mesh.getWorldPosition(new Vector3()))
    }
    // Thin belts give the scene a readable transition from inner rocky worlds to its icy outskirts.
    for (const belt of [{ id: 'asteroids', inner: 80, outer: 90, color: '#b9aa93', count: 1600 }, { id: 'kuiper', inner: 207, outer: 236, color: '#8998cf', count: 2600 }]) {
      const positions: number[] = []
      for (let i = 0; i < belt.count; i++) {
        const angle = random() * Math.PI * 2, r = belt.inner + random() * (belt.outer - belt.inner)
        positions.push(Math.cos(angle) * r, (random() - 0.5) * 3, Math.sin(angle) * r)
      }
      const points = new Points(new BufferGeometry().setAttribute('position', new Float32BufferAttribute(positions, 3)), new PointsMaterial({ color: belt.color, size: 0.55, transparent: true, opacity: 0.6, depthWrite: false }))
      beltGroup.add(points)
      labels.add(belt.id, zh ? (belt.id === 'asteroids' ? '小行星带' : '柯伊伯带') : (belt.id === 'asteroids' ? 'Asteroid belt' : 'Kuiper belt'), belt.color,
        () => new Vector3(-belt.inner * 0.8, 0, belt.inner * 0.6), 'belts')
    }

    // 日地拉格朗日点 L1–L5（L1/L2 离地球仅 0.01 AU，展示距离经夸大）
    const lagrangeDefs = [
      { id: 'l1', text: 'L1' },
      { id: 'l2', text: zh ? 'L2 · 韦布望远镜' : 'L2 · JWST' },
      { id: 'l3', text: 'L3' },
      { id: 'l4', text: 'L4' },
      { id: 'l5', text: 'L5' },
    ]
    const lagrangeMeshes = new Map<string, Mesh>()
    for (const ld of lagrangeDefs) {
      const m = new Mesh(new SphereGeometry(0.7, 16, 16), new MeshBasicMaterial({ color: 0xa5f3fc }))
      guideGroup.add(m)
      lagrangeMeshes.set(ld.id, m)
      labels.add('lagrange', ld.text, '#a5f3fc', () => m.position.clone(), 'guides')
    }
    // 深空探测器：方向示意 + 真实距离标签 + 轨迹线
    for (const probe of DEEP_SPACE_PROBES) {
      const pos = new Vector3(...probe.pos)
      const dot = new Mesh(new SphereGeometry(1.1, 12, 12), new MeshBasicMaterial({ color: 0xe2e8f0 }))
      dot.position.copy(pos)
      probeGroup.add(dot)
      // 从内太阳系方向拉出的轨迹线
      const from = pos.clone().normalize().multiplyScalar(Math.min(60, pos.length() * 0.35))
      const trackGeo = new BufferGeometry()
      trackGeo.setAttribute(
        'position',
        new Float32BufferAttribute([from.x, from.y, from.z, pos.x, pos.y, pos.z], 3),
      )
      probeGroup.add(
        new Line(trackGeo, new LineBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.3 })),
      )
      labels.add(probe.id, zh ? probe.nameZh : probe.nameEn, '#cbd5e1', () => pos.clone(), 'probes')
    }

    /** 按地球当前轨道角更新 L1–L5 位置 */
    const updateLagrange = (earthAngle: number, earthDist: number) => {
      const dir = new Vector3(Math.cos(earthAngle), 0, Math.sin(earthAngle))
      const set = (id: string, v: Vector3) => {
        const m = lagrangeMeshes.get(id)
        if (m) m.position.copy(v)
      }
      set('l1', dir.clone().multiplyScalar(earthDist - 8))
      set('l2', dir.clone().multiplyScalar(earthDist + 8))
      set('l3', dir.clone().multiplyScalar(-earthDist))
      const rot = (da: number) =>
        new Vector3(Math.cos(earthAngle + da), 0, Math.sin(earthAngle + da)).multiplyScalar(earthDist)
      set('l4', rot(-Math.PI / 3)) // 轨道前方 60°
      set('l5', rot(Math.PI / 3)) // 轨道后方 60°
    }

    // 点击拾取
    const raycaster = new Raycaster()
    /** 屏幕坐标 → 命中的天体 id */
    const pickAt = (clientX: number, clientY: number): string | null => {
      const rect = renderer.domElement.getBoundingClientRect()
      const ndc = new Vector2(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1,
      )
      raycaster.setFromCamera(ndc, camera)
      const hit = raycaster.intersectObjects(clickable, false)[0]
      return hit ? ((hit.object.userData.id as string) ?? null) : null
    }

    // 悬停变手型，明确告诉用户天体可点
    const onMove = (ev: MouseEvent) => {
      renderer.domElement.style.cursor = pickAt(ev.clientX, ev.clientY) ? 'pointer' : 'grab'
    }
    renderer.domElement.style.cursor = 'grab'
    renderer.domElement.addEventListener('mousemove', onMove)

    let down: { x: number; y: number } | null = null
    const onDown = (ev: PointerEvent) => { down = { x: ev.clientX, y: ev.clientY } }
    const onUp = (ev: PointerEvent) => {
      if (!down || Math.hypot(ev.clientX - down.x, ev.clientY - down.y) > 6) { down = null; return }
      down = null
      const id = pickAt(ev.clientX, ev.clientY)
      if (id) explorer.select(id)
    }
    const onCancel = () => { down = null }
    renderer.domElement.addEventListener('pointerdown', onDown)
    renderer.domElement.addEventListener('pointerup', onUp)
    renderer.domElement.addEventListener('pointercancel', onCancel)

    runtime.setFocusProvider(id => {
      const planet = planetMeshes.find(p => p.id === id)
      if (planet) return { position: planet.mesh.getWorldPosition(new Vector3()), distance: Math.max(PLANETS.find(p => p.id === id)!.vRadius * 9, 18) }
      if (id === 'sun') return { position: new Vector3(), distance: 95 }
      const probe = DEEP_SPACE_PROBES.find(p => p.id === id)
      if (probe) return { position: new Vector3(...probe.pos), distance: 35 }
      if (id === 'lagrange') return { position: lagrangeMeshes.get('l2')!.position.clone(), distance: 65 }
      const r = id === 'asteroids' ? 85 : id === 'kuiper' ? 220 : 0
      return r ? { position: new Vector3(-r * 0.8, 0, r * 0.6), distance: 80 } : null
    })
    runtime.start(dt => {
      const settings = live.current
      orbitGroup.visible = settings.layers.orbits
      beltGroup.visible = settings.layers.belts
      guideGroup.visible = settings.layers.guides
      probeGroup.visible = settings.layers.probes
      sun.rotation.y += dt * 0.02
      for (const pm of planetMeshes) {
        pm.angle += dt * pm.speed * 0.25
        pm.mesh.position.set(Math.cos(pm.angle) * pm.dist, 0, Math.sin(pm.angle) * pm.dist)
        pm.mesh.rotation.y += dt * 0.3
        if (pm.id === 'earth') updateLagrange(pm.angle, pm.dist)
        const mat = pm.mesh.material as MeshPhongMaterial
        mat.emissive.set(settings.selected === pm.id ? '#18334a' : '#000000')
      }
      scene.updateMatrixWorld()
    }, () => labels.update(live.current))
    return () => {
      renderer.domElement.removeEventListener('pointerdown', onDown)
      renderer.domElement.removeEventListener('pointerup', onUp)
      renderer.domElement.removeEventListener('pointercancel', onCancel)
      renderer.domElement.removeEventListener('mousemove', onMove)
      labels.dispose(); runtime.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zh])

  return (
    <>
      <div ref={containerRef} className="space-stage" />
      <div ref={labelsRef} className="space-stage pointer-events-none overflow-hidden" />
      <SpaceExplorer kind="solar" explorer={explorer} items={SOLAR_ITEMS} layers={SOLAR_LAYERS} note={[SOLAR_NOTE[0] + ' 公转速度为演示速度，非实时星历。', SOLAR_NOTE[1] + ' Orbital motion is illustrative, not a live ephemeris.']} />
    </>
  )
}
