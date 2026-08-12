import type { Country } from '../types'
import rawCountries from '../data/countries.json'

/**
 * 国家基础数据：构建时静态化（scripts/build-countries.mjs 生成），
 * 运行时零网络请求、零首屏等待。
 * 注：REST Countries v3.1 API 已于 2026 年弃用，故不再作为运行时依赖。
 */
export function getAllCountries(): Country[] {
  return (rawCountries as Country[]).slice().sort((a, b) => a.nameEn.localeCompare(b.nameEn))
}
