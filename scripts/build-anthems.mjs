/**
 * 构建时数据脚本：从 Wikidata 查询各国国歌（P85）及其 Commons 音频（P51），
 * 生成 src/data/anthems.json（{cca3: {nameEn, nameZh, audio}}）。
 * 音频文件托管在 Wikimedia Commons（公有领域/自由许可）。
 *
 * 用法：node scripts/build-anthems.mjs
 */
import { writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../src/data/anthems.json')

const QUERY = `SELECT ?iso3 ?anthemEn ?anthemZh ?anthemZhCn ?audio WHERE {
  ?country wdt:P298 ?iso3 .
  ?country p:P85 ?st .
  ?st ps:P85 ?anthem .
  FILTER NOT EXISTS { ?st pq:P582 ?end }
  OPTIONAL { ?anthem wdt:P51 ?audio . }
  OPTIONAL { ?anthem rdfs:label ?anthemEn FILTER(LANG(?anthemEn)="en") }
  OPTIONAL { ?anthem rdfs:label ?anthemZh FILTER(LANG(?anthemZh)="zh") }
  OPTIONAL { ?anthem rdfs:label ?anthemZhCn FILTER(LANG(?anthemZhCn)="zh-cn") }
}`

const res = await fetch('https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(QUERY), {
  headers: { 'User-Agent': 'earth-app/1.0 (educational project; github.com/tan-zhuo/earth)' },
})
if (!res.ok) throw new Error(`SPARQL 请求失败: ${res.status}`)
const json = await res.json()

const result = {}
for (const row of json.results.bindings) {
  const iso3 = row.iso3?.value
  if (!iso3) continue
  const entry = {
    nameEn: row.anthemEn?.value ?? null,
    // 优先简体中文标签
    nameZh: row.anthemZhCn?.value ?? row.anthemZh?.value ?? null,
    // Commons 文件 URL 转 https
    audio: row.audio?.value?.replace(/^http:/, 'https:') ?? null,
  }
  const prev = result[iso3]
  // 同一国家多行时优先保留有音频的
  if (!prev || (!prev.audio && entry.audio)) result[iso3] = entry
}

await writeFile(OUT, JSON.stringify(result))
const withAudio = Object.values(result).filter((e) => e.audio).length
console.log(`已生成 ${Object.keys(result).length} 国国歌（${withAudio} 国含音频）→ ${OUT}`)
