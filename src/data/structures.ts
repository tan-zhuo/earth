/**
 * 行星内部构造与磁场可视化的静态数据（双语）：
 * 地球/火星的分层结构（半径为表面半径的百分比）、磁场类型与资料卡。
 */
import type { SpaceFacts } from './space'

export interface StructureLayer {
  key: string
  nameZh: string
  nameEn: string
  /** 外半径，表面 = 100 */
  rOuter: number
  color: string
}

export interface StructureConfig {
  layers: StructureLayer[] // 从外到内
  /** 最外层使用的表面贴图（可选） */
  surfaceTexture?: string
  /** 磁场类型：dipole 全球偶极场 / crustal 残余地壳磁场 */
  fieldType: 'dipole' | 'crustal'
}

/* ---------------- 地球 ---------------- */

export const EARTH_STRUCTURE: StructureConfig = {
  layers: [
    { key: 'crust', nameZh: '地壳', nameEn: 'Crust', rOuter: 100, color: '#64748b' },
    { key: 'upperMantle', nameZh: '上地幔', nameEn: 'Upper mantle', rOuter: 98.5, color: '#92400e' },
    { key: 'lowerMantle', nameZh: '下地幔', nameEn: 'Lower mantle', rOuter: 89.6, color: '#b91c1c' },
    { key: 'outerCore', nameZh: '外核（液态）', nameEn: 'Outer core (liquid)', rOuter: 54.6, color: '#f97316' },
    { key: 'innerCore', nameZh: '内核（固态）', nameEn: 'Inner core (solid)', rOuter: 19.2, color: '#fde68a' },
  ],
  surfaceTexture: '/textures/earth-blue-marble.jpg',
  fieldType: 'dipole',
}

export const EARTH_STRUCTURE_FACTS: SpaceFacts = {
  titleZh: '地球内部构造',
  titleEn: "Earth's Interior",
  subtitleZh: '由地震波研究揭示的分层结构',
  subtitleEn: 'Layered structure revealed by seismic waves',
  rows: [
    { labelZh: '地壳', labelEn: 'Crust', valueZh: '平均 17 km（海洋 5 · 大陆达 70）', valueEn: '~17 km avg (5 oceanic, up to 70 continental)' },
    { labelZh: '地幔', labelEn: 'Mantle', valueZh: '深至 2,890 km，硅酸盐岩', valueEn: 'To 2,890 km deep, silicate rock' },
    { labelZh: '外核', labelEn: 'Outer core', valueZh: '液态铁镍，2,890–5,150 km', valueEn: 'Liquid iron-nickel, 2,890–5,150 km' },
    { labelZh: '内核', labelEn: 'Inner core', valueZh: '固态铁镍球，半径 1,220 km', valueEn: 'Solid iron-nickel, 1,220 km radius' },
    { labelZh: '中心温度', labelEn: 'Core temperature', valueZh: '约 5,400°C（接近太阳表面）', valueEn: "~5,400°C (near the Sun's surface)" },
  ],
  descZh: '人类从未钻透地壳（最深钻孔仅 12.3 km），对内部的认识几乎全部来自地震波：纵波与横波在不同物质中的传播差异，勾勒出这幅分层图景。地幔的缓慢对流驱动着板块运动、地震与火山。',
  descEn: 'No drill has ever pierced the crust (deepest borehole: 12.3 km). Nearly everything we know comes from seismic waves — how P- and S-waves travel through different materials maps these layers. Slow mantle convection drives plate tectonics, earthquakes and volcanoes.',
  noteZh: '剖面比例真实，颜色为示意。拖动旋转查看。',
  noteEn: 'Layer proportions are to scale; colors are illustrative. Drag to rotate.',
}

