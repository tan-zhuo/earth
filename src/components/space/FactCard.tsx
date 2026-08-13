import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { SpaceFacts } from '../../data/space'

/** 宇宙视图共用的右侧资料卡（月球/行星/银河系/宇宙），可关闭，关闭后显示 ⓘ 重开按钮 */
export default function FactCard({ facts }: { facts: SpaceFacts }) {
  const { i18n } = useTranslation()
  const zh = i18n.language.startsWith('zh')
  const [open, setOpen] = useState(true)

  // 内容变化（如点击了另一颗行星）时重新展开
  useEffect(() => {
    setOpen(true)
  }, [facts.titleEn])

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed top-16 right-4 z-20 rounded-full border border-slate-700/60 bg-slate-900/70 p-2.5 text-slate-300 backdrop-blur transition hover:border-sky-500/60 hover:text-sky-300"
        aria-label="Show info"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="8" cy="8" r="6.5" />
          <path d="M8 7.2v4" strokeLinecap="round" />
          <circle cx="8" cy="4.8" r="0.9" fill="currentColor" stroke="none" />
        </svg>
      </button>
    )
  }

  return (
    <aside className="panel-enter fixed inset-x-0 bottom-0 z-20 max-h-[60vh] overflow-y-auto rounded-t-2xl border-t border-slate-700/50 bg-slate-900/85 backdrop-blur-xl md:inset-x-auto md:top-16 md:right-4 md:bottom-auto md:max-h-[calc(100vh-8rem)] md:w-[380px] md:rounded-2xl md:border">
      <div className="relative p-5">
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-700/50 hover:text-slate-100"
          aria-label="Close"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3l10 10M13 3L3 13" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-slate-100">{zh ? facts.titleZh : facts.titleEn}</h2>
        <p className="mt-1 text-xs text-sky-400">{zh ? facts.subtitleZh : facts.subtitleEn}</p>

        <div className="mt-4 space-y-0.5">
          {facts.rows.map((r) => (
            <div key={r.labelEn} className="flex items-baseline justify-between gap-4 py-1.5 text-sm">
              <span className="shrink-0 text-slate-400">{zh ? r.labelZh : r.labelEn}</span>
              <span className="text-right font-medium text-slate-200">{zh ? r.valueZh : r.valueEn}</span>
            </div>
          ))}
        </div>

        <p className="mt-4 border-t border-slate-700/40 pt-3 text-sm leading-relaxed text-slate-300">
          {zh ? facts.descZh : facts.descEn}
        </p>
        {(facts.noteZh || facts.noteEn) && (
          <p className="mt-3 text-[10px] text-slate-600">{zh ? facts.noteZh : facts.noteEn}</p>
        )}
      </div>
    </aside>
  )
}
