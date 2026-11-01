import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import './i18n'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    {/* Vercel 监控：访问量分析 + Core Web Vitals 性能指标（仅在 Vercel 部署时上报） */}
    <Analytics />
    <SpeedInsights />
  </StrictMode>,
)

// PWA：生产环境注册 Service Worker（静态资源离线缓存，二次打开秒开）
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => console.warn('Service Worker 注册失败', err))
  })
}
