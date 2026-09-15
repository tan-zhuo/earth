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

export type WikiLang = 'zh' | 'en' | 'ja' | 'ru'

async function fetchSummary(lang: WikiLang, title: string): Promise<WikiSummary | null> {
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
export async function fetchCountryHistory(country: Country, lang: WikiLang): Promise<WikiSummary | null> {
  const key = `earth:wiki:${lang}:${country.cca3}`
  const cached = getCache<WikiSummary>(key, CACHE_TTL)
  if (cached) return cached

  const candidates: [WikiLang, string][] =
    lang === 'zh'
      ? [[lang, `${country.nameZh}历史`], [lang, country.nameZh]]
      : lang === 'ja'
        ? [[lang, `${country.nameJa}の歴史`], [lang, country.nameJa]]
        : lang === 'ru'
          ? [[lang, `История ${country.nameRu}`], [lang, country.nameRu]]
          : []
  // 英文条目兜底（日/俄维基缺条目时也能显示）
  candidates.push(['en', `History of ${country.nameEn}`], ['en', `History of the ${country.nameEn}`], ['en', country.nameEn])

  for (const [wikiLang, title] of candidates) {
    try {
      const summary = await fetchSummary(wikiLang, title)
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
