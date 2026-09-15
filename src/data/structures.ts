/**
 * 行星内部构造与磁场可视化的静态数据（多语言）：
 * 地球/火星的分层结构（半径为表面半径的百分比）、磁场类型与资料卡。
 */
import type { SpaceFacts } from './space'

export interface StructureLayer {
  key: string
  nameZh: string
  nameEn: string
  nameJa: string
  nameRu: string
  /** 外半径，表面 = 100 */
  rOuter: number
  color: string
}

export interface StructureConfig {
  layers: StructureLayer[] // 从外到内
  /** 最外层使用的表面贴图（可选） */
  surfaceTexture?: string
  /** 磁场类型：dipole 全球偶极场 / crustal 残余地壳磁场 */
  fieldType: 'dipole' | 'crustal'
}

/* ---------------- 地球 ---------------- */

export const EARTH_STRUCTURE: StructureConfig = {
  layers: [
    { key: 'crust', nameZh: '地壳', nameEn: 'Crust', nameJa: '地殻', nameRu: 'Кора', rOuter: 100, color: '#64748b' },
    { key: 'upperMantle', nameZh: '上地幔', nameEn: 'Upper mantle', nameJa: '上部マントル', nameRu: 'Верхняя мантия', rOuter: 98.5, color: '#92400e' },
    { key: 'lowerMantle', nameZh: '下地幔', nameEn: 'Lower mantle', nameJa: '下部マントル', nameRu: 'Нижняя мантия', rOuter: 89.6, color: '#b91c1c' },
    { key: 'outerCore', nameZh: '外核（液态）', nameEn: 'Outer core (liquid)', nameJa: '外核（液体）', nameRu: 'Внешнее ядро (жидкое)', rOuter: 54.6, color: '#f97316' },
    { key: 'innerCore', nameZh: '内核（固态）', nameEn: 'Inner core (solid)', nameJa: '内核（固体）', nameRu: 'Внутреннее ядро (твёрдое)', rOuter: 19.2, color: '#fde68a' },
  ],
  surfaceTexture: '/textures/earth-blue-marble.jpg',
  fieldType: 'dipole',
}

