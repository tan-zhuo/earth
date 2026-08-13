/**
 * 宇宙尺度视图的静态数据（双语）：
 * 月球（含着陆点）、太阳系行星、银河系、可观测宇宙。
 * 行星贴图来自 Solar System Scope（CC BY 4.0），已自托管于 public/space/。
 */

export interface FactRow {
  labelZh: string
  labelEn: string
  valueZh: string
  valueEn: string
}

export interface SpaceFacts {
  titleZh: string
  titleEn: string
  subtitleZh: string
  subtitleEn: string
  rows: FactRow[]
  descZh: string
  descEn: string
  noteZh?: string
  noteEn?: string
}

/* ---------------- 月球 ---------------- */

export const MOON_FACTS: SpaceFacts = {
  titleZh: '月球',
  titleEn: 'The Moon',
  subtitleZh: '地球唯一的天然卫星 · 距离尺度 10⁸ m',
  subtitleEn: "Earth's only natural satellite · scale 10⁸ m",
  rows: [
    { labelZh: '平均距离', labelEn: 'Mean distance', valueZh: '384,400 公里', valueEn: '384,400 km' },
    { labelZh: '半径', labelEn: 'Radius', valueZh: '1,737 公里（地球的 27%）', valueEn: '1,737 km (27% of Earth)' },
    { labelZh: '表面重力', labelEn: 'Surface gravity', valueZh: '地球的 1/6', valueEn: '1/6 of Earth' },
    { labelZh: '公转周期', labelEn: 'Orbital period', valueZh: '27.3 天（潮汐锁定）', valueEn: '27.3 days (tidally locked)' },
    { labelZh: '表面温度', labelEn: 'Surface temp', valueZh: '-173°C ~ 127°C', valueEn: '-173°C to 127°C' },
  ],
  descZh: '月球因潮汐锁定永远以同一面朝向地球。它对地球的潮汐、自转轴稳定性至关重要。1969 年阿波罗 11 号实现人类首次登月，2019 年嫦娥四号实现人类首次月球背面软着陆。',
  descEn: 'Tidally locked, the Moon always shows Earth the same face. It stabilizes our planet\'s axial tilt and drives the tides. Apollo 11 achieved the first crewed landing in 1969; Chang\'e 4 made the first far-side soft landing in 2019.',
}

export interface MoonSite {
  nameZh: string
  nameEn: string
  lat: number
  lng: number
  yearLabel: string
}

export const MOON_SITES: MoonSite[] = [
  { nameZh: '阿波罗 11 号', nameEn: 'Apollo 11', lat: 0.674, lng: 23.473, yearLabel: '1969' },
  { nameZh: '阿波罗 12 号', nameEn: 'Apollo 12', lat: -3.01, lng: -23.42, yearLabel: '1969' },
  { nameZh: '阿波罗 14 号', nameEn: 'Apollo 14', lat: -3.65, lng: -17.47, yearLabel: '1971' },
  { nameZh: '阿波罗 15 号', nameEn: 'Apollo 15', lat: 26.13, lng: 3.63, yearLabel: '1971' },
  { nameZh: '阿波罗 16 号', nameEn: 'Apollo 16', lat: -8.97, lng: 15.5, yearLabel: '1972' },
  { nameZh: '阿波罗 17 号', nameEn: 'Apollo 17', lat: 20.19, lng: 30.77, yearLabel: '1972' },
  { nameZh: '月球 9 号', nameEn: 'Luna 9', lat: 7.08, lng: -64.37, yearLabel: '1966' },
  { nameZh: '嫦娥三号', nameEn: "Chang'e 3", lat: 44.12, lng: -19.51, yearLabel: '2013' },
  { nameZh: '嫦娥四号（背面）', nameEn: "Chang'e 4 (far side)", lat: -45.5, lng: 177.6, yearLabel: '2019' },
  { nameZh: '嫦娥五号', nameEn: "Chang'e 5", lat: 43.06, lng: -51.92, yearLabel: '2020' },
]

/* ---------------- 太阳系 ---------------- */

export interface PlanetDef {
  id: string
  nameZh: string
  nameEn: string
  texture: string
  /** 可视化半径（非真实比例） */
  vRadius: number
  /** 可视化轨道半径 */
  vDist: number
  /** 公转周期（年），用于动画角速度 */
  periodYears: number
  hasRing?: boolean
  facts: SpaceFacts
}