export const EARTH_MAGNETIC_FACTS: SpaceFacts = {
  titleZh: '地球磁场',
  titleEn: "Earth's Magnetic Field",
  subtitleZh: '外核发电机产生的全球偶极场',
  subtitleEn: 'A global dipole powered by the core dynamo',
  rows: [
    { labelZh: '成因', labelEn: 'Origin', valueZh: '外核液态铁镍对流（地磁发电机）', valueEn: 'Convecting liquid iron in the outer core (geodynamo)' },
    { labelZh: '磁轴倾角', labelEn: 'Axis tilt', valueZh: '相对自转轴约 11°', valueEn: '~11° from the rotation axis' },
    { labelZh: '表面强度', labelEn: 'Surface strength', valueZh: '25–65 微特斯拉', valueEn: '25–65 microtesla' },
    { labelZh: '磁极漂移', labelEn: 'Pole drift', valueZh: '磁北极正以约 40 km/年 移向西伯利亚', valueEn: 'Magnetic north drifts ~40 km/yr toward Siberia' },
    { labelZh: '磁极倒转', labelEn: 'Reversals', valueZh: '地质史上多次，上次约 78 万年前', valueEn: 'Many in geologic history; last ~780,000 years ago' },
  ],
  descZh: '磁场在地球周围撑起"磁层"，偏转太阳风带电粒子——没有它，大气可能像火星一样被逐渐剥离。被磁场导引到两极的粒子撞击高层大气，就是极光。候鸟与海龟也依靠磁场导航。',
  descEn: 'The field inflates a magnetosphere that deflects the solar wind — without it, our atmosphere could be stripped away like Mars\'s. Particles funneled to the poles ignite the auroras. Migratory birds and sea turtles navigate by this field.',
  noteZh: '磁力线为偶极场示意，倾斜 11° 的磁轴以虚线标出。',
  noteEn: 'Field lines are a dipole schematic; the 11°-tilted magnetic axis is shown dashed.',
}

/* ---------------- 火星 ---------------- */

export const MARS_STRUCTURE: StructureConfig = {
  layers: [
    { key: 'crust', nameZh: '地壳', nameEn: 'Crust', rOuter: 100, color: '#9a3412' },
    { key: 'mantle', nameZh: '地幔', nameEn: 'Mantle', rOuter: 97, color: '#b45309' },
    { key: 'core', nameZh: '地核（液态）', nameEn: 'Core (liquid)', rOuter: 54, color: '#f59e0b' },
  ],
  surfaceTexture: '/space/mars.jpg',
  fieldType: 'crustal',
}

export const MARS_STRUCTURE_FACTS: SpaceFacts = {
  titleZh: '火星内部构造',
  titleEn: "Mars's Interior",
  subtitleZh: 'InSight 号火震数据揭示的分层',
  subtitleEn: 'Layers revealed by InSight marsquake data',
  rows: [
    { labelZh: '地壳', labelEn: 'Crust', valueZh: '平均约 24–72 km，比地球厚', valueEn: '~24–72 km, thicker than Earth\'s' },
    { labelZh: '地幔', labelEn: 'Mantle', valueZh: '硅酸盐岩，对流已基本停滞', valueEn: 'Silicate rock; convection has largely stalled' },
    { labelZh: '地核', labelEn: 'Core', valueZh: '液态铁镍硫，半径约 1,830 km', valueEn: 'Liquid iron-nickel-sulfur, ~1,830 km radius' },
    { labelZh: '探测方式', labelEn: 'How we know', valueZh: 'InSight 号记录了 1,300+ 次火震', valueEn: 'InSight recorded 1,300+ marsquakes' },
  ],
  descZh: '2018–2022 年，InSight 号的地震仪首次"透视"了另一颗行星的内部：火星地核比预想的大而轻，仍是液态；但地幔对流太弱，无法再驱动发电机与板块运动。',
  descEn: "From 2018–2022, InSight's seismometer gave us the first look inside another planet: Mars's core is larger and lighter than expected, and still liquid — but mantle convection is too feeble to power a dynamo or plate tectonics.",
  noteZh: '剖面比例基于 InSight 测量，颜色为示意。',
  noteEn: 'Proportions based on InSight measurements; colors illustrative.',
}

