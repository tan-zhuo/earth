import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import GlobeView from './components/GlobeView'
import Header from './components/Header'
import InfoPanel from './components/InfoPanel'
import { useAppStore } from './store/useAppStore'

export default function App() {
  const { t, i18n } = useTranslation()
  const selected = useAppStore((s) => s.selected)

  // SEO：标题、<html lang>、描述随语言和选中国家动态更新
  useEffect(() => {
    const zh = i18n.language.startsWith('zh')
    document.documentElement.lang = zh ? 'zh-CN' : 'en'
    const base = zh ? 'Earth · 3D 互动地球' : 'Earth · Interactive 3D World Atlas'
    document.title = selected
      ? `${zh ? selected.nameZh : selected.nameEn} - ${base}`
      : base
    const desc = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (desc && selected) {
      desc.content = zh
        ? `${selected.nameZh}（${selected.nameEn}）：首都、人口、GDP、政治体制等信息，交互式 3D 地球。`
        : `${selected.nameEn}: capital, population, GDP and government on an interactive 3D globe.`
    }
  }, [selected, i18n.language])

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
