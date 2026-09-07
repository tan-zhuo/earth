import { BufferGeometry, Material, PerspectiveCamera, Scene, Texture, Vector3, WebGLRenderer } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { RefObject } from 'react'
import type { ExplorerSettings } from './SpaceExplorer'

export function seededRandom(seed: number) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 }
}

/** Shared lifecycle: frame-rate independent motion, responsive framing and GPU cleanup. */
export function createSpaceScene(el: HTMLDivElement, live: RefObject<ExplorerSettings>, radius: number) {
  const scene = new Scene()
  const camera = new PerspectiveCamera(50, 1, 0.1, 8000)
  const renderer = new WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.5 : 2))
  el.appendChild(renderer.domElement)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.enablePan = false
  controls.minDistance = radius * 0.04
  controls.maxDistance = radius * 8
  const destination = new Vector3()
  const targetDestination = new Vector3()
  let focusProvider: ((id: string) => { position: Vector3; distance: number } | null) | undefined
  let focusedId: string | null = null
  let focusRevision = 0
  let revision = -1
  let transitioning = false
  let distance = 1
  const pose = (immediate = false) => {
    focusedId = null
    const direction = live.current?.pose === 'top' ? new Vector3(0, 1, 0.001) : live.current?.pose === 'side' ? new Vector3(0, 0.08, 1) : new Vector3(0, 0.6, 1)
    destination.copy(direction.normalize().multiplyScalar(distance))
    targetDestination.set(0, 0, 0)
    if (immediate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { camera.position.copy(destination); controls.target.copy(targetDestination); transitioning = false } else transitioning = true
  }
  const resize = () => {
    const w = el.clientWidth, h = el.clientHeight
    if (!w || !h) return
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
    distance = radius / Math.sin(Math.atan(Math.tan(camera.fov * Math.PI / 360) * Math.min(1, camera.aspect))) * 1.05
    controls.maxDistance = Math.max(radius * 8, distance * 1.5)
    pose(true)
  }
  resize()
  const observer = new ResizeObserver(resize)
  observer.observe(el)
  const stopTransition = () => { transitioning = false }
  controls.addEventListener('start', stopTransition)
  let raf = 0, last = 0, disposed = false
  const start = (update: (dt: number) => void, afterCamera?: () => void) => {
    const tick = (now: number) => {
      if (disposed) return
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0
      last = now
      if (!document.hidden) {
        const settings = live.current!
        update(settings.paused ? 0 : dt * settings.speed)
        if (revision !== settings.revision) { revision = settings.revision; pose(revision === 0) }
        if (focusedId && settings.selected !== focusedId) pose()
        if (focusRevision !== settings.focusRevision) {
          focusRevision = settings.focusRevision
          const focus = focusProvider?.(settings.selected)
          if (focus) {
            focusedId = settings.selected
            const offset = camera.position.clone().sub(controls.target).normalize().multiplyScalar(focus.distance)
            targetDestination.copy(focus.position)
            destination.copy(focus.position).add(offset)
            transitioning = true
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { camera.position.copy(destination); controls.target.copy(targetDestination); transitioning = false }
          }
        }
        if (focusedId) {
          const focus = focusProvider?.(focusedId)
          if (focus) {
            const delta = focus.position.clone().sub(targetDestination)
            destination.add(delta); targetDestination.copy(focus.position)
            if (!transitioning) { camera.position.add(delta); controls.target.add(delta) }
          }
        }
        if (transitioning) {
          const amount = 1 - Math.exp(-dt * 6)
          camera.position.lerp(destination, amount); controls.target.lerp(targetDestination, amount)
          if (camera.position.distanceTo(destination) < 0.05) transitioning = false
        }
        controls.update()
        afterCamera?.()
        renderer.render(scene, camera)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
  }
  const textures = new Set<Texture>()
  return { scene, camera, controls, renderer, start, textures,
    setFocusProvider(provider: NonNullable<typeof focusProvider>) { focusProvider = provider },
    isDisposed: () => disposed, dispose() {
    disposed = true
    cancelAnimationFrame(raf)
    observer.disconnect()
    controls.removeEventListener('start', stopTransition)
    controls.dispose()
    const geometries = new Set<BufferGeometry>(), materials = new Set<Material>()
    scene.traverse(o => {
      const drawable = o as unknown as { geometry?: BufferGeometry; material?: Material | Material[] }
      if (drawable.geometry) geometries.add(drawable.geometry)
      if (drawable.material) for (const mat of Array.isArray(drawable.material) ? drawable.material : [drawable.material]) {
        materials.add(mat)
        for (const value of Object.values(mat)) if (value instanceof Texture) textures.add(value)
      }
    })
    geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose())
    renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove()
  } }
}

export function createSpaceLabels(el: HTMLDivElement, camera: PerspectiveCamera, onSelect: (id: string) => void) {
  const labels: { id: string; button: HTMLButtonElement; position: () => Vector3; layer?: string }[] = []
  return {
    add(id: string, text: string, color: string, position: () => Vector3, layer?: string) {
      const button = document.createElement('button')
      button.type = 'button'; button.textContent = text; button.className = 'space-landmark'
      button.style.setProperty('--marker', color)
      button.addEventListener('click', () => onSelect(id))
      el.appendChild(button); labels.push({ id, button, position, layer })
    },
    update(settings: ExplorerSettings) {
      const occupied: { x: number; y: number; w: number }[] = []
      const ordered = [...labels].sort((a, b) => Number(b.id === settings.selected) - Number(a.id === settings.selected))
      for (const label of ordered) {
        const v = label.position().project(camera)
        const x = (v.x + 1) / 2 * el.clientWidth, y = (1 - v.y) / 2 * el.clientHeight
        const w = Math.min(220, label.button.offsetWidth || 90)
        const selected = label.id === settings.selected
        const visible = (!label.layer || settings.layers[label.layer]) && v.z > -1 && v.z < 1 && x > w / 2 && x < el.clientWidth - w / 2 && y > 20 && y < el.clientHeight - 20 && !occupied.some(o => Math.abs(o.x - x) < (o.w + w) / 2 + 6 && Math.abs(o.y - y) < 34)
        label.button.style.visibility = visible ? 'visible' : 'hidden'
        label.button.setAttribute('aria-pressed', String(selected))
        if (visible) { label.button.style.left = `${x}px`; label.button.style.top = `${y}px`; occupied.push({ x, y, w }) }
      }
    },
    dispose() { labels.forEach(l => l.button.remove()) },
  }
}
