import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../store/useAppStore'
import { OIL_PRODUCTION, GAS_PRODUCTION } from '../data/resources'
import { formatUsd } from '../utils/format'
import type { Country } from '../types'

type TabKey = 'gdp' | 'exports' | 'imports' | 'oil' | 'gas'

const TABS: TabKey[] = ['gdp', 'exports', 'imports', 'oil', 'gas']
const TOP_N = 20

interface RankRow {
  country: Country
  value: number
  display: string
}

export default function RankingPanel() {
  const { t, i18n } = useTranslation()
  const showRankings = useAppStore((s) => s.showRankings)
  const toggleRankings = useAppStore((s) => s.toggleRankings)
  const countries = useAppStore((s) => s.countries)
  const gdpAll = useAppStore((s) => s.gdpAll)
  const select = useAppStore((s) => s.select)
  const [tab, setTab] = useState<TabKey>('gdp')

  const lang = i18n.language
  const zh = lang.startsWith('zh')

  const byCca3 = useMemo(() => new Map(countries.map((c) => [c.cca3, c])), [countries])

  const rows: RankRow[] = useMemo(() => {
    // 静态资源榜（石油 / 天然气）
    if (tab === 'oil' || tab === 'gas') {
      const list = tab === 'oil' ? OIL_PRODUCTION : GAS_PRODUCTION
      return list
        .map((e) => ({ entry: e, country: byCca3.get(e.cca3) }))
        .filter((x): x is { entry: (typeof list)[0]; country: Country } => !!x.country)
        .map(({ entry, country }) => ({
          country,
          value: entry.value,
          display:
            tab === 'oil'
              ? zh
                ? `${(entry.value / 10).toLocaleString('zh-CN')} 万桶/日`
                : `${entry.value.toLocaleString('en-US')} kb/d`
              : zh
                ? `${(entry.value * 10).toLocaleString('zh-CN')} 亿立方米/年`
                : `${entry.value.toLocaleString('en-US')} bcm/yr`,
        }))
    }
    // World Bank 榜（GDP / 出口 / 进口）
    if (!gdpAll) return []
    return countries
      .map((c) => {
        const e = gdpAll[c.cca3]
        const value = tab === 'gdp' ? e?.gdp : tab === 'exports' ? e?.exports : e?.imports
        return value != null ? { country: c, value, display: formatUsd(value, lang) } : null
      })
      .filter((x): x is RankRow => x !== null)
      .sort((a, b) => b.value - a.value)
      .slice(0, TOP_N)
  }, [tab, gdpAll, countries, byCca3, zh, lang])

  if (!showRankings) return null

  const max = rows[0]?.value ?? 1

  const handleRowClick = (c: Country) => {
    select(c)
    // 移动端上排行榜与详情面板都在底部，选中后关闭排行榜避免遮挡
    if (window.innerWidth < 768) toggleRankings()
  }

  return (
    <aside className="panel-enter fixed inset-x-0 bottom-0 z-20 max-h-[70vh] overflow-hidden rounded-t-2xl border-t border-slate-700/50 bg-slate-900/90 backdrop-blur-xl md:inset-x-auto md:top-16 md:left-4 md:bottom-4 md:w-[360px] md:max-h-none md:rounded-2xl md:border">
      <div className="flex h-full max-h-[70vh] flex-col md:max-h-full">
        {/* 标题 + 关闭 */}
        <div className="flex items-center justify-between border-b border-slate-700/40 px-4 py-3">
          <h2 className="text-sm font-bold tracking-wide text-slate-100">{t('rankings.title')}</h2>
          <button
            onClick={toggleRankings}
            className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-700/50 hover:text-slate-100"
            aria-label="Close rankings"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </div>

        {/* 榜单切换 */}
        <div className="flex gap-1 overflow-x-auto border-b border-slate-700/40 px-3 py-2">
          {TABS.map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                tab === k
                  ? 'bg-sky-500/15 text-sky-300'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {t(`rankings.${k}`)}
            </button>
          ))}
        </div>

        {/* 榜单内容 */}
        <ol className="flex-1 overflow-y-auto px-2 py-2">
          {rows.length === 0 && (
            <li className="animate-pulse px-3 py-4 text-sm text-slate-500">{t('loading')}</li>
          )}
          {rows.map((row, i) => (
            <li key={row.country.cca3}>
              <button
                onClick={() => handleRowClick(row.country)}
                className="relative flex w-full items-center gap-2.5 overflow-hidden rounded-lg px-2.5 py-2 text-left transition hover:bg-slate-800/70"
              >
                {/* 相对数值条 */}
                <span
                  className="absolute inset-y-1 left-0 rounded-r bg-sky-500/10"
                  style={{ width: `${(row.value / max) * 100}%` }}
                />
                <span className={`relative w-6 shrink-0 text-center text-xs font-bold ${i < 3 ? 'text-amber-400' : 'text-slate-500'}`}>
                  {i + 1}
                </span>
                <img
                  src={`https://flagcdn.com/w40/${row.country.cca2.toLowerCase()}.png`}
                  alt=""
                  loading="lazy"
                  className="relative h-4 w-6 shrink-0 rounded-sm border border-slate-700/60 object-cover"
                />
                <span className="relative min-w-0 flex-1 truncate text-sm text-slate-200">
                  {zh ? row.country.nameZh : row.country.nameEn}
                </span>
                <span className="relative shrink-0 text-xs font-medium text-slate-300">{row.display}</span>
              </button>
            </li>
          ))}
        </ol>

        {/* 资源榜数据口径说明 */}
        {(tab === 'oil' || tab === 'gas') && (
          <p className="border-t border-slate-700/40 px-4 py-2 text-[10px] text-slate-600">
            {t('rankings.resourceNote')}
          </p>
        )}
      </div>
    </aside>
  )
}
