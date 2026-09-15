/** 界面语言代码（与 i18n/index.ts 的 LANGUAGES 一致） */
export type Lang = 'zh' | 'en' | 'ja' | 'ru'

export function langOf(language: string): Lang {
  if (language.startsWith('zh')) return 'zh'
  if (language.startsWith('ja')) return 'ja'
  if (language.startsWith('ru')) return 'ru'
  return 'en'
}

type Suffix = 'Zh' | 'En' | 'Ja' | 'Ru'
const SUFFIX: Record<Lang, Suffix> = { zh: 'Zh', en: 'En', ja: 'Ja', ru: 'Ru' }

/** 四语文本选择：缺少日/俄时回退英文 */
export function pick<T>(language: string, zh: T, en: T, ja?: T, ru?: T): T {
  const l = langOf(language)
  return l === 'zh' ? zh : l === 'ja' ? (ja ?? en) : l === 'ru' ? (ru ?? en) : en
}

/**
 * 读取对象上的多语言字段：tr(item, 'name', lang) → item.nameJa / nameRu / nameZh / nameEn，
 * 缺失时回退英文。
 */
export function tr<K extends string, O extends Partial<Record<`${K}${Suffix}`, unknown>>>(
  obj: O,
  key: K,
  language: string,
): NonNullable<O[`${K}En` & keyof O]> {
  const record = obj as Record<string, unknown>
  const value = record[`${key}${SUFFIX[langOf(language)]}`]
  return (value ?? record[`${key}En`]) as NonNullable<O[`${K}En` & keyof O]>
}