export const EARTH_STRUCTURE_FACTS: SpaceFacts = {
  titleZh: '地球内部构造',
  titleEn: "Earth's Interior",
  titleJa: '地球の内部構造',
  titleRu: 'Внутреннее строение Земли',
  subtitleZh: '由地震波研究揭示的分层结构',
  subtitleEn: 'Layered structure revealed by seismic waves',
  subtitleJa: '地震波の研究で明らかになった層構造',
  subtitleRu: 'Слоистое строение, выявленное по сейсмическим волнам',
  rows: [
    { labelZh: '地壳', labelEn: 'Crust', labelJa: '地殻', labelRu: 'Кора', valueZh: '平均 17 km（海洋 5 · 大陆达 70）', valueEn: '~17 km avg (5 oceanic, up to 70 continental)', valueJa: '平均約 17 km（海洋 5 · 大陸は最大 70）', valueRu: 'в среднем ~17 км (океаническая 5, континентальная до 70)' },
    { labelZh: '地幔', labelEn: 'Mantle', labelJa: 'マントル', labelRu: 'Мантия', valueZh: '深至 2,890 km，硅酸盐岩', valueEn: 'To 2,890 km deep, silicate rock', valueJa: '深さ 2,890 km まで · ケイ酸塩岩', valueRu: 'до глубины 2 890 км · силикатные породы' },
    { labelZh: '外核', labelEn: 'Outer core', labelJa: '外核', labelRu: 'Внешнее ядро', valueZh: '液态铁镍，2,890–5,150 km', valueEn: 'Liquid iron-nickel, 2,890–5,150 km', valueJa: '液体の鉄・ニッケル · 2,890〜5,150 km', valueRu: 'жидкие железо и никель · 2 890–5 150 км' },
    { labelZh: '内核', labelEn: 'Inner core', labelJa: '内核', labelRu: 'Внутреннее ядро', valueZh: '固态铁镍球，半径 1,220 km', valueEn: 'Solid iron-nickel, 1,220 km radius', valueJa: '固体の鉄・ニッケル球 · 半径 1,220 km', valueRu: 'твёрдый железо-никелевый шар · радиус 1 220 км' },
    { labelZh: '中心温度', labelEn: 'Core temperature', labelJa: '中心温度', labelRu: 'Температура в центре', valueZh: '约 5,400°C（接近太阳表面）', valueEn: "~5,400°C (near the Sun's surface)", valueJa: '約 5,400°C（太陽表面に匹敵）', valueRu: '~5 400 °C (почти как на поверхности Солнца)' },
  ],
  descZh: '人类从未钻透地壳（最深钻孔仅 12.3 km），对内部的认识几乎全部来自地震波：纵波与横波在不同物质中的传播差异，勾勒出这幅分层图景。地幔的缓慢对流驱动着板块运动、地震与火山。',
  descEn: 'No drill has ever pierced the crust (deepest borehole: 12.3 km). Nearly everything we know comes from seismic waves — how P- and S-waves travel through different materials maps these layers. Slow mantle convection drives plate tectonics, earthquakes and volcanoes.',
  descJa: '人類は地殻を掘り抜いたことがなく（最も深い掘削孔でも 12.3 km）、内部についての知識はほぼすべて地震波から得られています。P 波と S 波が異なる物質中を伝わる違いから、この層構造が描き出されました。マントルのゆっくりとした対流が、プレート運動や地震、火山を引き起こしています。',
  descRu: 'Ни одна скважина не пробила кору насквозь (самая глубокая — 12,3 км). Почти всё, что мы знаем о недрах, получено по сейсмическим волнам: различия в распространении продольных и поперечных волн в разных веществах и рисуют эту слоистую картину. Медленная конвекция мантии движет тектоническими плитами, вызывает землетрясения и извержения вулканов.',
  noteZh: '剖面为示意模型，薄层厚度适度夸大，颜色用于区分层次。拖动旋转查看。',
  noteEn: 'Schematic cutaway: thin layers are exaggerated and colors distinguish the layers. Drag to rotate.',
  noteJa: '断面は模式図です。薄い層は厚めに誇張し、色で層を区別しています。ドラッグで回転できます。',
  noteRu: 'Схематичный разрез: тонкие слои утолщены, цвета различают слои. Перетащите, чтобы повернуть.',
}

