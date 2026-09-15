/**
 * 宇宙尺度视图的静态数据（中/英/日/俄）：
 * 月球（含着陆点）、太阳系行星、银河系、可观测宇宙。
 * 行星贴图来自 Solar System Scope（CC BY 4.0），已自托管于 public/space/。
 */

/** 四语文本元组：[中文, English, 日本語, Русский] */
export type L4 = [string, string, string, string]

export interface FactRow {
  labelZh: string
  labelEn: string
  labelJa: string
  labelRu: string
  valueZh: string
  valueEn: string
  valueJa: string
  valueRu: string
}

export interface SpaceFacts {
  titleZh: string
  titleEn: string
  titleJa: string
  titleRu: string
  subtitleZh: string
  subtitleEn: string
  subtitleJa: string
  subtitleRu: string
  rows: FactRow[]
  descZh: string
  descEn: string
  descJa: string
  descRu: string
  noteZh?: string
  noteEn?: string
  noteJa?: string
  noteRu?: string
}

/** 由两个四语元组生成资料行 */
export const factRow = (label: L4, value: L4): FactRow => ({
  labelZh: label[0], labelEn: label[1], labelJa: label[2], labelRu: label[3],
  valueZh: value[0], valueEn: value[1], valueJa: value[2], valueRu: value[3],
})

/* ---------------- 月球 ---------------- */

export const MOON_FACTS: SpaceFacts = {
  titleZh: '月球',
  titleEn: 'The Moon',
  titleJa: '月',
  titleRu: 'Луна',
  subtitleZh: '地球唯一的天然卫星 · 距离尺度 10⁸ m',
  subtitleEn: "Earth's only natural satellite · scale 10⁸ m",
  subtitleJa: '地球唯一の天然衛星 · 距離スケール 10⁸ m',
  subtitleRu: 'Единственный естественный спутник Земли · масштаб 10⁸ м',
  rows: [
    factRow(['平均距离', 'Mean distance', '平均距離', 'Среднее расстояние'], ['384,400 公里', '384,400 km', '384,400 km', '384 400 км']),
    factRow(['半径', 'Radius', '半径', 'Радиус'], ['1,737 公里（地球的 27%）', '1,737 km (27% of Earth)', '1,737 km（地球の 27%）', '1737 км (27% земного)']),
    factRow(['表面重力', 'Surface gravity', '表面重力', 'Сила тяжести'], ['地球的 1/6', '1/6 of Earth', '地球の 1/6', '1/6 земной']),
    factRow(['公转周期', 'Orbital period', '公転周期', 'Период обращения'], ['27.3 天（潮汐锁定）', '27.3 days (tidally locked)', '27.3 日（潮汐固定）', '27,3 суток (приливный захват)']),
    factRow(['表面温度', 'Surface temp', '表面温度', 'Температура поверхности'], ['-173°C ~ 127°C', '-173°C to 127°C', '-173°C ～ 127°C', 'от −173 до 127 °C']),
  ],
  descZh: '月球因潮汐锁定永远以同一面朝向地球。它对地球的潮汐、自转轴稳定性至关重要。1969 年阿波罗 11 号实现人类首次登月，2019 年嫦娥四号实现人类首次月球背面软着陆。',
  descEn: 'Tidally locked, the Moon always shows Earth the same face. It stabilizes our planet\'s axial tilt and drives the tides. Apollo 11 achieved the first crewed landing in 1969; Chang\'e 4 made the first far-side soft landing in 2019.',
  descJa: '潮汐固定により、月は常に同じ面を地球に向けています。地球の潮汐や自転軸の安定に欠かせない存在です。1969 年にアポロ11号が人類初の月面着陸を果たし、2019 年には嫦娥4号が月の裏側への初の軟着陸に成功しました。',
  descRu: 'Из-за приливного захвата Луна всегда обращена к Земле одной стороной. Она стабилизирует наклон земной оси и вызывает приливы. В 1969 году «Аполлон-11» совершил первую пилотируемую посадку, а в 2019 году «Чанъэ-4» впервые мягко сел на обратную сторону Луны.',
}

export interface MoonSite {
  nameZh: string
  nameEn: string
  nameJa: string
  nameRu: string
  lat: number
  lng: number
  yearLabel: string
}

