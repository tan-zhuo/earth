/**
 * 航天器 3D 模型：全部用 three 基本几何体程序化搭建（不依赖外部模型文件）。
 * 各部件比例做了适度简化与夸张，只求形态可辨识；真实尺寸见资料卡。
 * 每个模型自带部件锚点（userData.partId），视图据此投影出部件标签。
 */
import {
  BoxGeometry, CanvasTexture, CircleGeometry, ConeGeometry, CylinderGeometry, DoubleSide,
  Group, LatheGeometry, Mesh, MeshStandardMaterial, Object3D, RepeatWrapping, Shape, ShapeGeometry,
  SphereGeometry, TorusGeometry, Vector2, Vector3, SRGBColorSpace,
} from 'three'

/* ---------------- 材质与贴图 ---------------- */

let panelTex: CanvasTexture | null = null
/** 太阳能电池阵：深蓝底 + 电池片网格 */
function solarTexture(): CanvasTexture {
  if (panelTex) return panelTex
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#152a63'
  ctx.fillRect(0, 0, 256, 256)
  ctx.strokeStyle = '#3f63c4'
  ctx.lineWidth = 2
  for (let i = 0; i <= 256; i += 16) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i, 256)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, i)
    ctx.lineTo(256, i)
    ctx.stroke()
  }
  ctx.strokeStyle = '#8195bb'
  ctx.lineWidth = 0.6
  for (let x = 2; x < 256; x += 4) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 256); ctx.stroke() }
  panelTex = new CanvasTexture(c)
  panelTex.colorSpace = SRGBColorSpace
  panelTex.wrapS = panelTex.wrapT = RepeatWrapping
  panelTex.repeat.set(5, 2)
  return panelTex
}

let foilTex: CanvasTexture | null = null
/** 多层隔热毯（MLI）：金色底 + 随机褶皱明暗 */
function foilTexture(): CanvasTexture {
  if (foilTex) return foilTex
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#c99a2e'
  ctx.fillRect(0, 0, 128, 128)
  for (let i = 0; i < 220; i++) {
    const x = Math.random() * 128
    const y = Math.random() * 128
    ctx.strokeStyle = Math.random() > 0.5 ? 'rgba(255,225,150,0.5)' : 'rgba(120,80,10,0.45)'
    ctx.lineWidth = Math.random() * 2 + 0.4
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + (Math.random() - 0.5) * 26, y + (Math.random() - 0.5) * 26)
    ctx.stroke()
  }
  foilTex = new CanvasTexture(c)
  foilTex.colorSpace = SRGBColorSpace
  return foilTex
}

const hull = () => new MeshStandardMaterial({ color: 0xd6dbe4, roughness: 0.3, metalness: 0.8 })
const white = () => new MeshStandardMaterial({ color: 0xeef2f7, roughness: 0.4 })
const dark = () => new MeshStandardMaterial({ color: 0x2a3040, roughness: 0.4 })
const gold = () => new MeshStandardMaterial({ color: 0xe8bc62, roughness: 0.2, metalness: 1 })
const foil = () => new MeshStandardMaterial({ map: foilTexture(), bumpMap: foilTexture(), bumpScale: 0.025, roughness: 0.36, metalness: 0.85 })
const solar = () => new MeshStandardMaterial({ map: solarTexture(), roughness: 0.45, metalness: 0.25 })

/* ---------------- 搭建辅助 ---------------- */

/** 放置一个网格并返回它（省去逐个 position.set） */
function put(parent: Object3D, mesh: Mesh, x = 0, y = 0, z = 0): Mesh {
  mesh.position.set(x, y, z)
  parent.add(mesh)
  return mesh
}

/** Every assembly owns its meshes and one physical annotation anchor. */
function part(root: Group, id: string, position: [number, number, number]): Group {
  const group = new Group()
  group.name = id
  group.userData.partId = id
  const anchor = new Object3D()
  anchor.name = 'anchor'
  anchor.position.set(...position)
  group.add(anchor)
  root.add(group)
  return group
}

