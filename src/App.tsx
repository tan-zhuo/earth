import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import GlobeView from './components/GlobeView'
import Header from './components/Header'
import EarthAppearance from './components/EarthAppearance'
import Sidebar from './components/Sidebar'
import InfoPanel from './components/InfoPanel'
import TimeTravelBar from './components/TimeTravelBar'
import RankingPanel from './components/RankingPanel'
import TerrainPanel from './components/TerrainPanel'
import DailyPick from './components/DailyPick'
import MoonView from './components/space/MoonView'
import SolarSystemView from './components/space/SolarSystemView'
import GalaxyView from './components/space/GalaxyView'
import UniverseView from './components/space/UniverseView'
import EarthStructureView from './components/space/EarthStructureView'
import MarsView from './components/space/MarsView'
import SpacecraftView from './components/space/SpacecraftView'
import { fetchAllGdp } from './services/worldbank'
import { useAppStore } from './store/useAppStore'
import { HREFLANG, SITE_URL, countryMeta, homeMeta } from './seo'
import { parseRoute, buildUrl } from './routing'
import { PALEO_ERAS } from './data/paleoEras'
import { langOf, pick } from './i18n/pick'

export default function App() {
  const { t, i18n } = useTranslation()
  const selected = useAppStore((s) => s.selected)
  const timeTravel = useAppStore((s) => s.timeTravel)
  const view = useAppStore((s) => s.view)
  const eraIndex = useAppStore((s) => s.eraIndex)
  const craftId = useAppStore((s) => s.craftId)
  const showRankings = useAppStore((s) => s.showRankings)
  const setGdpAll = useAppStore((s) => s.setGdpAll)

  // 启动时批量拉取全球 GDP（一次请求 + 30 天缓存），供 3D 柱状图使用
  useEffect(() => {
    fetchAllGdp()
      .then(setGdpAll)
      .catch((err) => console.error('全球 GDP 加载失败', err))
  }, [setGdpAll])

  /** URL 是否带语言前缀：从带前缀的链接进来，或用户手动切换过语言后，链接都带上语言 */
  const prefixedRef = useRef(false)

  // 深链：/{lang}/country/{cca3}、?view=…、?era=… 直达对应语言、国家、视图或时代
  useEffect(() => {
    const route = parseRoute(window.location.pathname, window.location.search)
    const s = useAppStore.getState()
    if (route.lang) {
      prefixedRef.current = true
      if (langOf(i18n.language) !== route.lang) void i18n.changeLanguage(route.lang)
    }
    if (route.country) {
      const c = s.countries.find((x) => x.cca3 === route.country)
      if (c) s.select(c)
    } else if (route.view === 'spacecraft' && route.craft) {
      s.setCraft(route.craft)
    } else if (route.view && route.view !== 'earth') {
      s.setView(route.view)
    } else if (route.era != null) {
      const index = PALEO_ERAS.findIndex((e) => e.ma === route.era)
      if (index >= 0) {
        s.toggleTimeTravel()
        s.setEraIndex(index)
      }
    }
    const onLanguage = () => { prefixedRef.current = true }
    i18n.on('languageChanged', onLanguage)
    return () => i18n.off('languageChanged', onLanguage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 状态变化时同步 URL 与 canonical（replaceState 不污染历史记录），任何画面都能直接复制链接分享
  useEffect(() => {
    const url = buildUrl({
      lang: prefixedRef.current ? langOf(i18n.language) : null,
      country: selected?.cca3 ?? null,
      view,
      era: timeTravel ? PALEO_ERAS[eraIndex].ma : null,
      craft: view === 'spacecraft' ? craftId : null,
    })
    if (window.location.pathname + window.location.search !== url) window.history.replaceState(null, '', url)
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (canonical) canonical.href = `${SITE_URL}${window.location.pathname}`
  }, [selected, view, timeTravel, eraIndex, craftId, i18n.language])

  // SEO：标题、<html lang>、描述随语言和选中国家动态更新（与预渲染的静态页同源）
  useEffect(() => {
    const lang = langOf(i18n.language)
    document.documentElement.lang = HREFLANG[lang]
    const meta = selected ? countryMeta(selected, lang) : homeMeta(lang)
    document.title = meta.title
    const desc = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (desc) desc.content = meta.description
  }, [selected, i18n.language])

  return (
    <div className={`relative h-full w-full overflow-hidden text-slate-100 ${['solar', 'galaxy', 'universe'].includes(view) ? 'bg-black' : 'bg-slate-950'}`}>
      {/* 地球视图常驻（隐藏时暂停渲染），其他尺度视图按需挂载 */}
      <GlobeView />
      {view === 'moon' && <MoonView />}
      {view === 'solar' && <SolarSystemView />}
      {view === 'galaxy' && <GalaxyView />}
      {view === 'universe' && <UniverseView />}
      {view === 'earthStructure' && <EarthStructureView />}
      {view === 'mars' && <MarsView />}
      {view === 'spacecraft' && <SpacecraftView />}

      <Header />
      <Sidebar />
      {view === 'earth' && (
        <>
          <InfoPanel />
          <TimeTravelBar />
          <RankingPanel />
          <TerrainPanel />
          <EarthAppearance />
          {!selected && !timeTravel && !showRankings && <DailyPick />}
        </>
      )}

      {/* 尺度切换淡入过渡（key 变化触发重播） */}
      <div key={view} className="view-fade pointer-events-none fixed inset-0 z-40 bg-slate-950" />

      {/* 底部操作提示（地球视图未选中国家时显示） */}
      {view === 'earth' && !selected && !timeTravel && (
        <p className="pointer-events-none fixed inset-x-0 bottom-4 z-10 text-center text-xs text-slate-500">
          <span className="sm:hidden">{pick(i18n.language, '拖动旋转 · 双指缩放 · 点击国家', 'Drag to rotate · Pinch to zoom · Select a country', 'ドラッグで回転 · ピンチでズーム · 国をタップ', 'Вращайте касанием · масштаб щипком · выберите страну')}</span>
          <span className="hidden sm:inline">{t('hint')} · {t('scaleHintEarth')}</span>
        </p>
      )}
      {view !== 'earth' && view !== 'earthStructure' && view !== 'mars' && view !== 'spacecraft' && (
        <p className="pointer-events-none fixed inset-x-0 bottom-4 z-10 text-center text-xs text-slate-500">
          {['solar', 'galaxy', 'universe'].includes(view) ? pick(i18n.language, '拖动旋转 · 滚轮缩放 · 点击标签探索', 'Drag to orbit · Scroll to zoom · Select a label to explore', 'ドラッグで回転 · スクロールでズーム · ラベルを選んで探索', 'Перетащите для вращения · колесо для масштаба · выберите метку') : t('scaleHintSpace')}
        </p>
      )}

      {/* 作者与开源链接 */}
      <footer className="fixed bottom-4 left-4 z-10 hidden items-center gap-3 text-xs text-slate-500 md:flex">
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
