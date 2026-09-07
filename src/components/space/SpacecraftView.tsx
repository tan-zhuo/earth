import Icon from '../Icon'
import { useEffect, useRef, useState } from 'react'
import { Box3, Group, Mesh, MeshPhongMaterial, MeshStandardMaterial, Object3D, Raycaster, Vector2, Vector3 } from 'three'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../../store/useAppStore'
import { SPACECRAFT_MODELS, findCraft } from '../../data/spacecraftModels'
import { DETAILED_CRAFT, loadDetailedCraft } from './detailedCraft'
import { buildCraft } from './craftBuilders'
import { createModelScene, disposeModelTree } from './modelScene'

type Runtime = ReturnType<typeof createModelScene>
interface Part { id: string; group: Object3D; anchor: Object3D; button: HTMLButtonElement }

/** One persistent renderer, explicit part assemblies and bounds-based framing. */
export default function SpacecraftView() {
  const containerRef = useRef<HTMLDivElement>(null)
  const labelsRef = useRef<HTMLDivElement>(null)
  const runtimeRef = useRef<Runtime | null>(null)
  const modelRef = useRef<Group | null>(null)
  const partsRef = useRef<Part[]>([])
  const craftId = useAppStore(s => s.craftId)
  const setCraft = useAppStore(s => s.setCraft)
  const { i18n } = useTranslation()
  const zh = i18n.language.startsWith('zh')
  const craft = findCraft(craftId)
  const [selected, setSelected] = useState<string | null>(null)
  const [rotate, setRotate] = useState(false)
  const [labels, setLabels] = useState(true)
  const [isolate, setIsolate] = useState(false)
  const [presentation, setPresentation] = useState<'detail' | 'parts'>('detail')
  const [loadStatus, setLoadStatus] = useState<'loading' | 'ready' | 'error'>('ready')
  const [retry, setRetry] = useState(0)
  const detailed = presentation === 'detail' && DETAILED_CRAFT.has(craft.id)
  const [tab, setTab] = useState<'parts' | 'facts'>('parts')
  const state = useRef({ selected, rotate, labels, isolate })
  state.current = { selected, rotate, labels, isolate }
  const selectPart = (id: string | null) => { setSelected(id); setRotate(false); if (!id) setIsolate(false) }

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const runtime = createModelScene(el)
    runtimeRef.current = runtime
    if (import.meta.env.DEV) (window as unknown as { __modelScene?: Runtime }).__modelScene = runtime
    const raycaster = new Raycaster()
    let down: Vector2 | null = null
    const onDown = (e: PointerEvent) => { down = new Vector2(e.clientX, e.clientY) }
    const onCancel = () => { down = null }
    const onUp = (e: PointerEvent) => {
      if (!down || down.distanceTo(new Vector2(e.clientX, e.clientY)) > 6) { down = null; return }
      down = null
      const model = modelRef.current
      if (!model) return
      const rect = el.getBoundingClientRect()
      raycaster.setFromCamera(new Vector2((e.clientX - rect.left) / rect.width * 2 - 1, 1 - (e.clientY - rect.top) / rect.height * 2), runtime.camera)
      // Raycaster can hit invisible meshes: only include currently visible assemblies.
      const hit = raycaster.intersectObjects(partsRef.current.filter(p => p.group.visible).map(p => p.group), true)[0]
      let object: Object3D | null = hit?.object ?? null
      while (object && !object.userData.partId) object = object.parent
      if (object) selectPart(object.userData.partId)
    }
    runtime.renderer.domElement.addEventListener('pointerdown', onDown)
    runtime.renderer.domElement.addEventListener('pointerup', onUp)
    runtime.renderer.domElement.addEventListener('pointercancel', onCancel)
    runtime.start(() => {
      runtime.controls.autoRotate = state.current.rotate
      const occupied: Vector2[] = []
      const order = [...partsRef.current].sort((a, b) => Number(b.id === state.current.selected) - Number(a.id === state.current.selected))
      for (const part of order) {
        const point = part.anchor.getWorldPosition(new Vector3()).project(runtime.camera)
        const x = (point.x + 1) / 2 * el.clientWidth, y = (1 - point.y) / 2 * el.clientHeight
        const visible = state.current.labels && part.group.visible && point.z > -1 && point.z < 1 && x > 16 && x < el.clientWidth - 16 && y > 16 && y < el.clientHeight - 16 && !occupied.some(p => p.distanceTo(new Vector2(x, y)) < 34)
        part.button.style.visibility = visible ? 'visible' : 'hidden'
        part.button.style.left = `${x}px`; part.button.style.top = `${y}px`
        part.button.setAttribute('aria-pressed', String(state.current.selected === part.id))
        if (visible) occupied.push(new Vector2(x, y))
      }
    })
    return () => {
      runtime.renderer.domElement.removeEventListener('pointerdown', onDown)
      runtime.renderer.domElement.removeEventListener('pointerup', onUp)
      runtime.renderer.domElement.removeEventListener('pointercancel', onCancel)
      runtime.dispose(); runtimeRef.current = null
      if (import.meta.env.DEV) delete (window as unknown as { __modelScene?: Runtime }).__modelScene
    }
  }, [])

  useEffect(() => {
    const runtime = runtimeRef.current, layer = labelsRef.current
    if (!runtime || !layer) return
    let cancelled = false
    let loadedModel: Group | null = null
    setLoadStatus(detailed ? 'loading' : 'ready')
    const install = (model: Group) => {
      if (cancelled) { disposeModelTree(model, detailed); return }
      loadedModel = model
      // Center the whole assembly, including long booms and deployed doors.
      const center = new Box3().setFromObject(model).getCenter(new Vector3())
      model.position.sub(center)
      runtime.scene.add(model); modelRef.current = model
      setSelected(null); setIsolate(false); setRotate(false)
      const parts: Part[] = []
      for (const [index, definition] of (detailed ? [] : craft.parts).entries()) {
        const group = model.getObjectByName(definition.id)
        const anchor = group?.getObjectByName('anchor')
        if (!group || !anchor) continue
        const button = document.createElement('button')
        button.className = 'model-pin'; button.textContent = String(index + 1)
        button.addEventListener('click', () => selectPart(definition.id))
        layer.appendChild(button)
        parts.push({ id: definition.id, group, anchor, button })
      }
      partsRef.current = parts
      runtime.setSubject(model)
      setLoadStatus('ready')
    }
    if (detailed) void loadDetailedCraft(craft.id).then(install).catch(() => { if (!cancelled) setLoadStatus('error') })
    else install(buildCraft(craft.id))
    return () => {
      cancelled = true
      partsRef.current = []; layer.replaceChildren()
      if (loadedModel) { runtime.scene.remove(loadedModel); disposeModelTree(loadedModel, detailed) }
      modelRef.current = null
    }
  }, [craft, detailed, retry])

  // Language changes update UI only; they do not rebuild geometry or reset the camera.
  useEffect(() => {
    for (const part of partsRef.current) {
      const definition = craft.parts.find(p => p.id === part.id)!
      const name = zh ? definition.nameZh : definition.nameEn
      part.button.title = name; part.button.setAttribute('aria-label', name)
    }
  }, [craft, zh, detailed])

  useEffect(() => {
    for (const part of partsRef.current) {
      part.group.visible = !isolate || !selected || part.id === selected
      part.group.traverse(object => {
        const mesh = object as Mesh
        if (!mesh.isMesh) return
        for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
          if (material instanceof MeshPhongMaterial || material instanceof MeshStandardMaterial) material.emissive.set(part.id === selected ? '#153449' : '#000000')
        }
      })
    }
  }, [selected, isolate, craft])

  const reset = (view?: Vector3) => {
    setRotate(false); setIsolate(false)
    // Visibility is restored immediately so fitting includes every assembly.
    partsRef.current.forEach(p => { p.group.visible = true })
    runtimeRef.current?.fit(modelRef.current, view)
  }
  const name = zh ? craft.nameZh : craft.nameEn
  return <>
    <div className="model-stage" ref={containerRef} />
    <div className="model-stage pointer-events-none overflow-hidden" ref={labelsRef} />
    {detailed && loadStatus !== 'ready' && <div className="model-stage flex items-center justify-center" role="status">
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 text-sm text-slate-300">{loadStatus === 'loading' ? (zh ? '正在载入精细模型…' : 'Loading detailed model…') : <>{zh ? '模型加载失败' : 'Model could not load'}<button className="space-control" onClick={() => setRetry(v => v + 1)}>{zh ? '重试' : 'Retry'}</button><button className="space-control" onClick={() => setPresentation('parts')}>{zh ? '查看部件结构' : 'View parts'}</button></>}</div>
    </div>}
    <div className="model-picker">
      <label className="sr-only" htmlFor="model-picker">{zh ? '选择航天器' : 'Choose spacecraft'}</label>
      <select id="model-picker" value={craft.id} onChange={e => setCraft(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200">
        {SPACECRAFT_MODELS.map(c => <option key={c.id} value={c.id}>{zh ? c.nameZh : c.nameEn}</option>)}
      </select>
    </div>
    <div className="model-tools" role="group" aria-label={zh ? '模型工具' : 'Model controls'}>
      <button className="space-control" onClick={() => reset()}><Icon name="reset" size={15} />{zh ? '复位' : 'Reset'}</button>
      <button className="space-control" onClick={() => reset(new Vector3(0, 0.001, 1))}><Icon name="front" size={15} />{zh ? '正视' : 'Front'}</button>
      <button className="space-control" onClick={() => reset(new Vector3(0, 1, 0.001))}><Icon name="top" size={15} />{zh ? '俯视' : 'Top'}</button>
      <button className="space-control" aria-pressed={rotate} onClick={() => setRotate(v => !v)}><Icon name="rotate" size={15} />{zh ? '自转' : 'Rotate'}</button>
      <button className="space-control" disabled={detailed} aria-pressed={!detailed && labels} onClick={() => setLabels(v => !v)}><Icon name="pin" size={15} />{zh ? '编号' : 'Pins'}</button>
    </div>
    <aside className="model-info" aria-label={zh ? '航天器资料' : 'Spacecraft details'}>
      <div className="shrink-0 border-b border-slate-700/50 p-4">
        {DETAILED_CRAFT.has(craft.id) && <div className="mb-3 flex gap-1" role="group" aria-label={zh ? '模型展示方式' : 'Model presentation'}>
          <button className="space-control" aria-pressed={detailed} onClick={() => setPresentation('detail')}>{zh ? '精细外观' : 'Detailed model'}</button>
          <button className="space-control" aria-pressed={!detailed} onClick={() => setPresentation('parts')}>{zh ? '部件解析' : 'Part explorer'}</button>
        </div>}
        <h2 className="text-lg font-semibold text-slate-100 md:text-xl">{name}</h2>
        {!detailed && <div className="mt-2 flex gap-1" role="group" aria-label={zh ? '资料内容' : 'Information'}>
          <button className="space-control" aria-pressed={tab === 'parts'} onClick={() => setTab('parts')}>{zh ? '部件结构' : 'Parts'}</button>
          <button className="space-control" aria-pressed={tab === 'facts'} onClick={() => setTab('facts')}>{zh ? '任务资料' : 'Mission'}</button>
        </div>}
      </div>
      <div className="min-h-0 overflow-y-auto overscroll-contain p-3 md:p-4">
        {tab === 'parts' && !detailed ? <>
          <div className="grid grid-cols-2 gap-1.5 md:grid-cols-1">
            {craft.parts.map((p, index) => <button key={p.id} onClick={() => selectPart(selected === p.id ? null : p.id)} aria-pressed={selected === p.id}
              className={`flex min-h-11 items-center gap-2 rounded-lg border px-2 py-2 text-left text-xs leading-relaxed md:text-sm ${selected === p.id ? 'border-sky-400/60 bg-sky-400/10 text-sky-200' : 'border-slate-700/50 text-slate-300 hover:bg-slate-800'}`}>
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] text-sky-300">{index + 1}</span>{zh ? p.nameZh : p.nameEn}
            </button>)}
          </div>
          {selected && <div className="mt-3 flex flex-wrap gap-1">
            <button className="space-control border border-slate-700" aria-pressed={isolate} onClick={() => setIsolate(v => !v)}>{zh ? '只看该部件' : 'Isolate part'}</button>
            <button className="space-control border border-slate-700" onClick={() => { setRotate(false); const p = partsRef.current.find(p => p.id === selected); if (p) runtimeRef.current?.fit(p.group) }}>{zh ? '靠近部件' : 'Frame part'}</button>
            <button className="space-control" onClick={() => { selectPart(null); reset() }}>{zh ? '查看整体' : 'Whole model'}</button>
          </div>}
          <p className="mt-4 text-xs leading-relaxed text-slate-400">{zh ? '点击模型或编号选择部件；拖动旋转，滚轮或双指缩放。' : 'Select a part on the model or by number. Drag to orbit; scroll or pinch to zoom.'}</p>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-500">{zh ? '按主要连接关系重建的简化模型，局部比例有所调整；不是工程装配图或实时对接构型。' : 'A simplified model of the main assemblies, with adjusted local proportions; not an engineering drawing or a live docking configuration.'}</p>
        </> : <>
          {detailed && <p className="mb-4 text-xs leading-6 text-slate-400">{zh ? '拖动查看表面细节，滚轮或双指缩放；切换「部件解析」可单独查看各部件。' : 'Orbit and zoom to inspect surface details. Switch to Part explorer to isolate assemblies.'}<br /><a className="text-sky-300 underline underline-offset-4" href="https://github.com/nasa/NASA-3D-Resources" target="_blank" rel="noopener noreferrer">NASA 3D Resources</a></p>}
          <p className="mb-3 text-xs text-sky-300">{zh ? craft.facts.subtitleZh : craft.facts.subtitleEn}</p>
          {craft.facts.rows.map(row => <div key={row.labelEn} className="flex justify-between gap-4 border-b border-slate-800 py-2 text-xs"><span className="shrink-0 text-slate-400">{zh ? row.labelZh : row.labelEn}</span><span className="text-right text-slate-200">{zh ? row.valueZh : row.valueEn}</span></div>)}
          <p className="mt-4 text-sm leading-7 text-slate-300">{zh ? craft.facts.descZh : craft.facts.descEn}</p>
        </>}
      </div>
    </aside>
  </>
}