export const MOON_SITES: MoonSite[] = [
  { nameZh: '阿波罗 11 号', nameEn: 'Apollo 11', nameJa: 'アポロ11号', nameRu: '«Аполлон-11»', lat: 0.674, lng: 23.473, yearLabel: '1969' },
  { nameZh: '阿波罗 12 号', nameEn: 'Apollo 12', nameJa: 'アポロ12号', nameRu: '«Аполлон-12»', lat: -3.01, lng: -23.42, yearLabel: '1969' },
  { nameZh: '阿波罗 14 号', nameEn: 'Apollo 14', nameJa: 'アポロ14号', nameRu: '«Аполлон-14»', lat: -3.65, lng: -17.47, yearLabel: '1971' },
  { nameZh: '阿波罗 15 号', nameEn: 'Apollo 15', nameJa: 'アポロ15号', nameRu: '«Аполлон-15»', lat: 26.13, lng: 3.63, yearLabel: '1971' },
  { nameZh: '阿波罗 16 号', nameEn: 'Apollo 16', nameJa: 'アポロ16号', nameRu: '«Аполлон-16»', lat: -8.97, lng: 15.5, yearLabel: '1972' },
  { nameZh: '阿波罗 17 号', nameEn: 'Apollo 17', nameJa: 'アポロ17号', nameRu: '«Аполлон-17»', lat: 20.19, lng: 30.77, yearLabel: '1972' },
  { nameZh: '月球 9 号', nameEn: 'Luna 9', nameJa: 'ルナ9号', nameRu: '«Луна-9»', lat: 7.08, lng: -64.37, yearLabel: '1966' },
  { nameZh: '嫦娥三号', nameEn: "Chang'e 3", nameJa: '嫦娥3号', nameRu: '«Чанъэ-3»', lat: 44.12, lng: -19.51, yearLabel: '2013' },
  { nameZh: '嫦娥四号（背面）', nameEn: "Chang'e 4 (far side)", nameJa: '嫦娥4号（裏側）', nameRu: '«Чанъэ-4» (обратная сторона)', lat: -45.5, lng: 177.6, yearLabel: '2019' },
  { nameZh: '嫦娥五号', nameEn: "Chang'e 5", nameJa: '嫦娥5号', nameRu: '«Чанъэ-5»', lat: 43.06, lng: -51.92, yearLabel: '2020' },
]

/* ---------------- 太阳系 ---------------- */

export interface PlanetDef {
  id: string
  nameZh: string
  nameEn: string
  nameJa: string
  nameRu: string
  texture: string
  /** 可视化半径（非真实比例） */
  vRadius: number
  /** 可视化轨道半径 */
  vDist: number
  /** 公转周期（年），用于动画角速度 */
  periodYears: number
  hasRing?: boolean
  facts: SpaceFacts
}

/** 俄文数字写法：千分位用空格、小数点用逗号 */
const ruNum = (s: string) => s.replace(/,/g, ' ').replace(/\./g, ',')

function planetFacts(
  name: L4, sub: L4,
  diameter: string, distAu: string, period: L4, day: L4,
  moons: string, desc: L4,
): SpaceFacts {
  return {
    titleZh: name[0], titleEn: name[1], titleJa: name[2], titleRu: name[3],
    subtitleZh: sub[0], subtitleEn: sub[1], subtitleJa: sub[2], subtitleRu: sub[3],
    rows: [
      factRow(['直径', 'Diameter', '直径', 'Диаметр'], [`${diameter} 公里`, `${diameter} km`, `${diameter} km`, `${ruNum(diameter)} км`]),
      factRow(['距太阳', 'Distance from Sun', '太陽からの距離', 'Расстояние от Солнца'], [`${distAu} 天文单位`, `${distAu} AU`, `${distAu} 天文単位`, `${ruNum(distAu)} а. е.`]),
      factRow(['公转周期', 'Orbital period', '公転周期', 'Период обращения'], period),
      factRow(['自转周期', 'Day length', '自転周期', 'Период вращения'], day),
      factRow(['已知卫星', 'Known moons', '既知の衛星', 'Известные спутники'], [moons, moons, moons, moons]),
    ],
    descZh: desc[0], descEn: desc[1], descJa: desc[2], descRu: desc[3],
  }
}

