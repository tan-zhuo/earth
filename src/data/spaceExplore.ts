import { GALAXY_FACTS, PLANETS, SUN_FACTS, UNIVERSE_FACTS, factRow } from './space'
import type { L4, SpaceFacts } from './space'
import { DEEP_SPACE_PROBES } from './spacecraft'
import type { ExploreItem, ExploreLayer } from '../components/space/SpaceExplorer'

const facts = (title: L4, subtitle: L4, desc: L4, rows: [L4, L4][]): SpaceFacts => ({
  titleZh: title[0], titleEn: title[1], titleJa: title[2], titleRu: title[3],
  subtitleZh: subtitle[0], subtitleEn: subtitle[1], subtitleJa: subtitle[2], subtitleRu: subtitle[3],
  descZh: desc[0], descEn: desc[1], descJa: desc[2], descRu: desc[3],
  rows: rows.map(([label, value]) => factRow(label, value)),
})
const item = (id: string, color: string, f: SpaceFacts, source: string): ExploreItem => ({ id, color, nameZh: f.titleZh, nameEn: f.titleEn, nameJa: f.titleJa, nameRu: f.titleRu, facts: f, source })
/** 探测器名称的日/俄字段（缺失时回退英文） */
const probeName = (probe: (typeof DEEP_SPACE_PROBES)[number]): L4 => {
  const p = probe as typeof probe & { nameJa?: string; nameRu?: string }
  return [p.nameZh, p.nameEn, p.nameJa ?? p.nameEn, p.nameRu ?? p.nameEn]
}
export const SOLAR_LAYERS: ExploreLayer[] = [
  { id: 'orbits', zh: '轨道', en: 'Orbits', ja: '軌道', ru: 'Орбиты', color: '#64748b' },
  { id: 'belts', zh: '小天体带', en: 'Small bodies', ja: '小天体帯', ru: 'Малые тела', color: '#c4b5fd' },
  { id: 'guides', zh: '拉格朗日点', en: 'Lagrange points', ja: 'ラグランジュ点', ru: 'Точки Лагранжа', color: '#67e8f9' },
  { id: 'probes', zh: '探测器', en: 'Probes', ja: '探査機', ru: 'Зонды', color: '#cbd5e1' },
]
export const SOLAR_ITEMS: ExploreItem[] = [
  item('overview', '#fbbf24', facts(
    ['太阳系', 'Solar System', '太陽系', 'Солнечная система'],
    ['一颗恒星，八颗行星，无数小世界', 'One star, eight planets, countless small worlds', '1 つの恒星、8 つの惑星、無数の小さな世界', 'Одна звезда, восемь планет, бесчисленные малые миры'],
    ['从内侧的岩石行星到外侧的气态与冰巨星，太阳的引力把这些世界连在一起。选择一个行星查看资料，或打开小天体带，辨认火星与木星之间的小行星带及海王星之外的柯伊伯带。',
     'Solar gravity binds rocky inner worlds, gas giants and ice giants. Select a planet to learn more, or explore the asteroid belt between Mars and Jupiter and the Kuiper Belt beyond Neptune.',
     '内側の岩石惑星から外側の巨大ガス惑星・巨大氷惑星まで、太陽の重力がこれらの世界を結びつけています。惑星を選んで詳しく見るか、小天体帯を表示して火星と木星の間の小惑星帯や海王星の外側のカイパーベルトを確かめてみましょう。',
     'Гравитация Солнца удерживает вместе каменистые внутренние планеты, газовых и ледяных гигантов. Выберите планету, чтобы узнать подробности, или включите слой малых тел и найдите пояс астероидов между Марсом и Юпитером и пояс Койпера за Нептуном.'],
    [[['行星', 'Planets', '惑星', 'Планеты'], ['8 颗', '8', '8 個', '8']],
     [['形成时间', 'Formation', '形成時期', 'Образование'], ['约 46 亿年前', '~4.6 billion years ago', '約 46 億年前', 'около 4,6 млрд лет назад']]]), 'https://science.nasa.gov/solar-system/'),
  item('sun', '#fbbf24', SUN_FACTS, 'https://science.nasa.gov/sun/'),
  ...PLANETS.map(p => item(p.id, '#7dd3fc', p.facts, p.id === 'jupiter' ? 'https://science.nasa.gov/jupiter/jupiter-moons/' : ['saturn', 'uranus'].includes(p.id) ? `https://science.nasa.gov/${p.id}/moons/` : `https://science.nasa.gov/${p.id}/`)),
  item('asteroids', '#d6c3a3', facts(
    ['小行星带', 'Asteroid Belt', '小惑星帯', 'Пояс астероидов'],
    ['火星与木星之间的岩石世界', 'Rocky worlds between Mars and Jupiter', '火星と木星の間にある岩石の世界', 'Каменные миры между Марсом и Юпитером'],
    ['这里保存着太阳系形成早期的岩石残余，谷神星也在其中。画面增加了粒子密度以便观察；真实的小行星之间相隔很远。',
     'Rocky leftovers from the early Solar System share this region with the dwarf planet Ceres. Particle density is exaggerated here; real asteroids are widely separated.',
     'ここには太陽系形成初期の岩石の残骸があり、準惑星ケレスもこの中にあります。見やすくするため粒子の密度を高めていますが、実際の小惑星どうしは遠く離れています。',
     'Здесь хранятся каменные остатки ранней Солнечной системы, среди них — карликовая планета Церера. Плотность частиц увеличена для наглядности; настоящие астероиды разделены огромными расстояниями.'],
    [[['位置', 'Location', '位置', 'Расположение'], ['火星与木星之间', 'Between Mars and Jupiter', '火星と木星の間', 'Между Марсом и Юпитером']],
     [['主要成分', 'Material', '主な成分', 'Состав'], ['岩石与金属', 'Rock and metal', '岩石と金属', 'Камень и металл']]]), 'https://science.nasa.gov/solar-system/asteroids/facts/'),
  item('kuiper', '#a5b4fc', facts(
    ['柯伊伯带', 'Kuiper Belt', 'カイパーベルト', 'Пояс Койпера'],
    ['海王星之外的冰冷遗迹', 'Icy remnants beyond Neptune', '海王星の外側に広がる凍った残骸', 'Ледяные остатки за Нептуном'],
    ['海王星轨道之外分布着大量冰质小天体，包括冥王星。它们保留了太阳系早期的物质，也是一部分短周期彗星的来源。',
     'Beyond Neptune lies a broad population of icy bodies, including Pluto. They preserve material from the early Solar System and supply some short-period comets.',
     '海王星の軌道の外側には、冥王星を含む多数の氷天体が分布しています。太陽系初期の物質を保存しており、一部の短周期彗星のふるさとでもあります。',
     'За орбитой Нептуна находится множество ледяных тел, включая Плутон. Они сохраняют вещество ранней Солнечной системы и служат источником части короткопериодических комет.'],
    [[['位置', 'Location', '位置', 'Расположение'], ['海王星轨道外', 'Beyond Neptune', '海王星の軌道の外側', 'За орбитой Нептуна']],
     [['代表天体', 'Example', '代表的な天体', 'Пример'], ['冥王星', 'Pluto', '冥王星', 'Плутон']]]), 'https://science.nasa.gov/solar-system/kuiper-belt/facts/'),
  item('lagrange', '#67e8f9', facts(
    ['日地拉格朗日点', 'Sun–Earth Lagrange Points', '太陽–地球系のラグランジュ点', 'Точки Лагранжа Солнце–Земля'],
    ['随地球公转的五个特殊位置', 'Five special locations moving with Earth', '地球とともに公転する 5 つの特別な位置', 'Пять особых точек, движущихся вместе с Землёй'],
    ['在这五个位置附近，小天体可以与地球保持相同的绕日周期。L1、L2、L3 附近的平衡不稳定，航天器需要调整轨道；L4 和 L5 位于地球前后约 60°。韦布望远镜围绕日地 L2 运行。',
     'Near these five locations, a small object can share Earth’s orbital period. L1, L2 and L3 are unstable and spacecraft need station keeping; L4 and L5 lie roughly 60° ahead of and behind Earth. Webb orbits near Sun–Earth L2.',
     'これら 5 つの位置の付近では、小天体が地球と同じ周期で太陽を公転できます。L1・L2・L3 付近の釣り合いは不安定で、探査機は軌道修正が必要です。L4 と L5 は地球の前後約 60° にあります。ウェッブ宇宙望遠鏡は太陽–地球 L2 の周りを回っています。',
     'Вблизи этих пяти точек небольшое тело может обращаться вокруг Солнца с тем же периодом, что и Земля. Равновесие в L1, L2 и L3 неустойчиво, и аппаратам нужна коррекция орбиты; L4 и L5 находятся примерно на 60° впереди и позади Земли. Телескоп «Джеймс Уэбб» обращается около точки L2.'],
    [[['位置数量', 'Locations', '位置の数', 'Количество'], ['5 个', '5', '5 か所', '5']],
     [['韦布望远镜', 'Webb telescope', 'ウェッブ宇宙望遠鏡', 'Телескоп «Уэбб»'], ['日地 L2 附近', 'Near Sun–Earth L2', '太陽–地球 L2 付近', 'Около L2 Солнце–Земля']]]), 'https://science.nasa.gov/resource/what-is-a-lagrange-point/'),
  ...DEEP_SPACE_PROBES.map(probe => item(probe.id, '#cbd5e1', facts(
    probeName(probe),
    ['太阳系探测 · 轨迹示意', 'Solar System exploration · illustrative trajectory', '太陽系探査 · 軌跡はイメージ', 'Исследование Солнечной системы · траектория условна'],
    ['探测器帮助我们近距离研究太阳、行星与星际环境。画面中的点和连线只表示探索方向，不是当前定位或真实飞行轨迹；可以暂停动画，旋转视角查看。',
     'Spacecraft let us study the Sun, planets and interstellar environment up close. Dots and lines illustrate exploration directions, not current positions or measured flight paths. Pause and rotate to inspect the scene.',
     '探査機のおかげで、太陽や惑星、星間空間を間近で調べることができます。画面の点と線は探査の方向を示すだけで、現在位置や実際の飛行経路ではありません。アニメーションを一時停止し、視点を回して観察できます。',
     'Космические зонды позволяют изучать Солнце, планеты и межзвёздную среду вблизи. Точки и линии лишь показывают направления исследований, а не текущие положения или реальные траектории. Поставьте анимацию на паузу и поверните сцену, чтобы рассмотреть её.'],
    [[['类别', 'Type', '種類', 'Тип'], ['无人探测器', 'Robotic spacecraft', '無人探査機', 'Автоматический зонд']],
     [['位置显示', 'Position', '位置表示', 'Положение'], ['示意，非实时', 'Illustrative, not live', 'イメージ（リアルタイムではありません）', 'Условное, не в реальном времени']]]), 'https://science.nasa.gov/solar-system/')),

]
export const GALAXY_LAYERS: ExploreLayer[] = [
  { id: 'disk', zh: '恒星盘', en: 'Stellar disk', ja: '恒星円盤', ru: 'Звёздный диск', color: '#93c5fd' },
  { id: 'nebula', zh: '星云与尘埃', en: 'Gas & dust', ja: '星雲と塵', ru: 'Газ и пыль', color: '#f9a8d4' },
  { id: 'halo', zh: '银晕星团', en: 'Halo clusters', ja: 'ハローの星団', ru: 'Скопления гало', color: '#fde68a' },
]
export const GALAXY_ITEMS: ExploreItem[] = [
  item('overview', '#93c5fd', GALAXY_FACTS, 'https://science.nasa.gov/missions/hubble/apocalypse-when-hubble-casts-doubt-on-certainty-of-galactic-collision/'),
  item('sun', '#fbbf24', facts(
    ['太阳系的位置', 'Our Place in the Galaxy', '太陽系の位置', 'Наше место в Галактике'],
    ['猎户支臂 · 我们的宇宙地址', 'Orion Spur · our cosmic address', 'オリオン腕 · 私たちの宇宙の住所', 'Рукав Ориона · наш космический адрес'],
    ['太阳位于银河系的盘面，处在两条较大的旋臂之间的一段支臂中。从这里向银盘内部望去，无数遥远恒星汇成夜空中的银河。',
     'The Sun lies in the galactic disk, on a spur between larger spiral arms. Looking through the disk from here, distant stars blend into the band of the Milky Way.',
     '太陽は銀河円盤の中、2 本の大きな渦巻腕の間にある支腕にあります。ここから円盤の内側を見ると、無数の遠い恒星が夜空の天の川となって見えます。',
     'Солнце находится в диске Галактики, в ответвлении между крупными спиральными рукавами. Если смотреть отсюда вдоль диска, далёкие звёзды сливаются в полосу Млечного Пути.'],
    [[['距银心', 'From the center', '銀河中心からの距離', 'От центра'], ['约 2.6 万光年', '~26,000 light-years', '約 2.6 万光年', '~26 000 световых лет']],
     [['位置', 'Location', '位置', 'Расположение'], ['猎户支臂', 'Orion Spur', 'オリオン腕', 'Рукав Ориона']]]), 'https://science.nasa.gov/resource/the-milky-way-galaxy/'),
  item('core', '#f9a8d4', facts(
    ['人马座 A*', 'Sagittarius A*', 'いて座 A*', 'Стрелец A*'],
    ['藏在明亮银心中的超大质量黑洞', 'A supermassive black hole in the galactic center', '明るい銀河中心に潜む超大質量ブラックホール', 'Сверхмассивная чёрная дыра в центре Галактики'],
    ['银心的亮光来自密集的恒星和周围物质，黑洞本身并不发光。天文学家通过附近恒星的轨道研究它的质量；这里的光晕表示银心区域，并非黑洞的真实大小。',
     'The central glow comes from dense stars and surrounding matter, not light emitted by the black hole. Orbits of nearby stars reveal its mass. The glow here represents the central region, not the size of the black hole.',
     '銀河中心の輝きは密集した恒星と周囲の物質によるもので、ブラックホール自体は光りません。天文学者は近くの恒星の軌道からその質量を調べています。ここでの光は中心領域を表しており、ブラックホールの実際の大きさではありません。',
     'Свечение центра создают плотно расположенные звёзды и окружающее вещество — сама чёрная дыра не светится. Её массу определяют по орбитам ближайших звёзд. Сияние здесь обозначает центральную область, а не размер чёрной дыры.'],
    [[['质量', 'Mass', '質量', 'Масса'], ['约 430 万个太阳', '~4.3 million Suns', '太陽の約 430 万倍', '~4,3 млн масс Солнца']],
     [['所在区域', 'Location', '場所', 'Расположение'], ['银河系中心', 'Galactic center', '天の川銀河の中心', 'Центр Галактики']]]), 'https://science.nasa.gov/mission/webb/science-overview/science-explainers/what-is-the-center-of-our-galaxy-like/'),
  item('arms', '#93c5fd', facts(
    ['旋臂与恒星诞生', 'Spiral Arms', '渦巻腕と星の誕生', 'Спиральные рукава'],
    ['蓝白恒星与粉色恒星形成区', 'Blue-white stars and pink star-forming regions', '青白い恒星とピンクの星形成領域', 'Бело-голубые звёзды и розовые области звездообразования'],
    ['气体与尘埃沿旋臂聚集，孕育年轻恒星。蓝白色突出年轻恒星群，粉色示意电离氢区域；颜色用来解释结构，不是银河系的外部实拍。',
     'Gas and dust gather along spiral arms, where young stars form. Blue-white highlights young stellar populations; pink indicates ionized-hydrogen regions. These colors explain structure rather than reproduce a photograph.',
     'ガスと塵は渦巻腕に沿って集まり、若い恒星を生み出します。青白い色は若い星の集団を、ピンクは電離水素領域を表しています。色は構造を説明するためのもので、天の川銀河を外から撮影した写真ではありません。',
     'Газ и пыль собираются вдоль спиральных рукавов, где рождаются молодые звёзды. Бело-голубой цвет выделяет молодые звёздные населения, розовый — области ионизованного водорода. Цвета объясняют структуру и не воспроизводят фотографию.'],
    [[['银河系类型', 'Galaxy type', '銀河の種類', 'Тип галактики'], ['棒旋星系', 'Barred spiral', '棒渦巻銀河', 'Спиральная с перемычкой']],
     [['观察建议', 'Try this', '観察のヒント', 'Попробуйте'], ['切换俯视，辨认旋臂', 'Top view reveals the arms', '真上から見て渦巻腕を探す', 'Вид сверху покажет рукава']]]), 'https://science.nasa.gov/resource/the-milky-way-galaxy/'),
  item('halo', '#fde68a', facts(
    ['银晕与球状星团', 'Halo & Globular Clusters', 'ハローと球状星団', 'Гало и шаровые скопления'],
    ['银盘上下的古老恒星群', 'Old stellar populations around the disk', '銀河円盤の上下に広がる古い恒星の集団', 'Старые звёздные населения вокруг диска'],
    ['银河系并非只有一个薄盘。球状星团分布在银盘之外的广阔区域，包含引力束缚的古老恒星。切换侧视更容易看清盘面与银晕的关系。',
     'The Milky Way is more than a thin disk. Globular clusters contain old, gravitationally bound stars and inhabit a broad region around it. A side view reveals the contrast between disk and halo.',
     '天の川銀河は薄い円盤だけではありません。球状星団は重力で束縛された古い恒星の集まりで、円盤の外側の広い範囲に分布しています。横から見ると円盤とハローの違いがよくわかります。',
     'Млечный Путь — это не только тонкий диск. Шаровые скопления состоят из старых гравитационно связанных звёзд и занимают обширную область вокруг него. Вид сбоку показывает контраст между диском и гало.'],
    [[['形态', 'Structure', '形態', 'Структура'], ['环绕银盘分布', 'Surrounds the disk', '円盤を取り囲むように分布', 'Окружает диск']],
     [['观察建议', 'Try this', '観察のヒント', 'Попробуйте'], ['侧视并关闭恒星盘', 'Side view with the disk hidden', '横から見て恒星円盤を非表示に', 'Вид сбоку без звёздного диска']]]), 'https://science.nasa.gov/universe/galaxies/'),
]
export const UNIVERSE_LAYERS: ExploreLayer[] = [
  { id: 'clusters', zh: '星系团', en: 'Clusters', ja: '銀河団', ru: 'Скопления', color: '#fed7aa' },
  { id: 'filaments', zh: '宇宙纤维', en: 'Filaments', ja: 'フィラメント', ru: 'Нити', color: '#a5b4fc' },
  { id: 'voids', zh: '空洞轮廓', en: 'Void outline', ja: 'ボイドの輪郭', ru: 'Контур пустоты', color: '#67e8f9' },
]
export const UNIVERSE_ITEMS: ExploreItem[] = [
  item('overview', '#a5b4fc', UNIVERSE_FACTS, 'https://science.nasa.gov/mission/hubble/science/science-highlights/mapping-the-cosmic-web/'),
  item('local', '#fbbf24', facts(
    ['我们的星系邻居', 'Our Galactic Neighborhood', '私たちの銀河のご近所', 'Наши галактические соседи'],
    ['银河系、仙女座与三角座', 'Milky Way, Andromeda and Triangulum', '天の川銀河、アンドロメダ銀河、さんかく座銀河', 'Млечный Путь, Андромеда и Треугольник'],
    ['银河系属于本星系群，仙女座与三角座也是其中的旋涡星系。这里把近邻放大展示，帮助定位我们在宇宙网中的位置。',
     'The Milky Way belongs to the Local Group, alongside the spiral galaxies Andromeda and Triangulum. The neighborhood is enlarged here to help locate our home in the cosmic web.',
     '天の川銀河は局所銀河群に属し、アンドロメダ銀河やさんかく座銀河も同じ群の渦巻銀河です。宇宙の網の中で私たちの位置がわかるよう、近くの銀河を拡大して表示しています。',
     'Млечный Путь входит в Местную группу вместе со спиральными галактиками Андромеда и Треугольник. Окрестности увеличены, чтобы было проще найти наш дом в космической паутине.'],
    [[['我们的家园', 'Our home', '私たちのふるさと', 'Наш дом'], ['银河系', 'Milky Way', '天の川銀河', 'Млечный Путь']],
     [['所属结构', 'Membership', '所属', 'Принадлежность'], ['本星系群', 'Local Group', '局所銀河群', 'Местная группа']]]), 'https://science.nasa.gov/universe/galaxies/'),
  item('cluster', '#fed7aa', facts(
    ['星系团', 'Galaxy Clusters', '銀河団', 'Скопления галактик'],
    ['宇宙网中明亮而致密的节点', 'Bright, dense nodes of the cosmic web', '宇宙の網の中の明るく密集した結節点', 'Яркие плотные узлы космической паутины'],
    ['星系团包含星系、炽热气体与暗物质。这里的暖色光团表示星系集中的区域；关闭纤维图层，可以单独观察这些节点。',
     'Galaxy clusters contain galaxies, hot gas and dark matter. Warm concentrations show regions rich in galaxies. Hide the filament layer to examine these nodes on their own.',
     '銀河団は銀河、高温のガス、ダークマターでできています。暖色の光のかたまりは銀河が集中している領域を表します。フィラメントのレイヤーを非表示にすると、結節点だけを観察できます。',
     'Скопления содержат галактики, горячий газ и тёмную материю. Тёплые сгустки света показывают области с высокой концентрацией галактик. Скройте слой нитей, чтобы рассмотреть эти узлы отдельно.'],
    [[['组成', 'Contents', '構成', 'Состав'], ['星系、气体与暗物质', 'Galaxies, gas, dark matter', '銀河、ガス、ダークマター', 'Галактики, газ, тёмная материя']],
     [['结构角色', 'Role', '役割', 'Роль'], ['宇宙网节点', 'Cosmic web nodes', '宇宙の網の結節点', 'Узлы космической паутины']]]), 'https://science.nasa.gov/mission/hubble/science/science-highlights/mapping-the-cosmic-web/'),
  item('filament', '#a5b4fc', facts(
    ['宇宙纤维', 'Cosmic Filaments', '宇宙のフィラメント', 'Космические нити'],
    ['连接星系团的物质网络', 'Matter connecting galaxy clusters', '銀河団をつなぐ物質のネットワーク', 'Вещество, соединяющее скопления галактик'],
    ['星系沿纤维与片状结构分布，暗物质的引力影响着这张网络的形成。蓝白色粒子勾勒出连接关系，并不表示我们直接看到了暗物质。',
     'Galaxies trace filaments and sheets shaped by gravity, including that of dark matter. Blue-white particles reveal connections; they do not represent direct images of dark matter.',
     '銀河はフィラメントやシート状の構造に沿って分布し、ダークマターの重力がこの網の形成に影響しています。青白い粒子はつながりを示したもので、ダークマターを直接見ているわけではありません。',
     'Галактики выстраиваются вдоль нитей и стен, сформированных гравитацией, в том числе тёмной материи. Бело-голубые частицы показывают связи, но не являются прямым изображением тёмной материи.'],
    [[['形态', 'Shape', '形状', 'Форма'], ['纤维与片状结构', 'Filaments and sheets', 'フィラメントとシート', 'Нити и стены']],
     [['连接对象', 'Connects', '接続先', 'Соединяет'], ['星系群与星系团', 'Groups and clusters', '銀河群と銀河団', 'Группы и скопления']]]), 'https://science.nasa.gov/mission/hubble/science/science-highlights/mapping-the-cosmic-web/'),
  item('void', '#67e8f9', facts(
    ['宇宙空洞', 'Cosmic Voids', '宇宙のボイド', 'Космические пустоты'],
    ['纤维之间，星系稀少的区域', 'Sparse regions between filaments', 'フィラメントの間にある銀河の少ない領域', 'Разреженные области между нитями'],
    ['空洞并非绝对的真空，而是平均物质密度较低、星系较少的区域。青色球面只是帮助辨认的边界示意；真实空洞形状并不规则。',
     'Voids are not perfect vacuums. They are underdense regions with fewer galaxies. The cyan sphere is a visual guide; real void boundaries are irregular.',
     'ボイドは完全な真空ではなく、平均の物質密度が低く銀河の少ない領域です。水色の球面は位置をわかりやすくするための境界のイメージで、実際のボイドの形は不規則です。',
     'Пустоты — не абсолютный вакуум, а области с пониженной плотностью вещества и малым числом галактик. Голубая сфера — лишь наглядная граница; реальные пустоты имеют неправильную форму.'],
    [[['密度', 'Density', '密度', 'Плотность'], ['低于宇宙平均值', 'Below the cosmic average', '宇宙の平均より低い', 'Ниже средней по Вселенной']],
     [['轮廓', 'Outline', '輪郭', 'Контур'], ['仅为示意', 'Illustrative boundary', 'イメージのみ', 'Условная граница']]]), 'https://science.nasa.gov/mission/hubble/science/science-highlights/mapping-the-cosmic-web/'),
]
export const UNIVERSE_POSITIONS: Record<string, [number, number, number]> = { local: [0, 0, 0], cluster: [30, 8, -12], filament: [10, 1.5, -6], void: [38, 20, 35] }
