/**
 * 地形高程（含海底）数据的编码常量、色带与取值工具。
 *
 * 贴图由 scripts/build-terrain.mjs 从 NOAA ETOPO1 生成：
 *   earth-elevation.png  绝对高程，byte = 高程(m)/ELEV_STEP + SEA_BYTE
 *   earth-relief.png     局部起伏（高通），byte = 起伏(m)/RELIEF_STEP + 128
 * 改动编码请同步修改脚本里的同名常量。
 */

export const ELEVATION_TEXTURE = '/textures/earth-elevation.png'
export const RELIEF_TEXTURE = '/textures/earth-relief.png'

export const ELEV_STEP = 80
export const SEA_BYTE = 140
export const RELIEF_STEP = 16
export const TEX_W = 2048
export const TEX_H = 1024

export const EARTH_RADIUS_M = 6_371_000
/** 贴图中的最高点（20km 网格平均后约 6.2km），用于给国界/国旗等矢量图层留净空 */
export const MAX_TERRAIN_M = 6500
/** 垂直夸张默认值与范围：真实比例下珠峰只有地球半径的 0.14%，必须放大才看得见 */
export const EXAGGERATION_DEFAULT = 12
export const EXAGGERATION_MAX = 25

/** 高程字节 → 米 */
export const byteToMeters = (b: number) => (b - SEA_BYTE) * ELEV_STEP

/** 高程色带：海沟 → 深海 → 大陆架 → 平原 → 高山 → 雪线（米 → 颜色） */
const COLOR_STOPS: [number, [number, number, number]][] = [
  [-11000, [6, 16, 40]],
  [-6000, [12, 42, 82]],
  [-4000, [18, 64, 111]],
  [-2000, [28, 92, 140]],
  [-500, [42, 127, 174]],
  [-50, [92, 173, 201]],
  [0, [47, 107, 58]],
  [300, [75, 139, 59]],
  [1000, [154, 176, 90]],
  [2000, [201, 168, 106]],
  [3500, [154, 114, 86]],
  [4500, [142, 142, 148]],
  [6000, [242, 245, 248]],
]

/** 线性插值高程色带，返回 [r,g,b]（0-255） */
export function elevationRgb(meters: number): [number, number, number] {
  if (meters <= COLOR_STOPS[0][0]) return COLOR_STOPS[0][1]
  for (let i = 1; i < COLOR_STOPS.length; i++) {
    const [m1, c1] = COLOR_STOPS[i]
    if (meters > m1) continue
    const [m0, c0] = COLOR_STOPS[i - 1]
    // 海陆分界是硬边：0m 两侧分属浅海蓝与草绿，不做跨界混合
    const t = m0 < 0 && m1 === 0 ? 1 : (meters - m0) / (m1 - m0)
    return [0, 1, 2].map((k) => Math.round(c0[k] + (c1[k] - c0[k]) * t)) as [number, number, number]
  }
  return COLOR_STOPS[COLOR_STOPS.length - 1][1]
}

export const elevationCss = (meters: number) => `rgb(${elevationRgb(meters).join(',')})`

/** 256 色 RGBA 查找表（下标 = 高程贴图字节值），着色器与图例共用同一套配色 */
export function palette256(): Uint8Array {
  const lut = new Uint8Array(256 * 4)
  for (let b = 0; b < 256; b++) {
    const [r, g, bl] = elevationRgb(byteToMeters(b))
    lut.set([r, g, bl, 255], b * 4)
  }
  return lut
}

/** 按经纬度查询高程（米）；海洋为负值 */
export type ElevationSampler = (lat: number, lng: number) => number

let samplerPromise: Promise<ElevationSampler> | null = null

/**
 * 解码高程贴图到内存，供鼠标读数、国旗贴地等 CPU 侧使用。
 * 与 GPU 共用同一张图，不额外下载数据（浏览器缓存命中）。
 */
export function loadElevationSampler(): Promise<ElevationSampler> {
  samplerPromise ??= (async () => {
    const res = await fetch(ELEVATION_TEXTURE)
    const blob = await res.blob()
    // colorSpaceConversion:'none' —— 高程是数据不是颜色，禁止浏览器做色彩管理
    const bmp = await createImageBitmap(blob, { colorSpaceConversion: 'none' })
    const canvas = document.createElement('canvas')
    canvas.width = TEX_W
    canvas.height = TEX_H
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!
    ctx.drawImage(bmp, 0, 0, TEX_W, TEX_H)
    bmp.close()
    const rgba = ctx.getImageData(0, 0, TEX_W, TEX_H).data
    const gray = new Uint8Array(TEX_W * TEX_H)
    for (let i = 0; i < gray.length; i++) gray[i] = rgba[i * 4]

    const at = (x: number, y: number) =>
      gray[Math.min(TEX_H - 1, Math.max(0, y)) * TEX_W + ((x % TEX_W) + TEX_W) % TEX_W]

    return (lat: number, lng: number) => {
      // 双线性插值，经度环绕、纬度夹边
      const fx = ((lng + 180) / 360) * TEX_W - 0.5
      const fy = ((90 - lat) / 180) * TEX_H - 0.5
      const x0 = Math.floor(fx)
      const y0 = Math.floor(fy)
      const tx = fx - x0
      const ty = fy - y0
      const b =
        at(x0, y0) * (1 - tx) * (1 - ty) +
        at(x0 + 1, y0) * tx * (1 - ty) +
        at(x0, y0 + 1) * (1 - tx) * ty +
        at(x0 + 1, y0 + 1) * tx * ty
      return byteToMeters(b)
    }
  })()
  return samplerPromise
}
