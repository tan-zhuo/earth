/**
 * 航天器 3D 模型：全部用 three 基本几何体程序化搭建（不依赖外部模型文件）。
 * 各部件比例做了适度简化与夸张，只求形态可辨识；真实尺寸见资料卡。
 * 每个模型自带部件锚点（userData.partId），视图据此投影出部件标签。
 */
import {
  BoxGeometry, CanvasTexture, CircleGeometry, ConeGeometry, CylinderGeometry, DoubleSide,
  Group, LatheGeometry, Mesh, MeshPhongMaterial, Object3D, RepeatWrapping, Shape, ShapeGeometry,
  SphereGeometry, TorusGeometry, Vector2, Vector3,
} from 'three'

/* ---------------- 材质与贴图 ---------------- */

let panelTex: CanvasTexture | null = null
/** 太阳能电池阵：深蓝底 + 电池片网格 */
function solarTexture(): CanvasTexture {
  if (panelTex) return panelTex
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#152a63'
  ctx.fillRect(0, 0, 64, 64)
  ctx.strokeStyle = '#3f63c4'
  ctx.lineWidth = 2
  for (let i = 0; i <= 64; i += 16) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i, 64)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, i)
    ctx.lineTo(64, i)
    ctx.stroke()
  }
  panelTex = new CanvasTexture(c)
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
  return foilTex
}

const hull = () => new MeshPhongMaterial({ color: 0xd6dbe4, shininess: 70 })
const white = () => new MeshPhongMaterial({ color: 0xeef2f7, shininess: 25 })
const dark = () => new MeshPhongMaterial({ color: 0x2a3040, shininess: 20 })
const gold = () => new MeshPhongMaterial({ color: 0xd8a72c, shininess: 120 })
const foil = () => new MeshPhongMaterial({ map: foilTexture(), shininess: 90 })
const solar = () => new MeshPhongMaterial({ map: solarTexture(), shininess: 150, specular: 0x2b4a7a })

/* ---------------- 搭建辅助 ---------------- */

/** 放置一个网格并返回它（省去逐个 position.set） */
function put(parent: Object3D, mesh: Mesh, x = 0, y = 0, z = 0): Mesh {
  mesh.position.set(x, y, z)
  parent.add(mesh)
  return mesh
}

/** 部件标签锚点：视图会把它投影到屏幕上标注名称 */
function anchor(parent: Object3D, id: string, x: number, y: number, z: number) {
  const o = new Object3D()
  o.position.set(x, y, z)
  o.userData.partId = id
  parent.add(o)
}

/** 细杆（默认沿 Y 轴，用 rotation 改向） */
function rod(len: number, r = 0.05, mat = hull()) {
  return new Mesh(new CylinderGeometry(r, r, len, 10), mat)
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
  const g = new Group()

  // 镜筒（长轴沿 Z）+ 前端遮光罩 + 后端仪器舱
  const tube = put(g, new Mesh(new CylinderGeometry(1.25, 1.25, 4.4, 32), foil()))
  tube.rotation.x = Math.PI / 2
  const shade = put(g, new Mesh(new CylinderGeometry(1.28, 1.28, 1.7, 32, 1, true), hull()), 0, 0, 3.0)
  shade.rotation.x = Math.PI / 2
  ;(shade.material as MeshPhongMaterial).side = DoubleSide
  const aft = put(g, new Mesh(new CylinderGeometry(1.32, 1.32, 0.55, 32), white()), 0, 0, -2.4)
  aft.rotation.x = Math.PI / 2
  // 打开的舱门：铰接在遮光罩上沿，向外掀开
  const hinge = new Group()
  hinge.position.set(0, 1.28, 3.9)
  hinge.rotation.x = -1.05
  const door = new Mesh(new CircleGeometry(1.26, 28), hull())
  door.position.set(0, 1.26, 0)
  ;(door.material as MeshPhongMaterial).side = DoubleSide
  hinge.add(door)
  g.add(hinge)
  // 筒身腰箍
  for (const z of [-1.2, 0.4, 1.8]) {
    const ring = put(g, new Mesh(new TorusGeometry(1.27, 0.05, 8, 40), hull()), 0, 0, z)
    ring.rotation.y = Math.PI / 2
    ring.rotation.x = Math.PI / 2
  }

  // 太阳翼（两片，沿 X 展开）
  for (const s of [1, -1]) {
    const w = wing(3.6, 1.5)
    w.position.set(s * 3.3, 0, 0)
    g.add(w)
    put(g, rod(1.4, 0.07), s * 1.7, 0, 0).rotation.z = Math.PI / 2
  }

  // 高增益天线（上下各一支，杆 + 碟）
  for (const s of [1, -1]) {
    put(g, rod(1.5, 0.06), 0, s * 1.9, -0.6)
    const dish = put(g, new Mesh(new CylinderGeometry(0.5, 0.5, 0.07, 20), white()), 0, s * 2.6, -0.6)
    dish.rotation.x = s * 0.4
  }

  anchor(g, 'tube', 0, 1.4, 0.6)
  anchor(g, 'panel', 3.4, 0.3, 0)
  anchor(g, 'antenna', 0, 2.9, -0.6)
  anchor(g, 'aperture', 0, -1.5, 4.0)
  return g
}

