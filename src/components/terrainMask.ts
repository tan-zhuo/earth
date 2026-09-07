/**
 * 悬停/选中高亮的"贴地"实现。
 *
 * globe.gl 的高亮是平顶多边形盖：地形放大后它要么悬在山上方（近看穿帮），
 * 要么被山脉戳穿。这里改成把国家轮廓画进一张等经纬掩码贴图，
 * 由地球着色器直接在地表上着色 —— 高亮就长在地形上，任何倍数、任何视角都不会错位。
 *
 * 通道分工：R = 悬停，G = 选中填充，B = 选中边界。
 */
import { CanvasTexture, LinearFilter } from 'three'
import type { Feature, Geometry, Position } from 'geojson'

/** 掩码分辨率：与高程贴图同档，边缘才不会出现明显的锯齿台阶 */
const W = 2048
const H = 1024

export interface TerrainMask {
  texture: CanvasTexture
  /** 重画掩码；两个参数都为 null 时清空 */
  update: (hover: Feature<Geometry> | null, selected: Feature<Geometry> | null) => void
  dispose: () => void
}

export function createTerrainMask(): TerrainMask {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  const texture = new CanvasTexture(canvas)
  texture.minFilter = texture.magFilter = LinearFilter
  texture.generateMipmaps = false

  const tracePolygon = (rings: Position[][]) => {
    for (const ring of rings) {
      ring.forEach(([lng, lat], i) => {
        const x = ((lng + 180) / 360) * W
        const y = ((90 - lat) / 180) * H
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      })
      ctx.closePath()
    }
  }

  const paint = (f: Feature<Geometry>, color: string) => {
    const g = f.geometry
    const polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : []
    ctx.fillStyle = color
    for (const poly of polys) {
      ctx.beginPath()
      tracePolygon(poly)
      ctx.fill('evenodd') // 外环减内环（飞地/湖泊）
      if (color === '#00ff00') {
        ctx.strokeStyle = '#0000ff'
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
    }
  }

  // 只在悬停/选中真的变了时才重画并重传贴图（applyStyles 每次悬停都会调用进来）
  let lastHover: Feature<Geometry> | null = null
  let lastSelected: Feature<Geometry> | null = null
  let painted = false
  return {
    texture,
    update(hover, selected) {
      if (hover === lastHover && selected === lastSelected) return
      lastHover = hover
      lastSelected = selected
      if (!hover && !selected && !painted) return
      ctx.clearRect(0, 0, W, H)
      ctx.globalCompositeOperation = 'lighter' // 同一国家既悬停又选中时两个通道叠加
      if (hover) paint(hover, '#ff0000')
      if (selected) paint(selected, '#00ff00')
      ctx.globalCompositeOperation = 'source-over'
      painted = !!(hover || selected)
      texture.needsUpdate = true
    },
    dispose() {
      texture.dispose()
    },
  }
}