export const EARTH_MAGNETIC_FACTS: SpaceFacts = {
  titleZh: '地球磁场',
  titleEn: "Earth's Magnetic Field",
  titleJa: '地球の磁場',
  titleRu: 'Магнитное поле Земли',
  subtitleZh: '外核发电机产生的全球偶极场',
  subtitleEn: 'A global dipole powered by the core dynamo',
  subtitleJa: '外核のダイナモが生み出す全球的な双極子磁場',
  subtitleRu: 'Глобальное дипольное поле, создаваемое динамо в ядре',
  rows: [
    { labelZh: '成因', labelEn: 'Origin', labelJa: '成因', labelRu: 'Происхождение', valueZh: '外核液态铁镍对流（地磁发电机）', valueEn: 'Convecting liquid iron in the outer core (geodynamo)', valueJa: '外核の液体鉄・ニッケルの対流（ダイナモ作用）', valueRu: 'конвекция жидкого железа во внешнем ядре (геодинамо)' },
    { labelZh: '磁轴倾角', labelEn: 'Axis tilt', labelJa: '磁軸の傾き', labelRu: 'Наклон оси', valueZh: '相对自转轴约 11°', valueEn: '~11° from the rotation axis', valueJa: '自転軸に対して約 11°', valueRu: '~11° от оси вращения' },
    { labelZh: '表面强度', labelEn: 'Surface strength', labelJa: '地表の強さ', labelRu: 'Индукция у поверхности', valueZh: '25–65 微特斯拉', valueEn: '25–65 microtesla', valueJa: '25〜65 マイクロテスラ', valueRu: '25–65 микротесла' },
    { labelZh: '磁极漂移', labelEn: 'Pole drift', labelJa: '磁極の移動', labelRu: 'Дрейф полюса', valueZh: '磁北极正以约 40 km/年 移向西伯利亚', valueEn: 'Magnetic north drifts ~40 km/yr toward Siberia', valueJa: '北磁極は年約 40 km でシベリア方向へ移動中', valueRu: 'северный магнитный полюс смещается к Сибири на ~40 км/год' },
    { labelZh: '磁极倒转', labelEn: 'Reversals', labelJa: '地磁気逆転', labelRu: 'Инверсии', valueZh: '地质史上多次，上次约 78 万年前', valueEn: 'Many in geologic history; last ~780,000 years ago', valueJa: '地質時代に何度も発生 · 最後は約 78 万年前', valueRu: 'многократно в геологической истории; последняя ~780 тыс. лет назад' },
  ],
  descZh: '磁场在地球周围撑起"磁层"，偏转太阳风带电粒子——没有它，大气可能像火星一样被逐渐剥离。被磁场导引到两极的粒子撞击高层大气，就是极光。候鸟与海龟也依靠磁场导航。',
  descEn: 'The field inflates a magnetosphere that deflects the solar wind — without it, our atmosphere could be stripped away like Mars\'s. Particles funneled to the poles ignite the auroras. Migratory birds and sea turtles navigate by this field.',
  descJa: '磁場は地球の周りに「磁気圏」を広げ、太陽風の荷電粒子をそらしています。これがなければ、大気は火星のように少しずつはぎ取られていたかもしれません。磁場に導かれて極域に降り注いだ粒子が上層大気にぶつかると、オーロラになります。渡り鳥やウミガメも磁場を頼りに進路を決めています。',
  descRu: 'Поле раздувает вокруг Земли магнитосферу, отклоняющую заряженные частицы солнечного ветра, — без неё атмосфера могла бы постепенно улетучиться, как на Марсе. Частицы, направленные полем к полюсам, врезаются в верхние слои атмосферы и зажигают полярные сияния. Перелётные птицы и морские черепахи ориентируются по этому полю.',
  noteZh: '磁力线为偶极场示意，倾斜 11° 的磁轴以虚线标出。',
  noteEn: 'Field lines are a dipole schematic; the 11°-tilted magnetic axis is shown dashed.',
  noteJa: '磁力線は双極子磁場の模式図で、11° 傾いた磁軸を破線で示しています。',
  noteRu: 'Силовые линии — схема дипольного поля; магнитная ось с наклоном 11° показана пунктиром.',
}

/* ---------------- 火星 ---------------- */

export const MARS_STRUCTURE: StructureConfig = {
  layers: [
    { key: 'crust', nameZh: '地壳', nameEn: 'Crust', nameJa: '地殻', nameRu: 'Кора', rOuter: 100, color: '#9a3412' },
    { key: 'mantle', nameZh: '地幔', nameEn: 'Mantle', nameJa: 'マントル', nameRu: 'Мантия', rOuter: 97, color: '#b45309' },
    { key: 'core', nameZh: '地核（液态）', nameEn: 'Core (liquid)', nameJa: '核（液体）', nameRu: 'Ядро (жидкое)', rOuter: 54, color: '#f59e0b' },
  ],
  surfaceTexture: '/space/mars.jpg',
  fieldType: 'crustal',
}

