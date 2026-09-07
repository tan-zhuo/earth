import { useEffect, useRef, useState } from 'react'
import {
  BufferGeometry, DoubleSide, Float32BufferAttribute,
  Group, Line, LineBasicMaterial, LineDashedMaterial, Mesh, MeshBasicMaterial, MeshPhongMaterial,
  RingGeometry, Sphere, SphereGeometry, SRGBColorSpace, TextureLoader,
  Vector3, AdditiveBlending,
} from 'three'
import { createModelScene, disposeModelTree } from './modelScene'
import { useTranslation } from 'react-i18next'
import type { StructureConfig } from '../../data/structures'

const R = 100 // 表面半径
const PHI_LEN = Math.PI * 1.5 // 球壳保留 270°，切出 90° 剖面楔口

/**
 * 行星剖面场景：分层球壳（270°）+ 切面 + 层名标签，
 * showField 时叠加磁场可视化（偶极场磁力线 / 残余地壳磁场弧）。
 */
export default function StructureScene({
  config,
  showField,
}: {
  config: StructureConfig
  showField: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const labelsRef = useRef<HTMLDivElement>(null)
  const { i18n } = useTranslation()
  const zh = i18n.language.startsWith('zh')
  const showFieldRef = useRef(showField)
  showFieldRef.current = showField
  const runtimeRef = useRef<ReturnType<typeof createModelScene> | null>(null)
  const [rotate, setRotate] = useState(false)
  const rotateRef = useRef(false)
  rotateRef.current = rotate

  useEffect(() => {
    const el = containerRef.current
    const labelLayer = labelsRef.current
    if (!el || !labelLayer) return

    const runtime = createModelScene(el, new Vector3(-1, 0.55, -1.5))
    runtimeRef.current = runtime
    const { scene, controls } = runtime
    const loader = new TextureLoader()
    let disposed = false

    const body = new Group()
    scene.add(body)

    // 分层球壳（外→内），最内层为完整球体
    config.layers.forEach((layer, idx) => {
      const isInnermost = idx === config.layers.length - 1
      const geo = isInnermost
        ? new SphereGeometry(layer.rOuter, 48, 48)
        : new SphereGeometry(layer.rOuter, 64, 48, 0, PHI_LEN)
      let mat: MeshPhongMaterial
      if (idx === 0 && config.surfaceTexture) {
        const tex = loader.load(config.surfaceTexture, texture => { if (disposed) texture.dispose() })
        tex.colorSpace = SRGBColorSpace
        mat = new MeshPhongMaterial({ map: tex, side: DoubleSide, shininess: 4 })
      } else {
        mat = new MeshPhongMaterial({ color: layer.color, side: DoubleSide, shininess: 6 })
      }
      body.add(new Mesh(geo, mat))

      // 两个切面（半环面）：sphere φ∈[0,1.5π]，切面朝向 -X（φ=0）与 -Z（φ=1.5π）
      if (!isInnermost) {
        const rInner = config.layers[idx + 1]?.rOuter ?? 0
        for (const rotY of [Math.PI, Math.PI / 2]) {
          const face = new Mesh(
            new RingGeometry(rInner, layer.rOuter, 48, 1, -Math.PI / 2, Math.PI),
            new MeshBasicMaterial({ color: layer.color, side: DoubleSide }),
          )
          face.rotation.y = rotY
          // 切面颜色比壳体略暗，体现剖面
          ;(face.material as MeshBasicMaterial).color.multiplyScalar(rotY === Math.PI ? 0.92 : 0.62)
          body.add(face)
        }
      }
    })

    // 磁场可视化
    const fieldGroup = new Group()
    fieldGroup.visible = showFieldRef.current
    body.add(fieldGroup)

    if (config.fieldType === 'dipole') {
      fieldGroup.rotation.z = (11 * Math.PI) / 180 // 磁轴倾斜 11°
      // 磁轴虚线
      const axisGeo = new BufferGeometry()
      axisGeo.setAttribute('position', new Float32BufferAttribute([0, -R * 1.8, 0, 0, R * 1.8, 0], 3))
      const axis = new Line(axisGeo, new LineDashedMaterial({ color: 0x7dd3fc, dashSize: 6, gapSize: 4, transparent: true, opacity: 0.6 }))
      axis.computeLineDistances()
      fieldGroup.add(axis)
      // 偶极磁力线：r = L·sin²θ
      for (const L of [1.5, 2.2, 3.1]) {
        for (let a = 0; a < 8; a++) {
          const az = (a / 8) * Math.PI * 2
          const pts: number[] = []
          const thMin = Math.asin(Math.sqrt(1 / L))
          for (let i = 0; i <= 64; i++) {
            const th = thMin + (i / 64) * (Math.PI - 2 * thMin)
            const r = L * R * Math.sin(th) * Math.sin(th)
            pts.push(r * Math.sin(th) * Math.cos(az), r * Math.cos(th), r * Math.sin(th) * Math.sin(az))
          }
          const g = new BufferGeometry()
          g.setAttribute('position', new Float32BufferAttribute(pts, 3))
          fieldGroup.add(
            new Line(g, new LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45, blending: AdditiveBlending })),
          )
        }
      }
    } else {
      // 残余地壳磁场：南半球短弧
      let seed = 42
      const rand = (min: number, max: number) => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
        return min + seed / 4294967296 * (max - min)
      }
      for (let i = 0; i < 26; i++) {
        const lat = rand(-78, -22) * (Math.PI / 180)
        const lng = rand(0, 360) * (Math.PI / 180)
        const base = new Vector3(
          Math.cos(lat) * Math.cos(lng),
          Math.sin(lat),
          Math.cos(lat) * Math.sin(lng),
        )
        // 沿随机切向的小弧
        const tangent = new Vector3().crossVectors(base, new Vector3(0, 1, 0)).normalize()
        tangent.applyAxisAngle(base, rand(0, Math.PI * 2))
        const span = rand(0.08, 0.2)
        const h = rand(4, 10)
        const pts: number[] = []
        for (let j = 0; j <= 32; j++) {
          const t = j / 32
          const p = base
            .clone()
            .applyAxisAngle(tangent.clone().crossVectors(base, tangent).normalize(), (t - 0.5) * span)
            .normalize()
            .multiplyScalar(R + Math.sin(t * Math.PI) * h)
          pts.push(p.x, p.y, p.z)
        }
        const g = new BufferGeometry()
        g.setAttribute('position', new Float32BufferAttribute(pts, 3))
        fieldGroup.add(
          new Line(g, new LineBasicMaterial({ color: 0xf0abfc, transparent: true, opacity: 0.55, blending: AdditiveBlending })),
        )
      }
    }

    // A fixed color legend stays readable at every orbit angle and scale.
    const labelDefs = config.layers.map(layer => {
      const span = document.createElement('span')
      span.style.cssText = 'display:inline-flex;align-items:center;gap:5px;font-size:11px;color:#e2e8f0;padding:3px 6px;background:#020617bb;border-radius:4px'
      const dot = document.createElement('i')
      dot.style.cssText = `width:7px;height:7px;border-radius:50%;background:${layer.color}`
      span.append(dot, document.createTextNode(zh ? layer.nameZh : layer.nameEn))
      labelLayer.appendChild(span)
      return span
    })
    let previousField = showFieldRef.current
    const frame = () => runtime.setSubject(body, new Sphere(new Vector3(), showFieldRef.current ? (config.fieldType === 'dipole' ? 310 : 112) : R))
    frame()
    runtime.start(() => {
      controls.autoRotate = rotateRef.current
      fieldGroup.visible = showFieldRef.current
      if (previousField !== showFieldRef.current) { previousField = showFieldRef.current; frame() }
    })
    return () => {
      disposed = true
      disposeModelTree(body, true)
      runtime.dispose()
      runtimeRef.current = null
      labelDefs.forEach(span => span.remove())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, zh])

  return (
    <>
      <div ref={containerRef} className="model-stage structure-stage" />
      <div className="model-tools">
        <button className="space-control" onClick={() => { setRotate(false); runtimeRef.current?.fit() }}>{zh ? '剖面复位' : 'Reset cutaway'}</button>
        <button className="space-control" aria-pressed={rotate} onClick={() => setRotate(v => !v)}>{zh ? '自转' : 'Rotate'}</button>
      </div>
      <div ref={labelsRef} className="model-legend pointer-events-none" />
    </>
  )
}
