/**
 * 构建时数据脚本：由 Natural Earth 10m 数据生成
 *   - public/data/admin1/{CCA3}.json  各国一级行政区（省/州）边界 TopoJSON + 四语名称 + 标注点
 *   - public/data/cities.json         全球城市（首都、省会、5 万人以上城市）四语名称 + 人口
 *
 * 用法：node scripts/build-places.mjs [数据目录]
 * 数据目录需含 ne_10m_admin_1_states_provinces.geojson 与 ne_10m_populated_places.geojson
 * （github.com/nvkelso/natural-earth-vector/tree/master/geojson，公有领域）。
 * Natural Earth 的中文名混有繁体，统一用 OpenCC 转为简体。
 */
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'
import { execFileSync } from 'node:child_process'
import * as OpenCC from 'opencc-js'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = resolve(process.argv[2] ?? join(ROOT, '.cache/natural-earth'))
const BASE = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson'
const ADMIN1 = 'ne_10m_admin_1_states_provinces.geojson'
const PLACES = 'ne_10m_populated_places.geojson'

/** Natural Earth 的 adm0_a3 与应用 cca3 不一致的地区；映射为 null 的争议/零散地块直接略过 */
const CODE_FIX = {
  PSX: 'PSE', SDS: 'SSD', SAH: 'ESH', KOS: 'UNK', ALD: 'ALA', SOL: 'SOM', CYN: 'CYP', KAB: 'KAZ',
  ESB: null, WSB: null, USG: null, KAS: null, IOA: null, CSI: null, PGA: null, CLP: null, ATC: null,
}
const toCode = (a3) => (a3 in CODE_FIX ? CODE_FIX[a3] : a3)

const toSimplified = OpenCC.Converter({ from: 'tw', to: 'cn' })
const zh = (s) => (s ? toSimplified(s) : '')

async function ensure(file) {
  const path = join(SRC, file)
  if (existsSync(path)) return path
  await mkdir(SRC, { recursive: true })
  console.log(`下载 ${file} …`)
  const res = await fetch(`${BASE}/${file}`)
  if (!res.ok) throw new Error(`${file}: HTTP ${res.status}`)
  await writeFile(path, Buffer.from(await res.arrayBuffer()))
  return path
}

const countries = JSON.parse(await readFile(join(ROOT, 'src/data/countries.json'), 'utf8'))
const known = new Set(countries.map((c) => c.cca3))

/* ---------------- 一级行政区 ---------------- */
const admin = JSON.parse(await readFile(await ensure(ADMIN1), 'utf8'))
const byCountry = new Map()
for (const f of admin.features) {
  const p = f.properties
  const code = toCode(p.adm0_a3)
  if (!code || !known.has(code) || !f.geometry) continue
  // 少数无名小岛只保留边界、不出标注（名称为空串）
  const en = p.name_en || p.name || ''
  f.properties = {
    en,
    zh: zh(p.name_zh) || en,
    ja: p.name_ja || en,
    ru: p.name_ru || en,
    lat: +p.latitude.toFixed(3),
    lng: +p.longitude.toFixed(3),
    // 标注优先级：数值越小越重要（Natural Earth labelrank）
    r: p.labelrank ?? 9,
  }
  if (!byCountry.has(code)) byCountry.set(code, [])
  byCountry.get(code).push(f)
}

const outDir = join(ROOT, 'public/data/admin1')
await rm(outDir, { recursive: true, force: true })
await mkdir(outDir, { recursive: true })
const tmp = join(tmpdir(), `earth-admin1-${process.pid}`)
await mkdir(tmp, { recursive: true })
const mapshaper = join(ROOT, 'node_modules/.bin/mapshaper')
let total = 0
for (const [code, feats] of byCountry) {
  // 只有一个区划（城邦、小岛国）的国家没有内部边界可画
  if (feats.length < 2) continue
  const input = join(tmp, `${code}.geojson`)
  const output = join(outDir, `${code}.json`)
  await writeFile(input, JSON.stringify({ type: 'FeatureCollection', features: feats }))
  // 按国家各自简化：保留 12% 顶点、不丢小岛，坐标量化后体积约为原始的 1/20
  execFileSync(mapshaper, [
    input, '-simplify', '12%', 'keep-shapes', '-clean', 'allow-overlaps',
    '-rename-layers', 'admin1',
    '-o', output, 'format=topojson', 'quantization=20000', 'force',
  ], { stdio: 'pipe' })
  total += 1
}
await rm(tmp, { recursive: true, force: true })
console.log(`admin1：${total} 个国家`)

/* ---------------- 城市 ---------------- */
const places = JSON.parse(await readFile(await ensure(PLACES), 'utf8'))
const KIND = {
  'Admin-0 capital': 0,
  'Admin-0 capital alt': 0,
  'Admin-0 region capital': 1,
  'Admin-1 capital': 1,
  'Admin-1 region capital': 1,
  'Populated place': 2,
  'Populated Place': 2,
}
const cities = []
for (const { properties: p } of places.features) {
  const kind = KIND[p.FEATURECLA]
  const code = toCode(p.ADM0_A3)
  if (kind == null || !code || !known.has(code)) continue
  if (kind === 2 && p.POP_MAX < 50_000) continue
  const en = p.NAME_EN || p.NAME
  // [lat, lng, 人口, 类别(0 首都/1 省会/2 城市), cca3, 中, 英, 日, 俄]
  cities.push([
    +p.LATITUDE.toFixed(3), +p.LONGITUDE.toFixed(3), p.POP_MAX, kind, code,
    zh(p.NAME_ZH) || en, en, p.NAME_JA || en, p.NAME_RU || en,
  ])
}
// 先首都、再按人口：客户端按此顺序做标注避让，重要城市先占位
const isCapital = (c) => (c[3] === 0 ? 0 : 1)
cities.sort((a, b) => isCapital(a) - isCapital(b) || b[2] - a[2])
await writeFile(join(ROOT, 'public/data/cities.json'), JSON.stringify(cities))
console.log(`cities：${cities.length} 个城市`)
