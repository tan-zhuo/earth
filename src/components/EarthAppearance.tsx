import { useTranslation } from 'react-i18next'
import { useAppStore } from '../store/useAppStore'
import Icon from './Icon'
import { pick } from '../i18n/pick'

export default function EarthAppearance() {
  const { i18n } = useTranslation()
  const mode = useAppStore(s => s.earthAppearance)
  const setMode = useAppStore(s => s.setEarthAppearance)
  const timeTravel = useAppStore(s => s.timeTravel)
  if (timeTravel) return null
  return <div className="earth-appearance" role="group" aria-label={pick(i18n.language, '地球外观', 'Earth appearance', '地球の外観', 'Вид Земли')}>
    {(['day', 'night'] as const).map(value => <button key={value} aria-pressed={mode === value} onClick={() => setMode(value)}>
      <Icon name={value === 'day' ? 'sun' : 'moon'} size={16} />{value === 'day' ? pick(i18n.language, '白天', 'Day', '昼', 'День') : pick(i18n.language, '夜间', 'Night', '夜', 'Ночь')}
    </button>)}
  </div>
}
