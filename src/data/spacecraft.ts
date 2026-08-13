/**
 * 人类航天器标注数据（双语）：
 * 地球轨道航天器/星座（轨道参数真实，动画加速播放）+ 深空探测器（方向示意 + 真实距离）。
 */

export interface SatConstellation {
  id: string
  nameZh: string
  nameEn: string
  /** 轨道高度 km */
  altKm: number
  /** 轨道倾角（度） */
  incDeg: number
  /** 轨道周期（分钟） */
  periodMin: number
  /** 轨道面数量 */
  planes: number
  /** 每个轨道面的卫星数 */
  satsPerPlane: number
  /** 首个轨道面升交点经度（度），错开各星座 */
  node0: number
  color: string
  /** 轨道环透明度 */
  ringOpacity: number
}

export const EARTH_SATELLITES: SatConstellation[] = [
  { id: 'iss', nameZh: '国际空间站', nameEn: 'ISS', altKm: 420, incDeg: 51.6, periodMin: 92, planes: 1, satsPerPlane: 1, node0: 0, color: '#facc15', ringOpacity: 0.3 },
  { id: 'tiangong', nameZh: '天宫空间站', nameEn: 'Tiangong', altKm: 390, incDeg: 41.5, periodMin: 92, planes: 1, satsPerPlane: 1, node0: 130, color: '#f87171', ringOpacity: 0.3 },
  { id: 'hubble', nameZh: '哈勃望远镜', nameEn: 'Hubble', altKm: 540, incDeg: 28.5, periodMin: 95, planes: 1, satsPerPlane: 1, node0: 250, color: '#a78bfa', ringOpacity: 0.3 },
  { id: 'starlink', nameZh: '星链星座（7,000+ 颗 · 示意 60 颗）', nameEn: 'Starlink (7,000+ sats · 60 shown)', altKm: 550, incDeg: 53, periodMin: 95, planes: 6, satsPerPlane: 10, node0: 15, color: '#94a3b8', ringOpacity: 0.07 },
  { id: 'gps', nameZh: 'GPS 星座（31 颗在轨 · 6 轨道面）', nameEn: 'GPS constellation (31 in orbit · 6 planes)', altKm: 20200, incDeg: 55, periodMin: 718, planes: 6, satsPerPlane: 4, node0: 20, color: '#34d399', ringOpacity: 0.15 },
  { id: 'beidou', nameZh: '北斗星座（45 颗在轨 · MEO 示意）', nameEn: 'BeiDou constellation (45 in orbit · MEO shown)', altKm: 21500, incDeg: 55, periodMin: 773, planes: 3, satsPerPlane: 8, node0: 90, color: '#fb923c', ringOpacity: 0.15 },
  { id: 'geo', nameZh: '静止轨道卫星带（35,786 km）', nameEn: 'Geostationary belt (35,786 km)', altKm: 35786, incDeg: 0, periodMin: 1436, planes: 1, satsPerPlane: 14, node0: 0, color: '#38bdf8', ringOpacity: 0.28 },
]

export interface DeepSpaceProbe {
  id: string
  nameZh: string
  nameEn: string
  /** 标签附加信息（真实距离/状态） */
  tagZh: string
  tagEn: string
  /** 可视化位置（方向示意，长度压缩） */
  pos: [number, number, number]
}

export const DEEP_SPACE_PROBES: DeepSpaceProbe[] = [
  { id: 'voyager1', nameZh: '旅行者 1 号', nameEn: 'Voyager 1', tagZh: '约 168 AU · 已进入星际空间', tagEn: '~168 AU · in interstellar space', pos: [155, 175, -205] },
  { id: 'voyager2', nameZh: '旅行者 2 号', nameEn: 'Voyager 2', tagZh: '约 141 AU · 已进入星际空间', tagEn: '~141 AU · in interstellar space', pos: [-170, -140, 175] },
  { id: 'pioneer10', nameZh: '先驱者 10 号', nameEn: 'Pioneer 10', tagZh: '约 140 AU · 已失联', tagEn: '~140 AU · contact lost', pos: [250, 15, 120] },
  { id: 'newhorizons', nameZh: '新视野号', nameEn: 'New Horizons', tagZh: '约 62 AU · 飞越冥王星后', tagEn: '~62 AU · beyond Pluto', pos: [-185, 25, -145] },
  { id: 'parker', nameZh: '帕克太阳探测器', nameEn: 'Parker Solar Probe', tagZh: '近日轨道 · 最接近太阳的人造物', tagEn: 'closest human object to the Sun', pos: [21, 2, 12] },
]
