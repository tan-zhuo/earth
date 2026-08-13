/** 启动页控制：应用就绪后淡出并移除（index.html 中的 #splash） */

let hidden = false

export function hideSplash(): void {
  if (hidden) return
  hidden = true
  const splash = document.getElementById('splash')
  if (!splash) return
  splash.classList.add('splash-hide')
  // 等淡出动画结束后从 DOM 移除
  window.setTimeout(() => splash.remove(), 600)
}
