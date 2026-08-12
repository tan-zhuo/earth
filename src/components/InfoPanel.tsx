import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../store/useAppStore'
import { fetchStats } from '../services/worldbank'
import { fetchCountryHistory } from '../services/wikipedia'
import type { WikiSummary } from '../services/wikipedia'
import { countryExtras } from '../data/countryExtras'
import { incomeGroupOf } from '../types'
import type { WbStats } from '../types'
import { formatBigNumber, formatUsd, formatExact } from '../utils/format'

/** 大洲名称中译（数据集的 region 只有英文） */
const regionZh: Record<string, string> = {
  Africa: '非洲',
  Americas: '美洲',
  Asia: '亚洲',
  Europe: '欧洲',
  Oceania: '大洋洲',
  Antarctic: '南极洲',
}

const incomeBadgeColor: Record<string, string> = {
  high: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
  upperMiddle: 'bg-sky-500/15 text-sky-300 border-sky-500/40',
  lowerMiddle: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
  low: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-700/40 bg-slate-800/40 p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-sky-400">{title}</h3>
      {children}
    </section>
  )
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5 text-sm">
      <span className="shrink-0 text-slate-400">{label}</span>
      <span className="text-right font-medium text-slate-200">{value}</span>
    </div>
  )
}

/** 数据年份小标注 */
function YearTag({ year, suffix }: { year: string | null; suffix: string }) {
  if (!year) return null
  return (
    <span className="ml-1.5 text-xs text-slate-500">
      {year} {suffix}
    </span>
  )
}

export default function InfoPanel() {
  const { t, i18n } = useTranslation()
  const selected = useAppStore((s) => s.selected)
  const select = useAppStore((s) => s.select)

  const [stats, setStats] = useState<WbStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [history, setHistory] = useState<WikiSummary | null>(null)
  const [historyLoading, setHistoryLoading] = useState(false)

  // 选中国家后按需拉取世界银行数据（人口 + GDP，带本地缓存）
  useEffect(() => {
    setStats(null)
    if (!selected) return
    let cancelled = false
    setStatsLoading(true)
    fetchStats(selected.cca2)
      .then((s) => !cancelled && setStats(s))
      .catch(() => !cancelled && setStats(null))
      .finally(() => !cancelled && setStatsLoading(false))
    return () => {
      cancelled = true
    }
  }, [selected])

  // 历史摘要来自维基百科，随语言切换重新获取（有本地缓存）
  useEffect(() => {
    setHistory(null)
    if (!selected) return
    let cancelled = false
    setHistoryLoading(true)
    fetchCountryHistory(selected, i18n.language.startsWith('zh') ? 'zh' : 'en')
      .then((h) => !cancelled && setHistory(h))
      .catch(() => !cancelled && setHistory(null))
      .finally(() => !cancelled && setHistoryLoading(false))
    return () => {
      cancelled = true
    }
  }, [selected, i18n.language])

  if (!selected) return null

  const lang = i18n.language
  const zh = lang.startsWith('zh')
  const extra = countryExtras[selected.cca3]

  const name = zh ? selected.nameZh : selected.nameEn
  const altName = zh ? selected.nameEn : selected.nameZh
  const official = zh ? selected.officialZh : selected.officialEn
  const capital = zh && extra?.capitalZh ? extra.capitalZh : selected.capital.join(', ') || '—'
  const region = zh ? (regionZh[selected.region] ?? selected.region) : selected.region
  const government = extra ? (zh ? extra.govZh : extra.govEn) : null
  const income = stats?.gdpPerCapita != null ? incomeGroupOf(stats.gdpPerCapita) : null

  const pendingDash = statsLoading ? (
    <span className="animate-pulse text-slate-500">…</span>
  ) : (
    t('panel.gdpUnavailable')
  )

  return (
    <aside
      key={selected.cca3}
      className="panel-enter fixed inset-x-0 bottom-0 z-20 max-h-[72vh] overflow-y-auto rounded-t-2xl border-t border-slate-700/50 bg-slate-900/85 backdrop-blur-xl md:inset-x-auto md:top-16 md:right-4 md:bottom-4 md:max-h-none md:w-[400px] md:rounded-2xl md:border"
    >
      {/* 头部：国旗 + 名称 */}
      <div className="relative border-b border-slate-700/40 p-5">
        <button
          onClick={() => select(null)}
          className="absolute top-4 right-4 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-700/50 hover:text-slate-100"
          aria-label={t('backToGlobe')}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3l10 10M13 3L3 13" />
          </svg>
        </button>
        <img
          src={selected.flagSvg}
          alt={name}
          className="mb-3 h-16 rounded-md border border-slate-600/50 shadow-lg"
        />
        <h2 className="text-2xl font-bold text-slate-100">{name}</h2>
        <p className="text-sm text-slate-400">{altName}</p>
        <p className="mt-2 text-xs text-slate-500">
          {t('panel.officialName')}：{official}
        </p>
      </div>

      <div className="space-y-3 p-4">
        <Section title={t('panel.basics')}>
          <Row label={t('panel.capital')} value={capital} />
          <Row
            label={t('panel.region')}
            value={`${region}${selected.subregion ? ` · ${selected.subregion}` : ''}`}
          />
          <Row
            label={t('panel.area')}
            value={`${formatBigNumber(selected.area, lang)} ${t('panel.sqkm')}`}
          />
          <Row
            label={t('panel.population')}
            value={
              stats?.population != null ? (
                <>
                  {formatBigNumber(stats.population, lang)}
                  <YearTag year={stats.populationYear} suffix={t('panel.dataYear')} />
                </>
              ) : (
                pendingDash
              )
            }
          />
          <Row label={t('panel.languages')} value={selected.languages.join(', ') || '—'} />
          <Row
            label={t('panel.currency')}
            value={
              selected.currencies
                .map((c) => `${c.name} (${c.code}${c.symbol ? ` ${c.symbol}` : ''})`)
                .join(', ') || '—'
            }
          />
        </Section>

        <Section title={t('panel.economy')}>
          <Row
            label={t('panel.gdp')}
            value={
              stats?.gdp != null ? (
                <>
                  {formatUsd(stats.gdp, lang)}
                  <YearTag year={stats.gdpYear} suffix={t('panel.dataYear')} />
                </>
              ) : (
                pendingDash
              )
            }
          />
          <Row
            label={t('panel.gdpPerCapita')}
            value={
              stats?.gdpPerCapita != null ? `$${formatExact(stats.gdpPerCapita, lang)}` : pendingDash
            }
          />
          {income && (
            <span
              className={`mt-2 inline-block rounded-full border px-3 py-1 text-xs font-medium ${incomeBadgeColor[income]}`}
            >
              {t(`income.${income}`)}
            </span>
          )}
        </Section>

        <Section title={t('panel.politics')}>
          <Row
            label={t('panel.government')}
            value={government ?? <span className="text-slate-500">{t('panel.govUnavailable')}</span>}
          />
        </Section>

        <Section title={t('panel.history')}>
          {historyLoading ? (
            <p className="animate-pulse py-1 text-sm text-slate-400">{t('panel.historyLoading')}</p>
          ) : history ? (
            <>
              <p className="text-sm leading-relaxed text-slate-300">{history.extract}</p>
              <a
                href={history.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-xs text-sky-400 transition hover:text-sky-300"
              >
                {t('panel.historyMore')}
              </a>
            </>
          ) : (
            <p className="text-sm text-slate-500">{t('panel.historyUnavailable')}</p>
          )}
        </Section>
      </div>
    </aside>
  )
}
