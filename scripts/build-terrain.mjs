/**
 * 构建时数据脚本：从 NOAA ETOPO1（1 弧分全球地形 + 海底地形，公有领域）
 * 生成两张地形贴图，供 3D 地球做真实高程起伏：
 *
 *   public/textures/earth-elevation.png  8bit 灰度，绝对高程（含海底），
 *                                        byte = 高程(m)/80 + 140（海平面恰为 140）
 *                                        → 顶点位移、高程着色、鼠标读数都用它
 *   public/textures/earth-relief.png     8bit 灰度，局部起伏（高通滤波，步长 16m）
 *                                        → 片元着色器里算山体阴影（比绝对高程精度高一个量级，不会出现等高线台阶）
 *
 * 数据源：NOAA NCEI ETOPO1 Ice Surface，经 ERDDAP 按纬度分段下载（int16，单位米）。
 * 用法：node scripts/build-terrain.mjs [--width 4096] [--cache <目录>]
 * 生成结果已提交到仓库，正常开发/构建无需重跑。
 */
import { writeFile, readFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync, crc32 } from 'node:zlib'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ERDDAP = 'https://coastwatch.pfeg.noaa.gov/erddap/griddap/etopo180.nc'
/** ETOPO1 网格尺寸（格点配准：含首尾两条边界线） */
const SRC_W = 21601
const SRC_H = 10801
/** 每次请求的纬度行数（约 25MB/次） */
const BAND_ROWS = 600

/* ---- 编码常量：与 src/data/terrain.ts 保持一致 ---- */
const ELEV_STEP = 80 // m/级：覆盖 -11200 ~ +9200m，够放下马里亚纳海沟与珠峰
const SEA_BYTE = 140 // 海平面对应的字节值（整数，保证岸线着色不抖动）
const RELIEF_STEP = 16 // m/级：局部起伏 ±2032m
const RELIEF_RADIUS = 6 // 高通滤波的箱式模糊半径（像素），4096 宽时约 ±60km

const args = process.argv.slice(2)
const argOf = (name, dflt) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : dflt
}
const OUT_W = Number(argOf('width', 4096))
const OUT_H = OUT_W / 2
const CACHE = resolve(argOf('cache', join(ROOT, '.cache/terrain')))

/* ------------------------------------------------------------------ */
/* NetCDF-3 最小解析：只需取出唯一的 int16 变量数据段                    */
/* ------------------------------------------------------------------ */

/** 读取 NetCDF-3 头部，返回 {name: {type, begin, dims}} */
function parseNetcdf3(buf) {
  if (buf.toString('latin1', 0, 3) !== 'CDF') throw new Error('不是 NetCDF-3 文件')
  const v64 = buf[3] === 2
  let p = 8 // magic(4) + numrecs(4)
  const u32 = () => {
    const v = buf.readUInt32BE(p)
    p += 4
    return v
  }
  const str = () => {
    const n = u32()
    const s = buf.toString('utf8', p, p + n)
    p += n + ((4 - (n % 4)) % 4) // 4 字节对齐
    return s
  }
  const skipAtts = () => {
    const tag = u32()
    const n = u32()
    if (tag === 0) return // ABSENT
    for (let i = 0; i < n; i++) {
      str()
      const type = u32()
      const nvals = u32()
      const size = [0, 1, 1, 2, 4, 4, 8][type] * nvals
      p += size + ((4 - (size % 4)) % 4)
    }
  }

  const dims = []
  {
    const tag = u32()
    const n = u32()
    if (tag !== 0) for (let i = 0; i < n; i++) dims.push({ name: str(), size: u32() })
  }
  skipAtts() // 全局属性

  const vars = {}
  const tag = u32()
  const n = u32()
  if (tag !== 0) {
    for (let i = 0; i < n; i++) {
      const name = str()
      const rank = u32()
      const shape = []
      for (let d = 0; d < rank; d++) shape.push(dims[u32()].size)
      skipAtts()
      const type = u32()
      u32() // vsize
      const begin = v64 ? Number(buf.readBigUInt64BE((p += 8) - 8)) : u32()
      vars[name] = { type, begin, shape }
    }
  }
  return vars
}

/* ------------------------------------------------------------------ */
/* PNG 编码（8bit 灰度，Paeth 行过滤）                                   */
/* ------------------------------------------------------------------ */

function png8(gray, w, h) {
  // 每行首字节为过滤器类型 4（Paeth），对平滑地形数据压缩率最好
  const raw = Buffer.alloc((w + 1) * h)
  for (let y = 0; y < h; y++) {
    const off = y * (w + 1)
    raw[off] = 4
    for (let x = 0; x < w; x++) {
      const a = x > 0 ? gray[y * w + x - 1] : 0
      const b = y > 0 ? gray[(y - 1) * w + x] : 0
      const c = x > 0 && y > 0 ? gray[(y - 1) * w + x - 1] : 0
      const pp = a + b - c
      const pa = Math.abs(pp - a)
      const pb = Math.abs(pp - b)
      const pc = Math.abs(pp - c)
      const pred = pa <= pb && pa <= pc ? a : pb <= pc ? b : c
      raw[off + 1 + x] = (gray[y * w + x] - pred) & 0xff
    }
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4)
    len.writeUInt32BE(data.length)
    const body = Buffer.concat([Buffer.from(type, 'latin1'), data])
    const crc = Buffer.alloc(4)
    crc.writeUInt32BE(crc32(body) >>> 0)
    return Buffer.concat([len, body, crc])
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0)
  ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 0 // 灰度
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