const UP = new Vector3(0, 1, 0)
/** 连接两点的杆件：着陆腿、支架、伸杆都用它，端点自然对齐 */
function link(
  parent: Object3D,
  from: [number, number, number],
  to: [number, number, number],
  r = 0.05,
  mat = hull(),
) {
  const a = new Vector3(...from)
  const b = new Vector3(...to)
  const dir = new Vector3().subVectors(b, a)
  const m = new Mesh(new CylinderGeometry(r, r, dir.length(), 10), mat)
  m.position.copy(a).addScaledVector(dir, 0.5)
  m.quaternion.setFromUnitVectors(UP, dir.clone().normalize())
  parent.add(m)
  return m
}

/** 一片太阳翼（长 × 宽，厚度固定，含边框） */
function wing(len: number, width: number) {
  const g = new Group()
  put(g, new Mesh(new BoxGeometry(len, 0.04, width), solar()))
  put(g, new Mesh(new BoxGeometry(len + 0.08, 0.06, 0.06), hull()), 0, 0, width / 2)
  put(g, new Mesh(new BoxGeometry(len + 0.08, 0.06, 0.06), hull()), 0, 0, -width / 2)
  return g
}

/* ---------------- 哈勃太空望远镜 ---------------- */
function buildHubble(): Group {
  const root = new Group()
  const tube = part(root, 'tube', [0, 1.25, 0])
  put(tube, new Mesh(new CylinderGeometry(1.25, 1.25, 4.4, 40), hull())).rotation.x = Math.PI / 2
  put(tube, new Mesh(new CylinderGeometry(1.32, 1.32, 0.55, 40), foil()), 0, 0, -2.4).rotation.x = Math.PI / 2
  for (const z of [-1.8, -0.2, 1.8]) {
    // TorusGeometry lies in XY already: the tube's long axis is Z.
    put(tube, new Mesh(new TorusGeometry(1.27, 0.045, 8, 48), white()), 0, 0, z)
  }
  const aperture = part(root, 'aperture', [0, 1.28, 3.8])
  put(aperture, new Mesh(new CylinderGeometry(1.28, 1.28, 1.5, 40, 1, true), new MeshStandardMaterial({ color: '#aeb8c7', side: DoubleSide })), 0, 0, 2.95).rotation.x = Math.PI / 2
  put(aperture, new Mesh(new CircleGeometry(1.24, 40), dark()), 0, 0, 2.23)
  put(aperture, new Mesh(new CircleGeometry(0.94, 40), hull()), 0, 0, 2.24)
  const hinge = new Group()
  hinge.position.set(0, 1.28, 3.7)
  hinge.rotation.x = -0.8
  put(hinge, new Mesh(new CircleGeometry(1.26, 40), new MeshStandardMaterial({ color: '#d6dbe4', side: DoubleSide })), 0, 1.26, 0)
  aperture.add(hinge)
  const panels = part(root, 'panel', [3.4, 0, 0])
  for (const side of [-1, 1]) {
    link(panels, [side * 1.2, 0, 0], [side * 2.1, 0, 0], 0.075)
    const panel = wing(3.2, 1.6)
    panel.position.set(side * 3.6, 0, 0)
    panels.add(panel)
  }
  const antenna = part(root, 'antenna', [0, 2.4, -1.3])
  for (const side of [-1, 1]) {
    link(antenna, [0, side * 1.15, -1.3], [0, side * 2.4, -1.3], 0.055)
    put(antenna, new Mesh(new CylinderGeometry(0.44, 0.32, 0.14, 24), white()), 0, side * 2.4, -1.3)
  }
  return root
}

