import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import GlobeView from './components/GlobeView'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import InfoPanel from './components/InfoPanel'
import TimeTravelBar from './components/TimeTravelBar'
import RankingPanel from './components/RankingPanel'
import MoonView from './components/space/MoonView'
import SolarSystemView from './components/space/SolarSystemView'
import GalaxyView from './components/space/GalaxyView'
import UniverseView from './components/space/UniverseView'
import EarthStructureView from './components/space/EarthStructureView'
import MarsView from './components/space/MarsView'
import { fetchAllGdp } from './services/worldbank'
import { useAppStore } from './store/useAppStore'
import { SITE_URL } from './seo'

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

  // 国家深链：/country/{cca3} 直达该国（SEO 可索引页面）
  useEffect(() => {
    const m = window.location.pathname.match(/^\/country\/([a-z]{3})$/i)
    if (!m) return
    const { countries, select } = useAppStore.getState()
    const c = countries.find((x) => x.cca3.toLowerCase() === m[1].toLowerCase())
    if (c) select(c)
  }, [])

  // 选中变化时同步 URL 与 canonical（replaceState 不污染历史记录）
  useEffect(() => {
    const path = selected ? `/country/${selected.cca3.toLowerCase()}` : '/'
    if (window.location.pathname !== path) window.history.replaceState(null, '', path)
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (canonical) canonical.href = `${SITE_URL}${path === '/' ? '/' : path}`
  }, [selected])

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
      {view === 'earthStructure' && <EarthStructureView />}
      {view === 'mars' && <MarsView />}

      <Header />
      <Sidebar />
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
      {view !== 'earth' && view !== 'earthStructure' && view !== 'mars' && (
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
      </footer>
    </div>
  )
}
