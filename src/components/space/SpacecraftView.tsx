import { useEffect, useRef } from 'react'
import {
  AmbientLight, BackSide, DirectionalLight, Group, Mesh, MeshBasicMaterial, Object3D,
  PerspectiveCamera, Scene, SphereGeometry, SRGBColorSpace, TextureLoader, Vector3, WebGLRenderer,
} from 'three'
import type { Material } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../../store/useAppStore'
import { SPACECRAFT_MODELS, findCraft } from '../../data/spacecraftModels'
import { buildCraft } from './craftBuilders'
import FactCard from './FactCard'

/** 释放模型占用的几何体与材质（贴图为模块级缓存，不在此释放） */
function disposeTree(root: Object3D) {
  root.traverse((o) => {
    const m = o as Mesh
    if (!m.isMesh) return
    m.geometry?.dispose()
    const mat = m.material as Material | Material[]
    Array.isArray(mat) ? mat.forEach((x) => x.dispose()) : mat?.dispose()
  })
}

/**
 * 航天器 3D 展厅：程序化搭建的模型 + 部件标注 + 资料卡讲解。
 * 场景只建一次，切换航天器时只换模型，避免反复创建 WebGL 上下文。
 */
export default function SpacecraftView() {
  const containerRef = useRef<HTMLDivElement>(null)
  const labelsRef = useRef<HTMLDivElement>(null)
  const craftId = useAppStore((s) => s.craftId)
  const setCraft = useAppStore((s) => s.setCraft)
  const { t, i18n } = useTranslation()
  const zh = i18n.language.startsWith('zh')
  const craft = findCraft(craftId)

  // 供模型切换 effect 使用的场景引用
  const holderRef = useRef<Group | null>(null)
  const cameraRef = useRef<PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  /** 当前模型的部件标签（逐帧投影） */
  const partsRef = useRef<{ anchor: Object3D; span: HTMLSpanElement }[]>([])

  // 场景骨架（挂载一次）
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const scene = new Scene()
    const camera = new PerspectiveCamera(45, el.clientWidth / el.clientHeight, 0.1, 6000)
    camera.position.set(0, 6, 18)
    cameraRef.current = camera
    const renderer = new WebGLRenderer({ antialias: true })
    renderer.setSize(el.clientWidth, el.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.7
    controls.minDistance = 4
    controls.maxDistance = 80
    controlsRef.current = controls

    // 主光（模拟太阳）+ 环境光 + 一盏冷色补光，避免背面全黑
    scene.add(new AmbientLight(0xffffff, 0.55))
    const sun = new DirectionalLight(0xfff6e0, 2.1)
    sun.position.set(6, 8, 10)
    scene.add(sun)
    const fill = new DirectionalLight(0x7aa2d8, 0.7)
    fill.position.set(-8, -4, -6)
    scene.add(fill)

    // 星空背景
    const skyTex = new TextureLoader().load('/textures/night-sky.png')
    skyTex.colorSpace = SRGBColorSpace
    scene.add(
      new Mesh(new SphereGeometry(2000, 32, 32), new MeshBasicMaterial({ map: skyTex, side: BackSide })),
    )

    const holder = new Group()
    scene.add(holder)
    holderRef.current = holder

    let raf = 0
    const v = new Vector3()
    const tick = () => {
      controls.update()
      holder.updateMatrixWorld()
      for (const { anchor, span } of partsRef.current) {
        anchor.getWorldPosition(v).project(camera)
        const visible = v.z < 1
        span.style.display = visible ? 'block' : 'none'
        if (visible) {
          span.style.left = `${((v.x + 1) / 2) * el.clientWidth}px`
          span.style.top = `${((1 - v.y) / 2) * el.clientHeight}px`
        }
      }
      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const ro = new ResizeObserver(() => {
      if (el.clientWidth === 0 || el.clientHeight === 0) return
      camera.aspect = el.clientWidth / el.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(el.clientWidth, el.clientHeight)
    })
    ro.observe(el)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      disposeTree(scene)
      skyTex.dispose()
      renderer.dispose()
      renderer.forceContextLoss() // 立即释放 WebGL 上下文，防止上下文超限导致其他视图黑屏
      el.removeChild(renderer.domElement)
      holderRef.current = null
      cameraRef.current = null
      controlsRef.current = null
    }
  }, [])

  // 换航天器 / 换语言：重建模型与部件标签
  useEffect(() => {
    const holder = holderRef.current
    const camera = cameraRef.current
    const controls = controlsRef.current
    const labelLayer = labelsRef.current
    if (!holder || !camera || !controls || !labelLayer) return

    const model = buildCraft(craft.id)
    holder.add(model)

    // 部件锚点 → 屏幕标签
    const partName = new Map(craft.parts.map((p) => [p.id, zh ? p.nameZh : p.nameEn]))
    const labels: { anchor: Object3D; span: HTMLSpanElement }[] = []
    model.traverse((o) => {
      const id = o.userData.partId as string | undefined
      if (!id) return
      const text = partName.get(id)
      if (!text) return
      const span = document.createElement('span')
      span.textContent = text
      span.style.cssText =
        'position:absolute;transform:translate(-50%,-50%);font-size:11px;font-family:system-ui;' +
        'color:#e2e8f0;background:rgba(2,6,23,.55);border:1px solid rgba(56,189,248,.25);' +
        'border-radius:6px;padding:2px 6px;backdrop-filter:blur(2px);' +
        'pointer-events:none;white-space:nowrap'
      labelLayer.appendChild(span)
      labels.push({ anchor: o, span })
    })
    partsRef.current = labels

    // 每台航天器尺度不同，切换时重置视角
    camera.position.set(craft.camDist * 0.35, craft.camDist * 0.4, craft.camDist * 0.85)
    controls.target.set(0, 0, 0)
    controls.update()

    return () => {
      partsRef.current = []
      labels.forEach((l) => l.span.remove())
      holder.remove(model)
      disposeTree(model)
    }
  }, [craft, zh])

  return (
    <>
      <div ref={containerRef} className="absolute inset-0 z-0" />
      <div ref={labelsRef} className="pointer-events-none absolute inset-0 z-10 overflow-hidden" />
      <FactCard facts={craft.facts} />

      {/* 航天器切换条（移动端可横向滑动） */}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-20 flex justify-center px-4">
        <div className="pointer-events-auto flex max-w-full gap-1 overflow-x-auto rounded-full border border-slate-700/60 bg-slate-900/80 p-1 backdrop-blur">
          {SPACECRAFT_MODELS.map((c) => (
            <button
              key={c.id}
              onClick={() => setCraft(c.id)}
              className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-medium whitespace-nowrap transition ${
                c.id === craft.id
                  ? 'bg-sky-500/15 text-sky-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {zh ? c.nameZh : c.nameEn}
            </button>
          ))}
        </div>
      </div>

      <p className="pointer-events-none fixed inset-x-0 bottom-1 z-10 text-center text-[10px] text-slate-600">
        {t('craftHint')}
      </p>
    </>
  )
}
