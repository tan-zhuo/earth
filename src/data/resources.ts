/**
 * 石油 / 天然气产量榜单（本地精选静态数据）。
 * 免费公开 API 无法稳定提供产量数据（EIA 需注册密钥），故采用静态快照：
 * 数值为 2024 年前后公开统计的约值（EIA / 能源年鉴口径），仅用于排行对比。
 * oil 单位：千桶/日（kb/d）；gas 单位：十亿立方米/年（bcm）。key 为 cca3。
 */
export interface ResourceEntry {
  cca3: string
  value: number
}

export const OIL_PRODUCTION: ResourceEntry[] = [
  { cca3: 'USA', value: 13200 },
  { cca3: 'SAU', value: 9700 },
  { cca3: 'RUS', value: 9300 },
  { cca3: 'CAN', value: 4900 },
  { cca3: 'IRQ', value: 4300 },
  { cca3: 'CHN', value: 4200 },
  { cca3: 'BRA', value: 3700 },
  { cca3: 'IRN', value: 3600 },
  { cca3: 'ARE', value: 3400 },
  { cca3: 'KWT', value: 2600 },
  { cca3: 'KAZ', value: 1900 },
  { cca3: 'NOR', value: 1800 },
  { cca3: 'MEX', value: 1600 },
  { cca3: 'NGA', value: 1400 },
  { cca3: 'DZA', value: 1400 },
  { cca3: 'QAT', value: 1300 },
  { cca3: 'LBY', value: 1200 },
  { cca3: 'AGO', value: 1100 },
  { cca3: 'OMN', value: 1000 },
  { cca3: 'VEN', value: 900 },
  { cca3: 'COL', value: 780 },
  { cca3: 'GBR', value: 700 },
  { cca3: 'IND', value: 600 },
  { cca3: 'AZE', value: 600 },
  { cca3: 'IDN', value: 580 },
]

export const GAS_PRODUCTION: ResourceEntry[] = [
  { cca3: 'USA', value: 1035 },
  { cca3: 'RUS', value: 640 },
  { cca3: 'IRN', value: 260 },
  { cca3: 'CHN', value: 235 },
  { cca3: 'CAN', value: 190 },
  { cca3: 'QAT', value: 180 },
  { cca3: 'AUS', value: 150 },
  { cca3: 'NOR', value: 115 },
  { cca3: 'SAU', value: 115 },
  { cca3: 'DZA', value: 100 },
  { cca3: 'TKM', value: 80 },
  { cca3: 'MYS', value: 75 },
  { cca3: 'EGY', value: 60 },
  { cca3: 'IDN', value: 60 },
  { cca3: 'ARE', value: 55 },
  { cca3: 'UZB', value: 47 },
  { cca3: 'NGA', value: 45 },
  { cca3: 'ARG', value: 45 },
  { cca3: 'OMN', value: 40 },
  { cca3: 'AZE', value: 35 },
  { cca3: 'GBR', value: 35 },
  { cca3: 'KAZ', value: 28 },
  { cca3: 'TTO', value: 25 },
  { cca3: 'NLD', value: 15 },
]
