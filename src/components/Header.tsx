import { useTranslation } from 'react-i18next'
import { useAppStore } from '../store/useAppStore'
import type { SpaceView } from '../store/useAppStore'

const btnBase =
  'rounded-lg border px-3 py-1.5 text-xs font-medium backdrop-blur transition hover:border-sky-500/60 hover:text-sky-300'
const btnOff = `${btnBase} border-slate-700/60 bg-slate-900/60 text-slate-300`
const btnOn = `${btnBase} border-sky-500/70 bg-sky-500/10 text-sky-300`

const VIEWS: SpaceView[] = ['earth', 'moon', 'solar', 'galaxy', 'universe']

export default function Header() {
  const { t, i18n } = useTranslation()
  const selected = useAppStore((s) => s.selected)
  const select = useAppStore((s) => s.select)
  const autoRotate = useAppStore((s) => s.autoRotate)
  const toggleAutoRotate = useAppStore((s) => s.toggleAutoRotate)
  const showGdpBars = useAppStore((s) => s.showGdpBars)
  const toggleGdpBars = useAppStore((s) => s.toggleGdpBars)
  const showFlags = useAppStore((s) => s.showFlags)
  const toggleFlags = useAppStore((s) => s.toggleFlags)
  const timeTravel = useAppStore((s) => s.timeTravel)
  const toggleTimeTravel = useAppStore((s) => s.toggleTimeTravel)
  const showRankings = useAppStore((s) => s.showRankings)
  const toggleRankings = useAppStore((s) => s.toggleRankings)
  const showRoutes = useAppStore((s) => s.showRoutes)
  const toggleRoutes = useAppStore((s) => s.toggleRoutes)
  const view = useAppStore((s) => s.view)
  const setView = useAppStore((s) => s.setView)

  const zh = i18n.language.startsWith('zh')
  const onEarth = view === 'earth'

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-30 flex flex-wrap items-start justify-between gap-3 p-4">
      <div className="pointer-events-auto flex flex-wrap items-center gap-3 select-none">
        <h1 className="text-xl font-bold tracking-wide text-slate-100">
          {t('appTitle')}
          <span className="ml-2 hidden text-xs font-normal text-slate-400 lg:inline">
            {t('appSubtitle')}
          </span>
        </h1>
        {/* 宇宙尺度阶梯 */}
        <nav className="flex overflow-hidden rounded-lg border border-slate-700/60 bg-slate-900/60 backdrop-blur">
          {VIEWS.map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-2.5 py-1.5 text-xs font-medium transition ${
                view === v
                  ? 'bg-sky-500/15 text-sky-300'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              {t(`views.${v}`)}
            </button>
          ))}
        </nav>
      </div>

      <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-2">
        {onEarth && (
          <>
            {selected && (
              <button onClick={() => select(null)} className={btnOff}>
                ← {t('backToGlobe')}
              </button>
            )}
            <button onClick={toggleTimeTravel} className={timeTravel ? btnOn : btnOff}>
              {t('timeTravel')}
            </button>
            {/* 时间旅行模式下没有国家概念，隐藏现代图层开关 */}
            {!timeTravel && (
              <>
                <button onClick={toggleRankings} className={showRankings ? btnOn : btnOff}>
                  {t('rankingsBtn')}
                </button>
                <button onClick={toggleRoutes} className={showRoutes ? btnOn : btnOff}>
                  {t('layerRoutes')}
                </button>
                <button onClick={toggleGdpBars} className={showGdpBars ? btnOn : btnOff}>
                  {t('layerGdpBars')}
                </button>
                <button onClick={toggleFlags} className={showFlags ? btnOn : btnOff}>
                  {t('layerFlags')}
                </button>
              </>
            )}
            <button
              onClick={toggleAutoRotate}
              className={autoRotate ? btnOn : btnOff}
              title={t('hint')}
            >
              {autoRotate ? t('autoRotateOn') : t('autoRotateOff')}
            </button>
          </>
        )}
        <button
          onClick={() => i18n.changeLanguage(zh ? 'en' : 'zh')}
          className={btnOff}
          aria-label="Switch language"
        >
          {zh ? 'EN' : '中文'}
        </button>
      </div>
    </header>
  )
}
