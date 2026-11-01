/**
 * 预渲染专用（只被 scripts/prerender.mjs 加载，不进应用包）：
 * 生成每个页面的 <head> SEO 段与给不执行 JS 的爬虫看的正文。
 * 标题与描述来自 seo.ts，与应用内动态标题同源。
 */
import type { Country } from './types'
import type { Lang } from './i18n/pick'
import { HREFLANG, PAGE_LANGS, SITE_URL, capitalName, countryMeta, homeMeta, pagePath } from './seo'
import type { PageMeta } from './seo'
import { countryExtras } from './data/countryExtras'
import { regionName } from './data/regionNames'
import factbookRaw from './data/factbook.json'
import { translateTerms } from './utils/termsZh'

const factbook = factbookRaw as Record<string, { res: string | null; agri: string | null; ind: string | null; expc: string | null }>

/** [lat, lng, 人口, 类别, cca3, 中, 英, 日, 俄]（public/data/cities.json） */
export type CityRow = [number, number, number, number, string, string, string, string, string]
/** 省级区划四语名称（public/data/admin1/{cca3}.json 的属性） */
export interface RegionNames { zh: string; en: string; ja: string; ru: string }

export interface PageInput {
  /** null = 无语言前缀的 x-default 页面（中英双语正文） */
  lang: Lang | null
  country: Country | null
  countries: Country[]
  cities: CityRow[]
  regions: RegionNames[]
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const nameIn = (c: Country, lang: Lang) =>
  lang === 'zh' ? c.nameZh : lang === 'ja' ? c.nameJa || c.nameEn : lang === 'ru' ? c.nameRu || c.nameEn : c.nameEn
const officialIn = (c: Country, lang: Lang) =>
  lang === 'zh' ? c.officialZh : lang === 'ja' ? c.officialJa || c.officialEn : lang === 'ru' ? c.officialRu || c.officialEn : c.officialEn
const LOCALE: Record<Lang, string> = { zh: 'zh-CN', en: 'en', ja: 'ja', ru: 'ru' }
const OG_LOCALE: Record<Lang, string> = { zh: 'zh_CN', en: 'en_US', ja: 'ja_JP', ru: 'ru_RU' }
const CITY_COLUMN: Record<Lang, number> = { zh: 5, en: 6, ja: 7, ru: 8 }

const LABELS: Record<Lang, Record<string, string>> = {
  zh: { official: '官方全称', capital: '首都', region: '地区', area: '面积', languages: '官方语言', currencies: '货币', government: '政治体制', resources: '自然资源', industries: '主要产业', exports: '主要出口', regions: '一级行政区', cities: '主要城市', nearby: '同地区的国家', popular: '热门国家', explore: '在 3D 地球上探索', km2: '平方公里', population: '人口' },
  en: { official: 'Official name', capital: 'Capital', region: 'Region', area: 'Area', languages: 'Languages', currencies: 'Currencies', government: 'Government', resources: 'Natural resources', industries: 'Industries', exports: 'Main exports', regions: 'First-level divisions', cities: 'Major cities', nearby: 'Countries in the same region', popular: 'Popular countries', explore: 'Explore on the 3D globe', km2: 'km²', population: 'population' },
  ja: { official: '正式名称', capital: '首都', region: '地域', area: '面積', languages: '公用語', currencies: '通貨', government: '政治体制', resources: '天然資源', industries: '主要産業', exports: '主要輸出品', regions: '第一級行政区画', cities: '主要都市', nearby: '同じ地域の国', popular: '人気の国', explore: '3D 地球儀で探索', km2: 'km²', population: '人口' },
  ru: { official: 'Официальное название', capital: 'Столица', region: 'Регион', area: 'Площадь', languages: 'Языки', currencies: 'Валюты', government: 'Форма правления', resources: 'Природные ресурсы', industries: 'Отрасли', exports: 'Основной экспорт', regions: 'Регионы первого уровня', cities: 'Крупные города', nearby: 'Страны того же региона', popular: 'Популярные страны', explore: 'Исследовать на 3D-глобусе', km2: 'км²', population: 'население' },
}

const POPULAR = ['CHN', 'USA', 'JPN', 'DEU', 'GBR', 'FRA', 'IND', 'RUS', 'BRA', 'KOR', 'ITA', 'CAN', 'AUS', 'ESP', 'MEX', 'IDN', 'SAU', 'TUR', 'CHE', 'SGP', 'EGY', 'ZAF', 'ARG', 'THA']

/** x-default 页面的标题/描述：中英并列（与原首页一致） */
function xDefaultMeta(country: Country | null): PageMeta {
  if (!country) {
    return {
      title: 'Earth 3D 互动地球仪 - 世界地图·国家信息·GDP 排行 | Interactive 3D World Globe',
      description: `${homeMeta('zh').description} ${homeMeta('en').description}`,
    }
  }
  return {
    title: `${country.nameZh} ${country.nameEn}：国旗、首都、人口、GDP | Flag, Capital, Population & GDP - Earth 3D`,
    description: `${countryMeta(country, 'zh').description} ${countryMeta(country, 'en').description}`,
  }
}

export function pageMetaFor(lang: Lang | null, country: Country | null): PageMeta {
  if (!lang) return xDefaultMeta(country)
  return country ? countryMeta(country, lang) : homeMeta(lang)
}

/** <head> 中 SEO 相关的整段（替换 index.html 的 <!--seo:head--> 区块） */
export function renderHead({ lang, country }: PageInput): string {
  const meta = pageMetaFor(lang, country)
  const url = `${SITE_URL}${pagePath(lang, country?.cca3)}`
  const alternates = [
    ...PAGE_LANGS.map((l) => `<link rel="alternate" hreflang="${HREFLANG[l]}" href="${SITE_URL}${pagePath(l, country?.cca3)}" />`),
    `<link rel="alternate" hreflang="x-default" href="${SITE_URL}${pagePath(null, country?.cca3)}" />`,
  ]
  const ogLocale = OG_LOCALE[lang ?? 'zh']
  const jsonLd = country
    ? {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: meta.title,
        url,
        inLanguage: HREFLANG[lang ?? 'zh'],
        description: meta.description,
        about: {
          '@type': 'Country',
          name: nameIn(country, lang ?? 'en'),
          alternateName: [country.nameEn, country.officialEn, country.nameZh].filter((n, i, all) => n && all.indexOf(n) === i),
          image: country.flagPng,
        },
        isPartOf: { '@type': 'WebApplication', name: 'Earth', url: `${SITE_URL}${pagePath(lang, null)}` },
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Earth', item: `${SITE_URL}${pagePath(lang, null)}` },
            { '@type': 'ListItem', position: 2, name: nameIn(country, lang ?? 'en'), item: url },
          ],
        },
      }
    : {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Earth',
        alternateName: ['Earth · 3D 互动地球', 'Earth · Interactive 3D World Atlas'],
        url,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        inLanguage: PAGE_LANGS.map((l) => HREFLANG[l]),
        description: meta.description,
        author: { '@type': 'Person', name: 'tan-zhuo', url: 'https://tanzhuo.xyz' },
        codeRepository: 'https://github.com/tan-zhuo/earth',
      }
  return [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    ...(keywordsFor(lang, country) ? [`<meta name="keywords" content="${esc(keywordsFor(lang, country)!)}" />`] : []),
    `<link rel="canonical" href="${url}" />`,
    ...alternates,
    '<meta property="og:type" content="website" />',
    '<meta property="og:site_name" content="Earth" />',
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${SITE_URL}/og.png" />`,
    '<meta property="og:image:width" content="1280" />',
    '<meta property="og:image:height" content="800" />',
    `<meta property="og:locale" content="${ogLocale}" />`,
    ...PAGE_LANGS.filter((l) => OG_LOCALE[l] !== ogLocale).map((l) => `<meta property="og:locale:alternate" content="${OG_LOCALE[l]}" />`),
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${esc(meta.title)}" />`,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
    `<meta name="twitter:image" content="${SITE_URL}/og.png" />`,
    `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`,
  ].map((line) => `    ${line}`).join('\n')
}

