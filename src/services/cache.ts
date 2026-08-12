/** localStorage 缓存小工具：带版本号与 TTL，配额超限时静默降级为不缓存 */

interface CacheEntry<T> {
  v: number
  ts: number
  data: T
}

const CACHE_VERSION = 1

export function getCache<T>(key: string, ttlMs: number): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const entry = JSON.parse(raw) as CacheEntry<T>
    if (entry.v !== CACHE_VERSION || Date.now() - entry.ts > ttlMs) {
      localStorage.removeItem(key)
      return null
    }
    return entry.data
  } catch {
    return null
  }
}

export function setCache<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = { v: CACHE_VERSION, ts: Date.now(), data }
    localStorage.setItem(key, JSON.stringify(entry))
  } catch {
    // 配额满 / 隐私模式：忽略，退化为纯内存
  }
}