const AU = '天文单位'

function planetFacts(
  zh: string, en: string, sub: [string, string],
  diameter: string, distAu: string, period: [string, string], day: [string, string],
  moons: string, desc: [string, string],
): SpaceFacts {
  return {
    titleZh: zh, titleEn: en,
    subtitleZh: sub[0], subtitleEn: sub[1],
    rows: [
      { labelZh: '直径', labelEn: 'Diameter', valueZh: `${diameter} 公里`, valueEn: `${diameter} km` },
      { labelZh: '距太阳', labelEn: 'Distance from Sun', valueZh: `${distAu} ${AU}`, valueEn: `${distAu} AU` },
      { labelZh: '公转周期', labelEn: 'Orbital period', valueZh: period[0], valueEn: period[1] },
      { labelZh: '自转周期', labelEn: 'Day length', valueZh: day[0], valueEn: day[1] },
      { labelZh: '已知卫星', labelEn: 'Known moons', valueZh: moons, valueEn: moons },
    ],
    descZh: desc[0], descEn: desc[1],
  }
}

export const SUN_FACTS: SpaceFacts = {
  titleZh: '太阳',
  titleEn: 'The Sun',
  subtitleZh: 'G 型主序星 · 太阳系质量的 99.86%',
  subtitleEn: 'G-type main-sequence star · 99.86% of system mass',
  rows: [
    { labelZh: '直径', labelEn: 'Diameter', valueZh: '139.2 万公里（地球的 109 倍）', valueEn: '1.392M km (109× Earth)' },
    { labelZh: '表面温度', labelEn: 'Surface temp', valueZh: '约 5,500°C', valueEn: '~5,500°C' },
    { labelZh: '核心温度', labelEn: 'Core temp', valueZh: '约 1,500 万°C', valueEn: '~15M °C' },
    { labelZh: '年龄', labelEn: 'Age', valueZh: '约 46 亿年', valueEn: '~4.6 billion years' },
  ],
  descZh: '太阳通过核心的氢核聚变每秒将约 400 万吨物质转化为能量，是地球所有生命的能量之源。它还将燃烧约 50 亿年。',
  descEn: 'Fusing hydrogen in its core, the Sun converts ~4 million tonnes of matter into energy every second — the power source of all life on Earth. It has ~5 billion years of fuel left.',
}