export const MARS_STRUCTURE_FACTS: SpaceFacts = {
  titleZh: '火星内部构造',
  titleEn: "Mars's Interior",
  titleJa: '火星の内部構造',
  titleRu: 'Внутреннее строение Марса',
  subtitleZh: 'InSight 号火震数据揭示的分层',
  subtitleEn: 'Layers revealed by InSight marsquake data',
  subtitleJa: 'インサイトの火震データで明らかになった層構造',
  subtitleRu: 'Слои, выявленные по данным о марсотрясениях InSight',
  rows: [
    { labelZh: '地壳', labelEn: 'Crust', labelJa: '地殻', labelRu: 'Кора', valueZh: '平均约 24–72 km，比地球厚', valueEn: '~24–72 km, thicker than Earth\'s', valueJa: '約 24〜72 km · 地球より厚い', valueRu: '~24–72 км, толще земной' },
    { labelZh: '地幔', labelEn: 'Mantle', labelJa: 'マントル', labelRu: 'Мантия', valueZh: '硅酸盐岩，对流已基本停滞', valueEn: 'Silicate rock; convection has largely stalled', valueJa: 'ケイ酸塩岩 · 対流はほぼ停止', valueRu: 'силикатные породы; конвекция почти остановилась' },
    { labelZh: '地核', labelEn: 'Core', labelJa: '核', labelRu: 'Ядро', valueZh: '液态铁镍硫，半径约 1,830 km', valueEn: 'Liquid iron-nickel-sulfur, ~1,830 km radius', valueJa: '液体の鉄・ニッケル・硫黄 · 半径約 1,830 km', valueRu: 'жидкие железо, никель и сера · радиус ~1 830 км' },
    { labelZh: '探测方式', labelEn: 'How we know', labelJa: '観測方法', labelRu: 'Источник данных', valueZh: 'InSight 号记录了 1,300+ 次火震', valueEn: 'InSight recorded 1,300+ marsquakes', valueJa: 'インサイトが 1,300 回以上の火震を記録', valueRu: 'InSight зарегистрировал 1 300+ марсотрясений' },
  ],
  descZh: '2018–2022 年，InSight 号的地震仪首次"透视"了另一颗行星的内部：火星地核比预想的大而轻，仍是液态；但地幔对流太弱，无法再驱动发电机与板块运动。',
  descEn: "From 2018–2022, InSight's seismometer gave us the first look inside another planet: Mars's core is larger and lighter than expected, and still liquid — but mantle convection is too feeble to power a dynamo or plate tectonics.",
  descJa: '2018〜2022 年、インサイトの地震計が初めて別の惑星の内部を「透視」しました。火星の核は予想より大きく軽く、今も液体です。しかしマントルの対流は弱すぎて、ダイナモやプレート運動を駆動することはもうできません。',
  descRu: 'В 2018–2022 годах сейсмометр InSight впервые позволил заглянуть внутрь другой планеты: ядро Марса оказалось больше и легче, чем ожидалось, и всё ещё жидкое, но конвекция в мантии слишком слаба, чтобы питать динамо или тектонику плит.',
  noteZh: '层次参考 InSight 测量；薄层厚度和颜色为展示而调整。',
  noteEn: 'Layers informed by InSight measurements; thin layers and colors adjusted for illustration.',
  noteJa: '層はインサイトの観測に基づきます。薄い層の厚さと色は見やすさのため調整しています。',
  noteRu: 'Слои основаны на измерениях InSight; толщина тонких слоёв и цвета изменены для наглядности.',
}

