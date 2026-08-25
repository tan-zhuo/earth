/**
 * 贴地国界：把国家边界折线按地形高度抬起来画。
 *
 * globe.gl 的多边形图层是"平顶盖"，一旦地形起伏放大，国界要么被山脉戳穿，
 * 要么整层悬在半空。这里改成自己按边界点采样高程生成折线，贴着地形走；
 * 全部国界合并进一个 LineSegments，只占一次 draw call。
 */
import { BufferGeometry, Float32BufferAttribute, LineBasicMaterial, LineSegments } from 'three'
import type { Feature, Geometry, Position } from 'geojson'
import { EARTH_RADIUS_M } from '../data/terrain'
import type { ElevationSampler } from '../data/terrain'

/** 边界线离地高度（地球半径倍数），避免与地表 z-fighting */
const LINE_LIFT = 0.0015
/** 长于该角距（度）的边界段要细分，否则跨山脉的直线段会插进山里 */
const MAX_STEP_DEG = 1

export interface BorderOptions {
  sampler: ElevationSampler
  exaggeration: number
  /** three-globe 的经纬度 → 世界坐标 */
  toXYZ: (lat: number, lng: number, alt: number) => { x: number; y: number; z: number }
  color: string
  opacity: number
}

export function buildDrapedBorders(
  feats: Feature<Geometry>[],
  { sampler, exaggeration, toXYZ, color, opacity }: BorderOptions,
): LineSegments {
  const pos: number[] = []

  const push = (lat: number, lng: number) => {
    // 海面以下不下沉：海岸线与海上边界留在海平面
    const alt = LINE_LIFT + (Math.max(0, sampler(lat, lng)) * exaggeration) / EARTH_RADIUS_M
    const { x, y, z } = toXYZ(lat, lng, alt)
    pos.push(x, y, z)
  }

  const addRing = (ring: Position[]) => {
    for (let i = 0; i < ring.length - 1; i++) {
      const [lng1, lat1] = ring[i]
      const [lng2, lat2] = ring[i + 1]
      if (Math.abs(lng2 - lng1) > 180) continue // 跨换日线的接缝段，跳过
      const steps = Math.max(
        1,
        Math.ceil(Math.max(Math.abs(lat2 - lat1), Math.abs(lng2 - lng1)) / MAX_STEP_DEG),
      )
      for (let s = 0; s < steps; s++) {
        push(lat1 + ((lat2 - lat1) * s) / steps, lng1 + ((lng2 - lng1) * s) / steps)
        push(lat1 + ((lat2 - lat1) * (s + 1)) / steps, lng1 + ((lng2 - lng1) * (s + 1)) / steps)
      }
    }
  }

  for (const f of feats) {
    const g = f.geometry
    const polys =
      g.type === 'Polygon'
        ? [g.coordinates]
        : g.type === 'MultiPolygon'
          ? g.coordinates
          : []
    for (const poly of polys) for (const ring of poly) addRing(ring)
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(pos, 3))
  const lines = new LineSegments(
    geometry,
    new LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false }),
  )
  lines.raycast = () => {} // 纯装饰，别参与拾取
  return lines
}
