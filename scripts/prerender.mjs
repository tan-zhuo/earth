/**
 * 构建后预渲染：以 dist/index.html 为模板，给每个语言 × 每个国家输出独立的静态 HTML，
 * 并生成带 hreflang 的 sitemap.xml。
 *
 *   dist/index.html                 x-default 首页（中英双语正文，按浏览器语言显示界面）
 *   dist/{zh,en,ja,ru}/index.html   各语言首页
 *   dist/country/{cca3}/index.html  x-default 国家页
 *   dist/{lang}/country/{cca3}/index.html
 *
 * 每页只替换 <head> 的 SEO 段与隐藏正文段，JS/CSS 引用不变，打开后由同一个应用接管。
 * 用法：npm run build（vite build 之后自动执行）。
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import { feature } from 'topojson-client'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')

// 借 Vite 的模块加载器直接执行 TS 源码（扩展名省略的 import、JSON import 都能解析），
// 标题/描述与应用内完全同源
const vite = await createServer({
  root: ROOT,
  logLevel: 'error',
  appType: 'custom',
  server: { middlewareMode: true, hmr: false, watch: null },
  optimizeDeps: { noDiscovery: true, include: [] },
})
const seo = await vite.ssrLoadModule('/src/seo.ts')
const content = await vite.ssrLoadModule('/src/seoContent.ts')
await vite.close()

const template = await readFile(join(DIST, 'index.html'), 'utf8')
const countries = JSON.parse(await readFile(join(ROOT, 'src/data/countries.json'), 'utf8'))
const cities = JSON.parse(await readFile(join(ROOT, 'public/data/cities.json'), 'utf8'))

/** 各国一级行政区名称（按 Natural Earth labelrank，重要的在前） */
async function regionsOf(cca3) {
  const file = join(ROOT, 'public/data/admin1', `${cca3}.json`)
  if (!existsSync(file)) return []
  const topo = JSON.parse(await readFile(file, 'utf8'))
  return feature(topo, topo.objects.admin1).features
    .map((f) => f.properties)
    .filter((p) => p.en)
    .sort((a, b) => a.r - b.r || a.en.localeCompare(b.en))
}

const HEAD = /<!--seo:head-->[\s\S]*?<!--\/seo:head-->/
const BODY = /<!--seo:body-->[\s\S]*?<!--\/seo:body-->/
if (!HEAD.test(template) || !BODY.test(template)) throw new Error('dist/index.html 缺少 seo:head / seo:body 标记')

const render = (input) => {
  const htmlLang = input.lang ? seo.HREFLANG[input.lang] : 'zh-CN'
  return template
    .replace(/<html lang="[^"]*">/, `<html lang="${htmlLang}">`)
    .replace(HEAD, () => `<!--seo:head-->\n${content.renderHead(input)}\n    <!--/seo:head-->`)
    .replace(BODY, () => `<!--seo:body-->\n${content.renderBody(input)}\n    <!--/seo:body-->`)
}

const write = async (path, html) => {
  const file = join(DIST, path.replace(/^\//, ''), 'index.html')
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, html)
}

const langs = [null, ...seo.PAGE_LANGS]
let pages = 0
for (const lang of langs) {
  await write(seo.pagePath(lang, null), render({ lang, country: null, countries, cities, regions: [] }))
  pages++
}
for (const country of countries) {
  const regions = await regionsOf(country.cca3)
  for (const lang of langs) {
    await write(seo.pagePath(lang, country.cca3), render({ lang, country, countries, cities, regions }))
    pages++
  }
}

/* ---- sitemap：每个 URL 列出全部语言版本（含 x-default） ---- */
const alternates = (cca3) =>
  [
    ...seo.PAGE_LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${seo.HREFLANG[l]}" href="${seo.SITE_URL}${seo.pagePath(l, cca3)}" />`),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${seo.SITE_URL}${seo.pagePath(null, cca3)}" />`,
  ].join('\n')
const entries = []
for (const cca3 of [null, ...countries.map((c) => c.cca3)]) {
  const alt = alternates(cca3)
  for (const lang of langs) {
    entries.push(`  <url>
    <loc>${seo.SITE_URL}${seo.pagePath(lang, cca3)}</loc>
    <changefreq>monthly</changefreq>
    <priority>${cca3 ? '0.7' : '1.0'}</priority>
${alt}
  </url>`)
  }
}
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`
await writeFile(join(DIST, 'sitemap.xml'), sitemap)
// 同步回 public/，保持仓库里的 sitemap 与线上一致
await writeFile(join(ROOT, 'public/sitemap.xml'), sitemap)
console.log(`预渲染完成：${pages} 个页面，sitemap ${entries.length} 个 URL`)