export const SUN_FACTS: SpaceFacts = {
  titleZh: '太阳',
  titleEn: 'The Sun',
  titleJa: '太陽',
  titleRu: 'Солнце',
  subtitleZh: 'G 型主序星 · 太阳系质量的 99.86%',
  subtitleEn: 'G-type main-sequence star · 99.86% of system mass',
  subtitleJa: 'G 型主系列星 · 太陽系の質量の 99.86%',
  subtitleRu: 'Звезда главной последовательности класса G · 99,86% массы системы',
  rows: [
    factRow(['直径', 'Diameter', '直径', 'Диаметр'], ['139.2 万公里（地球的 109 倍）', '1.392M km (109× Earth)', '約 139 万 km（地球の 109 倍）', '1,392 млн км (109 земных)']),
    factRow(['表面温度', 'Surface temp', '表面温度', 'Температура поверхности'], ['约 5,500°C', '~5,500°C', '約 5,500°C', 'около 5500 °C']),
    factRow(['核心温度', 'Core temp', '中心核の温度', 'Температура ядра'], ['约 1,500 万°C', '~15M °C', '約 1,500 万°C', 'около 15 млн °C']),
    factRow(['年龄', 'Age', '年齢', 'Возраст'], ['约 46 亿年', '~4.6 billion years', '約 46 億年', 'около 4,6 млрд лет']),
  ],
  descZh: '太阳通过核心的氢核聚变每秒将约 400 万吨物质转化为能量，是地球所有生命的能量之源。它还将燃烧约 50 亿年。',
  descEn: 'Fusing hydrogen in its core, the Sun converts ~4 million tonnes of matter into energy every second — the power source of all life on Earth. It has ~5 billion years of fuel left.',
  descJa: '太陽は中心核での水素の核融合により、毎秒約 400 万トンの物質をエネルギーに変えています。地球上のすべての生命のエネルギー源であり、あと約 50 億年は輝き続けます。',
  descRu: 'Термоядерный синтез водорода в ядре каждую секунду превращает около 4 млн тонн вещества в энергию — это источник энергии для всей жизни на Земле. Топлива Солнцу хватит ещё примерно на 5 млрд лет.',
}

