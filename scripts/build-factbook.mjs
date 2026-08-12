/**
 * 构建时数据脚本：从 CIA World Factbook（factbook/factbook.json 镜像，公有领域）
 * 提取每个国家的自然资源、农产品、工业、出口商品清单，
 * 生成 src/data/factbook.json（{cca3: {res, agri, ind, expc}}）。
 *
 * 用法：node scripts/build-factbook.mjs
 * 生成结果已提交仓库，需要更新数据时再重跑。
 */
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(ROOT, 'src/data/factbook.json')
const CODES_CSV = 'https://raw.githubusercontent.com/datasets/country-codes/master/data/country-codes.csv'
const TREE_API = 'https://api.github.com/repos/factbook/factbook.json/git/trees/master?recursive=1'
const RAW_BASE = 'https://raw.githubusercontent.com/factbook/factbook.json/master/'

/** 极简 CSV 行解析（处理引号内逗号） */
function parseCsvLine(line) {
  const out = []
  let cur = ''
  let inQ = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQ) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++ }
      else if (ch === '"') inQ = false
      else cur += ch
    } else if (ch === '"') inQ = true
    else if (ch === ',') { out.push(cur); cur = '' }
    else cur += ch
  }
  out.push(cur)
  return out
}

// 1) GEC(FIPS) ↔ ISO3 映射
const csv = await (await fetch(CODES_CSV)).text()
const lines = csv.split('\n').filter(Boolean)
const header = parseCsvLine(lines[0])
const iIso3 = header.indexOf('ISO3166-1-Alpha-3')
const iFips = header.indexOf('FIPS')
const gecToIso3 = new Map()
for (const line of lines.slice(1)) {
  const cols = parseCsvLine(line)
  const gec = cols[iFips]?.trim()
  const iso3 = cols[iIso3]?.trim()
  if (gec && iso3) gecToIso3.set(gec.toLowerCase(), iso3)
}
console.log(`GEC 映射条目: ${gecToIso3.size}`)

// 2) factbook 仓库文件清单（一次 git tree 请求）
const tree = await (await fetch(TREE_API)).json()
const files = tree.tree.filter((f) => /^[a-z-]+\/[a-z]{2}\.json$/.test(f.path)).map((f) => f.path)
console.log(`factbook 国家文件: ${files.length}`)

// 3) 我们的国家列表（只保留能对上 cca3 的）
const countries = JSON.parse(await readFile(resolve(ROOT, 'src/data/countries.json'), 'utf8'))
const wantIso3 = new Set(countries.map((c) => c.cca3))

/** 清洗文本：去掉年份注记与 note 尾巴 */
function clean(text) {
  if (!text || typeof text !== 'string') return null
  let t = text
    .replace(/<[^>]+>/g, '')
    .replace(/\s*\(\d{4}(?:\s*est\.?)?\)/g, '')
    .split(/;?\s*note(?:\s*\d*)?\s*[:-]/i)[0]
    .trim()
    .replace(/[;,]\s*$/, '')
  return t || null
}

const result = {}
const CONCURRENCY = 10
for (let i = 0; i < files.length; i += CONCURRENCY) {
  await Promise.all(
    files.slice(i, i + CONCURRENCY).map(async (path) => {
      const gec = path.split('/')[1].replace('.json', '')
      const iso3 = gecToIso3.get(gec)
      if (!iso3 || !wantIso3.has(iso3)) return
      try {
        const d = await (await fetch(RAW_BASE + path)).json()
        const entry = {
          res: clean(d?.Geography?.['Natural resources']?.text),
          agri: clean(d?.Economy?.['Agricultural products']?.text),
          ind: clean(d?.Economy?.Industries?.text),
          expc: clean(d?.Economy?.['Exports - commodities']?.text),
        }
        if (entry.res || entry.agri || entry.ind || entry.expc) result[iso3] = entry
      } catch {
        // 单国失败跳过
      }
    }),
  )
}

await writeFile(OUT, JSON.stringify(result))
console.log(`已生成 ${Object.keys(result).length} 个国家 → ${OUT}`)