export const PLANETS: PlanetDef[] = [
  {
    id: 'mercury', nameZh: '水星', nameEn: 'Mercury', texture: '/space/mercury.jpg',
    vRadius: 1.6, vDist: 34, periodYears: 0.24,
    facts: planetFacts('水星', 'Mercury', ['离太阳最近的行星', 'Closest planet to the Sun'],
      '4,879', '0.39', ['88 天', '88 days'], ['59 天', '59 days'], '0',
      ['昼夜温差超过 600°C，是太阳系温差最大的行星。表面布满陨石坑，形似月球。',
       'With day-night swings over 600°C, Mercury has the most extreme temperature range in the Solar System. Its cratered surface resembles the Moon.']),
  },
  {
    id: 'venus', nameZh: '金星', nameEn: 'Venus', texture: '/space/venus_atmosphere.jpg',
    vRadius: 2.4, vDist: 44, periodYears: 0.62,
    facts: planetFacts('金星', 'Venus', ['最热的行星 · 逆向自转', 'Hottest planet · retrograde rotation'],
      '12,104', '0.72', ['225 天', '225 days'], ['243 天（逆向）', '243 days (retrograde)'], '0',
      ['浓密的二氧化碳大气造成失控温室效应，表面温度高达 465°C，足以熔化铅。它的一天比一年还长。',
       'A runaway greenhouse effect under its dense CO₂ atmosphere keeps the surface at 465°C — hot enough to melt lead. Its day is longer than its year.']),
  },
  {
    id: 'earth', nameZh: '地球', nameEn: 'Earth', texture: '/textures/earth-blue-marble.jpg',
    vRadius: 2.5, vDist: 56, periodYears: 1,
    facts: planetFacts('地球', 'Earth', ['已知唯一存在生命的行星', 'The only known world with life'],
      '12,742', '1.00', ['365.25 天', '365.25 days'], ['23 小时 56 分', '23h 56m'], '1',
      ['表面 71% 被液态水覆盖，大气以氮氧为主。在"宜居带"的位置、磁场与月球的稳定作用共同造就了生命家园。',
       '71% covered by liquid water with a nitrogen-oxygen atmosphere. Its habitable-zone orbit, magnetic field and stabilizing Moon make it the home of life.']),
  },
  {
    id: 'mars', nameZh: '火星', nameEn: 'Mars', texture: '/space/mars.jpg',
    vRadius: 2.0, vDist: 70, periodYears: 1.88,
    facts: planetFacts('火星', 'Mars', ['红色行星 · 人类探测最多的行星', 'The Red Planet'],
      '6,779', '1.52', ['687 天', '687 days'], ['24 小时 37 分', '24h 37m'], '2',
      ['氧化铁让它呈现红色。拥有太阳系最高的火山（奥林帕斯山，21 公里）和最大的峡谷。远古火星曾有液态水，是寻找地外生命的首要目标。',
       'Iron oxide gives Mars its color. Home to the tallest volcano (Olympus Mons, 21 km) and a canyon system dwarfing the Grand Canyon. Ancient Mars had liquid water — making it the prime target in the search for past life.']),
  },
  {
    id: 'jupiter', nameZh: '木星', nameEn: 'Jupiter', texture: '/space/jupiter.jpg',
    vRadius: 7, vDist: 100, periodYears: 11.86,
    facts: planetFacts('木星', 'Jupiter', ['太阳系最大的行星', 'Largest planet in the Solar System'],
      '139,820', '5.20', ['11.9 年', '11.9 years'], ['9 小时 56 分', '9h 56m'], '95',
      ['质量是其他七大行星总和的 2.5 倍。大红斑是持续了数百年的巨型风暴。它强大的引力像"清道夫"一样保护着内行星。',
       '2.5× the mass of all other planets combined. The Great Red Spot is a storm raging for centuries. Its gravity shields the inner planets like a cosmic vacuum cleaner.']),
  },
  {
    id: 'saturn', nameZh: '土星', nameEn: 'Saturn', texture: '/space/saturn.jpg',
    vRadius: 6, vDist: 130, periodYears: 29.45, hasRing: true,
    facts: planetFacts('土星', 'Saturn', ['拥有壮丽光环的气态巨行星', 'The ringed gas giant'],
      '116,460', '9.58', ['29.5 年', '29.5 years'], ['10 小时 33 分', '10h 33m'], '274',
      ['光环由无数冰块与岩石碎片组成，宽度超过 28 万公里，厚度却只有约 10 米。密度比水低，理论上能浮在水面上。',
       'Its rings — countless ice and rock fragments — span over 280,000 km yet are only ~10 m thick. Saturn is less dense than water; it would float.']),
  },
  {
    id: 'uranus', nameZh: '天王星', nameEn: 'Uranus', texture: '/space/uranus.jpg',
    vRadius: 4, vDist: 160, periodYears: 84.02,
    facts: planetFacts('天王星', 'Uranus', ['躺着自转的冰巨星', 'The sideways ice giant'],
      '50,724', '19.2', ['84 年', '84 years'], ['17 小时 14 分（逆向）', '17h 14m (retrograde)'], '28',
      ['自转轴倾斜 98°，几乎是"躺着"绕太阳公转，可能源于远古的巨型撞击。大气中的甲烷让它呈现淡蓝绿色。',
       'Tilted 98°, Uranus essentially rolls around the Sun on its side — likely the scar of an ancient giant impact. Methane gives it its pale cyan hue.']),
  },
  {
    id: 'neptune', nameZh: '海王星', nameEn: 'Neptune', texture: '/space/neptune.jpg',
    vRadius: 4, vDist: 190, periodYears: 164.8,
    facts: planetFacts('海王星', 'Neptune', ['最遥远的行星 · 用数学发现', 'Farthest planet · found by math'],
      '49,244', '30.1', ['165 年', '165 years'], ['16 小时 6 分', '16h 6m'], '16',
      ['1846 年天文学家通过计算天王星轨道摄动"用笔尖"发现了它。风速高达 2,100 km/h，是太阳系最狂暴的行星。',
       'Discovered in 1846 by calculation from Uranus\'s orbital wobbles — found "with the point of a pen". Winds reach 2,100 km/h, the fastest in the Solar System.']),
  },
]

