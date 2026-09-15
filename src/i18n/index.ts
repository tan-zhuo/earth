import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './locales/en'
import zh from './locales/zh'
import ja from './locales/ja'
import ru from './locales/ru'

/** 界面可选语言（按钮上显示各自的本语名称） */
export const LANGUAGES = [
  { code: 'zh', label: '中文' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'ru', label: 'Русский' },
] as const

// 检测顺序：localStorage（记住用户选择）→ 浏览器语言；默认英文
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en, zh, ja, ru },
    fallbackLng: 'en',
    supportedLngs: LANGUAGES.map(l => l.code),
    nonExplicitSupportedLngs: true, // zh-CN / zh-TW → zh, ja-JP → ja, ru-RU → ru
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'earth:lang',
    },
    interpolation: { escapeValue: false },
  })

export default i18n
