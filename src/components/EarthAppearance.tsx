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
    {(['day', 'night', 'real'] as const).map(value => <button key={value} aria-pressed={mode === value} onClick={() => setMode(value)}
      title={value === 'real' ? pick(i18n.language, '按此刻真实的太阳位置照亮地球，背光面亮起城市灯光', 'Lit by the real Sun right now, with city lights on the night side', '現在の太陽の位置で照らし、夜側には街の明かり', 'Освещение по реальному положению Солнца сейчас, огни городов на ночной стороне') : undefined}>
      <Icon name={value === 'day' ? 'sun' : value === 'night' ? 'moon' : 'earth'} size={16} />
      {value === 'day' ? pick(i18n.language, '白天', 'Day', '昼', 'День') : value === 'night' ? pick(i18n.language, '夜间', 'Night', '夜', 'Ночь') : pick(i18n.language, '实时', 'Live', 'リアル', 'Сейчас')}
    </button>)}
  </div>
}