/* ---------------- 国际空间站 ---------------- */
function buildISS(): Group {
  const root = new Group()
  const truss = part(root, 'truss', [0, 0.3, 0])
  // Four continuous rails and connected diagonal braces replace intersecting bars.
  for (const y of [-0.22, 0.22]) for (const z of [-0.22, 0.22]) link(truss, [-8, y, z], [8, y, z], 0.045)
  for (let x = -8; x < 8; x++) {
    for (const z of [-0.22, 0.22]) link(truss, [x, -0.22, z], [x + 1, 0.22, z], 0.028)
    for (const y of [-0.22, 0.22]) link(truss, [x, y, -0.22], [x + 1, y, 0.22], 0.028)
  }
  const arrays = part(root, 'array', [6.7, 0, 4])
  for (const x of [-6.7, -4.8, 4.8, 6.7]) for (const side of [-1, 1]) {
    // Eight wings, each with two blankets attached to a central mast.
    link(arrays, [x, 0, 0], [x, 0, side * 5.8], 0.045)
    for (const dx of [-0.4, 0.4]) {
      const panel = wing(0.7, 5.2)
      panel.position.set(x + dx, 0, side * 3.15)
      arrays.add(panel)
    }
  }
  const modules = part(root, 'modules', [0, -0.65, 1.2])
  link(modules, [0, 0, 0], [0, -0.65, 0], 0.25)
  for (const [z, length, radius] of [[-2.1, 2.3, 0.45], [0, 1.8, 0.6], [2.0, 2.2, 0.54]]) {
    put(modules, new Mesh(new CylinderGeometry(radius, radius, length, 28), white()), 0, -0.7, z).rotation.x = Math.PI / 2
  }
  for (const z of [-0.85, 0.95]) put(modules, new Mesh(new SphereGeometry(0.62, 24, 16), hull()), 0, -0.7, z)
  for (const side of [-1, 1]) put(modules, new Mesh(new CylinderGeometry(0.44, 0.44, 2.0, 24), white()), side * 1.35, -0.7, 1.05).rotation.z = Math.PI / 2
  const radiator = part(root, 'radiator', [-2.4, 1.6, 0.6])
  for (const x of [-2.5, 2.5]) {
    link(radiator, [x, 0, 0], [x, 1.4, 0], 0.075)
    link(radiator, [x - 0.74, 1.4, 0], [x + 0.74, 1.4, 0], 0.045)
    for (const dx of [-0.5, 0, 0.5]) {
      const panel = put(radiator, new Mesh(new BoxGeometry(0.44, 0.035, 2.4), white()), x + dx, 1.4, 0)
      panel.rotation.x = 0.55
    }
  }
  const docked = part(root, 'docked', [0, -0.7, -4.1])
  put(docked, new Mesh(new CylinderGeometry(0.34, 0.34, 1.1, 24), foil()), 0, -0.7, -3.65).rotation.x = Math.PI / 2
  put(docked, new Mesh(new SphereGeometry(0.34, 24, 16), white()), 0, -0.7, -4.25)
  return root
}

/* ---------------- 天宫空间站：T 字舱体与实际对接方向 ---------------- */
function buildTiangong(): Group {
  const root = new Group()
  const core = part(root, 'core', [0, 0.8, -1.8])
  put(core, new Mesh(new CylinderGeometry(0.78, 0.78, 2.6, 32), white()), 0, 0, -1.8).rotation.x = Math.PI / 2
  put(core, new Mesh(new CylinderGeometry(0.5, 0.5, 1.1, 28), hull()), 0, 0, 0).rotation.x = Math.PI / 2
  put(core, new Mesh(new SphereGeometry(0.66, 28, 20), white()), 0, 0, 0.8)
  for (const side of [-1, 1]) {
    const lab = part(root, side < 0 ? 'wentian' : 'mengtian', [side * 2.5, 0.65, 0.8])
    put(lab, new Mesh(new CylinderGeometry(0.37, 0.37, 0.55, 24), hull()), side * 0.7, 0, 0.8).rotation.z = Math.PI / 2
    put(lab, new Mesh(new CylinderGeometry(0.62, 0.62, 3.2, 28), white()), side * 2.5, 0, 0.8).rotation.z = Math.PI / 2
    put(lab, new Mesh(new CylinderGeometry(0.45, 0.45, 0.7, 24), hull()), side * 4.4, 0, 0.8).rotation.z = Math.PI / 2
  }
  for (const z of [-2.9, -2.0, -1.1, -0.6]) put(core, new Mesh(new TorusGeometry(0.785, 0.018, 8, 64), hull()), 0, 0, z)
  for (const side of [-1, 1]) {
    const lab = root.getObjectByName(side < 0 ? 'wentian' : 'mengtian')!
    for (const x of [1.1, 2.1, 3.1, 3.9]) put(lab, new Mesh(new TorusGeometry(0.625, 0.016, 8, 64), hull()), side * x, 0, 0.8).rotation.y = Math.PI / 2
  }
  const wings = part(root, 'wings', [4.4, 0, 4.0])
  for (const x of [-4.4, 4.4]) for (const side of [-1, 1]) {
    link(wings, [x, 0, 0.8], [x, 0, 0.8 + side * 1.0], 0.065)
    const panel = wing(1.05, 4.0)
    panel.position.set(x, 0, 0.8 + side * 2.8)
    wings.add(panel)
  }
  for (const side of [-1, 1]) {
    link(wings, [side * 0.7, 0, -2.6], [side * 1.1, 0, -2.6], 0.06)
    const panel = wing(2.4, 0.95)
    panel.position.set(side * 2.2, 0, -2.6)
    wings.add(panel)
  }
  // Shenzhou at the forward node; Tianzhou at Tianhe's aft port.
  const crew = part(root, 'shenzhou', [0, 0.45, 2.8])
  put(crew, new Mesh(new CylinderGeometry(0.3, 0.3, 0.65, 24), white()), 0, 0, 1.7).rotation.x = Math.PI / 2
  put(crew, new Mesh(new SphereGeometry(0.36, 24, 16), hull()), 0, 0, 2.3)
  put(crew, new Mesh(new CylinderGeometry(0.35, 0.35, 0.7, 24), foil()), 0, 0, 2.95).rotation.x = Math.PI / 2
  const cargo = part(root, 'tianzhou', [0, 0.5, -4.2])
  put(cargo, new Mesh(new CylinderGeometry(0.3, 0.3, 0.4, 24), hull()), 0, 0, -3.25).rotation.x = Math.PI / 2
  put(cargo, new Mesh(new CylinderGeometry(0.51, 0.51, 1.5, 28), white()), 0, 0, -4.15).rotation.x = Math.PI / 2
  put(cargo, new Mesh(new CylinderGeometry(0.4, 0.4, 0.5, 24), foil()), 0, 0, -5.1).rotation.x = Math.PI / 2
  return root
}

