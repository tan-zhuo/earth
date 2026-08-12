import { useTranslation } from 'react-i18next'
import { useAppStore } from '../store/useAppStore'

const btnBase =
  'rounded-lg border border-slate-700/60 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-300 backdrop-blur transition hover:border-sky-500/60 hover:text-sky-300'

/** 精简顶栏：菜单按钮 + 标题 + 上下文按钮 + 语言切换，其余入口在左侧抽屉 */
export default function Header() {
  const { t, i18n } = useTranslation()
  const selected = useAppStore((s) => s.selected)
  const select = useAppStore((s) => s.select)
  const timeTravel = useAppStore((s) => s.timeTravel)
  const toggleTimeTravel = useAppStore((s) => s.toggleTimeTravel)
  const view = useAppStore((s) => s.view)
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen)

  const zh = i18n.language.startsWith('zh')

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-center justify-between gap-3 p-4">
      <div className="pointer-events-auto flex items-center gap-2.5 select-none">
        <button
          onClick={() => setSidebarOpen(true)}
          className={btnBase}
          aria-label={t('menu')}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M2 4h12M2 8h12M2 12h12" />
          </svg>
        </button>
        <h1 className="text-xl font-bold tracking-wide text-slate-100">
          {t('appTitle')}
          <span className="ml-2 hidden text-xs font-normal text-slate-400 sm:inline">
            {t(`views.${view}`)}
          </span>
        </h1>
      </div>

      <div className="pointer-events-auto flex items-center gap-2">
        {selected && (
          <button onClick={() => select(null)} className={btnBase}>
            ← {t('backToGlobe')}
          </button>
        )}
        {timeTravel && (
          <button onClick={toggleTimeTravel} className={btnBase}>
            ← {t('exitTimeTravel')}
          </button>
        )}
        <button
          onClick={() => i18n.changeLanguage(zh ? 'en' : 'zh')}
          className={btnBase}
          aria-label="Switch language"
        >
          {zh ? 'EN' : '中文'}
        </button>
      </div>
    </header>
  )
}
