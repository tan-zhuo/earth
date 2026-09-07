import { useTranslation } from 'react-i18next'
import { useAppStore } from '../store/useAppStore'
import Icon from './Icon'

export default function EarthAppearance() {
  const { i18n } = useTranslation()
  const zh = i18n.language.startsWith('zh')
  const mode = useAppStore(s => s.earthAppearance)
  const setMode = useAppStore(s => s.setEarthAppearance)
  const timeTravel = useAppStore(s => s.timeTravel)
  if (timeTravel) return null
  return <div className="earth-appearance" role="group" aria-label={zh ? '地球外观' : 'Earth appearance'}>
    {(['day', 'night'] as const).map(value => <button key={value} aria-pressed={mode === value} onClick={() => setMode(value)}>
      <Icon name={value === 'day' ? 'sun' : 'moon'} size={16} />{value === 'day' ? (zh ? '白天' : 'Day') : (zh ? '夜间' : 'Night')}
    </button>)}
  </div>
}
