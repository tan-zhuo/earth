import { create } from 'zustand'
import type { Country } from '../types'
import { getAllCountries } from '../services/countries'
import type { GdpEntry } from '../services/worldbank'

interface AppState {
  countries: Country[]
  /** ccn3（ISO numeric）→ Country，供 GeoJSON feature.id 快速查找 */
  byCcn3: Map<string, Country>
  selected: Country | null
  autoRotate: boolean
  /** 3D 图层开关 */
  showGdpBars: boolean
  showFlags: boolean
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

  select: (c: Country | null) => void
  toggleAutoRotate: () => void
  toggleGdpBars: () => void
  toggleFlags: () => void
  setGdpAll: (data: Record<string, GdpEntry>) => void
  toggleTimeTravel: () => void
  setEraIndex: (i: number) => void
  toggleRankings: () => void
  toggleRoutes: () => void
}

// 国家数据是构建时静态化的，直接同步初始化
const countries = getAllCountries()

export const useAppStore = create<AppState>((set) => ({
  countries,
  byCcn3: new Map(countries.filter((c) => c.ccn3).map((c) => [c.ccn3, c])),
  selected: null,
  autoRotate: true,
  showGdpBars: true,
  showFlags: true,
  gdpAll: null,
  timeTravel: false,
  eraIndex: 0,
  showRankings: false,
  showRoutes: false,

  select: (c) => set({ selected: c }),
  toggleAutoRotate: () => set((s) => ({ autoRotate: !s.autoRotate })),
  toggleGdpBars: () => set((s) => ({ showGdpBars: !s.showGdpBars })),
  toggleFlags: () => set((s) => ({ showFlags: !s.showFlags })),
  setGdpAll: (data) => set({ gdpAll: data }),
  // 进入时间旅行：从最古老时代开始，并关闭已打开的国家详情
  toggleTimeTravel: () =>
    set((s) => ({ timeTravel: !s.timeTravel, eraIndex: 0, selected: null, showRankings: false })),
  setEraIndex: (i) => set({ eraIndex: i }),
  toggleRankings: () => set((s) => ({ showRankings: !s.showRankings })),
  toggleRoutes: () => set((s) => ({ showRoutes: !s.showRoutes })),
}))
