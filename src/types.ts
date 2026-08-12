/** 应用内统一的国家数据模型（构建时由 mledoze/countries 数据集生成，见 scripts/build-countries.mjs） */
export interface Country {
  cca2: string
  cca3: string
  /** ISO 3166-1 numeric，用于与 world-atlas GeoJSON 的 feature.id 匹配 */
  ccn3: string
  nameEn: string
  officialEn: string
  nameZh: string
  officialZh: string
  capital: string[]
  /** 面积，平方公里 */
  area: number
  region: string
  subregion: string
  flagSvg: string
  flagPng: string
  currencies: { code: string; name: string; symbol?: string }[]
  languages: string[]
  /** [lat, lng] */
  latlng: [number, number]
}

/** World Bank 按需获取的统计数据（各取最近一个非空年份） */
export interface WbStats {
  population: number | null
  populationYear: string | null
  gdp: number | null
  gdpYear: string | null
  gdpPerCapita: number | null
  gdpPerCapitaYear: string | null
}

/** 世界银行收入分组（用作“发展程度”标签） */
export type IncomeGroup = 'high' | 'upperMiddle' | 'lowerMiddle' | 'low'

/** 按世界银行 2025 财年人均 GNI 阈值近似划分（用人均 GDP 近似） */
export function incomeGroupOf(gdpPerCapita: number): IncomeGroup {
  if (gdpPerCapita > 14005) return 'high'
  if (gdpPerCapita > 4515) return 'upperMiddle'
  if (gdpPerCapita > 1145) return 'lowerMiddle'
  return 'low'
}
