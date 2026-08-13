import { useEffect, useRef } from 'react'
import {
  AmbientLight, BackSide, BufferGeometry, DirectionalLight, DoubleSide, Float32BufferAttribute,
  Group, Line, LineBasicMaterial, LineDashedMaterial, Mesh, MeshBasicMaterial, MeshPhongMaterial,
  PerspectiveCamera, RingGeometry, Scene, SphereGeometry, SRGBColorSpace, TextureLoader,
  Vector3, WebGLRenderer, AdditiveBlending,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
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
  const fieldGroupRef = useRef<Group | null>(null)

  useEffect(() => {
    const el = containerRef.current
    const labelLayer = labelsRef.current
    if (!el || !labelLayer) return

    const scene = new Scene()
    const camera = new PerspectiveCamera(45, el.clientWidth / el.clientHeight, 0.1, 5000)
    // 初始相机正对剖面楔口（楔口朝向 -X-Z）
    camera.position.set(-235, 130, -235)
    const renderer = new WebGLRenderer({ antialias: true })
    renderer.setSize(el.clientWidth, el.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.appendChild(renderer.domElement)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.minDistance = 130
    controls.maxDistance = 450

    scene.add(new AmbientLight(0xffffff, 0.85))
    const dir = new DirectionalLight(0xffffff, 1.4)
    dir.position.set(-150, 120, -180) // 照亮剖面一侧
    scene.add(dir)

    // 星空背景
    const loader = new TextureLoader()
    const skyTex = loader.load('/textures/night-sky.png')
    skyTex.colorSpace = SRGBColorSpace
    scene.add(new Mesh(new SphereGeometry(3000, 32, 32), new MeshBasicMaterial({ map: skyTex, side: BackSide })))

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
        const tex = loader.load(config.surfaceTexture)
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
          ;(face.material as MeshBasicMaterial).color.multiplyScalar(0.72)
          body.add(face)
        }
      }
    })

    // 磁场可视化
    const fieldGroup = new Group()
    fieldGroup.visible = showFieldRef.current
    fieldGroupRef.current = fieldGroup
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
      const rand = (min: number, max: number) => min + Math.random() * (max - min)
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

    // 层名标签：沿 -X 剖切面呈对角瀑布排布（每层角度递增，避免薄层重叠）
    const labelDefs = config.layers.map((layer, idx) => {
      const rInner = config.layers[idx + 1]?.rOuter ?? 0
      const rMid = Math.max((layer.rOuter + rInner) / 2, 14)
      const span = document.createElement('span')
      span.textContent = zh ? layer.nameZh : layer.nameEn
      span.style.cssText =
        'position:absolute;transform:translate(-50%,-50%);font-size:11px;font-family:system-ui;' +
        'color:#f1f5f9;text-shadow:0 0 5px rgba(2,6,23,.95);pointer-events:none;white-space:nowrap'
      labelLayer.appendChild(span)
      const angle = -0.12 - idx * 0.14 // 赤道下方逐层压低
      const pos = new Vector3(-Math.cos(angle) * rMid, Math.sin(angle) * rMid, 0)
      return { span, pos }
    })

    let raf = 0
    const tick = () => {
      body.rotation.y += 0.0004 // 缓慢旋转，保持剖面长时间可读
      body.updateMatrixWorld()
      if (fieldGroupRef.current) fieldGroupRef.current.visible = showFieldRef.current
      for (const { span, pos } of labelDefs) {
        const v = pos.clone().applyMatrix4(body.matrixWorld).project(camera)
        const visible = v.z < 1
        span.style.display = visible ? 'block' : 'none'
        if (visible) {
          span.style.left = `${((v.x + 1) / 2) * el.clientWidth}px`
          span.style.top = `${((1 - v.y) / 2) * el.clientHeight}px`
        }
      }
      controls.update()
      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const ro = new ResizeObserver(() => {
      camera.aspect = el.clientWidth / el.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(el.clientWidth, el.clientHeight)
    })
    ro.observe(el)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      renderer.dispose()
      el.removeChild(renderer.domElement)
      labelDefs.forEach((l) => l.span.remove())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, zh])

  return (
    <>
      <div ref={containerRef} className="absolute inset-0 z-0" />
      <div ref={labelsRef} className="pointer-events-none absolute inset-0 z-10 overflow-hidden" />
    </>
  )
}