/* ---------------- 国际空间站 ---------------- */

function buildISS(): Group {
  const g = new Group()

  // 主桁架（沿 X）
  put(g, new Mesh(new BoxGeometry(15, 0.38, 0.38), hull()))
  for (let x = -7; x <= 7; x += 1) {
    put(g, new Mesh(new BoxGeometry(0.1, 0.7, 0.1), hull()), x, 0, 0)
  }

  // 8 片太阳翼：桁架两端各一组，每组前后各两片
  for (const x of [-6.9, -5.0, 5.0, 6.9]) {
    for (const z of [1, -1]) {
      const w = wing(1.6, 3.4)
      w.position.set(x, 0, z * 2.1)
      g.add(w)
    }
    const joint = put(g, new Mesh(new CylinderGeometry(0.3, 0.3, 0.5, 16), white()), x, 0, 0)
    joint.rotation.x = Math.PI / 2
  }

  // 散热板（白色，垂直于太阳翼）
  for (const x of [-2.4, 2.4]) {
    for (const s of [1, -1]) {
      const rad = put(g, new Mesh(new BoxGeometry(1.2, 0.05, 2.6), white()), x, s * 1.1, 0)
      rad.rotation.x = s * 0.5
    }
  }

  // 增压舱段：沿 Z 的主轴 + 两侧实验舱
  const spine = put(g, new Mesh(new CylinderGeometry(0.55, 0.55, 5.4, 24), white()), 0, -0.55, 0)
  spine.rotation.x = Math.PI / 2
  for (const z of [-1.6, 0.6]) {
    const node = put(g, new Mesh(new SphereGeometry(0.68, 20, 16), white()), 0, -0.55, z)
    node.scale.set(1, 0.95, 1)
  }
  for (const s of [1, -1]) {
    const lab = put(g, new Mesh(new CylinderGeometry(0.5, 0.5, 2.2, 20), white()), s * 1.5, -0.55, 0.6)
    lab.rotation.z = Math.PI / 2
  }
  // 对接的飞船（联盟/货运）
  const ship = put(g, new Mesh(new CylinderGeometry(0.34, 0.34, 1.1, 16), foil()), 0, -0.55, -3.3)
  ship.rotation.x = Math.PI / 2
  put(g, new Mesh(new ConeGeometry(0.34, 0.5, 16), dark()), 0, -0.55, -4.05).rotation.x = -Math.PI / 2

  anchor(g, 'truss', 0, 0.6, 0)
  anchor(g, 'array', 6.9, 0, 3.2)
  anchor(g, 'modules', 0, -1.4, 1.6)
  anchor(g, 'radiator', -2.4, 1.7, 0)
  anchor(g, 'docked', 0, -0.55, -4.6)
  return g
}

/* ---------------- 天宫空间站 ---------------- */

