import { useTranslation } from 'react-i18next'
import GlobeView from './components/GlobeView'
import Header from './components/Header'
import InfoPanel from './components/InfoPanel'
import { useAppStore } from './store/useAppStore'

export default function App() {
  const { t } = useTranslation()
  const selected = useAppStore((s) => s.selected)

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-950 text-slate-100">
      <GlobeView />
      <Header />
      <InfoPanel />

      {/* 底部操作提示（未选中国家时显示） */}
      {!selected && (
        <p className="pointer-events-none fixed inset-x-0 bottom-4 z-10 text-center text-xs text-slate-500">
          {t('hint')}
        </p>
      )}
    </div>
  )
}