export const PLANETS: PlanetDef[] = [
  {
    id: 'mercury', nameZh: '水星', nameEn: 'Mercury', nameJa: '水星', nameRu: 'Меркурий', texture: '/space/mercury.jpg',
    vRadius: 1.6, vDist: 34, periodYears: 0.24,
    facts: planetFacts(['水星', 'Mercury', '水星', 'Меркурий'], ['离太阳最近的行星', 'Closest planet to the Sun', '太陽に最も近い惑星', 'Ближайшая к Солнцу планета'],
      '4,879', '0.39', ['88 天', '88 days', '88 日', '88 суток'], ['59 天', '59 days', '59 日', '59 суток'], '0',
      ['昼夜温差超过 600°C，是太阳系温差最大的行星。表面布满陨石坑，形似月球。',
       'With day-night swings over 600°C, Mercury has the most extreme temperature range in the Solar System. Its cratered surface resembles the Moon.',
       '昼夜の温度差は 600°C を超え、太陽系で最も寒暖差の大きい惑星です。表面はクレーターに覆われ、月によく似ています。',
       'Перепад температур между днём и ночью превышает 600 °C — самый большой в Солнечной системе. Поверхность, покрытая кратерами, напоминает лунную.']),
  },
  {
    id: 'venus', nameZh: '金星', nameEn: 'Venus', nameJa: '金星', nameRu: 'Венера', texture: '/space/venus_atmosphere.jpg',
    vRadius: 2.4, vDist: 44, periodYears: 0.62,
    facts: planetFacts(['金星', 'Venus', '金星', 'Венера'], ['最热的行星 · 逆向自转', 'Hottest planet · retrograde rotation', '最も高温の惑星 · 逆行自転', 'Самая горячая планета · обратное вращение'],
      '12,104', '0.72', ['225 天', '225 days', '225 日', '225 суток'], ['243 天（逆向）', '243 days (retrograde)', '243 日（逆行）', '243 суток (обратное)'], '0',
      ['浓密的二氧化碳大气造成失控温室效应，表面温度高达 465°C，足以熔化铅。它的一天比一年还长。',
       'A runaway greenhouse effect under its dense CO₂ atmosphere keeps the surface at 465°C — hot enough to melt lead. Its day is longer than its year.',
       '濃い二酸化炭素の大気が暴走温室効果を引き起こし、表面温度は鉛も溶ける 465°C に達します。1 日の長さは 1 年よりも長いのです。',
       'Плотная атмосфера из CO₂ вызывает неуправляемый парниковый эффект: на поверхности 465 °C — достаточно, чтобы расплавить свинец. Сутки здесь длиннее года.']),
  },
  {
    id: 'earth', nameZh: '地球', nameEn: 'Earth', nameJa: '地球', nameRu: 'Земля', texture: '/textures/earth-blue-marble.jpg',
    vRadius: 2.5, vDist: 56, periodYears: 1,
    facts: planetFacts(['地球', 'Earth', '地球', 'Земля'], ['已知唯一存在生命的行星', 'The only known world with life', '生命が確認されている唯一の惑星', 'Единственный известный мир с жизнью'],
      '12,742', '1.00', ['365.25 天', '365.25 days', '365.25 日', '365,25 суток'], ['23 小时 56 分', '23h 56m', '23 時間 56 分', '23 ч 56 мин'], '1',
      ['表面 71% 被液态水覆盖，大气以氮氧为主。在"宜居带"的位置、磁场与月球的稳定作用共同造就了生命家园。',
       '71% covered by liquid water with a nitrogen-oxygen atmosphere. Its habitable-zone orbit, magnetic field and stabilizing Moon make it the home of life.',
       '表面の 71% が液体の水に覆われ、大気は窒素と酸素が主成分です。ハビタブルゾーン内の軌道、磁場、そして月による安定化が、生命のふるさとを生み出しました。',
       '71% поверхности покрыто жидкой водой, атмосфера состоит в основном из азота и кислорода. Орбита в зоне обитаемости, магнитное поле и стабилизирующее влияние Луны сделали Землю домом для жизни.']),
  },
  {
    id: 'mars', nameZh: '火星', nameEn: 'Mars', nameJa: '火星', nameRu: 'Марс', texture: '/space/mars.jpg',
    vRadius: 2.0, vDist: 70, periodYears: 1.88,
    facts: planetFacts(['火星', 'Mars', '火星', 'Марс'], ['红色行星 · 人类探测最多的行星', 'The Red Planet', '赤い惑星 · 最も多く探査された惑星', 'Красная планета'],
      '6,779', '1.52', ['687 天', '687 days', '687 日', '687 суток'], ['24 小时 37 分', '24h 37m', '24 時間 37 分', '24 ч 37 мин'], '2',
      ['氧化铁让它呈现红色。拥有太阳系最高的火山（奥林帕斯山，21 公里）和最大的峡谷。远古火星曾有液态水，是寻找地外生命的首要目标。',
       'Iron oxide gives Mars its color. Home to the tallest volcano (Olympus Mons, 21 km) and a canyon system dwarfing the Grand Canyon. Ancient Mars had liquid water — making it the prime target in the search for past life.',
       '酸化鉄が赤い色の正体です。太陽系で最も高い火山オリンポス山（21 km）と最大級の峡谷を持ちます。かつては液体の水が存在し、地球外生命探査の最重要ターゲットです。',
       'Красный цвет Марсу придаёт оксид железа. Здесь самый высокий вулкан Солнечной системы — гора Олимп (21 км) — и гигантская система каньонов. На древнем Марсе была жидкая вода, поэтому он главная цель поиска внеземной жизни.']),
  },
  {
    id: 'jupiter', nameZh: '木星', nameEn: 'Jupiter', nameJa: '木星', nameRu: 'Юпитер', texture: '/space/jupiter.jpg',
    vRadius: 7, vDist: 100, periodYears: 11.86,
    facts: planetFacts(['木星', 'Jupiter', '木星', 'Юпитер'], ['太阳系最大的行星', 'Largest planet in the Solar System', '太陽系最大の惑星', 'Крупнейшая планета Солнечной системы'],
      '139,820', '5.20', ['11.9 年', '11.9 years', '11.9 年', '11,9 года'], ['9 小时 56 分', '9h 56m', '9 時間 56 分', '9 ч 56 мин'], '115 · 2026-08',
      ['质量是其他七大行星总和的 2.5 倍。大红斑是持续了数百年的巨型风暴。它强大的引力像"清道夫"一样保护着内行星。',
       '2.5× the mass of all other planets combined. The Great Red Spot is a storm raging for centuries. Its gravity shields the inner planets like a cosmic vacuum cleaner.',
       '質量はほかの惑星すべての合計の 2.5 倍。大赤斑は数百年続く巨大な嵐です。強い重力が「掃除屋」のように内側の惑星を守っています。',
       'Масса Юпитера в 2,5 раза больше массы всех остальных планет вместе взятых. Большое Красное Пятно — буря, бушующая веками. Его гравитация, словно космический пылесос, защищает внутренние планеты.']),
  },
  {
    id: 'saturn', nameZh: '土星', nameEn: 'Saturn', nameJa: '土星', nameRu: 'Сатурн', texture: '/space/saturn.jpg',
    vRadius: 6, vDist: 130, periodYears: 29.45, hasRing: true,
    facts: planetFacts(['土星', 'Saturn', '土星', 'Сатурн'], ['拥有壮丽光环的气态巨行星', 'The ringed gas giant', '壮麗な環を持つ巨大ガス惑星', 'Газовый гигант с кольцами'],
      '116,460', '9.58', ['29.5 年', '29.5 years', '29.5 年', '29,5 года'], ['10 小时 33 分', '10h 33m', '10 時間 33 分', '10 ч 33 мин'], '293 · 2026-08',
      ['光环由无数冰块与岩石碎片组成，宽度超过 28 万公里，厚度却只有约 10 米。密度比水低，理论上能浮在水面上。',
       'Its rings — countless ice and rock fragments — span over 280,000 km yet are only ~10 m thick. Saturn is less dense than water; it would float.',
       '環は無数の氷や岩のかけらでできており、幅は 28 万 km 以上なのに厚さは約 10 m しかありません。密度は水より小さく、理論上は水に浮きます。',
       'Кольца из бесчисленных обломков льда и камня простираются более чем на 280 000 км, но их толщина — всего около 10 м. Плотность Сатурна меньше плотности воды: теоретически он мог бы плавать.']),
  },
  {
    id: 'uranus', nameZh: '天王星', nameEn: 'Uranus', nameJa: '天王星', nameRu: 'Уран', texture: '/space/uranus.jpg',
    vRadius: 4, vDist: 160, periodYears: 84.02,
    facts: planetFacts(['天王星', 'Uranus', '天王星', 'Уран'], ['躺着自转的冰巨星', 'The sideways ice giant', '横倒しで自転する巨大氷惑星', 'Ледяной гигант, лежащий на боку'],
      '50,724', '19.2', ['84 年', '84 years', '84 年', '84 года'], ['17 小时 14 分（逆向）', '17h 14m (retrograde)', '17 時間 14 分（逆行）', '17 ч 14 мин (обратное)'], '29 · 2026-08',
      ['自转轴倾斜 98°，几乎是"躺着"绕太阳公转，可能源于远古的巨型撞击。大气中的甲烷让它呈现淡蓝绿色。',
       'Tilted 98°, Uranus essentially rolls around the Sun on its side — likely the scar of an ancient giant impact. Methane gives it its pale cyan hue.',
       '自転軸が 98° 傾き、ほぼ横倒しの状態で太陽を回ります。太古の巨大衝突の名残と考えられています。大気中のメタンが淡い青緑色を生み出しています。',
       'Ось вращения наклонена на 98°, и Уран фактически катится по орбите на боку — вероятно, след древнего гигантского столкновения. Метан придаёт ему бледно-голубой оттенок.']),
  },
  {
    id: 'neptune', nameZh: '海王星', nameEn: 'Neptune', nameJa: '海王星', nameRu: 'Нептун', texture: '/space/neptune.jpg',
    vRadius: 4, vDist: 190, periodYears: 164.8,
    facts: planetFacts(['海王星', 'Neptune', '海王星', 'Нептун'], ['最遥远的行星 · 用数学发现', 'Farthest planet · found by math', '最も遠い惑星 · 計算で発見', 'Самая далёкая планета · открыта расчётом'],
      '49,244', '30.1', ['165 年', '165 years', '165 年', '165 лет'], ['16 小时 6 分', '16h 6m', '16 時間 6 分', '16 ч 6 мин'], '16',
      ['1846 年天文学家通过计算天王星轨道摄动"用笔尖"发现了它。风速高达 2,100 km/h，是太阳系最狂暴的行星。',
       'Discovered in 1846 by calculation from Uranus\'s orbital wobbles — found "with the point of a pen". Winds reach 2,100 km/h, the fastest in the Solar System.',
       '1846 年、天王星の軌道のずれを計算することで「ペン先で」発見されました。風速は時速 2,100 km に達し、太陽系で最も激しい風が吹く惑星です。',
       'Открыт в 1846 году по расчётам возмущений орбиты Урана — «на кончике пера». Скорость ветра достигает 2100 км/ч, это самые быстрые ветры в Солнечной системе.']),
  },
]

