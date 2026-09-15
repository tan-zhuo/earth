/**
 * 本地精选静态数据：政治体制（中/英/日/俄）+ 首都本地化名称。
 * REST Countries 不提供政体信息、首都也没有译名，故用本地数据补齐。
 * 覆盖主要国家；未覆盖的国家首都回退 capitalNames.json（Wikidata），政体显示占位提示。key 为 cca3。
 */
export interface CountryExtra {
  govEn: string
  govZh: string
  govJa: string
  govRu: string
  capitalZh?: string
  capitalJa?: string
  capitalRu?: string
}

export const countryExtras: Record<string, CountryExtra> = {
  CHN: { govEn: 'Unitary one-party socialist republic', govZh: '单一制社会主义共和国（共产党领导）', govJa: '単一国家・一党制社会主義共和国（共産党指導）', govRu: 'Унитарная однопартийная социалистическая республика', capitalZh: '北京', capitalJa: '北京', capitalRu: 'Пекин' },
  USA: { govEn: 'Federal presidential constitutional republic', govZh: '联邦总统制立宪共和国', govJa: '連邦制・大統領制立憲共和国', govRu: 'Федеративная президентская конституционная республика', capitalZh: '华盛顿哥伦比亚特区', capitalJa: 'ワシントンD.C.', capitalRu: 'Вашингтон' },
  GBR: { govEn: 'Unitary parliamentary constitutional monarchy', govZh: '单一制议会立宪君主制', govJa: '単一国家・議院内閣制立憲君主制', govRu: 'Унитарная парламентская конституционная монархия', capitalZh: '伦敦', capitalJa: 'ロンドン', capitalRu: 'Лондон' },
  FRA: { govEn: 'Unitary semi-presidential republic', govZh: '单一制半总统制共和国', govJa: '単一国家・半大統領制共和国', govRu: 'Унитарная полупрезидентская республика', capitalZh: '巴黎', capitalJa: 'パリ', capitalRu: 'Париж' },
  DEU: { govEn: 'Federal parliamentary republic', govZh: '联邦议会共和制', govJa: '連邦制・議院内閣制共和国', govRu: 'Федеративная парламентская республика', capitalZh: '柏林', capitalJa: 'ベルリン', capitalRu: 'Берлин' },
  JPN: { govEn: 'Unitary parliamentary constitutional monarchy', govZh: '议会立宪君主制', govJa: '議院内閣制立憲君主制', govRu: 'Унитарная парламентская конституционная монархия', capitalZh: '东京', capitalJa: '東京', capitalRu: 'Токио' },
  RUS: { govEn: 'Federal semi-presidential republic', govZh: '联邦半总统制共和国', govJa: '連邦制・半大統領制共和国', govRu: 'Федеративная полупрезидентская республика', capitalZh: '莫斯科', capitalJa: 'モスクワ', capitalRu: 'Москва' },
  IND: { govEn: 'Federal parliamentary republic', govZh: '联邦议会共和制', govJa: '連邦制・議院内閣制共和国', govRu: 'Федеративная парламентская республика', capitalZh: '新德里', capitalJa: 'ニューデリー', capitalRu: 'Нью-Дели' },
  BRA: { govEn: 'Federal presidential republic', govZh: '联邦总统制共和国', govJa: '連邦制・大統領制共和国', govRu: 'Федеративная президентская республика', capitalZh: '巴西利亚', capitalJa: 'ブラジリア', capitalRu: 'Бразилиа' },
  CAN: { govEn: 'Federal parliamentary constitutional monarchy', govZh: '联邦议会立宪君主制', govJa: '連邦制・議院内閣制立憲君主制', govRu: 'Федеративная парламентская конституционная монархия', capitalZh: '渥太华', capitalJa: 'オタワ', capitalRu: 'Оттава' },
  AUS: { govEn: 'Federal parliamentary constitutional monarchy', govZh: '联邦议会立宪君主制', govJa: '連邦制・議院内閣制立憲君主制', govRu: 'Федеративная парламентская конституционная монархия', capitalZh: '堪培拉', capitalJa: 'キャンベラ', capitalRu: 'Канберра' },
  KOR: { govEn: 'Unitary presidential republic', govZh: '单一制总统制共和国', govJa: '単一国家・大統領制共和国', govRu: 'Унитарная президентская республика', capitalZh: '首尔', capitalJa: 'ソウル', capitalRu: 'Сеул' },
  PRK: { govEn: 'Unitary one-party socialist republic', govZh: '单一制一党制社会主义共和国', govJa: '単一国家・一党制社会主義共和国', govRu: 'Унитарная однопартийная социалистическая республика', capitalZh: '平壤', capitalJa: '平壌', capitalRu: 'Пхеньян' },
  ITA: { govEn: 'Unitary parliamentary republic', govZh: '单一制议会共和制', govJa: '単一国家・議院内閣制共和国', govRu: 'Унитарная парламентская республика', capitalZh: '罗马', capitalJa: 'ローマ', capitalRu: 'Рим' },
  ESP: { govEn: 'Unitary parliamentary constitutional monarchy', govZh: '议会立宪君主制', govJa: '議院内閣制立憲君主制', govRu: 'Унитарная парламентская конституционная монархия', capitalZh: '马德里', capitalJa: 'マドリード', capitalRu: 'Мадрид' },
  PRT: { govEn: 'Unitary semi-presidential republic', govZh: '单一制半总统制共和国', govJa: '単一国家・半大統領制共和国', govRu: 'Унитарная полупрезидентская республика', capitalZh: '里斯本', capitalJa: 'リスボン', capitalRu: 'Лиссабон' },
  NLD: { govEn: 'Unitary parliamentary constitutional monarchy', govZh: '议会立宪君主制', govJa: '議院内閣制立憲君主制', govRu: 'Унитарная парламентская конституционная монархия', capitalZh: '阿姆斯特丹', capitalJa: 'アムステルダム', capitalRu: 'Амстердам' },
  BEL: { govEn: 'Federal parliamentary constitutional monarchy', govZh: '联邦议会立宪君主制', govJa: '連邦制・議院内閣制立憲君主制', govRu: 'Федеративная парламентская конституционная монархия', capitalZh: '布鲁塞尔', capitalJa: 'ブリュッセル', capitalRu: 'Брюссель' },
  CHE: { govEn: 'Federal directorial republic', govZh: '联邦委员会制共和国', govJa: '連邦制・議会統治制（合議制）共和国', govRu: 'Федеративная директориальная республика', capitalZh: '伯尔尼', capitalJa: 'ベルン', capitalRu: 'Берн' },
  AUT: { govEn: 'Federal parliamentary republic', govZh: '联邦议会共和制', govJa: '連邦制・議院内閣制共和国', govRu: 'Федеративная парламентская республика', capitalZh: '维也纳', capitalJa: 'ウィーン', capitalRu: 'Вена' },
  SWE: { govEn: 'Unitary parliamentary constitutional monarchy', govZh: '议会立宪君主制', govJa: '議院内閣制立憲君主制', govRu: 'Унитарная парламентская конституционная монархия', capitalZh: '斯德哥尔摩', capitalJa: 'ストックホルム', capitalRu: 'Стокгольм' },
  NOR: { govEn: 'Unitary parliamentary constitutional monarchy', govZh: '议会立宪君主制', govJa: '議院内閣制立憲君主制', govRu: 'Унитарная парламентская конституционная монархия', capitalZh: '奥斯陆', capitalJa: 'オスロ', capitalRu: 'Осло' },
  DNK: { govEn: 'Unitary parliamentary constitutional monarchy', govZh: '议会立宪君主制', govJa: '議院内閣制立憲君主制', govRu: 'Унитарная парламентская конституционная монархия', capitalZh: '哥本哈根', capitalJa: 'コペンハーゲン', capitalRu: 'Копенгаген' },
  FIN: { govEn: 'Unitary parliamentary republic', govZh: '单一制议会共和制', govJa: '単一国家・議院内閣制共和国', govRu: 'Унитарная парламентская республика', capitalZh: '赫尔辛基', capitalJa: 'ヘルシンキ', capitalRu: 'Хельсинки' },
  POL: { govEn: 'Unitary semi-presidential republic', govZh: '单一制半总统制共和国', govJa: '単一国家・半大統領制共和国', govRu: 'Унитарная полупрезидентская республика', capitalZh: '华沙', capitalJa: 'ワルシャワ', capitalRu: 'Варшава' },
  CZE: { govEn: 'Unitary parliamentary republic', govZh: '单一制议会共和制', govJa: '単一国家・議院内閣制共和国', govRu: 'Унитарная парламентская республика', capitalZh: '布拉格', capitalJa: 'プラハ', capitalRu: 'Прага' },
  HUN: { govEn: 'Unitary parliamentary republic', govZh: '单一制议会共和制', govJa: '単一国家・議院内閣制共和国', govRu: 'Унитарная парламентская республика', capitalZh: '布达佩斯', capitalJa: 'ブダペスト', capitalRu: 'Будапешт' },
  GRC: { govEn: 'Unitary parliamentary republic', govZh: '单一制议会共和制', govJa: '単一国家・議院内閣制共和国', govRu: 'Унитарная парламентская республика', capitalZh: '雅典', capitalJa: 'アテネ', capitalRu: 'Афины' },
  TUR: { govEn: 'Unitary presidential republic', govZh: '单一制总统制共和国', govJa: '単一国家・大統領制共和国', govRu: 'Унитарная президентская республика', capitalZh: '安卡拉', capitalJa: 'アンカラ', capitalRu: 'Анкара' },
  UKR: { govEn: 'Unitary semi-presidential republic', govZh: '单一制半总统制共和国', govJa: '単一国家・半大統領制共和国', govRu: 'Унитарная полупрезидентская республика', capitalZh: '基辅', capitalJa: 'キーウ', capitalRu: 'Киев' },
  EGY: { govEn: 'Unitary semi-presidential republic', govZh: '单一制半总统制共和国', govJa: '単一国家・半大統領制共和国', govRu: 'Унитарная полупрезидентская республика', capitalZh: '开罗', capitalJa: 'カイロ', capitalRu: 'Каир' },
  SAU: { govEn: 'Unitary absolute monarchy', govZh: '单一制君主专制', govJa: '単一国家・絶対君主制', govRu: 'Унитарная абсолютная монархия', capitalZh: '利雅得', capitalJa: 'リヤド', capitalRu: 'Эр-Рияд' },
  IRN: { govEn: 'Unitary Islamic republic', govZh: '单一制伊斯兰共和国', govJa: '単一国家・イスラム共和国', govRu: 'Унитарная исламская республика', capitalZh: '德黑兰', capitalJa: 'テヘラン', capitalRu: 'Тегеран' },
  IRQ: { govEn: 'Federal parliamentary republic', govZh: '联邦议会共和制', govJa: '連邦制・議院内閣制共和国', govRu: 'Федеративная парламентская республика', capitalZh: '巴格达', capitalJa: 'バグダード', capitalRu: 'Багдад' },
  ISR: { govEn: 'Unitary parliamentary republic', govZh: '单一制议会共和制', govJa: '単一国家・議院内閣制共和国', govRu: 'Унитарная парламентская республика', capitalZh: '耶路撒冷（存在争议）', capitalJa: 'エルサレム（係争中）', capitalRu: 'Иерусалим (оспаривается)' },
  ARE: { govEn: 'Federal elective monarchy', govZh: '联邦选举君主制（酋长国联邦）', govJa: '連邦制・選挙君主制（首長国連邦）', govRu: 'Федеративная выборная монархия (федерация эмиратов)', capitalZh: '阿布扎比', capitalJa: 'アブダビ', capitalRu: 'Абу-Даби' },
  QAT: { govEn: 'Unitary absolute monarchy', govZh: '单一制君主专制', govJa: '単一国家・絶対君主制', govRu: 'Унитарная абсолютная монархия', capitalZh: '多哈', capitalJa: 'ドーハ', capitalRu: 'Доха' },
  PAK: { govEn: 'Federal parliamentary Islamic republic', govZh: '联邦议会制伊斯兰共和国', govJa: '連邦制・議院内閣制イスラム共和国', govRu: 'Федеративная парламентская исламская республика', capitalZh: '伊斯兰堡', capitalJa: 'イスラマバード', capitalRu: 'Исламабад' },
  BGD: { govEn: 'Unitary parliamentary republic', govZh: '单一制议会共和制', govJa: '単一国家・議院内閣制共和国', govRu: 'Унитарная парламентская республика', capitalZh: '达卡', capitalJa: 'ダッカ', capitalRu: 'Дакка' },
  THA: { govEn: 'Unitary parliamentary constitutional monarchy', govZh: '议会立宪君主制', govJa: '議院内閣制立憲君主制', govRu: 'Унитарная парламентская конституционная монархия', capitalZh: '曼谷', capitalJa: 'バンコク', capitalRu: 'Бангкок' },
  VNM: { govEn: 'Unitary one-party socialist republic', govZh: '单一制一党制社会主义共和国', govJa: '単一国家・一党制社会主義共和国', govRu: 'Унитарная однопартийная социалистическая республика', capitalZh: '河内', capitalJa: 'ハノイ', capitalRu: 'Ханой' },
  IDN: { govEn: 'Unitary presidential republic', govZh: '单一制总统制共和国', govJa: '単一国家・大統領制共和国', govRu: 'Унитарная президентская республика', capitalZh: '雅加达', capitalJa: 'ジャカルタ', capitalRu: 'Джакарта' },
  MYS: { govEn: 'Federal parliamentary elective constitutional monarchy', govZh: '联邦议会制选举立宪君主制', govJa: '連邦制・議院内閣制選挙立憲君主制', govRu: 'Федеративная парламентская выборная конституционная монархия', capitalZh: '吉隆坡', capitalJa: 'クアラルンプール', capitalRu: 'Куала-Лумпур' },
  SGP: { govEn: 'Unitary parliamentary republic', govZh: '单一制议会共和制', govJa: '単一国家・議院内閣制共和国', govRu: 'Унитарная парламентская республика', capitalZh: '新加坡', capitalJa: 'シンガポール', capitalRu: 'Сингапур' },
  PHL: { govEn: 'Unitary presidential republic', govZh: '单一制总统制共和国', govJa: '単一国家・大統領制共和国', govRu: 'Унитарная президентская республика', capitalZh: '马尼拉', capitalJa: 'マニラ', capitalRu: 'Манила' },
  MEX: { govEn: 'Federal presidential republic', govZh: '联邦总统制共和国', govJa: '連邦制・大統領制共和国', govRu: 'Федеративная президентская республика', capitalZh: '墨西哥城', capitalJa: 'メキシコシティ', capitalRu: 'Мехико' },
  ARG: { govEn: 'Federal presidential republic', govZh: '联邦总统制共和国', govJa: '連邦制・大統領制共和国', govRu: 'Федеративная президентская республика', capitalZh: '布宜诺斯艾利斯', capitalJa: 'ブエノスアイレス', capitalRu: 'Буэнос-Айрес' },
  CHL: { govEn: 'Unitary presidential republic', govZh: '单一制总统制共和国', govJa: '単一国家・大統領制共和国', govRu: 'Унитарная президентская республика', capitalZh: '圣地亚哥', capitalJa: 'サンティアゴ', capitalRu: 'Сантьяго' },
  PER: { govEn: 'Unitary semi-presidential republic', govZh: '单一制半总统制共和国', govJa: '単一国家・半大統領制共和国', govRu: 'Унитарная полупрезидентская республика', capitalZh: '利马', capitalJa: 'リマ', capitalRu: 'Лима' },
  COL: { govEn: 'Unitary presidential republic', govZh: '单一制总统制共和国', govJa: '単一国家・大統領制共和国', govRu: 'Унитарная президентская республика', capitalZh: '波哥大', capitalJa: 'ボゴタ', capitalRu: 'Богота' },
  VEN: { govEn: 'Federal presidential republic', govZh: '联邦总统制共和国', govJa: '連邦制・大統領制共和国', govRu: 'Федеративная президентская республика', capitalZh: '加拉加斯', capitalJa: 'カラカス', capitalRu: 'Каракас' },
  ZAF: { govEn: 'Unitary parliamentary republic', govZh: '单一制议会共和制', govJa: '単一国家・議院内閣制共和国', govRu: 'Унитарная парламентская республика', capitalZh: '比勒陀利亚（行政）', capitalJa: 'プレトリア（行政首都）', capitalRu: 'Претория (административная)' },
  NGA: { govEn: 'Federal presidential republic', govZh: '联邦总统制共和国', govJa: '連邦制・大統領制共和国', govRu: 'Федеративная президентская республика', capitalZh: '阿布贾', capitalJa: 'アブジャ', capitalRu: 'Абуджа' },
  KEN: { govEn: 'Unitary presidential republic', govZh: '单一制总统制共和国', govJa: '単一国家・大統領制共和国', govRu: 'Унитарная президентская республика', capitalZh: '内罗毕', capitalJa: 'ナイロビ', capitalRu: 'Найроби' },
  ETH: { govEn: 'Federal parliamentary republic', govZh: '联邦议会共和制', govJa: '連邦制・議院内閣制共和国', govRu: 'Федеративная парламентская республика', capitalZh: '亚的斯亚贝巴', capitalJa: 'アディスアベバ', capitalRu: 'Аддис-Абеба' },
  DZA: { govEn: 'Unitary semi-presidential republic', govZh: '单一制半总统制共和国', govJa: '単一国家・半大統領制共和国', govRu: 'Унитарная полупрезидентская республика', capitalZh: '阿尔及尔', capitalJa: 'アルジェ', capitalRu: 'Алжир' },
  MAR: { govEn: 'Unitary parliamentary constitutional monarchy', govZh: '议会立宪君主制', govJa: '議院内閣制立憲君主制', govRu: 'Унитарная парламентская конституционная монархия', capitalZh: '拉巴特', capitalJa: 'ラバト', capitalRu: 'Рабат' },
  NZL: { govEn: 'Unitary parliamentary constitutional monarchy', govZh: '议会立宪君主制', govJa: '議院内閣制立憲君主制', govRu: 'Унитарная парламентская конституционная монархия', capitalZh: '惠灵顿', capitalJa: 'ウェリントン', capitalRu: 'Веллингтон' },
  IRL: { govEn: 'Unitary parliamentary republic', govZh: '单一制议会共和制', govJa: '単一国家・議院内閣制共和国', govRu: 'Унитарная парламентская республика', capitalZh: '都柏林', capitalJa: 'ダブリン', capitalRu: 'Дублин' },
  ROU: { govEn: 'Unitary semi-presidential republic', govZh: '单一制半总统制共和国', govJa: '単一国家・半大統領制共和国', govRu: 'Унитарная полупрезидентская республика', capitalZh: '布加勒斯特', capitalJa: 'ブカレスト', capitalRu: 'Бухарест' },
  KAZ: { govEn: 'Unitary presidential republic', govZh: '单一制总统制共和国', govJa: '単一国家・大統領制共和国', govRu: 'Унитарная президентская республика', capitalZh: '阿斯塔纳', capitalJa: 'アスタナ', capitalRu: 'Астана' },
  MNG: { govEn: 'Unitary semi-presidential republic', govZh: '单一制半总统制共和国', govJa: '単一国家・半大統領制共和国', govRu: 'Унитарная полупрезидентская республика', capitalZh: '乌兰巴托', capitalJa: 'ウランバートル', capitalRu: 'Улан-Батор' },
  CUB: { govEn: 'Unitary one-party socialist republic', govZh: '单一制一党制社会主义共和国', govJa: '単一国家・一党制社会主義共和国', govRu: 'Унитарная однопартийная социалистическая республика', capitalZh: '哈瓦那', capitalJa: 'ハバナ', capitalRu: 'Гавана' },
}
