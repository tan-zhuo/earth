/** 数字本地化格式：中文用 万亿/亿/万，日文用 兆/億/万，俄文用 трлн/млрд/млн，英文用 T/B/M */

const isZh = (lang: string) => lang.startsWith('zh')
const isJa = (lang: string) => lang.startsWith('ja')
const isRu = (lang: string) => lang.startsWith('ru')

const localeOf = (lang: string) => (isZh(lang) ? 'zh-CN' : isJa(lang) ? 'ja-JP' : isRu(lang) ? 'ru-RU' : 'en-US')

export function formatBigNumber(n: number, lang: string): string {
  if (isZh(lang) || isJa(lang)) {
    const [t, b] = isZh(lang) ? ['万亿', '亿'] : ['兆', '億']
    if (n >= 1e12) return `${(n / 1e12).toFixed(2)} ${t}`
    if (n >= 1e8) return `${(n / 1e8).toFixed(2)} ${b}`
    if (n >= 1e4) return `${(n / 1e4).toFixed(1)} 万`
    return n.toLocaleString(localeOf(lang))
  }
  if (isRu(lang)) {
    const fmt = (v: number, d: number) => v.toLocaleString('ru-RU', { minimumFractionDigits: d, maximumFractionDigits: d })
    if (n >= 1e12) return `${fmt(n / 1e12, 2)} трлн`
    if (n >= 1e9) return `${fmt(n / 1e9, 2)} млрд`
    if (n >= 1e6) return `${fmt(n / 1e6, 1)} млн`
    return n.toLocaleString('ru-RU')
  }
  if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`
  return n.toLocaleString('en-US')
}

export function formatUsd(n: number, lang: string): string {
  return `$${formatBigNumber(n, lang)}`
}

/** 人均 GDP 等中等数值：完整千分位 */
export function formatExact(n: number, lang: string): string {
  return Math.round(n).toLocaleString(localeOf(lang))
}
