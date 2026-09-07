import { useEffect, useRef } from 'react'
import {
  AdditiveBlending, BufferGeometry, Color, Float32BufferAttribute, Group, NormalBlending,
  Points, PointsMaterial, Sprite, SpriteMaterial, Vector3, LineLoop, LineBasicMaterial,
} from 'three'
import type { Blending } from 'three'
import { useTranslation } from 'react-i18next'
import { makeStarTexture, makeGlowTexture } from '../../utils/spriteTextures'
import SpaceExplorer, { useExplorer } from './SpaceExplorer'
import { GALAXY_ITEMS, GALAXY_LAYERS } from '../../data/spaceExplore'
import { createSpaceScene, createSpaceLabels, seededRandom } from './spaceScene'

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
  const explorer = useExplorer(GALAXY_LAYERS)
  const { live } = explorer

  useEffect(() => {
    const el = containerRef.current
    const labelLayer = labelsRef.current
    if (!el || !labelLayer) return

    const runtime = createSpaceScene(el, live, RADIUS)
    const { scene, camera } = runtime
    const random = seededRandom(42)
    const labels = createSpaceLabels(labelLayer, camera, id => explorer.select(id))

    const galaxy = new Group()
    scene.add(galaxy)

    const starTex = makeStarTexture()
    const gauss = () => (random() + random() + random() - 1.5) / 1.5

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
      pts.userData.layer = 'disk'
      galaxy.add(pts)
      return pts
    }

    /** 旋臂上的一个点（armBias 沿臂法向偏移，用于尘埃带） */
    const armPoint = (rPow: number, spread: number, armBias = 0) => {
      const r = Math.pow(random(), rPow) * RADIUS
      const arm = Math.floor(random() * ARMS)
      // 两条主臂更密：奇数臂 40% 概率丢给主臂
      const density = arm % 2 === 1 && random() < 0.4 ? arm - 1 : arm
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
        const p = armPoint(0.72, 0.5)
        pos.push(p.x, p.y, p.z)
        // 8% 红巨星、6% 蓝白亮星，其余按半径渐变
        const c = random() < 0.08 ? cRed : random() < 0.065 ? cBlue : mixByRadius(p.r)
        col.push(c.r, c.g, c.b)
      }
      addPoints(pos, col, 0.65, 0.65)
    }

    {
      const positions: number[] = [], colors: number[] = []
      for (let i = 0; i < 9000; i++) {
        const radius = Math.sqrt(random()) * RADIUS * 0.94
        const angle = random() * Math.PI * 2
        positions.push(Math.cos(angle) * radius, gauss() * 1.2, Math.sin(angle) * radius)
        const color = mixByRadius(radius)
        colors.push(color.r, color.g, color.b)
      }
      addPoints(positions, colors, 1.15, 0.12)
    }

    // 2) 旋臂亮星（大颗粒、偏蓝白，勾勒臂形）
    {
      const pos: number[] = []
      const col: number[] = []
      for (let i = 0; i < 7000; i++) {
        const p = armPoint(0.6, 0.12)
        pos.push(p.x, p.y, p.z)
        const c = cBlue.clone().lerp(cMid, random() * 0.6)
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
        const c = cCore.clone().lerp(new Color('#ffd28a'), random() * 0.5)
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
      addPoints(pos, col, 4.2, 0.16).userData.layer = 'nebula'
    }

    // 5) 疏散星团（旋臂内的蓝白色致密星群）
    {
      const pos: number[] = []
      const col: number[] = []
      for (let i = 0; i < 70; i++) {
        const c0 = armPoint(0.55, 0.1)
        if (c0.r < 10) continue
        const n = 12 + Math.floor(random() * 9)
        for (let j = 0; j < n; j++) {
          pos.push(c0.x + gauss() * 0.8, c0.y + gauss() * 0.5, c0.z + gauss() * 0.8)
          const c = cBlue.clone().lerp(new Color('#ffffff'), random() * 0.5)
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
        dir.normalize().multiplyScalar(16 + random() * 42)
        const n = 18 + Math.floor(random() * 12)
        for (let j = 0; j < n; j++) {
          pos.push(dir.x + gauss() * 1.1, dir.y + gauss() * 1.1, dir.z + gauss() * 1.1)
          col.push(cGlob.r, cGlob.g, cGlob.b)
        }
      }
      addPoints(pos, col, 0.4, 0.8).userData.layer = 'halo'
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
      addPoints(pos, col, 1.0, 0.4, NormalBlending, 2).userData.layer = 'nebula'
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

    const destinations: Record<string, Vector3> = {
      sun: sunPos, core: new Vector3(0, 0, 0),
      arms: new Vector3(Math.cos(48 * SPIN + Math.PI) * 48, 0, Math.sin(48 * SPIN + Math.PI) * 48),
      halo: new Vector3(17, 25, -10),
    }
    for (const item of GALAXY_ITEMS.slice(1)) {
      labels.add(item.id, zh ? item.nameZh : item.nameEn, item.color,
        () => destinations[item.id].clone().applyMatrix4(galaxy.matrixWorld))
    }
    const orbit = new LineLoop(new BufferGeometry().setFromPoints(Array.from({ length: 180 }, (_, i) => {
      const angle = i / 180 * Math.PI * 2
      return new Vector3(Math.cos(angle) * sunR, 0, Math.sin(angle) * sunR)
    })), new LineBasicMaterial({ color: '#fbbf24', transparent: true, opacity: 0.4 }))
    galaxy.add(orbit)
    const sunMarker = new Sprite(new SpriteMaterial({ map: makeGlowTexture(255, 206, 92), transparent: true, depthWrite: false }))
    sunMarker.position.copy(sunPos); sunMarker.scale.setScalar(3)
    galaxy.add(sunMarker)

    runtime.setFocusProvider(id => destinations[id] ? {
      position: destinations[id].clone().applyMatrix4(galaxy.matrixWorld), distance: id === 'core' ? 40 : 65,
    } : null)
    runtime.start(dt => {
      const settings = live.current
      galaxy.rotation.y += dt * 0.025
      for (const child of galaxy.children) if (child.userData.layer) child.visible = settings.layers[child.userData.layer]
      orbit.visible = settings.selected === 'sun'
      sunMarker.scale.setScalar(settings.selected === 'sun' ? 5 : 3)
      galaxy.updateMatrixWorld()
    }, () => labels.update(live.current))
    return () => { labels.dispose(); runtime.dispose() }
    // Settings are read through live; controls never rebuild the scene.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zh])

  return (
    <>
      <div ref={containerRef} className="space-stage" />
      <div ref={labelsRef} className="space-stage pointer-events-none overflow-hidden" />
      <SpaceExplorer kind="galaxy" explorer={explorer} items={GALAXY_ITEMS} layers={GALAXY_LAYERS}
        note={['银河系结构与地标位置为示意；粒子代表恒星群，旋转仅用于展示。', 'Structure and landmark positions are schematic. Particles represent stellar populations; rotation is illustrative.']} />
    </>
  )
}
