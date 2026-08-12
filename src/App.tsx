import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import GlobeView from './components/GlobeView'
import Header from './components/Header'
import InfoPanel from './components/InfoPanel'
import TimeTravelBar from './components/TimeTravelBar'
import RankingPanel from './components/RankingPanel'
import MoonView from './components/space/MoonView'
import SolarSystemView from './components/space/SolarSystemView'
import GalaxyView from './components/space/GalaxyView'
import UniverseView from './components/space/UniverseView'
import { fetchAllGdp } from './services/worldbank'
import { useAppStore } from './store/useAppStore'

export default function App() {
  const { t, i18n } = useTranslation()
  const selected = useAppStore((s) => s.selected)
  const timeTravel = useAppStore((s) => s.timeTravel)
  const view = useAppStore((s) => s.view)
  const setGdpAll = useAppStore((s) => s.setGdpAll)

  // 启动时批量拉取全球 GDP（一次请求 + 30 天缓存），供 3D 柱状图使用
  useEffect(() => {
    fetchAllGdp()
      .then(setGdpAll)
      .catch((err) => console.error('全球 GDP 加载失败', err))
  }, [setGdpAll])

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
      {/* 地球视图常驻（隐藏时暂停渲染），其他尺度视图按需挂载 */}
      <GlobeView />
      {view === 'moon' && <MoonView />}
      {view === 'solar' && <SolarSystemView />}
      {view === 'galaxy' && <GalaxyView />}
      {view === 'universe' && <UniverseView />}

      <Header />
      {view === 'earth' && (
        <>
          <InfoPanel />
          <TimeTravelBar />
          <RankingPanel />
        </>
      )}

      {/* 尺度切换淡入过渡（key 变化触发重播） */}
      <div key={view} className="view-fade pointer-events-none fixed inset-0 z-40 bg-slate-950" />

      {/* 底部操作提示（地球视图未选中国家时显示） */}
      {view === 'earth' && !selected && !timeTravel && (
        <p className="pointer-events-none fixed inset-x-0 bottom-4 z-10 text-center text-xs text-slate-500">
          {t('hint')} · {t('scaleHintEarth')}
        </p>
      )}
      {view !== 'earth' && (
        <p className="pointer-events-none fixed inset-x-0 bottom-4 z-10 text-center text-xs text-slate-500">
          {t(view === 'universe' ? 'scaleHintUniverse' : 'scaleHintSpace')}
        </p>
      )}

      {/* 作者与开源链接 */}
      <footer className="fixed bottom-4 left-4 z-10 flex items-center gap-3 text-xs text-slate-500">
        <a
          href="https://tanzhuo.xyz"
          target="_blank"
          rel="noopener noreferrer"
          className="transition hover:text-sky-300"
        >
          {t('authorBlog')}
        </a>
        <span className="text-slate-700">|</span>
        <a
          href="https://github.com/tan-zhuo/earth"
          target="_blank"
          rel="noopener noreferrer"
          className="transition hover:text-sky-300"
        >
          GitHub
        </a>
      </footer>
    </div>
  )
}