export const MARS_MAGNETIC_FACTS: SpaceFacts = {
  titleZh: '火星磁场',
  titleEn: "Mars's Magnetic Field",
  titleJa: '火星の磁場',
  titleRu: 'Магнитное поле Марса',
  subtitleZh: '发电机已熄灭 · 只剩地壳"化石磁场"',
  subtitleEn: 'A dead dynamo · only crustal "fossil magnetism" remains',
  subtitleJa: 'ダイナモは停止 · 地殻の「化石磁場」だけが残る',
  subtitleRu: 'Динамо угасло · осталось лишь «ископаемое» намагничивание коры',
  rows: [
    { labelZh: '现状', labelEn: 'Today', labelJa: '現状', labelRu: 'Сейчас', valueZh: '无全球磁场', valueEn: 'No global magnetic field', valueJa: '全球的な磁場はない', valueRu: 'глобального магнитного поля нет' },
    { labelZh: '残余磁场', labelEn: 'Remnant field', labelJa: '残留磁場', labelRu: 'Остаточное поле', valueZh: '南半球古老地壳中的磁化条带', valueEn: 'Magnetized stripes in the ancient southern crust', valueJa: '南半球の古い地殻に残る縞状の磁化', valueRu: 'намагниченные полосы в древней коре южного полушария' },
    { labelZh: '发电机熄灭', labelEn: 'Dynamo died', labelJa: 'ダイナモ停止', labelRu: 'Угасание динамо', valueZh: '约 40 亿年前', valueEn: '~4 billion years ago', valueJa: '約 40 億年前', valueRu: '~4 млрд лет назад' },
    { labelZh: '后果', labelEn: 'Consequence', labelJa: '影響', labelRu: 'Последствия', valueZh: '太阳风剥离大气，火星变冷变干', valueEn: 'Solar wind stripped the atmosphere; Mars turned cold and dry', valueJa: '太陽風が大気をはぎ取り、火星は寒冷で乾燥した惑星に', valueRu: 'солнечный ветер сорвал атмосферу; Марс стал холодным и сухим' },
  ],
  descZh: '远古火星曾像地球一样拥有全球磁场与浓密大气，表面有液态水流淌。发电机熄灭后，太阳风在数亿年间将大气层剥离殆尽——这正是"磁场保护生命"最深刻的反面教材。MAVEN 探测器至今仍在测量这场持续的大气流失。',
  descEn: "Ancient Mars once had a global field, a thick atmosphere, and liquid water. When its dynamo died, the solar wind stripped the air away over hundreds of millions of years — the starkest lesson in how magnetic fields shelter life. NASA's MAVEN still measures this ongoing escape today.",
  descJa: '太古の火星は地球のように全球的な磁場と濃い大気を持ち、地表には液体の水が流れていました。ダイナモが止まると、太陽風が数億年かけて大気をはぎ取っていきました。「磁場が生命を守る」ことを最も痛烈に示す反面教師です。探査機メイヴンは今もこの大気の流出を観測し続けています。',
  descRu: 'Древний Марс, как и Земля, обладал глобальным магнитным полем и плотной атмосферой, а по его поверхности текла жидкая вода. Когда динамо угасло, солнечный ветер за сотни миллионов лет сорвал атмосферу — это самый наглядный урок того, как магнитное поле защищает жизнь. Зонд NASA MAVEN до сих пор измеряет эту продолжающуюся утечку.',
  noteZh: '南半球的弧线为残余地壳磁场示意。',
  noteEn: 'Southern arcs depict remnant crustal magnetism (schematic).',
  noteJa: '南半球の弧は地殻の残留磁場を表す模式図です。',
  noteRu: 'Дуги в южном полушарии схематично показывают остаточное намагничивание коры.',
}

