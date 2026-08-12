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

  select: (c: Country | null) => void
  toggleAutoRotate: () => void
  toggleGdpBars: () => void
  toggleFlags: () => void
  setGdpAll: (data: Record<string, GdpEntry>) => void
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

  select: (c) => set({ selected: c }),
  toggleAutoRotate: () => set((s) => ({ autoRotate: !s.autoRotate })),
  toggleGdpBars: () => set((s) => ({ showGdpBars: !s.showGdpBars })),
  toggleFlags: () => set((s) => ({ showFlags: !s.showFlags })),
  setGdpAll: (data) => set({ gdpAll: data }),
}))