/* ---------------- 韦伯：镜片共面，镜面与遮阳罩近乎垂直 ---------------- */
function buildJWST(): Group {
  const root = new Group()
  const primary = part(root, 'primary', [0, 2.25, -0.9])
  const r = 0.52, gap = 1.015
  for (let q = -2; q <= 2; q++) for (let row = -2; row <= 2; row++) {
    if (Math.max(Math.abs(q), Math.abs(row), Math.abs(q + row)) > 2 || (q === 0 && row === 0)) continue
    const x = Math.sqrt(3) * r * (q + row / 2) * gap
    const y = 2.25 + 1.5 * r * row * gap
    const segment = put(primary, new Mesh(new CylinderGeometry(r, r, 0.075, 6), gold()), x, y, -0.9)
    segment.rotation.x = Math.PI / 2
    segment.userData.mirrorSegment = true
  }
  put(primary, new Mesh(new CylinderGeometry(r * 0.93, r * 0.93, 0.1, 6), dark()), 0, 2.25, -0.9).rotation.x = Math.PI / 2
  put(primary, new Mesh(new BoxGeometry(3.2, 2.8, 0.18), dark()), 0, 2.25, -1.08)
  link(primary, [-0.65, -0.75, -1.1], [-0.65, 1.3, -1.1], 0.12, dark())
  link(primary, [0.65, -0.75, -1.1], [0.65, 1.3, -1.1], 0.12, dark())
  const secondary = part(root, 'secondary', [0, 2.25, 1.65])
  put(secondary, new Mesh(new CylinderGeometry(0.24, 0.24, 0.1, 28), gold()), 0, 2.25, 1.65).rotation.x = Math.PI / 2
  for (const [x, y] of [[0, 4.1], [-1.62, 1.3], [1.62, 1.3]]) link(secondary, [x, y, -0.9], [0, 2.25, 1.6], 0.04, dark())
  const shield = part(root, 'sunshield', [2.9, -0.7, 0])
  for (let i = 0; i < 5; i++) {
    const scale = 1 - i * 0.025
    const outline = new Shape()
    outline.moveTo(0, 5.2 * scale)
    outline.lineTo(3.25 * scale, 0.3)
    outline.lineTo(0, -5.2 * scale)
    outline.lineTo(-3.25 * scale, 0.3)
    outline.closePath()
    const sheet = put(shield, new Mesh(new ShapeGeometry(outline), new MeshStandardMaterial({ color: i % 2 ? '#a4aab5' : '#cbd0db', side: DoubleSide, roughness: 0.4 })), 0, -1 + i * 0.105, 0)
    sheet.rotation.x = -Math.PI / 2
    sheet.userData.shieldLayer = true
  }
  for (const [x, z] of [[0, 5.2], [0, -5.2], [3.25, -0.3], [-3.25, -0.3]]) link(shield, [0, -1.1, 0], [x, -1, z], 0.04, dark())
  const bus = part(root, 'bus', [0, -1.65, 0])
  put(bus, new Mesh(new BoxGeometry(1.65, 0.8, 1.5), foil()), 0, -1.5, 0)
  link(bus, [0.8, -1.7, 0], [1.5, -1.7, 0], 0.07)
  const panel = wing(2.0, 1.0)
  panel.position.set(2.45, -1.7, 0)
  bus.add(panel)
  link(bus, [0, -1.8, 0], [0, -2.3, 0], 0.06)
  put(bus, new Mesh(new CylinderGeometry(0.35, 0.3, 0.1, 24), white()), 0, -2.3, 0)
  return root
}

