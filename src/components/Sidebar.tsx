import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../store/useAppStore'
import type { SpaceView } from '../store/useAppStore'
import type { Country } from '../types'

const VIEWS: SpaceView[] = ['earth', 'moon', 'solar', 'galaxy', 'universe']

/** 开关行：标签 + 滑动开关 */
function ToggleRow({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800/70"
    >
      <span>{label}</span>
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition ${on ? 'bg-sky-500/70' : 'bg-slate-700'}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-slate-100 transition-all ${on ? 'left-[18px]' : 'left-0.5'}`}
        />
      </span>
    </button>
  )
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h3 className="mt-4 mb-1 px-3 text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
      {children}
    </h3>
  )
}

export default function Sidebar() {
  const { t, i18n } = useTranslation()
  const zh = i18n.language.startsWith('zh')

  const sidebarOpen = useAppStore((s) => s.sidebarOpen)
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen)
  const view = useAppStore((s) => s.view)
  const setView = useAppStore((s) => s.setView)
  const countries = useAppStore((s) => s.countries)
  const showGdpBars = useAppStore((s) => s.showGdpBars)
  const toggleGdpBars = useAppStore((s) => s.toggleGdpBars)
  const showFlags = useAppStore((s) => s.showFlags)
  const toggleFlags = useAppStore((s) => s.toggleFlags)
  const showRoutes = useAppStore((s) => s.showRoutes)
  const toggleRoutes = useAppStore((s) => s.toggleRoutes)
  const showSatellites = useAppStore((s) => s.showSatellites)
  const toggleSatellites = useAppStore((s) => s.toggleSatellites)
  const showRankings = useAppStore((s) => s.showRankings)
  const toggleRankings = useAppStore((s) => s.toggleRankings)
  const timeTravel = useAppStore((s) => s.timeTravel)
  const toggleTimeTravel = useAppStore((s) => s.toggleTimeTravel)
  const autoRotate = useAppStore((s) => s.autoRotate)
  const toggleAutoRotate = useAppStore((s) => s.toggleAutoRotate)

  const [query, setQuery] = useState('')

  // 国家搜索：中文名 / 英文名 / ISO 代码模糊匹配
  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return countries
      .filter(
        (c) =>
          c.nameZh.includes(q) ||
          c.officialZh.includes(q) ||
          c.nameEn.toLowerCase().includes(q) ||
          c.officialEn.toLowerCase().includes(q) ||
          c.cca2.toLowerCase() === q ||
          c.cca3.toLowerCase() === q,
      )
      .slice(0, 8)
  }, [query, countries])

  const pickCountry = (c: Country) => {
    if (view !== 'earth') setView('earth')
    // setView 会清空 selected，异步一拍后选中目标国家触发飞行
    setTimeout(() => useAppStore.getState().select(c), 50)
    setQuery('')
    setSidebarOpen(false)
  }

  return (
    <>
      {/* 遮罩 */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/50" onClick={() => setSidebarOpen(false)} />
      )}

      {/* 抽屉 */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-700/50 bg-slate-900/95 backdrop-blur-xl transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-700/40 px-4 py-3">
          <h2 className="text-sm font-bold tracking-wide text-slate-100">{t('menu')}</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-700/50 hover:text-slate-100"
            aria-label="Close menu"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {/* 国家搜索 */}
          <div className="p-1.5">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && results[0] && pickCountry(results[0])}
              placeholder={t('searchPlaceholder')}
              className="w-full rounded-lg border border-slate-700/60 bg-slate-800/60 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500/60"
            />
            {query.trim() && (
              <ul className="mt-1.5 overflow-hidden rounded-lg border border-slate-700/40">
                {results.length === 0 && (
                  <li className="px-3 py-2.5 text-xs text-slate-500">{t('searchNoResult')}</li>
                )}
                {results.map((c) => (
                  <li key={c.cca3}>
                    <button
                      onClick={() => pickCountry(c)}
                      className="flex w-full items-center gap-2.5 bg-slate-800/40 px-3 py-2 text-left transition hover:bg-sky-500/15"
                    >
                      <img
                        src={`https://flagcdn.com/w40/${c.cca2.toLowerCase()}.png`}
                        alt=""
                        className="h-3.5 w-5 rounded-sm border border-slate-700/60 object-cover"
                      />
                      <span className="min-w-0 flex-1 truncate text-sm text-slate-200">
                        {zh ? c.nameZh : c.nameEn}
                      </span>
                      <span className="text-[10px] text-slate-500">{c.cca3}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 尺度视图 */}
          <SectionTitle>{t('sections.scale')}</SectionTitle>
          <div className="grid grid-cols-2 gap-1.5 px-1.5">
            {VIEWS.map((v) => (
              <button
                key={v}
                onClick={() => {
                  setView(v)
                  setSidebarOpen(false)
                }}
                className={`rounded-lg border px-3 py-2 text-sm transition ${
                  view === v
                    ? 'border-sky-500/70 bg-sky-500/10 text-sky-300'
                    : 'border-slate-700/50 text-slate-300 hover:border-sky-500/40 hover:text-sky-200'
                }`}
              >
                {t(`views.${v}`)}
              </button>
            ))}
          </div>

          {/* 深入探索 */}
          <SectionTitle>{t('sections.explore')}</SectionTitle>
          <div className="grid grid-cols-2 gap-1.5 px-1.5">
            {(['earthStructure', 'mars'] as SpaceView[]).map((v) => (
              <button
                key={v}
                onClick={() => {
                  setView(v)
                  setSidebarOpen(false)
                }}
                className={`rounded-lg border px-3 py-2 text-sm transition ${
                  view === v
                    ? 'border-sky-500/70 bg-sky-500/10 text-sky-300'
                    : 'border-slate-700/50 text-slate-300 hover:border-sky-500/40 hover:text-sky-200'
                }`}
              >
                {t(`views.${v}`)}
              </button>
            ))}
          </div>

          {/* 地球专属：图层与功能 */}
          {view === 'earth' && (
            <>
              <SectionTitle>{t('sections.layers')}</SectionTitle>
              <ToggleRow label={t('layerGdpBars')} on={showGdpBars} onClick={toggleGdpBars} />
              <ToggleRow label={t('layerFlags')} on={showFlags} onClick={toggleFlags} />
              <ToggleRow label={t('layerRoutes')} on={showRoutes} onClick={toggleRoutes} />
              <ToggleRow label={t('layerSatellites')} on={showSatellites} onClick={toggleSatellites} />

              <SectionTitle>{t('sections.features')}</SectionTitle>
              <ToggleRow
                label={t('rankingsBtn')}
                on={showRankings}
                onClick={() => {
                  toggleRankings()
                  setSidebarOpen(false)
                }}
              />
              <ToggleRow
                label={t('timeTravel')}
                on={timeTravel}
                onClick={() => {
                  toggleTimeTravel()
                  setSidebarOpen(false)
                }}
              />
              <ToggleRow label={t('autoRotateLabel')} on={autoRotate} onClick={toggleAutoRotate} />
            </>
          )}
        </div>

        {/* 底部：语言与链接 */}
        <div className="border-t border-slate-700/40 p-3">
          <button
            onClick={() => i18n.changeLanguage(zh ? 'en' : 'zh')}
            className="mb-2 w-full rounded-lg border border-slate-700/60 px-3 py-2 text-sm text-slate-300 transition hover:border-sky-500/60 hover:text-sky-300"
          >
            {zh ? 'Switch to English' : '切换为中文'}
          </button>
          <div className="flex justify-center gap-3 text-xs text-slate-500">
            <a
              href="https://tanzhuo.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 transition hover:text-sky-300"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" />
              </svg>
              {t('authorBlog')}
            </a>
            <span className="text-slate-700">|</span>
            <a
              href="https://github.com/tan-zhuo/earth"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 transition hover:text-sky-300"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </aside>
    </>
  )
}
