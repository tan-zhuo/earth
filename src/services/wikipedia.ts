import type { Country } from '../types'
import { getCache, setCache } from './cache'

const CACHE_TTL = 30 * 24 * 3600 * 1000 // 30 天

export interface WikiSummary {
  title: string
  extract: string
  url: string
}

/* Wikipedia REST API summary 响应（只声明用到的字段） */
interface RawSummary {
  type: string
  title: string
  extract: string
  content_urls?: { desktop?: { page?: string } }
}

async function fetchSummary(lang: 'zh' | 'en', title: string): Promise<WikiSummary | null> {
  const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
  // Accept-Language 触发中文维基的简体变体转换
  const res = await fetch(url, lang === 'zh' ? { headers: { 'Accept-Language': 'zh-cn' } } : undefined)
  if (!res.ok) return null
  const json = (await res.json()) as RawSummary
  if (!json.extract || json.type === 'disambiguation') return null
  return {
    title: json.title,
    extract: json.extract,
    url: json.content_urls?.desktop?.page ?? `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title)}`,
  }
}

/**
 * 获取国家历史摘要：优先"XX历史 / History of XX"专题条目，
 * 找不到时回退到国家条目本身的摘要。
 */
export async function fetchCountryHistory(country: Country, lang: 'zh' | 'en'): Promise<WikiSummary | null> {
  const key = `earth:wiki:${lang}:${country.cca3}`
  const cached = getCache<WikiSummary>(key, CACHE_TTL)
  if (cached) return cached

  const candidates =
    lang === 'zh'
      ? [`${country.nameZh}历史`, country.nameZh]
      : [`History of ${country.nameEn}`, `History of the ${country.nameEn}`, country.nameEn]

  for (const title of candidates) {
    try {
      const summary = await fetchSummary(lang, title)
      if (summary) {
        setCache(key, summary)
        return summary
      }
    } catch {
      // 网络错误：尝试下一个候选
    }
  }
  return null
}
