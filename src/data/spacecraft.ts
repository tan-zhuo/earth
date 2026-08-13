/**
 * 人类航天器标注数据（双语）：
 * 地球轨道知名卫星（轨道参数真实，动画加速播放）+ 深空探测器（方向示意 + 真实距离）。
 */

export interface EarthSatellite {
  id: string
  nameZh: string
  nameEn: string
  /** 轨道高度 km */
  altKm: number
  /** 轨道倾角（度） */
  incDeg: number
  /** 轨道周期（分钟） */
  periodMin: number
  /** 升交点经度偏移（度），错开各轨道相位 */
  node: number
  color: string
}

export const EARTH_SATELLITES: EarthSatellite[] = [
  { id: 'iss', nameZh: '国际空间站', nameEn: 'ISS', altKm: 420, incDeg: 51.6, periodMin: 92, node: 0, color: '#facc15' },
  { id: 'tiangong', nameZh: '天宫空间站', nameEn: 'Tiangong', altKm: 390, incDeg: 41.5, periodMin: 92, node: 130, color: '#f87171' },
  { id: 'hubble', nameZh: '哈勃望远镜', nameEn: 'Hubble', altKm: 540, incDeg: 28.5, periodMin: 95, node: 250, color: '#a78bfa' },
  { id: 'gps', nameZh: 'GPS 卫星（20,200 km）', nameEn: 'GPS satellite (20,200 km)', altKm: 20200, incDeg: 55, periodMin: 718, node: 40, color: '#34d399' },
  { id: 'geo', nameZh: '静止轨道卫星（35,786 km）', nameEn: 'Geostationary (35,786 km)', altKm: 35786, incDeg: 0, periodMin: 1436, node: 0, color: '#38bdf8' },
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
