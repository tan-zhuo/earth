import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { SpaceFacts } from '../../data/space'
import { useAppStore } from '../../store/useAppStore'

export interface ExploreItem { id: string; nameZh: string; nameEn: string; color: string; facts: SpaceFacts; source?: string }
export interface ExploreLayer { id: string; zh: string; en: string; color: string }
export interface ExplorerSettings { selected: string; paused: boolean; speed: number; layers: Record<string, boolean>; pose: 'perspective' | 'top' | 'side'; revision: number; focusRevision: number }
export function useExplorer(layers: ExploreLayer[]) {
  const [settings, setSettings] = useState<ExplorerSettings>(() => ({ selected: 'overview', paused: window.matchMedia('(prefers-reduced-motion: reduce)').matches, speed: 1, layers: Object.fromEntries(layers.map(l => [l.id, !['guides', 'probes'].includes(l.id)])), pose: 'perspective', revision: 0, focusRevision: 0 }))
  const live = useRef(settings)
  live.current = settings
  return { settings, live, setSettings, select: (selected: string) => setSettings(s => ({ ...s, selected })) }
}
export type Explorer = ReturnType<typeof useExplorer>

export default function SpaceExplorer({ kind, explorer, items, layers, note }: {
  kind: 'solar' | 'galaxy' | 'universe'; explorer: Explorer; items: ExploreItem[]; layers: ExploreLayer[]; note: [string, string]
}) {
  const { i18n } = useTranslation()
  const zh = i18n.language.startsWith('zh')
  const { settings, setSettings, select } = explorer
  const [expanded, setExpanded] = useState(false)
  const setView = useAppStore(s => s.setView)
  const item = items.find(i => i.id === settings.selected) ?? items[0]
  const facts = item.facts
  const choose = (id: string) => { select(id); setExpanded(false) }
  const scales = [{ id: 'earth', zh: '地球', en: 'Earth' }, { id: 'solar', zh: '太阳系', en: 'Solar System' }, { id: 'galaxy', zh: '银河系', en: 'Milky Way' }, { id: 'universe', zh: '宇宙', en: 'Universe' }] as const
  return <>
    <div className="space-navigation">
      <nav aria-label={zh ? '探索尺度' : 'Explore scales'} className="flex items-center gap-1 overflow-x-auto">
        {scales.map((s, index) => <div key={s.id} className="flex shrink-0 items-center gap-1">
          {index > 0 && <span className="text-slate-600" aria-hidden="true">/</span>}
          <button onClick={() => setView(s.id)} aria-current={kind === s.id ? 'page' : undefined}
            className={`space-control ${kind === s.id ? 'text-sky-300 bg-sky-400/10' : ''}`}>{zh ? s.zh : s.en}</button>
        </div>)}
      </nav>
      <div className="mt-2 flex gap-1 overflow-x-auto pb-1" aria-label={zh ? '观察工具' : 'View controls'}>
        <button className="space-control" aria-pressed={settings.paused} onClick={() => setSettings(s => ({ ...s, paused: !s.paused }))}>{settings.paused ? (zh ? '▶ 播放' : '▶ Play') : (zh ? 'Ⅱ 暂停' : 'Ⅱ Pause')}</button>
        <label className="space-control flex items-center gap-1"><span className="sr-only">{zh ? '动画速度' : 'Animation speed'}</span>
          <select aria-label={zh ? '动画速度' : 'Animation speed'} className="bg-transparent" value={settings.speed} onChange={e => setSettings(s => ({ ...s, speed: Number(e.target.value) }))}>
            {[0.25, 1, 3].map(speed => <option className="bg-slate-900" key={speed} value={speed}>{speed}×</option>)}
          </select>
        </label>
        {(['perspective', 'top', 'side'] as const).map((pose, index) => <button key={pose} className="space-control" onClick={() => setSettings(s => ({ ...s, pose, revision: s.revision + 1 }))}>{(zh ? ['复位', '俯视', '侧视'] : ['Reset', 'Top', 'Side'])[index]}</button>)}
      </div>
    </div>
    <div className="space-layers" role="group" aria-label={zh ? '可见图层' : 'Visible layers'}>
      {layers.map(layer => <button className={`space-control flex items-center gap-2 ${settings.layers[layer.id] ? 'text-slate-200' : 'text-slate-500'}`} key={layer.id} aria-pressed={settings.layers[layer.id]}
        onClick={() => setSettings(s => ({ ...s, layers: { ...s.layers, [layer.id]: !s.layers[layer.id] } }))}>
        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: settings.layers[layer.id] ? layer.color : '#475569' }} />{zh ? layer.zh : layer.en}
      </button>)}
    </div>
    <aside className={`space-info ${expanded ? 'is-expanded' : ''}`} aria-label={zh ? '探索资料' : 'Exploration details'}>
      <div className="shrink-0 border-b border-slate-700/40 p-3 md:p-4">
        <label className="mb-2 block text-[10px] tracking-widest text-sky-300" htmlFor="space-destination">{zh ? '选择一个目的地' : 'CHOOSE A DESTINATION'}</label>
        <select id="space-destination" className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100" value={item.id} onChange={e => choose(e.target.value)}>
          {items.map(i => <option key={i.id} value={i.id}>{zh ? i.nameZh : i.nameEn}</option>)}
        </select>
      </div>
      <div className="min-h-0 overflow-y-auto overscroll-contain p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div><h2 className="text-xl font-semibold text-slate-100 md:text-2xl">{zh ? facts.titleZh : facts.titleEn}</h2><p className="mt-1 text-xs leading-relaxed text-sky-200/70">{zh ? facts.subtitleZh : facts.subtitleEn}</p></div>
          <button className="space-control md:hidden" aria-expanded={expanded} onClick={() => setExpanded(v => !v)}>{expanded ? (zh ? '收起' : 'Less') : (zh ? '详情' : 'More')}</button>
        </div>
        {item.id !== 'overview' && <button className="space-control mt-2 border border-sky-400/20 text-sky-300" onClick={() => setSettings(s => ({ ...s, focusRevision: s.focusRevision + 1 }))}>{zh ? '⌖ 靠近观察' : '⌖ Take a closer look'}</button>}
        <div className={`${expanded ? '' : 'hidden'} md:block`}>
          <div className="my-4 grid grid-cols-2 gap-2">{facts.rows.map(row => <div key={row.labelEn} className="rounded-lg border border-slate-700/40 bg-slate-800/40 p-3"><p className="text-[11px] text-slate-400">{zh ? row.labelZh : row.labelEn}</p><p className="mt-1 text-sm leading-relaxed text-slate-100">{zh ? row.valueZh : row.valueEn}</p></div>)}</div>
          <p className="text-sm leading-7 text-slate-300">{zh ? facts.descZh : facts.descEn}</p>
          {((kind === 'solar' && ['earth', 'mars'].includes(item.id)) || (kind === 'galaxy' && item.id === 'sun') || (kind === 'universe' && item.id === 'local')) && <button className="mt-4 w-full rounded-lg border border-sky-400/30 bg-sky-400/10 px-3 py-3 text-sm text-sky-200" onClick={() => setView(kind === 'solar' ? item.id as 'earth' | 'mars' : kind === 'galaxy' ? 'solar' : 'galaxy')}>{zh ? '进入这里探索 →' : 'Explore this destination →'}</button>}
          <p className="mt-5 border-t border-slate-700/40 pt-3 text-[11px] leading-relaxed text-slate-400">{zh ? note[0] : note[1]}</p>
          {item.source && <a className="mt-3 inline-block text-xs text-sky-300 hover:underline" href={item.source} target="_blank" rel="noopener noreferrer">{zh ? '科学资料 · NASA ↗' : 'Science reference · NASA ↗'}</a>}
        </div>
      </div>
    </aside>
  </>
}
