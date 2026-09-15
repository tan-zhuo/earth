import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { L4, SpaceFacts } from '../../data/space'
import { useAppStore } from '../../store/useAppStore'
import { pick, tr } from '../../i18n/pick'

export interface ExploreItem { id: string; nameZh: string; nameEn: string; nameJa: string; nameRu: string; color: string; facts: SpaceFacts; source?: string }
export interface ExploreLayer { id: string; zh: string; en: string; ja: string; ru: string; color: string }
export interface ExplorerSettings { selected: string; paused: boolean; speed: number; layers: Record<string, boolean>; pose: 'perspective' | 'top' | 'side'; revision: number; focusRevision: number }
export function useExplorer(layers: ExploreLayer[]) {
  const [settings, setSettings] = useState<ExplorerSettings>(() => ({ selected: 'overview', paused: window.matchMedia('(prefers-reduced-motion: reduce)').matches, speed: 1, layers: Object.fromEntries(layers.map(l => [l.id, !['guides', 'probes'].includes(l.id)])), pose: 'perspective', revision: 0, focusRevision: 0 }))
  const live = useRef(settings)
  live.current = settings
  return { settings, live, setSettings, select: (selected: string) => setSettings(s => ({ ...s, selected })) }
}
export type Explorer = ReturnType<typeof useExplorer>

