import type { WbStats } from '../types'
import { getCache, setCache } from './cache'

const CACHE_TTL = 30 * 24 * 3600 * 1000 // 30 天

/* World Bank API 返回 [meta, rows]；行结构只声明用到的字段 */
interface WbRow {
  date: string
  value: number | null
}

const INDICATORS = {
  population: 'SP.POP.TOTL',
  gdp: 'NY.GDP.MKTP.CD',
  gdpPerCapita: 'NY.GDP.PCAP.CD',
  exports: 'NE.EXP.GNFS.CD',
  imports: 'NE.IMP.GNFS.CD',
} as const

async function fetchIndicator(iso2: string, indicator: string): Promise<WbRow | null> {
  // mrv=10：取最近 10 年，从中找第一个非空值（部分国家数据滞后）
  const url = `https://api.worldbank.org/v2/country/${iso2}/indicator/${indicator}?format=json&mrv=10`
  const res = await fetch(url)
  if (!res.ok) return null
  const json = (await res.json()) as [unknown, WbRow[] | null]
  const rows = json?.[1]
  if (!rows) return null
  return rows.find((r) => r.value !== null) ?? null
}

/** 全球经济数据一览（GDP + 进出口），key 为 ISO3 */
export interface GdpEntry {
  gdp: number
  gdpYear: string
  gdpPerCapita: number | null
  exports: number | null
  exportsYear: string | null
  imports: number | null
  importsYear: string | null
}

async function fetchAllIndicator(indicator: string): Promise<Map<string, WbRow>> {
  // country/all + mrv=5 一次请求覆盖全部经济体，逐国取最近非空年份
  const url = `https://api.worldbank.org/v2/country/all/indicator/${indicator}?format=json&mrv=5&per_page=20000`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`World Bank 批量请求失败: ${res.status}`)
  const json = (await res.json()) as [unknown, (WbRow & { countryiso3code: string })[] | null]
  const latest = new Map<string, WbRow>()
  for (const row of json?.[1] ?? []) {
    if (row.value !== null && row.countryiso3code && !latest.has(row.countryiso3code)) {
      latest.set(row.countryiso3code, row) // 行按年份倒序，首个非空即最新
    }
  }
  return latest
}

/** 批量获取所有国家的 GDP、人均 GDP、出口额、进口额，带 30 天本地缓存 */
export async function fetchAllGdp(): Promise<Record<string, GdpEntry>> {
  const key = 'earth:wb:econ-v1'
  const cached = getCache<Record<string, GdpEntry>>(key, CACHE_TTL)
  if (cached) return cached

  const [gdpMap, pcMap, expMap, impMap] = await Promise.all([
    fetchAllIndicator(INDICATORS.gdp),
    fetchAllIndicator(INDICATORS.gdpPerCapita),
    fetchAllIndicator(INDICATORS.exports),
    fetchAllIndicator(INDICATORS.imports),
  ])
  const result: Record<string, GdpEntry> = {}
  for (const [iso3, row] of gdpMap) {
    result[iso3] = {
      gdp: row.value as number,
      gdpYear: row.date,
      gdpPerCapita: pcMap.get(iso3)?.value ?? null,
      exports: expMap.get(iso3)?.value ?? null,
      exportsYear: expMap.get(iso3)?.date ?? null,
      imports: impMap.get(iso3)?.value ?? null,
      importsYear: impMap.get(iso3)?.date ?? null,
    }
  }
  setCache(key, result)
  return result
}

/** 获取人口、名义 GDP、人均 GDP（美元现价），带 30 天本地缓存 */
export async function fetchStats(iso2: string): Promise<WbStats> {
  const key = `earth:wb:${iso2}`
  const cached = getCache<WbStats>(key, CACHE_TTL)
  if (cached) return cached

  const [pop, gdp, gdpPc] = await Promise.all([
    fetchIndicator(iso2, INDICATORS.population),
    fetchIndicator(iso2, INDICATORS.gdp),
    fetchIndicator(iso2, INDICATORS.gdpPerCapita),
  ])
  const stats: WbStats = {
    population: pop?.value ?? null,
    populationYear: pop?.date ?? null,
    gdp: gdp?.value ?? null,
    gdpYear: gdp?.date ?? null,
    gdpPerCapita: gdpPc?.value ?? null,
    gdpPerCapitaYear: gdpPc?.date ?? null,
  }
  setCache(key, stats)
  return stats
}
