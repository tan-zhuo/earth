/** 数字本地化格式：中文用 万亿/亿/万，英文用 T/B/M */

const isZh = (lang: string) => lang.startsWith('zh')

export function formatBigNumber(n: number, lang: string): string {
  if (isZh(lang)) {
    if (n >= 1e12) return `${(n / 1e12).toFixed(2)} 万亿`
    if (n >= 1e8) return `${(n / 1e8).toFixed(2)} 亿`
    if (n >= 1e4) return `${(n / 1e4).toFixed(1)} 万`
    return n.toLocaleString('zh-CN')
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
  return Math.round(n).toLocaleString(isZh(lang) ? 'zh-CN' : 'en-US')
}