/** 括注：中日用全角括号 */
const paren = (lang: Lang, s: string) => (lang === 'zh' || lang === 'ja' ? `（${s}）` : ` (${s})`)

/** 关键词：百度仍参考 keywords，只给中文与 x-default 页面输出 */
function keywordsFor(lang: Lang | null, country: Country | null): string | null {
  if (lang && lang !== 'zh') return null
  if (!country) return '3D地球仪,在线地球仪,互动地图,世界地图,国家信息查询,GDP排行榜,国旗大全,国歌,省份地图,城市,大陆漂移,太阳系模型,3D globe,interactive world map,country facts,GDP ranking'
  const n = country.nameZh
  return [n, `${n}国旗`, `${n}首都`, `${n}人口`, `${n}GDP`, `${n}地图`, `${n}省份`, `${n}主要城市`, country.nameEn].join(',')
}

const link = (lang: Lang | null, c: Country, label: Lang) =>
  `<a href="${pagePath(lang, c.cca3)}">${esc(nameIn(c, label))}</a>`

/** 某语言的国家正文 */
function countryArticle(input: PageInput, lang: Lang): string {
  const { country: c, countries, cities, regions } = input
  if (!c) return ''
  const L = LABELS[lang]
  const meta = countryMeta(c, lang)
  const fb = factbook[c.cca3]
  const extra = countryExtras[c.cca3]
  const terms = (s: string | null | undefined) => (s ? translateTerms(s, lang) : '')
  const gov = extra ? (lang === 'zh' ? extra.govZh : lang === 'ja' ? extra.govJa : lang === 'ru' ? extra.govRu : extra.govEn) : ''
  const facts: [string, string][] = [
    [L.official, officialIn(c, lang)],
    [L.capital, capitalName(c, lang)],
    [L.region, [regionName(c.region, lang), c.subregion ? regionName(c.subregion, lang) : ''].filter(Boolean).join(' · ')],
    [L.area, `${Math.round(c.area).toLocaleString(LOCALE[lang])} ${L.km2}`],
    [L.languages, c.languages.join(', ')],
    [L.currencies, c.currencies.map((x) => `${x.name} (${x.code})`).join(', ')],
    [L.government, gov],
    [L.resources, terms(fb?.res)],
    [L.industries, terms(fb?.ind)],
    [L.exports, terms(fb?.expc)],
  ]
  const linkLang = input.lang
  const ownCities = cities.filter((row) => row[4] === c.cca3).sort((a, b) => b[2] - a[2]).slice(0, 15)
  const nearby = countries
    .filter((x) => x.cca3 !== c.cca3 && x.subregion === c.subregion && x.area >= 300)
    .sort((a, b) => b.area - a.area)
    .slice(0, 16)
  const sections = [
    `<h1>${esc(nameIn(c, lang))}</h1>`,
    `<p>${esc(meta.description)}</p>`,
    `<dl>${facts.filter(([, v]) => v).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>`,
  ]
  if (regions.length)
    sections.push(`<h2>${L.regions}${paren(lang, String(regions.length))}</h2><ul>${regions.map((r) => `<li>${esc(r[lang])}</li>`).join('')}</ul>`)
  if (ownCities.length)
    sections.push(`<h2>${L.cities}</h2><ul>${ownCities.map((row) => `<li>${esc(String(row[CITY_COLUMN[lang]]))}${paren(lang, `${L.population} ${row[2].toLocaleString(LOCALE[lang])}`)}</li>`).join('')}</ul>`)
  if (nearby.length)
    sections.push(`<h2>${L.nearby}</h2><ul>${nearby.map((x) => `<li>${link(linkLang, x, lang)}</li>`).join('')}</ul>`)
  sections.push(`<p><a href="${pagePath(linkLang, null)}">${L.explore}</a></p>`)
  return `<article lang="${HREFLANG[lang]}">${sections.join('\n')}</article>`
}