/* ---------------- 旅行者：所有伸杆都从总线连接，避开天线碟 ---------------- */
function buildVoyager(): Group {
  const root = new Group()
  const dish = part(root, 'dish', [0, 1.04, 2])
  const profile = Array.from({ length: 25 }, (_, i) => { const r = i / 24 * 2; return new Vector2(r, r * r * 0.26) })
  put(dish, new Mesh(new LatheGeometry(profile, 64), new MeshStandardMaterial({ color: '#edf0f2', side: DoubleSide, roughness: 0.4 })))
  put(dish, new Mesh(new TorusGeometry(2, 0.035, 8, 64), hull()), 0, 1.04, 0).rotation.x = Math.PI / 2
  link(dish, [0, -0.65, 0], [0, 0.12, 0], 0.25)
  put(dish, new Mesh(new CylinderGeometry(0.85, 0.85, 0.5, 10), foil()), 0, -0.6, 0)
  link(dish, [0, 0, 0], [0, 1.25, 0], 0.04)
  put(dish, new Mesh(new ConeGeometry(0.16, 0.25, 20), dark()), 0, 1.3, 0)
  const rtgs = part(root, 'rtg', [-3.1, -0.6, 0])
  link(rtgs, [-0.6, -0.6, 0], [-3.7, -0.6, 0], 0.075)
  for (let i = 0; i < 3; i++) {
    const x = -1.8 - i * 0.68
    put(rtgs, new Mesh(new CylinderGeometry(0.22, 0.22, 0.6, 20), dark()), x, -0.6, 0).rotation.z = Math.PI / 2
    for (const dx of [-0.2, 0, 0.2]) put(rtgs, new Mesh(new TorusGeometry(0.27, 0.035, 6, 20), hull()), x + dx, -0.6, 0).rotation.y = Math.PI / 2
  }
  const instruments = part(root, 'instruments', [2.15, -0.65, 0.6])
  link(instruments, [0.6, -0.65, 0], [2.1, -0.65, 0], 0.09)
  put(instruments, new Mesh(new BoxGeometry(0.7, 0.45, 0.6), hull()), 2.1, -0.65, 0)
  for (const x of [1.94, 2.28]) put(instruments, new Mesh(new CylinderGeometry(0.12, 0.12, 0.65, 20), dark()), x, -0.65, 0.6).rotation.x = Math.PI / 2
  const boom = part(root, 'boom', [-8.4, -0.65, -6.5])
  const base = new Vector3(-0.6, -0.65, -0.4), tip = new Vector3(-8.4, -0.65, -6.5)
  link(boom, base.toArray() as [number, number, number], tip.toArray() as [number, number, number], 0.035, dark())
  for (let i = 0; i < 22; i++) {
    const p = base.clone().lerp(tip, i / 22), next = base.clone().lerp(tip, (i + 1) / 22)
    for (const y of [-0.08, 0.08]) link(boom, [p.x, p.y + y, p.z], [next.x, next.y - y, next.z], 0.018)
  }
  put(boom, new Mesh(new BoxGeometry(0.15, 0.15, 0.18), dark()), tip.x, tip.y, tip.z)
  for (const side of [-1, 1]) link(instruments, [side * 0.3, -0.8, 0.3], [side * 3, -1.4, 4.6], 0.018)
  const record = part(root, 'record', [0.72, -0.6, 0.5])
  put(record, new Mesh(new CircleGeometry(0.33, 40), new MeshStandardMaterial({ color: '#ddb653', side: DoubleSide, roughness: 0.4 })), 0.72, -0.6, 0.5).rotation.y = 0.95
  return root
}