export const MARS_MAGNETIC_FACTS: SpaceFacts = {
  titleZh: '火星磁场',
  titleEn: "Mars's Magnetic Field",
  subtitleZh: '发电机已熄灭 · 只剩地壳"化石磁场"',
  subtitleEn: 'A dead dynamo · only crustal "fossil magnetism" remains',
  rows: [
    { labelZh: '现状', labelEn: 'Today', valueZh: '无全球磁场', valueEn: 'No global magnetic field' },
    { labelZh: '残余磁场', labelEn: 'Remnant field', valueZh: '南半球古老地壳中的磁化条带', valueEn: 'Magnetized stripes in the ancient southern crust' },
    { labelZh: '发电机熄灭', labelEn: 'Dynamo died', valueZh: '约 40 亿年前', valueEn: '~4 billion years ago' },
    { labelZh: '后果', labelEn: 'Consequence', valueZh: '太阳风剥离大气，火星变冷变干', valueEn: 'Solar wind stripped the atmosphere; Mars turned cold and dry' },
  ],
  descZh: '远古火星曾像地球一样拥有全球磁场与浓密大气，表面有液态水流淌。发电机熄灭后，太阳风在数亿年间将大气层剥离殆尽——这正是"磁场保护生命"最深刻的反面教材。MAVEN 探测器至今仍在测量这场持续的大气流失。',
  descEn: "Ancient Mars once had a global field, a thick atmosphere, and liquid water. When its dynamo died, the solar wind stripped the air away over hundreds of millions of years — the starkest lesson in how magnetic fields shelter life. NASA's MAVEN still measures this ongoing escape today.",
  noteZh: '南半球的弧线为残余地壳磁场示意。',
  noteEn: 'Southern arcs depict remnant crustal magnetism (schematic).',
}

export const MARS_SURFACE_FACTS: SpaceFacts = {
  titleZh: '火星',
  titleEn: 'Mars',
  subtitleZh: '红色行星 · 标注历史着陆点',
  subtitleEn: 'The Red Planet · historic landing sites marked',
  rows: [
    { labelZh: '直径', labelEn: 'Diameter', valueZh: '6,779 公里（地球的 53%）', valueEn: '6,779 km (53% of Earth)' },
    { labelZh: '表面重力', labelEn: 'Surface gravity', valueZh: '地球的 38%', valueEn: '38% of Earth' },
    { labelZh: '一天', labelEn: 'Day length', valueZh: '24 小时 37 分', valueEn: '24h 37m' },
    { labelZh: '平均温度', labelEn: 'Mean temp', valueZh: '-63°C', valueEn: '-63°C' },
    { labelZh: '最高峰', labelEn: 'Highest peak', valueZh: '奥林帕斯山 21 km（太阳系之最）', valueEn: 'Olympus Mons, 21 km (tallest in the Solar System)' },
  ],
  descZh: '自 1976 年海盗 1 号成功着陆以来，人类已有十余个探测器抵达火星表面。2021 年祝融号使中国成为第二个成功巡视火星的国家。切换到"内部结构"与"磁场"看看这颗行星的内在。',
  descEn: 'Since Viking 1 in 1976, more than a dozen craft have reached the Martian surface. In 2021 Zhurong made China the second nation to rove Mars. Switch to "Interior" and "Magnetic field" to look inside the planet.',
}

export interface MarsSite {
  nameZh: string
  nameEn: string
  lat: number
  lng: number
  yearLabel: string
}

export const MARS_SITES: MarsSite[] = [
  { nameZh: '海盗 1 号', nameEn: 'Viking 1', lat: 22.48, lng: -49.97, yearLabel: '1976' },
  { nameZh: '海盗 2 号', nameEn: 'Viking 2', lat: 47.97, lng: 134.26, yearLabel: '1976' },
  { nameZh: '探路者号', nameEn: 'Pathfinder', lat: 19.13, lng: -33.22, yearLabel: '1997' },
  { nameZh: '勇气号', nameEn: 'Spirit', lat: -14.57, lng: 175.47, yearLabel: '2004' },
  { nameZh: '机遇号', nameEn: 'Opportunity', lat: -1.95, lng: -5.53, yearLabel: '2004' },
  { nameZh: '好奇号', nameEn: 'Curiosity', lat: -4.59, lng: 137.44, yearLabel: '2012' },
  { nameZh: '洞察号', nameEn: 'InSight', lat: 4.5, lng: 135.62, yearLabel: '2018' },
  { nameZh: '毅力号', nameEn: 'Perseverance', lat: 18.44, lng: 77.45, yearLabel: '2021' },
  { nameZh: '祝融号', nameEn: 'Zhurong', lat: 25.07, lng: 109.93, yearLabel: '2021' },
]