function homeArticle(input: PageInput, lang: Lang): string {
  const L = LABELS[lang]
  const meta = homeMeta(lang)
  const byCode = new Map(input.countries.map((c) => [c.cca3, c]))
  const popular = POPULAR.map((code) => byCode.get(code)).filter((c): c is Country => !!c)
  const all = [...input.countries].sort((a, b) => b.area - a.area)
  return `<article lang="${HREFLANG[lang]}">
<h1>${esc(meta.title)}</h1>
<p>${esc(meta.description)}</p>
<h2>${L.popular}</h2><ul>${popular.map((c) => `<li>${link(input.lang, c, lang)}</li>`).join('')}</ul>
<h2>${esc(lang === 'zh' ? '全部国家与地区' : lang === 'ja' ? 'すべての国と地域' : lang === 'ru' ? 'Все страны и территории' : 'All countries and territories')}</h2><ul>${all.map((c) => `<li>${link(input.lang, c, lang)}</li>`).join('')}</ul>
</article>`
}

/** 静态正文（替换 <!--seo:body--> 区块）：视觉隐藏，供不执行 JS 的爬虫索引 */
export function renderBody(input: PageInput): string {
  const langs: Lang[] = input.lang ? [input.lang] : ['zh', 'en']
  const articles = langs.map((l) => (input.country ? countryArticle(input, l) : homeArticle(input, l)))
  return `    <section style="position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0)" aria-hidden="true">
${articles.join('\n')}
    </section>`
}