/* ---------------- 阿波罗：前腿、舷梯与舱门处于同一平面 ---------------- */
function buildApolloLM(): Group {
  const root = new Group()
  const descent = part(root, 'descent', [1.3, -0.1, 0])
  put(descent, new Mesh(new CylinderGeometry(1.65, 1.65, 0.9, 8), foil()), 0, -0.1, 0).rotation.y = Math.PI / 8
  // Cone opens toward -Y: no upside-down engine bell.
  put(descent, new Mesh(new ConeGeometry(0.5, 0.65, 24, 1, true), dark()), 0, -0.85, 0)
  const legs = part(root, 'legs', [2.6, -1.5, 0])
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2, x = Math.cos(a), z = Math.sin(a)
    const foot: [number, number, number] = [x * 2.6, -1.5, z * 2.6]
    link(legs, [x * 1.2, 0.1, z * 1.2], foot, 0.075)
    for (const s of [-1, 1]) link(legs, [x * 1.3 + z * s * 0.5, 0.25, z * 1.3 - x * s * 0.5], [x * 2, -0.8, z * 2], 0.04)
    const pad = put(legs, new Mesh(new CylinderGeometry(0.34, 0.34, 0.09, 24), hull()), ...foot)
    pad.userData.landingPad = true
  }
  const ascent = part(root, 'ascent', [0.8, 0.9, 0.7])
  put(ascent, new Mesh(new CylinderGeometry(1.08, 1.08, 1.05, 8), white()), 0, 0.9, 0).rotation.y = Math.PI / 8
  put(ascent, new Mesh(new BoxGeometry(1.45, 0.95, 0.8), hull()), 0, 0.85, 0.95)
  for (const side of [-1, 1]) {
    const window = new Shape()
    window.moveTo(-0.2, -0.16); window.lineTo(0.2, -0.16); window.lineTo(side * 0.1, 0.2); window.closePath()
    put(ascent, new Mesh(new ShapeGeometry(window), dark()), side * 0.37, 1.05, 1.36)
    put(ascent, new Mesh(new SphereGeometry(0.38, 20, 14), foil()), side * 1.04, 0.85, -0.4)
  }
  put(ascent, new Mesh(new BoxGeometry(0.5, 0.55, 0.04), dark()), 0, 0.6, 1.37)
  const docking = part(root, 'docking', [0, 1.84, 0])
  put(docking, new Mesh(new CylinderGeometry(0.3, 0.48, 0.3, 28, 1, true), hull()), 0, 1.55, 0)
  put(docking, new Mesh(new TorusGeometry(0.3, 0.055, 8, 32), white()), 0, 1.72, 0).rotation.x = Math.PI / 2
  const ladder = part(root, 'ladder', [0, -0.7, 2.1])
  put(ladder, new Mesh(new BoxGeometry(0.6, 0.06, 0.5), hull()), 0, 0.3, 1.6)
  for (const x of [-0.2, 0.2]) link(ladder, [x, 0.3, 1.8], [x, -1.42, 2.6], 0.03)
  for (let i = 0; i < 8; i++) {
    const t = i / 7
    link(ladder, [-0.2, 0.3 - 1.72 * t, 1.8 + 0.8 * t], [0.2, 0.3 - 1.72 * t, 1.8 + 0.8 * t], 0.025)
  }
  return root
}

const BUILDERS: Record<string, () => Group> = { hubble: buildHubble, iss: buildISS, tiangong: buildTiangong, jwst: buildJWST, voyager1: buildVoyager, apolloLm: buildApolloLM }
export function buildCraft(id: string): Group {
  const model = (BUILDERS[id] ?? buildHubble)()
  model.name = id
  return model
}