function buildTiangong(): Group {
  const g = new Group()

  // 天和核心舱（沿 X）：大柱段 + 小柱段 + 前端节点舱
  const big = put(g, new Mesh(new CylinderGeometry(0.95, 0.95, 2.4, 24), white()), -0.6, 0, 0)
  big.rotation.z = Math.PI / 2
  const small = put(g, new Mesh(new CylinderGeometry(0.62, 0.62, 1.6, 24), white()), 1.4, 0, 0)
  small.rotation.z = Math.PI / 2
  put(g, new Mesh(new SphereGeometry(0.8, 24, 18), white()), 2.6, 0, 0) // 节点舱

  // 问天 / 梦天实验舱：从节点舱向 ±Z 伸出，构成 T 字
  for (const s of [1, -1]) {
    const lab = put(g, new Mesh(new CylinderGeometry(0.8, 0.8, 3.0, 24), white()), 2.6, 0, s * 2.3)
    lab.rotation.x = Math.PI / 2
    put(g, new Mesh(new CylinderGeometry(0.5, 0.5, 0.7, 20), hull()), 2.6, 0, s * 4.1).rotation.x = Math.PI / 2
    // 实验舱柔性太阳翼
    for (const t of [1, -1]) {
      const w = wing(3.4, 1.15)
      w.position.set(2.6 + t * 2.6, 0, s * 3.0)
      g.add(w)
    }
  }

  // 核心舱柔性太阳翼
  for (const s of [1, -1]) {
    const w = wing(1.15, 3.4)
    w.position.set(-1.2, 0, s * 2.5)
    g.add(w)
  }

  // 尾端对接的神舟载人飞船 + 节点舱径向的天舟货运飞船
  const sz = put(g, new Mesh(new CylinderGeometry(0.42, 0.42, 1.2, 18), foil()), -2.6, 0, 0)
  sz.rotation.z = Math.PI / 2
  put(g, new Mesh(new SphereGeometry(0.42, 18, 14), white()), -3.4, 0, 0)
  const tz = put(g, new Mesh(new CylinderGeometry(0.5, 0.5, 1.5, 18), hull()), 2.6, -1.9, 0)
  tz.rotation.x = 0

  anchor(g, 'core', -0.6, 1.3, 0)
  anchor(g, 'wentian', 2.6, -1.2, 3.4)
  anchor(g, 'mengtian', 2.6, 1.2, -3.4)
  anchor(g, 'wings', 5.4, 0.5, 3.0)
  anchor(g, 'shenzhou', -3.9, 0.6, 0)
  anchor(g, 'tianzhou', 2.6, -2.7, 0)
  return g
}

/* ---------------- 詹姆斯·韦布空间望远镜 ---------------- */

function buildJWST(): Group {
  const g = new Group()

  // 主镜：18 块正六边形（中心一块空缺），六边形朝 +Y
  const r = 0.44
  const d = r * Math.sqrt(3) // 相邻镜面中心距
  const centers: [number, number][] = []
  for (let k = 0; k < 6; k++) {
    const a1 = Math.PI / 6 + (k * Math.PI) / 3
    const a2 = (k * Math.PI) / 3
    centers.push([Math.cos(a1) * d, Math.sin(a1) * d]) // 内环 6 块
    centers.push([Math.cos(a1) * 2 * d, Math.sin(a1) * 2 * d]) // 外环 6 块
    centers.push([Math.cos(a2) * d * Math.sqrt(3), Math.sin(a2) * d * Math.sqrt(3)]) // 外环另 6 块
  }
  const mirror = new Group()
  g.add(mirror)
  for (const [x, z] of centers) {
    put(mirror, new Mesh(new CylinderGeometry(r, r, 0.07, 6), gold()), x, 0, z)
  }
  // 背面桁架
  put(g, new Mesh(new BoxGeometry(3.4, 0.12, 0.5), dark()), 0, -0.16, 0)

  // 副镜 + 三脚支架（杆件按端点连接，落在主镜边缘）
  put(g, new Mesh(new CylinderGeometry(0.36, 0.36, 0.06, 24), gold()), 0, 2.6, 0)
  for (const a of [Math.PI / 2, (7 * Math.PI) / 6, (11 * Math.PI) / 6]) {
    link(g, [Math.cos(a) * 1.75, 0.05, Math.sin(a) * 1.75], [0, 2.58, 0], 0.035)
  }

  // 五层遮阳罩（风筝形，逐层略小）
  const kite = (scale: number) => {
    const s = new Shape()
    s.moveTo(0, 2.7 * scale)
    s.lineTo(3.3 * scale, 0.1 * scale)
    s.lineTo(0, -3.0 * scale)
    s.lineTo(-3.3 * scale, 0.1 * scale)
    s.closePath()
    return new ShapeGeometry(s)
  }
  for (let i = 0; i < 5; i++) {
    const layer = new Mesh(
      kite(1 - i * 0.05),
      new MeshPhongMaterial({
        color: i === 0 ? 0xb0b8c6 : 0x8f98a8,
        side: DoubleSide,
        shininess: 90,
        transparent: true,
        opacity: 0.92,
      }),
    )
    layer.rotation.x = -Math.PI / 2
    layer.position.set(0, -1.4 - i * 0.3, 0)
    g.add(layer)
  }

  // 航天器总线 + 太阳翼（遮阳罩背阳面之下）
  put(g, new Mesh(new BoxGeometry(1.7, 0.7, 1.4), hull()), 0, -3.3, 0)
  const sw = wing(2.0, 1.0)
  sw.position.set(0, -3.9, 0)
  sw.rotation.z = 0.25
  g.add(sw)
  // 高增益天线
  put(g, new Mesh(new CylinderGeometry(0.32, 0.32, 0.06, 20), white()), 1.2, -3.7, 0.4).rotation.z = 0.6

  anchor(g, 'primary', 0, 0.55, 1.9)
  anchor(g, 'secondary', 0, 3.0, 0)
  anchor(g, 'sunshield', 3.5, -2.0, 0)
  anchor(g, 'bus', 0, -4.4, 0.9)
  return g
}

