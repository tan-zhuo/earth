/**
 * 构建时数据脚本：从 mledoze/countries（REST Countries 的上游开源数据集，ODbL 许可）
 * 生成精简的静态国家数据 src/data/countries.json。
 *
 * 用法：node scripts/build-countries.mjs
 * 生成结果已提交到仓库，正常开发/构建无需重跑；需要更新数据时再执行。
 *
 * 说明：REST Countries v3.1 API 已于 2026 年弃用（v5 需注册），
 * 因此改为构建时静态化，运行时不再依赖该服务。人口/GDP 由 World Bank API 按需获取。
 */
import { writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SOURCE = 'https://raw.githubusercontent.com/mledoze/countries/master/countries.json'
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../src/data/countries.json')

const res = await fetch(SOURCE)
if (!res.ok) throw new Error(`下载失败: ${res.status}`)
const raw = await res.json()

const slim = raw.map((c) => ({
  cca2: c.cca2,
  cca3: c.cca3,
  ccn3: c.ccn3 ?? '',
  nameEn: c.name.common,
  officialEn: c.name.official,
  nameZh: c.translations?.zho?.common ?? c.name.common,
  officialZh: c.translations?.zho?.official ?? c.name.official,
  capital: c.capital ?? [],
  area: c.area,
  region: c.region,
  subregion: c.subregion ?? '',
  // 国旗走 flagcdn.com 免费 CDN（按 ISO2 代码取图）
  flagSvg: `https://flagcdn.com/${c.cca2.toLowerCase()}.svg`,
  flagPng: `https://flagcdn.com/w640/${c.cca2.toLowerCase()}.png`,
  currencies: Object.entries(c.currencies ?? {}).map(([code, cur]) => ({
    code,
    name: cur.name,
    symbol: cur.symbol,
  })),
  languages: Object.values(c.languages ?? {}),
  latlng: c.latlng?.length === 2 ? c.latlng : [0, 0],
}))

await mkdir(dirname(OUT), { recursive: true })
await writeFile(OUT, JSON.stringify(slim))
console.log(`已生成 ${slim.length} 个国家 → ${OUT}`)
