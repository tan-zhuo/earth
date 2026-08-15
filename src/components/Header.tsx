import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../store/useAppStore'

const btnBase =
  'rounded-lg border border-slate-700/60 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-300 backdrop-blur transition hover:border-sky-500/60 hover:text-sky-300'

/* ---- 全屏：标准 API + Safari 的 webkit 前缀 ---- */
type FsDocument = Document & {
  webkitFullscreenElement?: Element | null
  webkitExitFullscreen?: () => Promise<void> | void
}
type FsElement = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void }

const fsRoot = () => document.documentElement as FsElement
/** iOS Safari 不支持元素级全屏，此时整个按钮不渲染 */
const FS_SUPPORTED =
  typeof document !== 'undefined' &&
  !!(fsRoot().requestFullscreen || fsRoot().webkitRequestFullscreen)

const isFullscreen = () => {
  const d = document as FsDocument
  return !!(d.fullscreenElement || d.webkitFullscreenElement)
}

/** 全屏开关：外部（Esc、F11）退出也会同步按钮状态 */
function useFullscreen(): [boolean, () => void] {
  const [full, setFull] = useState(isFullscreen)

  useEffect(() => {
    const sync = () => setFull(isFullscreen())
    document.addEventListener('fullscreenchange', sync)
    document.addEventListener('webkitfullscreenchange', sync)
    return () => {
      document.removeEventListener('fullscreenchange', sync)
      document.removeEventListener('webkitfullscreenchange', sync)
    }
  }, [])

  const toggle = () => {
    const d = document as FsDocument
    const run = isFullscreen()
      ? (d.exitFullscreen?.() ?? d.webkitExitFullscreen?.())
      : (fsRoot().requestFullscreen?.() ?? fsRoot().webkitRequestFullscreen?.())
    // 用户手势之外或被浏览器策略拒绝时会 reject，忽略即可（状态由 fullscreenchange 兜底）
    Promise.resolve(run).catch(() => {})
  }

  return [full, toggle]
}

/** 精简顶栏：菜单按钮 + 标题 + 上下文按钮 + 语言切换，其余入口在左侧抽屉 */
export default function Header() {
  const { t, i18n } = useTranslation()
  const selected = useAppStore((s) => s.selected)
  const select = useAppStore((s) => s.select)
  const timeTravel = useAppStore((s) => s.timeTravel)
  const toggleTimeTravel = useAppStore((s) => s.toggleTimeTravel)
  const view = useAppStore((s) => s.view)
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen)
  const [fullscreen, toggleFullscreen] = useFullscreen()

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
        <h1 className="flex items-center gap-2 text-xl font-bold tracking-wide text-slate-100">
          <img src="/logo.svg" alt="Earth logo" className="h-8 w-8" />
          {t('appTitle')}
          <span className="hidden text-xs font-normal text-slate-400 sm:inline">
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
        {FS_SUPPORTED && (
          <button
            onClick={toggleFullscreen}
            className={btnBase}
            aria-label={t(fullscreen ? 'exitFullscreen' : 'fullscreen')}
            title={t(fullscreen ? 'exitFullscreen' : 'fullscreen')}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {fullscreen ? (
                // 四角向内：退出全屏
                <path d="M6.5 2v4.5H2M9.5 2v4.5H14M6.5 14V9.5H2M9.5 14V9.5H14" />
              ) : (
                // 四角向外：进入全屏
                <path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4" />
              )}
            </svg>
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
