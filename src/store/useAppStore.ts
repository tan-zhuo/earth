import { create } from 'zustand'
import type { Country } from '../types'
import { getAllCountries } from '../services/countries'
import type { GdpEntry } from '../services/worldbank'
import { EXAGGERATION_DEFAULT } from '../data/terrain'

/**
 * 宇宙尺度阶梯（earth→moon→solar→galaxy→universe）
 * + 深入探索视图（earthStructure/mars）+ 航天器 3D 展厅（spacecraft）
 */
export type SpaceView =
  | 'earth'
  | 'moon'
  | 'solar'
  | 'galaxy'
  | 'universe'
  | 'earthStructure'
  | 'mars'
  | 'spacecraft'

export type EarthAppearance = 'day' | 'night' | 'real'
const APPEARANCES: EarthAppearance[] = ['day', 'night', 'real']

interface AppState {
  /** 地球外观：白天贴图 / 夜景灯光 / 按此刻真实太阳位置的昼夜光照 */
  earthAppearance: EarthAppearance
  setEarthAppearance: (mode: EarthAppearance) => void
  /** 当前尺度视图 */
  view: SpaceView
  countries: Country[]
  /** ccn3（ISO numeric）→ Country，供 GeoJSON feature.id 快速查找 */
  byCcn3: Map<string, Country>
  selected: Country | null
  autoRotate: boolean
  /** 3D 图层开关 */
  showGdpBars: boolean
  showFlags: boolean
  showSatellites: boolean
  /** 云层（白天/实时外观下显示，贴近地表时自动淡出） */
  showClouds: boolean
  /** 地名：选中国家的省级区划 + 按缩放逐级显示的城市 */
  showPlaces: boolean
  /** 全球 GDP 数据（ISO3 → 最新值），供柱状图使用 */
  gdpAll: Record<string, GdpEntry> | null
  /** 时间旅行（大陆漂移）模式 */
  timeTravel: boolean
  /** 当前时代索引（对应 PALEO_ERAS，0 为最古老） */
  eraIndex: number
  /** 排行榜面板 */
  showRankings: boolean
  /** 航线图层 */
  showRoutes: boolean
  /** 地形起伏（真实高程 + 海底地形）：顶点位移 + 山体阴影 */
  showTerrain: boolean
  /** 垂直夸张倍数（真实比例下山脉肉眼不可见） */
  exaggeration: number
  /** 高程着色：按海拔/水深上色，配合图例 */
  showElevationTint: boolean
  /** 指针所指位置的经纬度与高程（米，海洋为负），由地球视图节流写入 */
  cursor: { lat: number; lng: number; elevation: number } | null

  select: (c: Country | null) => void
  toggleAutoRotate: () => void
  toggleGdpBars: () => void
  toggleFlags: () => void
  toggleSatellites: () => void
  toggleClouds: () => void
  togglePlaces: () => void
  setGdpAll: (data: Record<string, GdpEntry>) => void
  toggleTimeTravel: () => void
  setEraIndex: (i: number) => void
  toggleRankings: () => void
  toggleRoutes: () => void
  toggleTerrain: () => void
  setExaggeration: (x: number) => void
  toggleElevationTint: () => void
  setCursor: (c: { lat: number; lng: number; elevation: number } | null) => void
  setView: (v: SpaceView) => void
  /** 航天器展厅当前展示的型号 */
  craftId: string
  setCraft: (id: string) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

// 国家数据是构建时静态化的，直接同步初始化
const countries = getAllCountries()

export const useAppStore = create<AppState>((set) => ({
  earthAppearance: (() => {
    try {
      const saved = localStorage.getItem('earth:appearance') as EarthAppearance | null
      return saved && APPEARANCES.includes(saved) ? saved : 'day'
    } catch { return 'day' }
  })(),
  setEarthAppearance: (mode) => {
    try { localStorage.setItem('earth:appearance', mode) } catch { /* Private browsing can disable storage. */ }
    set({ earthAppearance: mode })
  },
  view: 'earth',
  countries,
  byCcn3: new Map(countries.filter((c) => c.ccn3).map((c) => [c.ccn3, c])),
  selected: null,
  autoRotate: true,
  showGdpBars: false,
  showFlags: false,
  showSatellites: false,
  showClouds: true,
  showPlaces: true,
  gdpAll: null,
  timeTravel: false,
  eraIndex: 0,
  showRankings: false,
  showRoutes: false,
  showTerrain: true,
  exaggeration: EXAGGERATION_DEFAULT,
  showElevationTint: false,
  cursor: null,

  select: (c) => set({ selected: c }),
  toggleAutoRotate: () => set((s) => ({ autoRotate: !s.autoRotate })),
  toggleGdpBars: () => set((s) => ({ showGdpBars: !s.showGdpBars })),
  toggleFlags: () => set((s) => ({ showFlags: !s.showFlags })),
  toggleSatellites: () => set((s) => ({ showSatellites: !s.showSatellites })),
  toggleClouds: () => set((s) => ({ showClouds: !s.showClouds })),
  togglePlaces: () => set((s) => ({ showPlaces: !s.showPlaces })),
  setGdpAll: (data) => set({ gdpAll: data }),
  // 进入时间旅行：从最古老时代开始，并关闭已打开的国家详情
  toggleTimeTravel: () =>
    set((s) => ({ timeTravel: !s.timeTravel, eraIndex: 0, selected: null, showRankings: false })),
  setEraIndex: (i) => set({ eraIndex: i }),
  toggleRankings: () => set((s) => ({ showRankings: !s.showRankings })),
  toggleRoutes: () => set((s) => ({ showRoutes: !s.showRoutes })),
  toggleTerrain: () => set((s) => ({ showTerrain: !s.showTerrain })),
  setExaggeration: (x) => set({ exaggeration: x }),
  setCursor: (c) => set({ cursor: c }),
  // 高程着色需要地形数据，开启时顺带打开地形起伏
  toggleElevationTint: () =>
    set((s) => ({
      showElevationTint: !s.showElevationTint,
      showTerrain: s.showElevationTint ? s.showTerrain : true,
    })),
  // 切换尺度视图：离开地球时收起地球相关面板与模式
  setView: (v) =>
    set({ view: v, selected: null, showRankings: false, timeTravel: false, eraIndex: 0 }),
  craftId: 'hubble',
  // 从菜单直接点某台航天器：进入展厅并展示它
  setCraft: (id) =>
    set({
      craftId: id,
      view: 'spacecraft',
      selected: null,
      showRankings: false,
      timeTravel: false,
      eraIndex: 0,
    }),
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
