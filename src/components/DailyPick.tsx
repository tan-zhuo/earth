import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../store/useAppStore'
import CountryFlag from './CountryFlag'
import { countryName } from '../utils/countryName'
import { capitalName } from '../seo'
import { regionName } from '../data/regionNames'
import { langOf, pick } from '../i18n/pick'

const DISMISS_KEY = 'earth:dailyDismissed'

/** 本地日期键（YYYY-MM-DD）：同一天所有人看到同一个国家，零点换新 */
function todayKey(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

/** 日期 → 稳定的伪随机序号（相邻日期跳得足够远，不会按字母顺序轮播） */
function dayHash(key: string): number {
  let h = 2166136261
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 16777619)
  return h >>> 0
}

/** 今日推荐：每天一个国家，点击飞过去；当天关闭后不再出现 */
export default function DailyPick() {
  const { i18n } = useTranslation()
  const countries = useAppStore((s) => s.countries)
  const select = useAppStore((s) => s.select)
  const key = todayKey()
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(DISMISS_KEY) === key } catch { return false }
  })

  // 只推荐有首都、面积够大的主权国家/地区，避免推到无人小岛
  const country = useMemo(() => {
    const pool = countries.filter((c) => c.capital.length && c.area >= 2000).sort((a, b) => a.cca3.localeCompare(b.cca3))
    return pool.length ? pool[dayHash(key) % pool.length] : null
  }, [countries, key])

  if (dismissed || !country) return null
  const lang = langOf(i18n.language)
  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, key) } catch { /* 隐私模式下不记忆 */ }
    setDismissed(true)
  }
  const date = new Date().toLocaleDateString(lang === 'zh' ? 'zh-CN' : lang, { month: 'long', day: 'numeric' })
  const area = Math.round(country.area).toLocaleString(lang === 'zh' ? 'zh-CN' : lang)

  return (
    <aside className="daily-pick" aria-label={pick(i18n.language, '今日推荐', 'Country of the day', '今日の国', 'Страна дня')}>
      <button className="daily-pick-main" onClick={() => select(country)}>
        <span className="daily-pick-flag"><CountryFlag country={country} /></span>
        <span className="min-w-0">
          <span className="block truncate text-[10px] uppercase tracking-wider text-sky-300/80">
            {pick(i18n.language, '今日推荐', 'Country of the day', '今日の国', 'Страна дня')} · {date}
          </span>
          <span className="block truncate text-sm font-semibold text-slate-100">{countryName(country, i18n.language)}</span>
          <span className="block truncate text-[11px] text-slate-400">
            {regionName(country.subregion || country.region, i18n.language)} · {capitalName(country, lang)} · {area} km²
          </span>
        </span>
        <span aria-hidden="true" className="ml-auto pl-2 text-sky-300">→</span>
      </button>
      <button className="daily-pick-close" onClick={dismiss} aria-label={pick(i18n.language, '今天不再显示', 'Hide for today', '今日は表示しない', 'Скрыть до завтра')}>×</button>
    </aside>
  )
}
