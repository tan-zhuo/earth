import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../store/useAppStore'
import { PALEO_ERAS } from '../data/paleoEras'

const PLAY_INTERVAL = 1800 // 自动播放每个时代停留毫秒数

export default function TimeTravelBar() {
  const { t, i18n } = useTranslation()
  const timeTravel = useAppStore((s) => s.timeTravel)
  const eraIndex = useAppStore((s) => s.eraIndex)
  const setEraIndex = useAppStore((s) => s.setEraIndex)
  const [playing, setPlaying] = useState(false)

  const zh = i18n.language.startsWith('zh')

  // 进入模式时预加载全部时代贴图，保证拖动/播放流畅
  useEffect(() => {
    if (!timeTravel) {
      setPlaying(false)
      return
    }
    for (const era of PALEO_ERAS) {
      if (era.ma > 0) new Image().src = `/paleo/${era.ma}.jpg`
    }
  }, [timeTravel])

  // 自动播放：按时代逐步推进到现代
  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => {
      const { eraIndex: i, setEraIndex: set } = useAppStore.getState()
      if (i >= PALEO_ERAS.length - 1) setPlaying(false)
      else set(i + 1)
    }, PLAY_INTERVAL)
    return () => window.clearInterval(id)
  }, [playing])

  if (!timeTravel) return null

  const era = PALEO_ERAS[eraIndex]
  const atEnd = eraIndex >= PALEO_ERAS.length - 1

  const handlePlay = () => {
    if (playing) {
      setPlaying(false)
      return
    }
    if (atEnd) setEraIndex(0) // 已在现代：从最古老重新播放
    setPlaying(true)
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 flex justify-center p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-700/50 bg-slate-900/85 p-4 backdrop-blur-xl">
        {/* 时代信息 */}
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <div>
            <span className="text-lg font-bold text-slate-100">{zh ? era.nameZh : era.nameEn}</span>
            <span className="ml-2 text-xs text-sky-400">
              {era.ma > 0 ? `${era.ma} ${t('timeTravelMa')}` : t('timeTravelNow')}
            </span>
          </div>
          <button
            onClick={handlePlay}
            className="shrink-0 rounded-lg border border-sky-500/70 bg-sky-500/10 px-4 py-1.5 text-xs font-medium text-sky-300 transition hover:bg-sky-500/20"
          >
            {playing ? t('timeTravelPause') : t('timeTravelPlay')}
          </button>
        </div>
        <p className="mb-3 text-xs text-slate-400">{zh ? era.descZh : era.descEn}</p>

        {/* 时间轴滑块：左端最古老，右端现代 */}
        <input
          type="range"
          min={0}
          max={PALEO_ERAS.length - 1}
          step={1}
          value={eraIndex}
          onChange={(e) => {
            setPlaying(false)
            setEraIndex(Number(e.target.value))
          }}
          className="w-full accent-sky-400"
          aria-label="Geological time"
        />
        <div className="mt-1 flex justify-between text-[10px] text-slate-500">
          <span>750 {t('timeTravelMa')}</span>
          <span>{t('timeTravelNow')}</span>
        </div>

        {/* 数据来源署名 */}
        <p className="mt-2 text-right text-[10px] text-slate-600">
          Paleogeographic maps © C.R. Scotese, PALEOMAP Project
        </p>
      </div>
    </div>
  )
}
