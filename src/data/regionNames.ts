import { pick } from '../i18n/pick'

/** 大洲 / 次区域名称译名（数据集的 region、subregion 只有英文），顺序：中、日、俄 */
export const regionNames: Record<string, [string, string, string]> = {
  Africa: ['非洲', 'アフリカ', 'Африка'],
  Americas: ['美洲', 'アメリカ大陸', 'Америка'],
  Asia: ['亚洲', 'アジア', 'Азия'],
  Europe: ['欧洲', 'ヨーロッパ', 'Европа'],
  Oceania: ['大洋洲', 'オセアニア', 'Океания'],
  Antarctic: ['南极洲', '南極', 'Антарктика'],
  Caribbean: ['加勒比地区', 'カリブ海地域', 'Карибский бассейн'],
  'Southern Asia': ['南亚', '南アジア', 'Южная Азия'],
  'Middle Africa': ['中部非洲', '中部アフリカ', 'Центральная Африка'],
  'Northern Europe': ['北欧', '北ヨーロッパ', 'Северная Европа'],
  'Southeast Europe': ['东南欧', '東南ヨーロッパ', 'Юго-Восточная Европа'],
  'Southern Europe': ['南欧', '南ヨーロッパ', 'Южная Европа'],
  'Western Asia': ['西亚', '西アジア', 'Западная Азия'],
  'South America': ['南美洲', '南アメリカ', 'Южная Америка'],
  Polynesia: ['波利尼西亚', 'ポリネシア', 'Полинезия'],
  'Australia and New Zealand': ['澳大利亚和新西兰', 'オーストラリア・ニュージーランド', 'Австралия и Новая Зеландия'],
  'Central Europe': ['中欧', '中央ヨーロッパ', 'Центральная Европа'],
  'Eastern Africa': ['东部非洲', '東アフリカ', 'Восточная Африка'],
  'Western Europe': ['西欧', '西ヨーロッパ', 'Западная Европа'],
  'Western Africa': ['西部非洲', '西アフリカ', 'Западная Африка'],
  'Eastern Europe': ['东欧', '東ヨーロッパ', 'Восточная Европа'],
  'Central America': ['中美洲', '中央アメリカ', 'Центральная Америка'],
  'North America': ['北美洲', '北アメリカ', 'Северная Америка'],
  'South-Eastern Asia': ['东南亚', '東南アジア', 'Юго-Восточная Азия'],
  'Southern Africa': ['南部非洲', '南部アフリカ', 'Южная Африка'],
  'Eastern Asia': ['东亚', '東アジア', 'Восточная Азия'],
  'Northern Africa': ['北部非洲', '北アフリカ', 'Северная Африка'],
  Melanesia: ['美拉尼西亚', 'メラネシア', 'Меланезия'],
  Micronesia: ['密克罗尼西亚', 'ミクロネシア', 'Микронезия'],
  'Central Asia': ['中亚', '中央アジア', 'Центральная Азия'],
}

export function regionName(name: string, lang: string): string {
  const names = regionNames[name]
  return names ? pick(lang, names[0], name, names[1], names[2]) : name
}
