import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../store/useAppStore'
import { elevationCss, byteToMeters } from '../data/terrain'

/** 色带两端对应高程贴图的编码范围（byte 0 ~ 255） */
const MIN_M = byteToMeters(0)
const MAX_M = byteToMeters(255)
const posOf = (m: number) => ((m - MIN_M) / (MAX_M - MIN_M)) * 100

/** 图例刻度（米）：海沟、深海、海平面、高原 */
const TICKS = [-10000, -5000, 0, 5000]

/** 经纬度读数：31.2°N 103.4°E */
function formatCoords(lat: number, lng: number) {
  return `${Math.abs(lat).toFixed(1)}°${lat >= 0 ? 'N' : 'S'} ${Math.abs(lng).toFixed(1)}°${lng >= 0 ? 'E' : 'W'}`
}

/**
 * 地形 HUD：指针所指位置的海拔/水深读数 + 高程色带图例。
 * 只在地球视图开启地形起伏时出现（时间旅行的古地图没有对应高程数据）。
 */
export default function TerrainPanel() {
  const { t, i18n } = useTranslation()
  const view = useAppStore((s) => s.view)
  const timeTravel = useAppStore((s) => s.timeTravel)
  const showTerrain = useAppStore((s) => s.showTerrain)
  const showElevationTint = useAppStore((s) => s.showElevationTint)
  const exaggeration = useAppStore((s) => s.exaggeration)
  const cursor = useAppStore((s) => s.cursor)

  // 色带与着色器共用同一套配色，采样出 CSS 渐变（海平面处保留硬边）
  const gradient = useMemo(() => {
    const stops: string[] = []
    for (let b = 0; b <= 255; b += 5) {
      const m = byteToMeters(b)
      stops.push(`${elevationCss(m)} ${posOf(m).toFixed(2)}%`)
    }
    stops.push(`${elevationCss(-1)} ${posOf(0).toFixed(2)}%`, `${elevationCss(0)} ${posOf(0).toFixed(2)}%`)
    stops.sort((a, b) => parseFloat(a.split(' ')[1]) - parseFloat(b.split(' ')[1]))
    return `linear-gradient(to right, ${stops.join(',')})`
  }, [])

  if (view !== 'earth' || timeTravel || !showTerrain) return null

  const meters = cursor ? Math.round(cursor.elevation) : null

  return (
    <div className="pointer-events-none fixed bottom-12 left-4 z-10 w-56 rounded-xl border border-slate-700/50 bg-slate-900/80 px-3 py-2 backdrop-blur-md">
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
          {t('sections.terrain')}
        </span>
        <span className="text-[10px] text-slate-500">×{exaggeration}</span>
      </div>

      {meters == null ? (
        <p className="mt-1 text-xs text-slate-500">{t('terrain.hint')}</p>
      ) : (
        <div className="mt-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[11px] text-slate-400">
              {meters >= 0 ? t('terrain.elevation') : t('terrain.depth')}
            </span>
            <span
              className="font-mono text-lg leading-none font-semibold"
              style={{ color: elevationCss(cursor!.elevation) }}
            >
              {Math.abs(meters).toLocaleString(i18n.language)}
            </span>
            <span className="text-[11px] text-slate-400">m</span>
          </div>
          <p className="mt-0.5 font-mono text-[10px] text-slate-500">
            {formatCoords(cursor!.lat, cursor!.lng)}
          </p>
        </div>
      )}

      {showElevationTint && (
        <div className="mt-2">
          <div className="h-2 rounded-sm border border-slate-700/60" style={{ background: gradient }} />
          <div className="relative mt-0.5 h-3">
            {TICKS.map((m) => (
              <span
                key={m}
                className="absolute -translate-x-1/2 text-[9px] whitespace-nowrap text-slate-500"
                style={{ left: `${posOf(m)}%` }}
              >
                {m === 0 ? '0' : `${m / 1000}k`}
              </span>
            ))}
          </div>
          <p className="mt-0.5 text-[9px] text-slate-600">{t('terrain.source')}</p>
        </div>
      )}
    </div>
  )
}
