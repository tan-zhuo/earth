import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../store/useAppStore'
import { fetchStats, fetchResourceStats } from '../services/worldbank'
import type { ResourceStats } from '../services/worldbank'
import { fetchCountryHistory } from '../services/wikipedia'
import type { WikiSummary } from '../services/wikipedia'
import { countryExtras } from '../data/countryExtras'
import factbookRaw from '../data/factbook.json'
import anthemsRaw from '../data/anthems.json'
import { translateTerms } from '../utils/termsZh'

/** 各国国歌（构建时由 Wikidata 生成，音频托管于 Wikimedia Commons） */
const anthems = anthemsRaw as Record<
  string,
  { nameEn: string | null; nameZh: string | null; audio: string | null }
>

/** CIA Factbook 精选字段（构建时生成，见 scripts/build-factbook.mjs） */
const factbook = factbookRaw as Record<
  string,
  { res: string | null; agri: string | null; ind: string | null; expc: string | null }
>
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
  const gdpAll = useAppStore((s) => s.gdpAll)
  const countries = useAppStore((s) => s.countries)

  const [stats, setStats] = useState<WbStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [history, setHistory] = useState<WikiSummary | null>(null)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [resStats, setResStats] = useState<ResourceStats | null>(null)

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

  // 自然资源指标（World Bank，多指标一次请求，本地缓存）
  useEffect(() => {
    setResStats(null)
    if (!selected) return
    let cancelled = false
    fetchResourceStats(selected.cca2)
      .then((r) => !cancelled && setResStats(r))
      .catch(() => !cancelled && setResStats(null))
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

  // 全球 GDP 排名与进出口（批量数据含世界/地区等聚合体，排名只与真实国家比较）
  const econ = gdpAll?.[selected.cca3]
  const gdpRank =
    gdpAll && econ?.gdp != null
      ? countries.filter((c) => (gdpAll[c.cca3]?.gdp ?? -Infinity) > econ.gdp).length + 1
      : null

  const pendingDash = statsLoading ? (
    <span className="animate-pulse text-slate-500">…</span>
  ) : (
    t('panel.gdpUnavailable')
  )

  // Factbook 清单（中文按术语词典翻译）
  const fb = factbook[selected.cca3]
  const fbText = (s: string | null | undefined) => (s ? (zh ? translateTerms(s) : s) : null)
  const fbRes = fbText(fb?.res)
  const fbAgri = fbText(fb?.agri)
  const fbInd = fbText(fb?.ind)
  const fbExpc = fbText(fb?.expc)

  // 资源租金构成（只显示 >0.1% 的项）
  const rentPairs: Array<[string, number | null]> = resStats
    ? [
        ['rentOil', resStats.oilRents],
        ['rentGas', resStats.gasRents],
        ['rentCoal', resStats.coalRents],
        ['rentMineral', resStats.mineralRents],
        ['rentForest', resStats.forestRents],
      ]
    : []
  const rentItems = rentPairs.filter((x): x is [string, number] => x[1] != null && x[1] > 0.1)
  const fmtPct = (v: number) => `${v.toFixed(v >= 10 ? 0 : 1)}%`
  const fmtTons = (v: number) => `${formatBigNumber(v, lang)} ${t('panel.tons')}`

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
        {(() => {
          const anthem = anthems[selected.cca3]
          if (!anthem || (!anthem.nameEn && !anthem.nameZh)) return null
          return (
            <Section title={t('panel.anthem')}>
              <p className="text-sm font-medium text-slate-200">
                {zh ? (anthem.nameZh ?? anthem.nameEn) : (anthem.nameEn ?? anthem.nameZh)}
              </p>
              {anthem.audio ? (
                <audio
                  key={selected.cca3}
                  controls
                  preload="none"
                  src={anthem.audio}
                  className="mt-2 h-9 w-full"
                />
              ) : (
                <p className="mt-1 text-xs text-slate-500">{t('panel.anthemNoAudio')}</p>
              )}
              <p className="mt-1.5 text-[10px] text-slate-600">{t('panel.anthemSource')}</p>
            </Section>
          )
        })()}

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
                  {gdpRank != null && (
                    <span className="ml-1.5 rounded bg-amber-500/15 px-1.5 py-0.5 text-xs text-amber-300">
                      {t('panel.gdpRank', { rank: gdpRank })}
                    </span>
                  )}
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
          <Row
            label={t('panel.exports')}
            value={
              econ?.exports != null ? (
                <>
                  {formatUsd(econ.exports, lang)}
                  <YearTag year={econ.exportsYear} suffix={t('panel.dataYear')} />
                </>
              ) : (
                pendingDash
              )
            }
          />
          <Row
            label={t('panel.imports')}
            value={
              econ?.imports != null ? (
                <>
                  {formatUsd(econ.imports, lang)}
                  <YearTag year={econ.importsYear} suffix={t('panel.dataYear')} />
                </>
              ) : (
                pendingDash
              )
            }
          />
          {fbExpc && (
            <div className="mt-2 border-t border-slate-700/30 pt-2">
              <p className="mb-1 text-xs text-slate-400">{t('panel.exportsCommodities')}</p>
              <p className="text-sm leading-relaxed text-slate-300">{fbExpc}</p>
            </div>
          )}
          <p className="mt-1 text-[10px] text-slate-600">{t('panel.tradeNote')}</p>
          {income && (
            <span
              className={`mt-2 inline-block rounded-full border px-3 py-1 text-xs font-medium ${incomeBadgeColor[income]}`}
            >
              {t(`income.${income}`)}
            </span>
          )}
        </Section>

        <Section title={t('panel.resources')}>
          {fbRes && (
            <div className="mb-2">
              <p className="mb-1 text-xs text-slate-400">{t('panel.naturalResources')}</p>
              <p className="text-sm leading-relaxed text-slate-300">{fbRes}</p>
            </div>
          )}
          {resStats?.totalRents != null && resStats.totalRents > 0.05 && (
            <div className="mb-2">
              <Row label={t('panel.resourceRents')} value={fmtPct(resStats.totalRents)} />
              {rentItems.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {rentItems.map(([k, v]) => (
                    <span
                      key={k}
                      className="rounded-full border border-slate-600/50 bg-slate-800/60 px-2 py-0.5 text-xs text-slate-300"
                    >
                      {t(`panel.${k}`)} {fmtPct(v)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
          {resStats?.arablePct != null && (
            <Row label={t('panel.arable')} value={fmtPct(resStats.arablePct)} />
          )}
          {resStats?.forestPct != null && (
            <Row label={t('panel.forestCover')} value={fmtPct(resStats.forestPct)} />
          )}
          {resStats?.cereal != null && resStats.cereal > 0 && (
            <Row label={t('panel.cereal')} value={fmtTons(resStats.cereal)} />
          )}
          {resStats?.fish != null && resStats.fish > 0 && (
            <Row label={t('panel.fishery')} value={fmtTons(resStats.fish)} />
          )}
          {resStats?.freshwater != null && resStats.freshwater > 0 && (
            <Row
              label={t('panel.freshwater')}
              value={
                zh
                  ? `${formatBigNumber(resStats.freshwater * 10, lang)} 亿立方米`
                  : `${resStats.freshwater.toLocaleString('en-US', { maximumFractionDigits: 0 })} km³`
              }
            />
          )}
          {fbAgri && (
            <div className="mt-2 border-t border-slate-700/30 pt-2">
              <p className="mb-1 text-xs text-slate-400">{t('panel.agriProducts')}</p>
              <p className="text-sm leading-relaxed text-slate-300">{fbAgri}</p>
            </div>
          )}
          {fbInd && (
            <div className="mt-2 border-t border-slate-700/30 pt-2">
              <p className="mb-1 text-xs text-slate-400">{t('panel.industries')}</p>
              <p className="text-sm leading-relaxed text-slate-300">{fbInd}</p>
            </div>
          )}
          {!fbRes && !fbAgri && !fbInd && !resStats && (
            <p className="animate-pulse py-1 text-sm text-slate-400">{t('loading')}</p>
          )}
          <p className="mt-2 text-[10px] text-slate-600">{t('panel.factbookNote')}</p>
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
