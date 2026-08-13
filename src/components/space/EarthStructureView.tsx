import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import StructureScene from './StructureScene'
import FactCard from './FactCard'
import { EARTH_STRUCTURE, EARTH_STRUCTURE_FACTS, EARTH_MAGNETIC_FACTS } from '../../data/structures'

type Mode = 'structure' | 'magnetic'

/** 地球内部视图：剖面分层 / 磁场两种模式 */
export default function EarthStructureView() {
  const { t } = useTranslation()
  const [mode, setMode] = useState<Mode>('structure')

  return (
    <>
      <StructureScene config={EARTH_STRUCTURE} showField={mode === 'magnetic'} />
      <FactCard facts={mode === 'structure' ? EARTH_STRUCTURE_FACTS : EARTH_MAGNETIC_FACTS} />

      {/* 模式切换 */}
      <div className="fixed inset-x-0 bottom-6 z-20 flex justify-center">
        <div className="flex overflow-hidden rounded-full border border-slate-700/60 bg-slate-900/80 backdrop-blur">
          {(['structure', 'magnetic'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 text-xs font-medium transition ${
                mode === m ? 'bg-sky-500/15 text-sky-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t(`structureModes.${m}`)}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
