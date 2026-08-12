import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './locales/en'
import zh from './locales/zh'

// 检测顺序：localStorage（记住用户选择）→ 浏览器语言；默认英文
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en, zh },
    fallbackLng: 'en',
    supportedLngs: ['en', 'zh'],
    nonExplicitSupportedLngs: true, // zh-CN / zh-TW → zh
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'earth:lang',
    },
    interpolation: { escapeValue: false },
  })

export default i18n
