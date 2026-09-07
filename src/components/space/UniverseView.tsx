import { useEffect, useRef } from 'react'
import {
  AdditiveBlending, BufferGeometry, Color, Float32BufferAttribute, Group,
  Points, PointsMaterial, Sprite, SpriteMaterial, Vector3, Mesh, SphereGeometry, MeshBasicMaterial, LineSegments, LineBasicMaterial,
} from 'three'
import { useTranslation } from 'react-i18next'
import { makeStarTexture, makeGlowTexture, makeSpiralTexture } from '../../utils/spriteTextures'
import SpaceExplorer, { useExplorer } from './SpaceExplorer'
import { UNIVERSE_ITEMS, UNIVERSE_LAYERS, UNIVERSE_POSITIONS } from '../../data/spaceExplore'
import { createSpaceScene, createSpaceLabels, seededRandom } from './spaceScene'

const CLUSTERS = 130
const R = 95

/** 可观测宇宙视图：宇宙网——星系团核心（暖色椭圆星系）+ 纤维（蓝白旋涡星系）+ 空洞 */
export default function UniverseView() {
  const containerRef = useRef<HTMLDivElement>(null)
  const labelsRef = useRef<HTMLDivElement>(null)
  const { i18n } = useTranslation()
  const zh = i18n.language.startsWith('zh')
  const explorer = useExplorer(UNIVERSE_LAYERS)
  const { live } = explorer

  useEffect(() => {
    const el = containerRef.current
    const labelLayer = labelsRef.current
    if (!el || !labelLayer) return

    const runtime = createSpaceScene(el, live, R)
    const { scene, camera } = runtime
    const random = seededRandom(137)
    const labels = createSpaceLabels(labelLayer, camera, id => explorer.select(id))
    const voidCenter = new Vector3(...UNIVERSE_POSITIONS.void)

    const web = new Group()
    scene.add(web)

    const starTex = makeStarTexture()
    const gauss = () => (random() + random() + random() - 1.5) / 1.5

    const addPoints = (positions: number[], colors: number[], size: number, opacity: number, layer = 'clusters') => {
      // Carve an underdense region matching the visible void boundary.
      const filtered: number[] = [], filteredColors: number[] = []
      for (let i = 0; i < positions.length; i += 3) {
        if (new Vector3(positions[i], positions[i + 1], positions[i + 2]).distanceTo(voidCenter) < 18) continue
        filtered.push(...positions.slice(i, i + 3)); filteredColors.push(...colors.slice(i, i + 3))
      }
      const geo = new BufferGeometry()
      geo.setAttribute('position', new Float32BufferAttribute(filtered, 3))
      geo.setAttribute('color', new Float32BufferAttribute(filteredColors, 3))
      const points = new Points(geo, new PointsMaterial({
        size, sizeAttenuation: true, map: starTex, vertexColors: true,
        blending: AdditiveBlending, depthWrite: false, transparent: true, opacity,
      }))
      points.userData.layer = layer
      web.add(points)
    }

    // 星系团中心（球内均匀采样）
    const centers: Vector3[] = [new Vector3(...UNIVERSE_POSITIONS.cluster), new Vector3(-10, -5, 0)]
    for (let i = 0; i < CLUSTERS; i++) {
      const v = new Vector3(gauss() * 2, gauss() * 2, gauss() * 2)
      if (v.length() === 0) v.set(1, 0, 0)
      v.normalize().multiplyScalar(Math.cbrt(random()) * R)
      if (v.distanceTo(voidCenter) > 24) centers.push(v)
    }

    const cElliptical = new Color('#ffd9a8') // 团核心的老年椭圆星系：暖黄
    const cSpiral = new Color('#c9dcff') // 纤维与外围的旋涡星系：蓝白
    const cFaint = new Color('#8aa4e8') // 远处暗弱星系
    const jitterColor = (c: Color, amt: number) =>
      c.clone().offsetHSL((random() - 0.5) * 0.03, 0, (random() - 0.5) * amt)

    // 1) 团核心：致密的暖色椭圆星系（大而亮）
    {
      const pos: number[] = []
      const col: number[] = []
      for (const c0 of centers) {
        const n = 16 + Math.floor(random() * 26)
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
        const n = 34 + Math.floor(random() * 60)
        for (let i = 0; i < n; i++) {
          pos.push(c0.x + gauss() * 5.2, c0.y + gauss() * 5.2, c0.z + gauss() * 5.2)
          const c = jitterColor(random() < 0.7 ? cSpiral : cFaint, 0.3)
          col.push(c.r, c.g, c.b)
        }
      }
      addPoints(pos, col, 0.85, 0.8)
    }

    // 3) 纤维：连接最近的两个团（暗弱蓝色星系串）
    {
      const bridges: number[] = []
      const seen = new Set<string>()
      const pos: number[] = []
      const col: number[] = []
      for (const c0 of centers) {
        const nearest = centers
          .filter((o) => o !== c0)
          .sort((a, b) => a.distanceTo(c0) - b.distanceTo(c0))
          .slice(0, 2)
        for (const n of nearest) {
          const key = [centers.indexOf(c0), centers.indexOf(n)].sort((a, b) => a - b).join(':')
          if (seen.has(key)) continue
          seen.add(key)
          // Keep guides outside the illustrated void too.
          const delta = n.clone().sub(c0)
          const t = Math.max(0, Math.min(1, voidCenter.clone().sub(c0).dot(delta) / delta.lengthSq()))
          if (c0.clone().addScaledVector(delta, t).distanceTo(voidCenter) < 18) continue
          bridges.push(c0.x, c0.y, c0.z, n.x, n.y, n.z)
          const steps = 26
          for (let i = 1; i < steps; i++) {
            const v = c0.clone().lerp(n, i / steps)
            pos.push(v.x + gauss() * 2.0, v.y + gauss() * 2.0, v.z + gauss() * 2.0)
            const c = jitterColor(random() < 0.6 ? cFaint : cSpiral, 0.35)
            col.push(c.r, c.g, c.b)
          }
        }
      }
      addPoints(pos, col, 0.9, 0.85, 'filaments')
      const connections = new LineSegments(new BufferGeometry().setAttribute('position', new Float32BufferAttribute(bridges, 3)), new LineBasicMaterial({ color: '#8299df', transparent: true, opacity: 0.18, depthWrite: false }))
      connections.userData.layer = 'filaments'
      web.add(connections)
    }

    {
      const positions: number[] = [], colors: number[] = []
      for (let i = 0; i < 150; i++) {
        const p = centers[0].clone().lerp(centers[1], random())
        positions.push(p.x + gauss(), p.y + gauss(), p.z + gauss())
        colors.push(0.6, 0.7, 1)
      }
      addPoints(positions, colors, 0.8, 0.85, 'filaments')
    }

    // 4) 每个团中心一个"最亮团星系"（cD 星系辉光）
    {
      const cdTex = makeGlowTexture(255, 226, 180)
      for (const c0 of centers) {
        const s = new Sprite(new SpriteMaterial({ map: cdTex, transparent: true, opacity: 0.7, depthWrite: false }))
        s.userData.layer = 'clusters'
        s.position.copy(c0)
        s.scale.setScalar(2.6 + random() * 2.4)
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

    const voidOutline = new Mesh(new SphereGeometry(18, 24, 16), new MeshBasicMaterial({ color: '#67e8f9', wireframe: true, transparent: true, opacity: 0.09, depthWrite: false }))
    voidOutline.position.copy(voidCenter)
    voidOutline.userData.layer = 'voids'
    web.add(voidOutline)
    for (const item of UNIVERSE_ITEMS.slice(1)) {
      const layer = item.id === 'cluster' ? 'clusters' : item.id === 'filament' ? 'filaments' : item.id === 'void' ? 'voids' : undefined
      labels.add(item.id, zh ? item.nameZh : item.nameEn, item.color,
        () => new Vector3(...UNIVERSE_POSITIONS[item.id]).applyMatrix4(web.matrixWorld), layer)
    }
    runtime.setFocusProvider(id => UNIVERSE_POSITIONS[id] ? {
      position: new Vector3(...UNIVERSE_POSITIONS[id]).applyMatrix4(web.matrixWorld), distance: id === 'local' ? 28 : 60,
    } : null)
    runtime.start(dt => {
      const settings = live.current
      web.rotation.y += dt * 0.018
      for (const child of web.children) if (child.userData.layer) child.visible = settings.layers[child.userData.layer]
      ;(voidOutline.material as MeshBasicMaterial).opacity = settings.selected === 'void' ? 0.25 : 0.07
      web.updateMatrixWorld()
    }, () => labels.update(live.current))
    return () => { labels.dispose(); runtime.dispose() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zh])

  return (
    <>
      <div ref={containerRef} className="space-stage" />
      <div ref={labelsRef} className="space-stage pointer-events-none overflow-hidden" />
      <SpaceExplorer kind="universe" explorer={explorer} items={UNIVERSE_ITEMS} layers={UNIVERSE_LAYERS}
        note={['宇宙网为结构示意，非巡天地图；近邻星系被放大，地标不使用真实坐标。', 'A schematic cosmic web, not a survey map. Nearby galaxies are enlarged; landmarks are not at measured coordinates.']} />
    </>
  )
}