export const MARS_SURFACE_FACTS: SpaceFacts = {
  titleZh: '火星',
  titleEn: 'Mars',
  titleJa: '火星',
  titleRu: 'Марс',
  subtitleZh: '红色行星 · 标注历史着陆点',
  subtitleEn: 'The Red Planet · historic landing sites marked',
  subtitleJa: '赤い惑星 · 歴代の着陸地点を表示',
  subtitleRu: 'Красная планета · отмечены исторические места посадок',
  rows: [
    { labelZh: '直径', labelEn: 'Diameter', labelJa: '直径', labelRu: 'Диаметр', valueZh: '6,779 公里（地球的 53%）', valueEn: '6,779 km (53% of Earth)', valueJa: '6,779 km（地球の 53%）', valueRu: '6 779 км (53% земного)' },
    { labelZh: '表面重力', labelEn: 'Surface gravity', labelJa: '表面重力', labelRu: 'Сила тяжести', valueZh: '地球的 38%', valueEn: '38% of Earth', valueJa: '地球の 38%', valueRu: '38% земной' },
    { labelZh: '一天', labelEn: 'Day length', labelJa: '1 日の長さ', labelRu: 'Сутки', valueZh: '24 小时 37 分', valueEn: '24h 37m', valueJa: '24 時間 37 分', valueRu: '24 ч 37 мин' },
    { labelZh: '平均温度', labelEn: 'Mean temp', labelJa: '平均気温', labelRu: 'Средняя температура', valueZh: '-63°C', valueEn: '-63°C', valueJa: '-63°C', valueRu: '-63 °C' },
    { labelZh: '最高峰', labelEn: 'Highest peak', labelJa: '最高峰', labelRu: 'Высочайшая вершина', valueZh: '奥林帕斯山 21 km（太阳系之最）', valueEn: 'Olympus Mons, 21 km (tallest in the Solar System)', valueJa: 'オリンポス山 21 km（太陽系最高）', valueRu: 'гора Олимп, 21 км (высочайшая в Солнечной системе)' },
  ],
  descZh: '自 1976 年海盗 1 号成功着陆以来，人类已有十余个探测器抵达火星表面。2021 年祝融号使中国成为第二个成功巡视火星的国家。切换到"内部结构"与"磁场"看看这颗行星的内在。',
  descEn: 'Since Viking 1 in 1976, more than a dozen craft have reached the Martian surface. In 2021 Zhurong made China the second nation to rove Mars. Switch to "Interior" and "Magnetic field" to look inside the planet.',
  descJa: '1976 年にバイキング 1 号が着陸に成功して以来、十数機の探査機が火星の地表に到達しました。2021 年には祝融号により、中国が火星で探査車を走らせた 2 番目の国となりました。「内部構造」と「磁場」に切り替えて、この惑星の内側をのぞいてみましょう。',
  descRu: 'С момента посадки «Викинга-1» в 1976 году поверхности Марса достигли более десятка аппаратов. В 2021 году марсоход «Чжужун» сделал Китай второй страной, успешно исследовавшей Марс марсоходом. Переключитесь на «Строение» и «Магнитное поле», чтобы заглянуть внутрь планеты.',
}

export interface MarsSite {
  nameZh: string
  nameEn: string
  nameJa: string
  nameRu: string
  lat: number
  lng: number
  yearLabel: string
}

export const MARS_SITES: MarsSite[] = [
  { nameZh: '海盗 1 号', nameEn: 'Viking 1', nameJa: 'バイキング 1 号', nameRu: '«Викинг-1»', lat: 22.48, lng: -49.97, yearLabel: '1976' },
  { nameZh: '海盗 2 号', nameEn: 'Viking 2', nameJa: 'バイキング 2 号', nameRu: '«Викинг-2»', lat: 47.97, lng: 134.26, yearLabel: '1976' },
  { nameZh: '探路者号', nameEn: 'Pathfinder', nameJa: 'マーズ・パスファインダー', nameRu: '«Марс Пасфайндер»', lat: 19.13, lng: -33.22, yearLabel: '1997' },
  { nameZh: '勇气号', nameEn: 'Spirit', nameJa: 'スピリット', nameRu: '«Спирит»', lat: -14.57, lng: 175.47, yearLabel: '2004' },
  { nameZh: '机遇号', nameEn: 'Opportunity', nameJa: 'オポチュニティ', nameRu: '«Оппортьюнити»', lat: -1.95, lng: -5.53, yearLabel: '2004' },
  { nameZh: '好奇号', nameEn: 'Curiosity', nameJa: 'キュリオシティ', nameRu: '«Кьюриосити»', lat: -4.59, lng: 137.44, yearLabel: '2012' },
  { nameZh: '洞察号', nameEn: 'InSight', nameJa: 'インサイト', nameRu: 'InSight', lat: 4.5, lng: 135.62, yearLabel: '2018' },
  { nameZh: '毅力号', nameEn: 'Perseverance', nameJa: 'パーサヴィアランス', nameRu: '«Персеверанс»', lat: 18.44, lng: 77.45, yearLabel: '2021' },
  { nameZh: '祝融号', nameEn: 'Zhurong', nameJa: '祝融号', nameRu: '«Чжужун»', lat: 25.07, lng: 109.93, yearLabel: '2021' },
]
