import { create } from 'zustand'
import type { Country } from '../types'
import { getAllCountries } from '../services/countries'

interface AppState {
  countries: Country[]
  /** ccn3（ISO numeric）→ Country，供 GeoJSON feature.id 快速查找 */
  byCcn3: Map<string, Country>
  selected: Country | null
  autoRotate: boolean

  select: (c: Country | null) => void
  toggleAutoRotate: () => void
}

// 国家数据是构建时静态化的，直接同步初始化
const countries = getAllCountries()

export const useAppStore = create<AppState>((set) => ({
  countries,
  byCcn3: new Map(countries.filter((c) => c.ccn3).map((c) => [c.ccn3, c])),
  selected: null,
  autoRotate: true,

  select: (c) => set({ selected: c }),
  toggleAutoRotate: () => set((s) => ({ autoRotate: !s.autoRotate })),
}))
