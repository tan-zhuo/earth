/**
 * Service Worker：让「添加到主屏幕」后的第二次打开几乎不走网络。
 *
 *   /assets/*（构建产物，文件名带哈希）      缓存优先，永不过期
 *   贴图、模型、数据等其余同源静态资源      先给缓存、后台更新（stale-while-revalidate）
 *   页面导航                               网络优先，断网时回退缓存
 *
 * 只处理同源请求：世界银行 / 维基百科接口由应用自己的 localStorage 缓存负责；
 * flagcdn 国旗是跨域无 CORS 的图片，放进 Cache Storage 会按不透明响应大幅占用配额，交给浏览器 HTTP 缓存。
 * 改动缓存策略时提升 VERSION，旧缓存会在激活时清掉。
 */
const VERSION = 'v1'
const STATIC = `earth-static-${VERSION}`
const PAGES = `earth-pages-${VERSION}`

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => ![STATIC, PAGES].includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

const cacheFirst = async (request) => {
  const cache = await caches.open(STATIC)
  const hit = await cache.match(request)
  if (hit) return hit
  const response = await fetch(request)
  if (response.ok) cache.put(request, response.clone())
  return response
}

const staleWhileRevalidate = async (event) => {
  const cache = await caches.open(STATIC)
  const hit = await cache.match(event.request)
  const refresh = fetch(event.request).then((response) => {
    if (response.ok) cache.put(event.request, response.clone())
    return response
  })
  if (hit) {
    event.waitUntil(refresh.catch(() => {}))
    return hit
  }
  return refresh
}

const networkFirst = async (request) => {
  const cache = await caches.open(PAGES)
  try {
    const response = await fetch(request)
    if (response.ok) cache.put(request, response.clone())
    return response
  } catch (err) {
    return (await cache.match(request)) ?? (await cache.match('/')) ?? Promise.reject(err)
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)

  if (url.origin !== self.location.origin) return
  if (request.mode === 'navigate') return event.respondWith(networkFirst(request))
  // Range 请求（音视频分段）不缓存，交给浏览器
  if (request.headers.has('range') || url.pathname === '/sw.js') return
  if (url.pathname.startsWith('/assets/')) return event.respondWith(cacheFirst(request))
  if (/^\/(textures|data|space|models|paleo|draco)\//.test(url.pathname) || /\.(png|jpg|svg|webmanifest)$/.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(event))
  }
})
