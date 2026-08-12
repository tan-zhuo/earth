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
