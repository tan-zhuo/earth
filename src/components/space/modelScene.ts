import { AmbientLight, Box3, DirectionalLight, Material, Mesh, Object3D, PerspectiveCamera, Scene, Sphere, Texture, Vector3, WebGLRenderer } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

/** Craft textures are shared; structural scene textures are owned by that scene. */
export function disposeModelTree(root: Object3D, disposeTextures = false) {
  const geometries = new Set<Mesh['geometry']>(), materials = new Set<Material>(), textures = new Set<Texture>()
  root.traverse(object => {
    const mesh = object as Mesh
    if (mesh.geometry) geometries.add(mesh.geometry)
    if (mesh.material) for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
      materials.add(material)
      if (disposeTextures) for (const value of Object.values(material)) if (value instanceof Texture) textures.add(value)
    }
  })
  geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose())
}

export function createModelScene(el: HTMLDivElement, direction = new Vector3(1, 0.65, 1.5)) {
  const scene = new Scene()
  const camera = new PerspectiveCamera(40, 1, 0.01, 10000)
  const renderer = new WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.5 : 2))
  el.appendChild(renderer.domElement)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.enablePan = false
  controls.autoRotateSpeed = 0.5
  scene.add(new AmbientLight('#dce6ff', 1.05))
  const key = new DirectionalLight('#fff4dd', 2.1); key.position.set(5, 8, 10); scene.add(key)
  const fill = new DirectionalLight('#92b5e2', 1.2); fill.position.set(-6, 2, -4); scene.add(fill)
  let subject: Object3D | null = null
  let extent: Sphere | null = null
  const fit = (object = subject, view = direction) => {
    if (!object && !extent) return
    const bounds = extent ?? new Box3().setFromObject(object!).getBoundingSphere(new Sphere())
    if (!Number.isFinite(bounds.radius) || bounds.radius <= 0) return
    const angle = Math.atan(Math.tan(camera.fov * Math.PI / 360) * Math.min(1, camera.aspect))
    const axis = view.clone().normalize()
    let distance = bounds.radius / Math.sin(angle) * 1.12
    if (!extent && object) {
      // Fit the projected box for this view, so long, flat craft remain legible.
      const box = new Box3().setFromObject(object)
      const right = new Vector3().crossVectors(camera.up, axis).normalize()
      const up = new Vector3().crossVectors(axis, right).normalize()
      const tanV = Math.tan(camera.fov * Math.PI / 360), tanH = tanV * camera.aspect
      distance = 0
      for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
        const offset = new Vector3(x, y, z).sub(bounds.center)
        distance = Math.max(distance, offset.dot(axis) + Math.max(Math.abs(offset.dot(right)) / tanH, Math.abs(offset.dot(up)) / tanV))
      }
      distance = Math.max(distance * 1.12, bounds.radius * 1.05)
    }
    controls.target.copy(bounds.center)
    camera.position.copy(bounds.center).addScaledVector(view.clone().normalize(), distance)
    camera.near = Math.max(bounds.radius / 1000, 0.01)
    camera.far = Math.max(bounds.radius * 100, 100)
    controls.minDistance = bounds.radius * 0.25
    controls.maxDistance = distance * 5
    camera.updateProjectionMatrix()
    // Flush residual damping so reset remains a stable, reproducible view.
    const damping = controls.enableDamping; controls.enableDamping = false; controls.update(); controls.enableDamping = damping
  }
  const resize = () => {
    if (!el.clientWidth || !el.clientHeight) return
    camera.aspect = el.clientWidth / el.clientHeight
    renderer.setSize(el.clientWidth, el.clientHeight)
    camera.updateProjectionMatrix()
    fit()
  }
  resize()
  const observer = new ResizeObserver(resize); observer.observe(el)
  let raf = 0, last = 0
  const start = (update: () => void) => {
    const tick = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0; last = now
      if (!document.hidden) { controls.update(dt); scene.updateMatrixWorld(); update(); renderer.render(scene, camera) }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
  }
  return { scene, camera, renderer, controls, start, fit,
    setSubject(object: Object3D, bounds?: Sphere) { subject = object; extent = bounds ?? null; fit() },
    dispose() { cancelAnimationFrame(raf); observer.disconnect(); controls.dispose(); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove() },
  }
}