export const SOLAR_NOTE: [string, string] = [
  '行星大小与轨道距离经压缩处理，非真实比例。贴图 © Solar System Scope (CC BY 4.0)。',
  'Planet sizes and orbital distances are compressed, not to scale. Textures © Solar System Scope (CC BY 4.0).',
]

/* ---------------- 银河系 ---------------- */

export const GALAXY_FACTS: SpaceFacts = {
  titleZh: '银河系',
  titleEn: 'The Milky Way',
  subtitleZh: '棒旋星系 · 尺度 10²¹ m',
  subtitleEn: 'Barred spiral galaxy · scale 10²¹ m',
  rows: [
    { labelZh: '直径', labelEn: 'Diameter', valueZh: '约 10 万光年', valueEn: '~100,000 light-years' },
    { labelZh: '恒星数量', labelEn: 'Stars', valueZh: '1,000 ~ 4,000 亿颗', valueEn: '100–400 billion' },
    { labelZh: '中心黑洞', labelEn: 'Central black hole', valueZh: '人马座 A*（430 万倍太阳质量）', valueEn: 'Sagittarius A* (4.3M solar masses)' },
    { labelZh: '太阳的位置', labelEn: "Sun's position", valueZh: '猎户臂，距银心约 2.6 万光年', valueEn: 'Orion Arm, ~26,000 ly from center' },
    { labelZh: '银河年', labelEn: 'Galactic year', valueZh: '太阳绕银心一圈约 2.3 亿年', valueEn: 'Sun orbits center every ~230M years' },
  ],
  descZh: '夜空中的"银河"是我们从内部看到的银盘。太阳系诞生以来只绕银心转了约 20 圈。银河系正以每秒 110 公里的速度与仙女座星系接近，约 45 亿年后将开始碰撞合并。',
  descEn: 'The band of light in our night sky is this disk seen from within. Since its birth, the Solar System has completed only ~20 orbits. The Milky Way and Andromeda are closing at 110 km/s and will begin merging in ~4.5 billion years.',
  noteZh: '星系结构为程序化示意可视化。',
  noteEn: 'Galaxy structure is a procedural visualization.',
}

/* ---------------- 可观测宇宙 ---------------- */

export const UNIVERSE_FACTS: SpaceFacts = {
  titleZh: '可观测宇宙',
  titleEn: 'The Observable Universe',
  subtitleZh: '宇宙大尺度结构 · 尺度 10²⁷ m',
  subtitleEn: 'The cosmic web · scale 10²⁷ m',
  rows: [
    { labelZh: '直径', labelEn: 'Diameter', valueZh: '约 930 亿光年', valueEn: '~93 billion light-years' },
    { labelZh: '年龄', labelEn: 'Age', valueZh: '138 亿年', valueEn: '13.8 billion years' },
    { labelZh: '星系数量', labelEn: 'Galaxies', valueZh: '约 2 万亿个', valueEn: '~2 trillion' },
    { labelZh: '组成', labelEn: 'Composition', valueZh: '暗能量 68% · 暗物质 27% · 普通物质 5%', valueEn: 'Dark energy 68% · dark matter 27% · ordinary matter 5%' },
    { labelZh: '背景温度', labelEn: 'Background temp', valueZh: '2.7 K（宇宙微波背景）', valueEn: '2.7 K (cosmic microwave background)' },
  ],
  descZh: '在最大尺度上，星系并非均匀分布，而是沿"宇宙网"排列：星系团由纤维状结构连接，其间是巨大的空洞。你所见的每一个光点都代表一个包含千亿恒星的星系。因宇宙持续膨胀，可观测宇宙的边界正离我们越来越远。',
  descEn: 'At the largest scales galaxies trace the "cosmic web": clusters linked by filaments, separated by immense voids. Every point of light here represents a galaxy of hundreds of billions of stars. As space itself expands, the edge of what we can observe recedes ever farther.',
  noteZh: '宇宙网结构与星系标注位置均为示意可视化，非真实坐标。',
  noteEn: 'The cosmic web and galaxy label positions are schematic visualizations, not real coordinates.',
}
