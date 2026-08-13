/**
 * Canvas 程序化生成的辉光贴图：恒星光点、星云团、旋涡星系。
 * 供银河系/宇宙视图的粒子与精灵使用，避免外部资源。
 */
import { CanvasTexture } from 'three'

/** 柔和圆形光点（恒星/星系通用） */
export function makeStarTexture(): CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.25, 'rgba(255,255,255,0.55)')
  g.addColorStop(0.6, 'rgba(255,255,255,0.12)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  return new CanvasTexture(c)
}

/** 大而弥散的云雾状光斑（星云/星系晕/银心光晕） */
export function makeGlowTexture(r: number, g: number, b: number): CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')!
  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  grad.addColorStop(0, `rgba(${r},${g},${b},0.9)`)
  grad.addColorStop(0.35, `rgba(${r},${g},${b},0.35)`)
  grad.addColorStop(0.7, `rgba(${r},${g},${b},0.08)`)
  grad.addColorStop(1, `rgba(${r},${g},${b},0)`)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 128, 128)
  return new CanvasTexture(c)
}

/** 旋涡星系精灵：椭圆盘 + 两条旋臂 + 亮核（用于仙女座等"实体"星系） */
export function makeSpiralTexture(): CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')!
  ctx.translate(64, 64)
  // 外盘
  const disk = ctx.createRadialGradient(0, 0, 0, 0, 0, 60)
  disk.addColorStop(0, 'rgba(255,240,220,0.85)')
  disk.addColorStop(0.3, 'rgba(190,205,255,0.35)')
  disk.addColorStop(0.7, 'rgba(150,170,230,0.12)')
  disk.addColorStop(1, 'rgba(140,160,220,0)')
  ctx.fillStyle = disk
  ctx.beginPath()
  ctx.ellipse(0, 0, 60, 34, 0, 0, Math.PI * 2)
  ctx.fill()
  // 两条旋臂（压扁模拟倾角）
  ctx.strokeStyle = 'rgba(215,225,255,0.5)'
  ctx.lineWidth = 5
  ctx.lineCap = 'round'
  for (const dir of [0, Math.PI]) {
    ctx.beginPath()
    for (let t = 0; t <= 1; t += 0.04) {
      const a = dir + t * 2.4
      const r = 8 + t * 48
      const x = Math.cos(a) * r
      const y = Math.sin(a) * r * 0.55
      if (t === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
  // 亮核
  const core = ctx.createRadialGradient(0, 0, 0, 0, 0, 14)
  core.addColorStop(0, 'rgba(255,245,225,1)')
  core.addColorStop(1, 'rgba(255,235,200,0)')
  ctx.fillStyle = core
  ctx.beginPath()
  ctx.ellipse(0, 0, 14, 9, 0, 0, Math.PI * 2)
  ctx.fill()
  return new CanvasTexture(c)
}
