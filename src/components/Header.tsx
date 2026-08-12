import { useTranslation } from 'react-i18next'
import { useAppStore } from '../store/useAppStore'

const btnBase =
  'rounded-lg border border-slate-700/60 bg-slate-900/60 px-3 py-1.5 text-xs font-medium ' +
  'text-slate-300 backdrop-blur transition hover:border-sky-500/60 hover:text-sky-300'

export default function Header() {
  const { t, i18n } = useTranslation()
  const selected = useAppStore((s) => s.selected)
  const select = useAppStore((s) => s.select)
  const autoRotate = useAppStore((s) => s.autoRotate)
  const toggleAutoRotate = useAppStore((s) => s.toggleAutoRotate)

  const zh = i18n.language.startsWith('zh')

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-center justify-between gap-3 p-4">
      <div className="pointer-events-auto select-none">
        <h1 className="text-xl font-bold tracking-wide text-slate-100">
          🌍 {t('appTitle')}
          <span className="ml-2 hidden text-xs font-normal text-slate-400 sm:inline">
            {t('appSubtitle')}
          </span>
        </h1>
      </div>

      <div className="pointer-events-auto flex items-center gap-2">
        {selected && (
          <button onClick={() => select(null)} className={btnBase}>
            ← {t('backToGlobe')}
          </button>
        )}
        <button onClick={toggleAutoRotate} className={btnBase} title={t('hint')}>
          {autoRotate ? t('autoRotateOn') : t('autoRotateOff')}
        </button>
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