export const SOLAR_NOTE: L4 = [
  '行星大小与轨道距离经压缩处理，非真实比例；L1/L2 点距地球实际仅 0.01 AU，展示距离经夸大。贴图 © Solar System Scope (CC BY 4.0)。',
  'Planet sizes and orbital distances are compressed, not to scale; L1/L2 are really only 0.01 AU from Earth (exaggerated here). Textures © Solar System Scope (CC BY 4.0).',
  '惑星の大きさと軌道距離は圧縮しており、実際の縮尺ではありません。L1/L2 点は実際には地球からわずか 0.01 AU で、ここでは誇張して表示しています。テクスチャ © Solar System Scope (CC BY 4.0)。',
  'Размеры планет и расстояния орбит сжаты, масштаб не соблюдён; точки L1/L2 на самом деле всего в 0,01 а. е. от Земли (здесь расстояние преувеличено). Текстуры © Solar System Scope (CC BY 4.0).',
]

/* ---------------- 银河系 ---------------- */

export const GALAXY_FACTS: SpaceFacts = {
  titleZh: '银河系',
  titleEn: 'The Milky Way',
  titleJa: '天の川銀河',
  titleRu: 'Млечный Путь',
  subtitleZh: '棒旋星系 · 尺度 10²¹ m',
  subtitleEn: 'Barred spiral galaxy · scale 10²¹ m',
  subtitleJa: '棒渦巻銀河 · スケール 10²¹ m',
  subtitleRu: 'Спиральная галактика с перемычкой · масштаб 10²¹ м',
  rows: [
    factRow(['直径', 'Diameter', '直径', 'Диаметр'], ['约 10 万光年', '~100,000 light-years', '約 10 万光年', 'около 100 000 световых лет']),
    factRow(['恒星数量', 'Stars', '恒星の数', 'Число звёзд'], ['1,000 ~ 4,000 亿颗', '100–400 billion', '1,000 億～4,000 億個', '100–400 млрд']),
    factRow(['中心黑洞', 'Central black hole', '中心のブラックホール', 'Центральная чёрная дыра'], ['人马座 A*（430 万倍太阳质量）', 'Sagittarius A* (4.3M solar masses)', 'いて座 A*（太陽の 430 万倍の質量）', 'Стрелец A* (4,3 млн масс Солнца)']),
    factRow(['太阳的位置', "Sun's position", '太陽の位置', 'Положение Солнца'], ['猎户臂，距银心约 2.6 万光年', 'Orion Arm, ~26,000 ly from center', 'オリオン腕、銀河中心から約 2.6 万光年', 'рукав Ориона, ~26 000 св. лет от центра']),
    factRow(['银河年', 'Galactic year', '銀河年', 'Галактический год'], ['太阳绕银心一圈约 2.3 亿年', 'Sun orbits center every ~230M years', '太陽が銀河中心を一周するのに約 2.3 億年', 'оборот Солнца вокруг центра — ~230 млн лет']),
  ],
  descZh: '夜空中的"银河"是我们从内部看到的银盘。太阳系诞生以来只绕银心转了约 20 圈。银河系与仙女座星系正在相互接近，但未来是否合并仍有不确定性；2025 年研究估计，未来 100 亿年内碰撞的概率约为一半。',
  descEn: 'The band of light in our night sky is this disk seen from within. Since its birth, the Solar System has completed only ~20 orbits. The Milky Way and Andromeda are approaching, but a future merger is uncertain. A 2025 study estimates roughly a 50% chance of collision within 10 billion years.',
  descJa: '夜空の「天の川」は、私たちが内側から見た銀河円盤です。太陽系は誕生以来、銀河中心の周りを約 20 周しかしていません。天の川銀河とアンドロメダ銀河は互いに近づいていますが、将来合体するかどうかは不確かです。2025 年の研究では、100 億年以内に衝突する確率はおよそ半分と見積もられています。',
  descRu: 'Полоса Млечного Пути на ночном небе — это диск нашей Галактики, видимый изнутри. С момента рождения Солнечная система совершила вокруг центра лишь около 20 оборотов. Млечный Путь и Андромеда сближаются, но их слияние не гарантировано: по оценке исследования 2025 года, вероятность столкновения в ближайшие 10 млрд лет — около 50%.',
  noteZh: '星系结构为程序化示意可视化。',
  noteEn: 'Galaxy structure is a procedural visualization.',
  noteJa: '銀河の構造はプログラムで生成したイメージです。',
  noteRu: 'Структура галактики — процедурная визуализация.',
}

