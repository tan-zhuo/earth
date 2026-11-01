/**
 * SEO 单一来源：页面路径、标题与描述。
 * 应用内（App.tsx 动态更新 <title>）与构建时预渲染（scripts/prerender.mjs）共用这里，
 * 保证搜索引擎看到的静态 HTML 与用户打开后的页面一致。
 */
import type { Country } from './types'
import type { Lang } from './i18n/pick'
import { countryExtras } from './data/countryExtras'
import capitalNamesRaw from './data/capitalNames.json'
import { regionName } from './data/regionNames'

/** 站点部署域名（部署后改这里 + public/robots.txt + index.html） */
export const SITE_URL = 'https://www.earth.kim'

/** 有独立 URL 前缀的语言（/zh/、/en/、/ja/、/ru/）；无前缀的页面是 x-default，按浏览器语言显示 */
export const PAGE_LANGS: Lang[] = ['zh', 'en', 'ja', 'ru']

/** hreflang / <html lang> 使用的语言标签 */
export const HREFLANG: Record<Lang, string> = { zh: 'zh-CN', en: 'en', ja: 'ja', ru: 'ru' }

/** 页面路径：lang 为 null 时是无前缀的 x-default 页面 */
export function pagePath(lang: Lang | null, cca3?: string | null): string {
  const prefix = lang ? `/${lang}` : ''
  if (cca3) return `${prefix}/country/${cca3.toLowerCase()}`
  return `${prefix}/`
}

const capitalNames = capitalNamesRaw as Record<string, { zh: string | null; ja: string | null; ru: string | null }>

/** 首都本地化名称：精选数据 → Wikidata 译名 → 英文 */
export function capitalName(c: Country, lang: Lang): string {
  const en = c.capital.join(', ')
  if (lang === 'en') return en
  const extra = countryExtras[c.cca3]
  const key = lang === 'zh' ? 'capitalZh' : lang === 'ja' ? 'capitalJa' : 'capitalRu'
  return extra?.[key] ?? capitalNames[c.cca3]?.[lang] ?? en
}

const localName = (c: Country, lang: Lang) =>
  lang === 'zh' ? c.nameZh : lang === 'ja' ? c.nameJa || c.nameEn : lang === 'ru' ? c.nameRu || c.nameEn : c.nameEn

const areaText = (area: number, lang: Lang) =>
  Math.round(area).toLocaleString(lang === 'zh' ? 'zh-CN' : lang)

export interface PageMeta {
  title: string
  description: string
}

export function homeMeta(lang: Lang): PageMeta {
  switch (lang) {
    case 'zh':
      return {
        title: 'Earth 3D 互动地球仪 - 世界地图·国家信息·GDP 排行',
        description: '免费在线 3D 地球仪：旋转缩放地球，点击 250 个国家查看国旗、国歌、首都、人口、GDP 排名、政治体制、省份与城市；实时昼夜与云层、大陆漂移时间旅行、月球、火星、太阳系与银河系漫游。',
      }
    case 'ja':
      return {
        title: 'Earth 3D インタラクティブ地球儀 – 世界地図・国情報・GDPランキング',
        description: '無料のオンライン 3D 地球儀。250 の国と地域の国旗・国歌・首都・人口・GDP ランキング・政治体制・州と都市を表示。リアルタイムの昼夜と雲、大陸移動のタイムトラベル、月・火星・太陽系・銀河系の旅も。',
      }
    case 'ru':
      return {
        title: 'Earth — интерактивный 3D-глобус: страны, рейтинги ВВП, космос',
        description: 'Бесплатный онлайн 3D-глобус: флаги, гимны, столицы, население, рейтинг ВВП, форма правления, регионы и города 250 стран; смена дня и ночи в реальном времени, облака, дрейф континентов, Луна, Марс, Солнечная система и Млечный Путь.',
      }
    default:
      return {
        title: 'Earth · Interactive 3D World Globe – Countries, GDP Rankings & Space',
        description: 'A free interactive 3D globe: flags, anthems, capitals, population, GDP rankings, government, provinces and cities for 250 countries; live day/night lighting and clouds, continental drift time travel, the Moon, Mars, the Solar System and the Milky Way.',
      }
  }
}

export function countryMeta(c: Country, lang: Lang): PageMeta {
  const name = localName(c, lang)
  const capital = capitalName(c, lang)
  const region = regionName(c.subregion || c.region, lang)
  const area = areaText(c.area, lang)
  switch (lang) {
    case 'zh':
      return {
        title: `${name}国旗、首都、人口、GDP 排名与省份地图 - Earth 3D 地球仪`,
        description: `${name}（${c.nameEn}）位于${region}${capital ? `，首都${capital}` : ''}，面积约 ${area} 平方公里。在 3D 地球上查看${name}的国旗、国歌、人口、GDP 全球排名、政治体制、自然资源、省级行政区与主要城市。`,
      }
    case 'ja':
      return {
        title: `${name}の国旗・首都・人口・GDP・地域地図 | Earth 3D 地球儀`,
        description: `${name}（${c.nameEn}）は${region}の国${capital ? `。首都は${capital}` : ''}、面積は約 ${area} km²。3D 地球儀で${name}の国旗・国歌・人口・GDP ランキング・政治体制・資源・州と主要都市を確認できます。`,
      }
    case 'ru':
      return {
        title: `${name}: флаг, столица, население, ВВП и карта регионов | Earth 3D`,
        description: `${name} (${c.nameEn}) — ${region}${capital ? `, столица ${capital}` : ''}, площадь около ${area} км². Флаг, гимн, население, место в рейтинге ВВП, форма правления, ресурсы, регионы и крупные города на интерактивном 3D-глобусе.`,
      }
    default:
      return {
        title: `${name}: Flag, Capital, Population, GDP & Map of Regions | Earth 3D Globe`,
        description: `${name} is in ${region}${capital ? `, with its capital at ${capital}` : ''} and an area of about ${area} km². Explore its flag, anthem, population, GDP ranking, government, natural resources, provinces and major cities on an interactive 3D globe.`,
      }
  }
}
