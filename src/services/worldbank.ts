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

/* ---- 自然资源指标（单国按需，多指标一次请求） ---- */

export interface ResourceStats {
  /** 各类资源租金占 GDP %（衡量资源依赖度） */
  totalRents: number | null
  oilRents: number | null
  gasRents: number | null
  coalRents: number | null
  mineralRents: number | null
  forestRents: number | null
  /** 土地与产出 */
  arablePct: number | null
  forestPct: number | null
  /** 谷物产量（吨） */
  cereal: number | null
  /** 渔业产量（吨） */
  fish: number | null
  /** 可再生淡水资源（十亿立方米） */
  freshwater: number | null
}

const RESOURCE_INDICATORS: Record<keyof ResourceStats, string> = {
  totalRents: 'NY.GDP.TOTL.RT.ZS',
  oilRents: 'NY.GDP.PETR.RT.ZS',
  gasRents: 'NY.GDP.NGAS.RT.ZS',
  coalRents: 'NY.GDP.COAL.RT.ZS',
  mineralRents: 'NY.GDP.MINR.RT.ZS',
  forestRents: 'NY.GDP.FRST.RT.ZS',
  arablePct: 'AG.LND.ARBL.ZS',
  forestPct: 'AG.LND.FRST.ZS',
  cereal: 'AG.PRD.CREL.MT',
  fish: 'ER.FSH.PROD.MT',
  freshwater: 'ER.H2O.INTR.K3',
}

/** 获取单个国家的自然资源指标（11 个指标合并为一次请求），30 天缓存 */
export async function fetchResourceStats(iso2: string): Promise<ResourceStats> {
  const key = `earth:wb:res:${iso2}`
  const cached = getCache<ResourceStats>(key, CACHE_TTL)
  if (cached) return cached

  const ids = Object.values(RESOURCE_INDICATORS).join(';')
  // 多指标请求必须带 source 参数；mrv=8 容忍数据滞后
  const url = `https://api.worldbank.org/v2/country/${iso2}/indicator/${ids}?source=2&format=json&mrv=8&per_page=200`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`World Bank 资源指标请求失败: ${res.status}`)
  const json = (await res.json()) as [unknown, (WbRow & { indicator: { id: string } })[] | null]

  // 每个指标取最近非空年份（行按指标分组、年份倒序）
  const latest = new Map<string, number>()
  for (const row of json?.[1] ?? []) {
    if (row.value !== null && !latest.has(row.indicator.id)) latest.set(row.indicator.id, row.value)
  }
  const stats = Object.fromEntries(
    Object.entries(RESOURCE_INDICATORS).map(([k, id]) => [k, latest.get(id) ?? null]),
  ) as unknown as ResourceStats
  setCache(key, stats)
  return stats
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