/* ---------------- 旅行者 1 号 ---------------- */

function buildVoyager(): Group {
  const g = new Group()

  // 高增益天线：抛物面（开口朝 +Y）+ 边框 + 馈源
  const profile: Vector2[] = []
  for (let i = 0; i <= 14; i++) {
    const rr = (i / 14) * 2.0
    profile.push(new Vector2(rr, rr * rr * 0.26))
  }
  const dish = put(g, new Mesh(new LatheGeometry(profile, 48), white()))
  ;(dish.material as MeshPhongMaterial).side = DoubleSide
  put(g, new Mesh(new TorusGeometry(2.0, 0.04, 8, 48), hull()), 0, 1.04, 0).rotation.x = Math.PI / 2
  put(g, rod(1.1, 0.04), 0, 0.75, 0)
  put(g, new Mesh(new ConeGeometry(0.16, 0.3, 12), dark()), 0, 1.35, 0)

  // 十面体总线
  const bus = put(g, new Mesh(new CylinderGeometry(0.85, 0.85, 0.45, 10), foil()), 0, -0.5, 0)
  bus.rotation.y = Math.PI / 10

  // RTG 桁杆（-X 方向 3 台同位素电源）
  const boom = put(g, rod(2.6, 0.05), -1.6, -0.6, 0)
  boom.rotation.z = Math.PI / 2
  for (let i = 0; i < 3; i++) {
    const rtg = put(g, new Mesh(new CylinderGeometry(0.2, 0.2, 0.62, 14), dark()), -1.9 - i * 0.68, -0.6, 0)
    rtg.rotation.z = Math.PI / 2
    put(g, new Mesh(new TorusGeometry(0.21, 0.03, 6, 16), hull()), -1.9 - i * 0.68, -0.6, 0).rotation.y = Math.PI / 2
  }

  // 科学平台（+X）：扫描平台与相机
  const sci = put(g, rod(1.5, 0.05), 1.2, -0.7, 0)
  sci.rotation.z = Math.PI / 2
  put(g, new Mesh(new BoxGeometry(0.6, 0.5, 0.5), hull()), 2.1, -0.75, 0)
  put(g, new Mesh(new CylinderGeometry(0.14, 0.14, 0.7, 12), dark()), 2.1, -0.75, 0.55).rotation.x = Math.PI / 2

  // 磁强计伸杆（真机 13 m，斜向后上）+ 两根等离子体波天线（张开成 V 形）
  link(g, [-0.6, -0.5, -0.4], [-4.2, 2.6, -3.0], 0.025)
  link(g, [0.3, -0.7, 0.3], [3.0, -1.4, 4.6], 0.025)
  link(g, [-0.3, -0.7, 0.3], [-3.0, -1.4, 4.6], 0.025)

  // 金唱片（挂在总线侧面）
  const record = put(g, new Mesh(new CircleGeometry(0.38, 32), gold()), 0.72, -0.5, 0.5)
  record.rotation.y = 0.7
  ;(record.material as MeshPhongMaterial).side = DoubleSide

  anchor(g, 'dish', 0, 1.7, 1.6)
  anchor(g, 'rtg', -3.6, -1.3, 0)
  anchor(g, 'boom', -3.6, 3.0, -3.6)
  anchor(g, 'record', 1.4, -0.9, 1.0)
  anchor(g, 'instruments', 2.6, -1.4, 0)
  return g
}

/* ---------------- 阿波罗登月舱 ---------------- */

