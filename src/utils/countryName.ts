import type { Country } from '../types'

/** 按界面语言取国家通用名 */
export function countryName(c: Country, lang: string): string {
  if (lang.startsWith('zh')) return c.nameZh
  if (lang.startsWith('ja')) return c.nameJa
  if (lang.startsWith('ru')) return c.nameRu
  return c.nameEn
}

/** 按界面语言取国家正式名称 */
export function countryOfficialName(c: Country, lang: string): string {
  if (lang.startsWith('zh')) return c.officialZh
  if (lang.startsWith('ja')) return c.officialJa
  if (lang.startsWith('ru')) return c.officialRu
  return c.officialEn
}

/** 副名称：非英文界面显示英文名，英文界面显示中文名 */
export function countryAltName(c: Country, lang: string): string {
  return lang.startsWith('en') ? c.nameZh : c.nameEn
}