/* ------------------------------------------------------------------ */
/* 1. 下载 + 面积平均降采样                                             */
/* ------------------------------------------------------------------ */

/** 下载全球高程并按目标网格取平均，返回 Float32Array(OUT_W*OUT_H)，单位米 */
async function buildGrid() {
  const cached = join(CACHE, `etopo1-${OUT_W}x${OUT_H}.f32`)
  if (existsSync(cached)) {
    console.log(`使用缓存 ${cached}`)
    const buf = await readFile(cached)
    return new Float32Array(buf.buffer, buf.byteOffset, OUT_W * OUT_H)
  }

  const sum = new Float64Array(OUT_W * OUT_H)
  const cnt = new Uint32Array(OUT_W * OUT_H)

  for (let r0 = 0; r0 < SRC_H; r0 += BAND_ROWS) {
    const r1 = Math.min(SRC_H - 1, r0 + BAND_ROWS - 1)
    const url =
      `${ERDDAP}?altitude%5B${r0}:1:${r1}%5D%5B0:1:${SRC_W - 1}%5D`
    let buf
    for (let attempt = 1; ; attempt++) {
      try {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        buf = Buffer.from(await res.arrayBuffer())
        break
      } catch (err) {
        if (attempt >= 4) throw err
        console.warn(`  第 ${attempt} 次失败（${err.message}），重试…`)
        await new Promise((r) => setTimeout(r, 3000 * attempt))
      }
    }
    const v = parseNetcdf3(buf).altitude
    if (v.type !== 3) throw new Error(`altitude 类型异常: ${v.type}`) // 3 = NC_SHORT
    const rows = r1 - r0 + 1
    for (let r = 0; r < rows; r++) {
      // ERDDAP 的纬度自 -90 递增；贴图第 0 行是北极
      const lat = -90 + ((r0 + r) * 180) / (SRC_H - 1)
      const ty = Math.min(OUT_H - 1, Math.floor(((90 - lat) / 180) * OUT_H))
      const base = v.begin + r * SRC_W * 2
      for (let c = 0; c < SRC_W; c++) {
        const tx = Math.min(OUT_W - 1, Math.floor((c / (SRC_W - 1)) * OUT_W))
        const i = ty * OUT_W + tx
        sum[i] += buf.readInt16BE(base + c * 2)
        cnt[i]++
      }
    }
    process.stdout.write(`\r下载并降采样 ${Math.round(((r1 + 1) / SRC_H) * 100)}%`)
  }
  console.log()

  const grid = new Float32Array(OUT_W * OUT_H)
  for (let i = 0; i < grid.length; i++) grid[i] = cnt[i] ? sum[i] / cnt[i] : 0
  await mkdir(CACHE, { recursive: true })
  await writeFile(cached, Buffer.from(grid.buffer))
  return grid
}

/* ------------------------------------------------------------------ */
/* 2. 局部起伏（高通）                                                  */
/* ------------------------------------------------------------------ */

/** 经度方向环绕、纬度方向夹边的可分离箱式模糊 */
function boxBlur(src, w, h, r) {
  const tmp = new Float32Array(w * h)
  const out = new Float32Array(w * h)
  const win = 2 * r + 1
  for (let y = 0; y < h; y++) {
    const row = y * w
    let acc = 0
    for (let k = -r; k <= r; k++) acc += src[row + ((k + w) % w)]
    for (let x = 0; x < w; x++) {
      tmp[row + x] = acc / win
      acc += src[row + ((x + r + 1) % w)] - src[row + ((x - r + w) % w)]
    }
  }
  for (let x = 0; x < w; x++) {
    let acc = 0
    for (let k = -r; k <= r; k++) acc += tmp[Math.min(h - 1, Math.max(0, k)) * w + x]
    for (let y = 0; y < h; y++) {
      out[y * w + x] = acc / win
      acc +=
        tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x]
    }
  }
  return out
}

/* ------------------------------------------------------------------ */

const grid = await buildGrid()

let min = Infinity
let max = -Infinity
for (const v of grid) {
  if (v < min) min = v
  if (v > max) max = v
}
console.log(`高程范围：${min.toFixed(0)}m ~ ${max.toFixed(0)}m（${OUT_W}×${OUT_H} 网格平均）`)

const elev = new Uint8Array(OUT_W * OUT_H)
for (let i = 0; i < elev.length; i++) {
  elev[i] = Math.min(255, Math.max(0, Math.round(grid[i] / ELEV_STEP) + SEA_BYTE))
}

// 两次箱式模糊近似高斯，作为低频基准；原始高程减去它即局部起伏
const low = boxBlur(boxBlur(grid, OUT_W, OUT_H, RELIEF_RADIUS), OUT_W, OUT_H, RELIEF_RADIUS)
const relief = new Uint8Array(OUT_W * OUT_H)
for (let i = 0; i < relief.length; i++) {
  relief[i] = Math.min(255, Math.max(0, Math.round((grid[i] - low[i]) / RELIEF_STEP) + 128))
}

const outDir = join(ROOT, 'public/textures')
await mkdir(outDir, { recursive: true })
const files = [
  ['earth-elevation.png', png8(elev, OUT_W, OUT_H)],
  ['earth-relief.png', png8(relief, OUT_W, OUT_H)],
]
for (const [name, data] of files) {
  await writeFile(join(outDir, name), data)
  console.log(`已写入 public/textures/${name}（${(data.length / 1024 / 1024).toFixed(2)} MB）`)
}