function buildApolloLM(): Group {
  const g = new Group()

  // 下降级：八角柱 + 下降发动机
  const desc = put(g, new Mesh(new CylinderGeometry(1.75, 1.75, 0.9, 8), foil()), 0, -0.1, 0)
  desc.rotation.y = Math.PI / 8
  put(g, new Mesh(new ConeGeometry(0.55, 0.8, 18, 1, true), dark()), 0, -0.95, 0).rotation.x = Math.PI

  // 4 条着陆腿：主支柱 + 两根斜撑 + 圆盘足垫
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i * Math.PI) / 2
    const dx = Math.cos(a)
    const dz = Math.sin(a)
    const foot: [number, number, number] = [dx * 2.6, -1.5, dz * 2.6]
    link(g, [dx * 1.3, -0.35, dz * 1.3], foot, 0.075)
    // 斜撑：从下降级上沿撑到腿的中段
    const mid: [number, number, number] = [dx * 2.0, -0.95, dz * 2.0]
    link(g, [dx * 1.6 - dz * 0.5, 0.3, dz * 1.6 + dx * 0.5], mid, 0.04)
    link(g, [dx * 1.6 + dz * 0.5, 0.3, dz * 1.6 - dx * 0.5], mid, 0.04)
    put(g, new Mesh(new CylinderGeometry(0.36, 0.36, 0.1, 16), hull()), foot[0], foot[1], foot[2])
  }

  // 上升级：乘员舱 + 前窗 + 舱门 + 对接口
  const asc = put(g, new Mesh(new CylinderGeometry(1.15, 1.15, 1.05, 12), white()), 0, 0.9, 0)
  asc.rotation.y = Math.PI / 12
  const cabin = put(g, new Mesh(new BoxGeometry(1.5, 0.95, 0.7), white()), 0, 0.85, 1.1)
  cabin.rotation.x = 0
  for (const s of [1, -1]) {
    const win = put(g, new Mesh(new BoxGeometry(0.4, 0.32, 0.06), dark()), s * 0.38, 1.05, 1.46)
    win.rotation.x = -0.35
  }
  put(g, new Mesh(new BoxGeometry(0.55, 0.6, 0.06), dark()), 0, 0.55, 1.46)
  // 对接口 + 顶部舱盖
  put(g, new Mesh(new ConeGeometry(0.5, 0.45, 16, 1, true), hull()), 0, 1.62, 0)
  put(g, new Mesh(new CylinderGeometry(0.28, 0.28, 0.3, 16), white()), 0, 1.95, 0)
  // 姿控推进器（四组，每组 4 个）
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i * Math.PI) / 2
    const q = new Group()
    q.position.set(Math.cos(a) * 1.35, 1.35, Math.sin(a) * 1.35)
    for (const [ox, oy] of [[0.12, 0.1], [-0.12, 0.1], [0.12, -0.1], [-0.12, -0.1]]) {
      put(q, new Mesh(new ConeGeometry(0.07, 0.16, 8), dark()), ox, oy, 0)
    }
    g.add(q)
  }
  // 舷梯：从舱门下沿接到前腿足垫
  link(g, [0, 0.3, 1.45], [0.15, -1.35, 2.45], 0.035)
  link(g, [-0.3, 0.3, 1.45], [-0.15, -1.35, 2.45], 0.035)
  for (let i = 0; i < 6; i++) {
    const t = i / 6
    put(g, new Mesh(new BoxGeometry(0.45, 0.03, 0.05), hull()), -0.08, 0.3 - t * 1.6, 1.45 + t * 1.0)
  }

  anchor(g, 'ascent', 0, 2.3, 0)
  anchor(g, 'descent', 0, -0.1, 2.1)
  anchor(g, 'legs', 2.9, -1.9, 0)
  anchor(g, 'docking', 0, 1.6, -1.1)
  anchor(g, 'ladder', -1.3, -1.2, 2.2)
  return g
}

/* ---------------- 出口 ---------------- */

const BUILDERS: Record<string, () => Group> = {
  hubble: buildHubble,
  iss: buildISS,
  tiangong: buildTiangong,
  jwst: buildJWST,
  voyager1: buildVoyager,
  apolloLm: buildApolloLM,
}

/** 按 id 搭建模型；未知 id 返回空组 */
export function buildCraft(id: string): Group {
  return (BUILDERS[id] ?? (() => new Group()))()
}
