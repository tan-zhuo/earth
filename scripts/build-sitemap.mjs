/**
 * 构建时数据脚本：为首页 + 每个国家的深链（/country/{cca3}）生成 sitemap.xml。
 * 用法：node scripts/build-sitemap.mjs
 * 部署域名变更时改 SITE 常量后重跑。
 */
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SITE = 'https://www.earth.kim' // 部署后改这里
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const countries = JSON.parse(await readFile(resolve(ROOT, 'src/data/countries.json'), 'utf8'))

const urlXml = (loc, priority) => `  <url>
    <loc>${loc}</loc>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
    <xhtml:link rel="alternate" hreflang="zh-CN" href="${loc}" />
    <xhtml:link rel="alternate" hreflang="en" href="${loc}" />
  </url>`

const urls = [
  urlXml(`${SITE}/`, '1.0'),
  ...countries.map((c) => urlXml(`${SITE}/country/${c.cca3.toLowerCase()}`, '0.7')),
]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`
await writeFile(resolve(ROOT, 'public/sitemap.xml'), xml)
console.log(`sitemap.xml 已生成：${urls.length} 个 URL`)
