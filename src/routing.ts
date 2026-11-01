/**
 * 可分享的 URL：语言前缀 + 国家路径 + 视图参数。
 *
 *   /zh/country/chn        中文界面、选中中国（预渲染的静态页）
 *   /en/?view=solar        英文界面、太阳系视图
 *   /ja/?era=240           日文界面、时间旅行到 2.4 亿年前
 *   /country/chn           无语言前缀：x-default，按浏览器语言显示
 */
import type { Lang } from './i18n/pick'
import type { SpaceView } from './store/useAppStore'
import { PAGE_LANGS, pagePath } from './seo'

const VIEWS: SpaceView[] = ['earth', 'moon', 'solar', 'galaxy', 'universe', 'earthStructure', 'mars', 'spacecraft']

export interface Route {
  lang: Lang | null
  country: string | null
  view: SpaceView | null
  /** 时间旅行的时代（距今百万年） */
  era: number | null
  /** 航天器展厅的型号 */
  craft: string | null
}

export function parseRoute(pathname: string, search: string): Route {
  const m = pathname.match(/^\/(?:(zh|en|ja|ru)(?:\/|$))?(?:country\/([a-z]{3})\/?)?$/i)
  const params = new URLSearchParams(search)
  const view = params.get('view') as SpaceView | null
  const era = params.get('era')
  const lang = m?.[1]?.toLowerCase() as Lang | undefined
  return {
    lang: lang && PAGE_LANGS.includes(lang) ? lang : null,
    country: m?.[2]?.toUpperCase() ?? null,
    view: view && VIEWS.includes(view) ? view : null,
    era: era != null && /^\d+$/.test(era) ? Number(era) : null,
    craft: params.get('craft'),
  }
}

export function buildUrl(r: Route): string {
  const params = new URLSearchParams()
  if (!r.country) {
    if (r.view && r.view !== 'earth') params.set('view', r.view)
    if (r.view === 'spacecraft' && r.craft) params.set('craft', r.craft)
    if (r.era != null && (!r.view || r.view === 'earth')) params.set('era', String(r.era))
  }
  const query = params.toString()
  return pagePath(r.lang, r.country) + (query ? `?${query}` : '')
}