/* ---------------- 可观测宇宙 ---------------- */

export const UNIVERSE_FACTS: SpaceFacts = {
  titleZh: '可观测宇宙',
  titleEn: 'The Observable Universe',
  titleJa: '観測可能な宇宙',
  titleRu: 'Наблюдаемая Вселенная',
  subtitleZh: '宇宙大尺度结构 · 尺度 10²⁷ m',
  subtitleEn: 'The cosmic web · scale 10²⁷ m',
  subtitleJa: '宇宙の大規模構造 · スケール 10²⁷ m',
  subtitleRu: 'Космическая паутина · масштаб 10²⁷ м',
  rows: [
    factRow(['直径', 'Diameter', '直径', 'Диаметр'], ['约 930 亿光年', '~93 billion light-years', '約 930 億光年', 'около 93 млрд световых лет']),
    factRow(['年龄', 'Age', '年齢', 'Возраст'], ['138 亿年', '13.8 billion years', '138 億年', '13,8 млрд лет']),
    factRow(['星系数量', 'Galaxies', '銀河の数', 'Число галактик'], ['估计数千亿至数万亿个', 'Hundreds of billions to trillions (estimated)', '推定数千億～数兆個', 'от сотен миллиардов до триллионов (оценка)']),
    factRow(['组成', 'Composition', '組成', 'Состав'], ['暗能量 68% · 暗物质 27% · 普通物质 5%', 'Dark energy 68% · dark matter 27% · ordinary matter 5%', 'ダークエネルギー 68% · ダークマター 27% · 通常の物質 5%', 'тёмная энергия 68% · тёмная материя 27% · обычное вещество 5%']),
    factRow(['背景温度', 'Background temp', '背景温度', 'Фоновая температура'], ['2.7 K（宇宙微波背景）', '2.7 K (cosmic microwave background)', '2.7 K（宇宙マイクロ波背景放射）', '2,7 K (реликтовое излучение)']),
  ],
  descZh: '在最大尺度上，星系并非均匀分布，而是沿"宇宙网"排列：星系团由纤维状结构连接，其间是巨大的空洞。画面中的光点示意星系的分布，数量与大小经过简化。因宇宙持续膨胀，可观测宇宙的边界正离我们越来越远。',
  descEn: 'At the largest scales galaxies trace the "cosmic web": clusters linked by filaments, separated by immense voids. Points illustrate the distribution of galaxies; their numbers and sizes are simplified. As space itself expands, the edge of what we can observe recedes ever farther.',
  descJa: '最大のスケールで見ると、銀河は一様に分布しているのではなく「宇宙の網」に沿って並んでいます。銀河団はフィラメント状の構造でつながり、その間には巨大なボイド（空洞）が広がります。画面の光点は銀河の分布を表したもので、数や大きさは簡略化しています。宇宙は膨張し続けているため、観測可能な宇宙の果ては私たちからますます遠ざかっています。',
  descRu: 'На самых больших масштабах галактики распределены не равномерно, а образуют «космическую паутину»: скопления соединены нитями, между которыми лежат огромные пустоты. Точки на экране показывают распределение галактик, их число и размеры упрощены. Поскольку пространство расширяется, граница наблюдаемой Вселенной всё дальше удаляется от нас.',
  noteZh: '宇宙网结构与星系标注位置均为示意可视化，非真实坐标。',
  noteEn: 'The cosmic web and galaxy label positions are schematic visualizations, not real coordinates.',
  noteJa: '宇宙の網の構造と銀河ラベルの位置はイメージであり、実際の座標ではありません。',
  noteRu: 'Космическая паутина и положения подписей галактик — схематическая визуализация, а не реальные координаты.',
}