export default function SpaceExplorer({ kind, explorer, items, layers, note }: {
  kind: 'solar' | 'galaxy' | 'universe'; explorer: Explorer; items: ExploreItem[]; layers: ExploreLayer[]; note: L4
}) {
  const { i18n } = useTranslation()
  const lang = i18n.language
  const p = (zh: string, en: string, ja: string, ru: string) => pick(lang, zh, en, ja, ru)
  const { settings, setSettings, select } = explorer
  const [expanded, setExpanded] = useState(false)
  const setView = useAppStore(s => s.setView)
  const item = items.find(i => i.id === settings.selected) ?? items[0]
  const facts = item.facts
  const choose = (id: string) => { select(id); setExpanded(false) }
  const scales = [
    { id: 'earth', zh: '地球', en: 'Earth', ja: '地球', ru: 'Земля' },
    { id: 'solar', zh: '太阳系', en: 'Solar System', ja: '太陽系', ru: 'Солнечная система' },
    { id: 'galaxy', zh: '银河系', en: 'Milky Way', ja: '天の川銀河', ru: 'Млечный Путь' },
    { id: 'universe', zh: '宇宙', en: 'Universe', ja: '宇宙', ru: 'Вселенная' },
  ] as const
  const poseLabels = pick(lang, ['复位', '俯视', '侧视'], ['Reset', 'Top', 'Side'], ['リセット', '真上', '真横'], ['Сброс', 'Сверху', 'Сбоку'])
  const speedLabel = p('动画速度', 'Animation speed', 'アニメーション速度', 'Скорость анимации')
  return <>
    <div className="space-navigation">
      <nav aria-label={p('探索尺度', 'Explore scales', '探索スケール', 'Масштабы')} className="flex items-center gap-1 overflow-x-auto">
        {scales.map((s, index) => <div key={s.id} className="flex shrink-0 items-center gap-1">
          {index > 0 && <span className="text-slate-600" aria-hidden="true">/</span>}
          <button onClick={() => setView(s.id)} aria-current={kind === s.id ? 'page' : undefined}
            className={`space-control ${kind === s.id ? 'text-sky-300 bg-sky-400/10' : ''}`}>{p(s.zh, s.en, s.ja, s.ru)}</button>
        </div>)}
      </nav>
      <div className="mt-2 flex gap-1 overflow-x-auto pb-1" aria-label={p('观察工具', 'View controls', '表示コントロール', 'Управление видом')}>
        <button className="space-control" aria-pressed={settings.paused} onClick={() => setSettings(s => ({ ...s, paused: !s.paused }))}>{settings.paused ? p('▶ 播放', '▶ Play', '▶ 再生', '▶ Пуск') : p('Ⅱ 暂停', 'Ⅱ Pause', 'Ⅱ 一時停止', 'Ⅱ Пауза')}</button>
        <label className="space-control flex items-center gap-1"><span className="sr-only">{speedLabel}</span>
          <select aria-label={speedLabel} className="bg-transparent" value={settings.speed} onChange={e => setSettings(s => ({ ...s, speed: Number(e.target.value) }))}>
            {[0.25, 1, 3].map(speed => <option className="bg-slate-900" key={speed} value={speed}>{speed}×</option>)}
          </select>
        </label>
        {(['perspective', 'top', 'side'] as const).map((pose, index) => <button key={pose} className="space-control" onClick={() => setSettings(s => ({ ...s, pose, revision: s.revision + 1 }))}>{poseLabels[index]}</button>)}
      </div>
    </div>
    <div className="space-layers" role="group" aria-label={p('可见图层', 'Visible layers', '表示レイヤー', 'Видимые слои')}>
      {layers.map(layer => <button className={`space-control flex items-center gap-2 ${settings.layers[layer.id] ? 'text-slate-200' : 'text-slate-500'}`} key={layer.id} aria-pressed={settings.layers[layer.id]}
        onClick={() => setSettings(s => ({ ...s, layers: { ...s.layers, [layer.id]: !s.layers[layer.id] } }))}>
        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: settings.layers[layer.id] ? layer.color : '#475569' }} />{p(layer.zh, layer.en, layer.ja, layer.ru)}
      </button>)}
    </div>
    <aside className={`space-info ${expanded ? 'is-expanded' : ''}`} aria-label={p('探索资料', 'Exploration details', '探索情報', 'Сведения')}>
      <div className="shrink-0 border-b border-slate-700/40 p-3 md:p-4">
        <label className="mb-2 block text-[10px] tracking-widest text-sky-300" htmlFor="space-destination">{p('选择一个目的地', 'CHOOSE A DESTINATION', '目的地を選ぶ', 'ВЫБЕРИТЕ ЦЕЛЬ')}</label>
        <select id="space-destination" className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100" value={item.id} onChange={e => choose(e.target.value)}>
          {items.map(i => <option key={i.id} value={i.id}>{tr(i, 'name', lang)}</option>)}
        </select>
      </div>
      <div className="min-h-0 overflow-y-auto overscroll-contain p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div><h2 className="text-xl font-semibold text-slate-100 md:text-2xl">{tr(facts, 'title', lang)}</h2><p className="mt-1 text-xs leading-relaxed text-sky-200/70">{tr(facts, 'subtitle', lang)}</p></div>
          <button className="space-control md:hidden" aria-expanded={expanded} onClick={() => setExpanded(v => !v)}>{expanded ? p('收起', 'Less', '閉じる', 'Свернуть') : p('详情', 'More', '詳細', 'Подробнее')}</button>
        </div>
        {item.id !== 'overview' && <button className="space-control mt-2 border border-sky-400/20 text-sky-300" onClick={() => setSettings(s => ({ ...s, focusRevision: s.focusRevision + 1 }))}>{p('⌖ 靠近观察', '⌖ Take a closer look', '⌖ 近づいて見る', '⌖ Рассмотреть ближе')}</button>}
        <div className={`${expanded ? '' : 'hidden'} md:block`}>
          <div className="my-4 grid grid-cols-2 gap-2">{facts.rows.map(row => <div key={row.labelEn} className="rounded-lg border border-slate-700/40 bg-slate-800/40 p-3"><p className="text-[11px] text-slate-400">{tr(row, 'label', lang)}</p><p className="mt-1 text-sm leading-relaxed text-slate-100">{tr(row, 'value', lang)}</p></div>)}</div>
          <p className="text-sm leading-7 text-slate-300">{tr(facts, 'desc', lang)}</p>
          {((kind === 'solar' && ['earth', 'mars'].includes(item.id)) || (kind === 'galaxy' && item.id === 'sun') || (kind === 'universe' && item.id === 'local')) && <button className="mt-4 w-full rounded-lg border border-sky-400/30 bg-sky-400/10 px-3 py-3 text-sm text-sky-200" onClick={() => setView(kind === 'solar' ? item.id as 'earth' | 'mars' : kind === 'galaxy' ? 'solar' : 'galaxy')}>{p('进入这里探索 →', 'Explore this destination →', 'ここを探索する →', 'Исследовать это место →')}</button>}
          <p className="mt-5 border-t border-slate-700/40 pt-3 text-[11px] leading-relaxed text-slate-400">{p(...note)}</p>
          {item.source && <a className="mt-3 inline-block text-xs text-sky-300 hover:underline" href={item.source} target="_blank" rel="noopener noreferrer">{p('科学资料 · NASA ↗', 'Science reference · NASA ↗', '科学資料 · NASA ↗', 'Научные материалы · NASA ↗')}</a>}
        </div>
      </div>
    </aside>
  </>
}
