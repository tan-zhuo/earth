import { GALAXY_FACTS, PLANETS, SUN_FACTS, UNIVERSE_FACTS } from './space'
import type { SpaceFacts } from './space'
import { DEEP_SPACE_PROBES } from './spacecraft'
import type { ExploreItem, ExploreLayer } from '../components/space/SpaceExplorer'

const facts = (title: [string, string], subtitle: [string, string], desc: [string, string], rows: [string, string, string, string][]): SpaceFacts => ({
  titleZh: title[0], titleEn: title[1], subtitleZh: subtitle[0], subtitleEn: subtitle[1], descZh: desc[0], descEn: desc[1],
  rows: rows.map(([labelZh, labelEn, valueZh, valueEn]) => ({ labelZh, labelEn, valueZh, valueEn })),
})
const item = (id: string, color: string, f: SpaceFacts, source: string): ExploreItem => ({ id, color, nameZh: f.titleZh, nameEn: f.titleEn, facts: f, source })
export const SOLAR_LAYERS: ExploreLayer[] = [
  { id: 'orbits', zh: '轨道', en: 'Orbits', color: '#64748b' },
  { id: 'belts', zh: '小天体带', en: 'Small bodies', color: '#c4b5fd' },
  { id: 'guides', zh: '拉格朗日点', en: 'Lagrange points', color: '#67e8f9' },
  { id: 'probes', zh: '探测器', en: 'Probes', color: '#cbd5e1' },
]
export const SOLAR_ITEMS: ExploreItem[] = [
  item('overview', '#fbbf24', facts(['太阳系', 'Solar System'], ['一颗恒星，八颗行星，无数小世界', 'One star, eight planets, countless small worlds'], ['从内侧的岩石行星到外侧的气态与冰巨星，太阳的引力把这些世界连在一起。选择一个行星查看资料，或打开小天体带，辨认火星与木星之间的小行星带及海王星之外的柯伊伯带。', 'Solar gravity binds rocky inner worlds, gas giants and ice giants. Select a planet to learn more, or explore the asteroid belt between Mars and Jupiter and the Kuiper Belt beyond Neptune.'], [['行星', 'Planets', '8 颗', '8'], ['形成时间', 'Formation', '约 46 亿年前', '~4.6 billion years ago']]), 'https://science.nasa.gov/solar-system/'),
  item('sun', '#fbbf24', SUN_FACTS, 'https://science.nasa.gov/sun/'),
  ...PLANETS.map(p => item(p.id, '#7dd3fc', p.facts, p.id === 'jupiter' ? 'https://science.nasa.gov/jupiter/jupiter-moons/' : ['saturn', 'uranus'].includes(p.id) ? `https://science.nasa.gov/${p.id}/moons/` : `https://science.nasa.gov/${p.id}/`)),
  item('asteroids', '#d6c3a3', facts(['小行星带', 'Asteroid Belt'], ['火星与木星之间的岩石世界', 'Rocky worlds between Mars and Jupiter'], ['这里保存着太阳系形成早期的岩石残余，谷神星也在其中。画面增加了粒子密度以便观察；真实的小行星之间相隔很远。', 'Rocky leftovers from the early Solar System share this region with the dwarf planet Ceres. Particle density is exaggerated here; real asteroids are widely separated.'], [['位置', 'Location', '火星与木星之间', 'Between Mars and Jupiter'], ['主要成分', 'Material', '岩石与金属', 'Rock and metal']]), 'https://science.nasa.gov/solar-system/asteroids/facts/'),
  item('kuiper', '#a5b4fc', facts(['柯伊伯带', 'Kuiper Belt'], ['海王星之外的冰冷遗迹', 'Icy remnants beyond Neptune'], ['海王星轨道之外分布着大量冰质小天体，包括冥王星。它们保留了太阳系早期的物质，也是一部分短周期彗星的来源。', 'Beyond Neptune lies a broad population of icy bodies, including Pluto. They preserve material from the early Solar System and supply some short-period comets.'], [['位置', 'Location', '海王星轨道外', 'Beyond Neptune'], ['代表天体', 'Example', '冥王星', 'Pluto']]), 'https://science.nasa.gov/solar-system/kuiper-belt/facts/'),
  item('lagrange', '#67e8f9', facts(['日地拉格朗日点', 'Sun–Earth Lagrange Points'], ['随地球公转的五个特殊位置', 'Five special locations moving with Earth'], ['在这五个位置附近，小天体可以与地球保持相同的绕日周期。L1、L2、L3 附近的平衡不稳定，航天器需要调整轨道；L4 和 L5 位于地球前后约 60°。韦布望远镜围绕日地 L2 运行。', 'Near these five locations, a small object can share Earth’s orbital period. L1, L2 and L3 are unstable and spacecraft need station keeping; L4 and L5 lie roughly 60° ahead of and behind Earth. Webb orbits near Sun–Earth L2.'], [['位置数量', 'Locations', '5 个', '5'], ['韦布望远镜', 'Webb telescope', '日地 L2 附近', 'Near Sun–Earth L2']]), 'https://science.nasa.gov/resource/what-is-a-lagrange-point/'),
  ...DEEP_SPACE_PROBES.map(probe => item(probe.id, '#cbd5e1', facts([probe.nameZh, probe.nameEn], ['太阳系探测 · 轨迹示意', 'Solar System exploration · illustrative trajectory'], ['探测器帮助我们近距离研究太阳、行星与星际环境。画面中的点和连线只表示探索方向，不是当前定位或真实飞行轨迹；可以暂停动画，旋转视角查看。', 'Spacecraft let us study the Sun, planets and interstellar environment up close. Dots and lines illustrate exploration directions, not current positions or measured flight paths. Pause and rotate to inspect the scene.'], [['类别', 'Type', '无人探测器', 'Robotic spacecraft'], ['位置显示', 'Position', '示意，非实时', 'Illustrative, not live']]), 'https://science.nasa.gov/solar-system/')),

]
export const GALAXY_LAYERS: ExploreLayer[] = [
  { id: 'disk', zh: '恒星盘', en: 'Stellar disk', color: '#93c5fd' },
  { id: 'nebula', zh: '星云与尘埃', en: 'Gas & dust', color: '#f9a8d4' },
  { id: 'halo', zh: '银晕星团', en: 'Halo clusters', color: '#fde68a' },
]
export const GALAXY_ITEMS: ExploreItem[] = [
  item('overview', '#93c5fd', GALAXY_FACTS, 'https://science.nasa.gov/missions/hubble/apocalypse-when-hubble-casts-doubt-on-certainty-of-galactic-collision/'),
  item('sun', '#fbbf24', facts(['太阳系的位置', 'Our Place in the Galaxy'], ['猎户支臂 · 我们的宇宙地址', 'Orion Spur · our cosmic address'], ['太阳位于银河系的盘面，处在两条较大的旋臂之间的一段支臂中。从这里向银盘内部望去，无数遥远恒星汇成夜空中的银河。', 'The Sun lies in the galactic disk, on a spur between larger spiral arms. Looking through the disk from here, distant stars blend into the band of the Milky Way.'], [['距银心', 'From the center', '约 2.6 万光年', '~26,000 light-years'], ['位置', 'Location', '猎户支臂', 'Orion Spur']]), 'https://science.nasa.gov/resource/the-milky-way-galaxy/'),
  item('core', '#f9a8d4', facts(['人马座 A*', 'Sagittarius A*'], ['藏在明亮银心中的超大质量黑洞', 'A supermassive black hole in the galactic center'], ['银心的亮光来自密集的恒星和周围物质，黑洞本身并不发光。天文学家通过附近恒星的轨道研究它的质量；这里的光晕表示银心区域，并非黑洞的真实大小。', 'The central glow comes from dense stars and surrounding matter, not light emitted by the black hole. Orbits of nearby stars reveal its mass. The glow here represents the central region, not the size of the black hole.'], [['质量', 'Mass', '约 430 万个太阳', '~4.3 million Suns'], ['所在区域', 'Location', '银河系中心', 'Galactic center']]), 'https://science.nasa.gov/mission/webb/science-overview/science-explainers/what-is-the-center-of-our-galaxy-like/'),
  item('arms', '#93c5fd', facts(['旋臂与恒星诞生', 'Spiral Arms'], ['蓝白恒星与粉色恒星形成区', 'Blue-white stars and pink star-forming regions'], ['气体与尘埃沿旋臂聚集，孕育年轻恒星。蓝白色突出年轻恒星群，粉色示意电离氢区域；颜色用来解释结构，不是银河系的外部实拍。', 'Gas and dust gather along spiral arms, where young stars form. Blue-white highlights young stellar populations; pink indicates ionized-hydrogen regions. These colors explain structure rather than reproduce a photograph.'], [['银河系类型', 'Galaxy type', '棒旋星系', 'Barred spiral'], ['观察建议', 'Try this', '切换俯视，辨认旋臂', 'Top view reveals the arms']]), 'https://science.nasa.gov/resource/the-milky-way-galaxy/'),
  item('halo', '#fde68a', facts(['银晕与球状星团', 'Halo & Globular Clusters'], ['银盘上下的古老恒星群', 'Old stellar populations around the disk'], ['银河系并非只有一个薄盘。球状星团分布在银盘之外的广阔区域，包含引力束缚的古老恒星。切换侧视更容易看清盘面与银晕的关系。', 'The Milky Way is more than a thin disk. Globular clusters contain old, gravitationally bound stars and inhabit a broad region around it. A side view reveals the contrast between disk and halo.'], [['形态', 'Structure', '环绕银盘分布', 'Surrounds the disk'], ['观察建议', 'Try this', '侧视并关闭恒星盘', 'Side view with the disk hidden']]), 'https://science.nasa.gov/universe/galaxies/'),
]
export const UNIVERSE_LAYERS: ExploreLayer[] = [
  { id: 'clusters', zh: '星系团', en: 'Clusters', color: '#fed7aa' },
  { id: 'filaments', zh: '宇宙纤维', en: 'Filaments', color: '#a5b4fc' },
  { id: 'voids', zh: '空洞轮廓', en: 'Void outline', color: '#67e8f9' },
]
export const UNIVERSE_ITEMS: ExploreItem[] = [
  item('overview', '#a5b4fc', UNIVERSE_FACTS, 'https://science.nasa.gov/mission/hubble/science/science-highlights/mapping-the-cosmic-web/'),
  item('local', '#fbbf24', facts(['我们的星系邻居', 'Our Galactic Neighborhood'], ['银河系、仙女座与三角座', 'Milky Way, Andromeda and Triangulum'], ['银河系属于本星系群，仙女座与三角座也是其中的旋涡星系。这里把近邻放大展示，帮助定位我们在宇宙网中的位置。', 'The Milky Way belongs to the Local Group, alongside the spiral galaxies Andromeda and Triangulum. The neighborhood is enlarged here to help locate our home in the cosmic web.'], [['我们的家园', 'Our home', '银河系', 'Milky Way'], ['所属结构', 'Membership', '本星系群', 'Local Group']]), 'https://science.nasa.gov/universe/galaxies/'),
  item('cluster', '#fed7aa', facts(['星系团', 'Galaxy Clusters'], ['宇宙网中明亮而致密的节点', 'Bright, dense nodes of the cosmic web'], ['星系团包含星系、炽热气体与暗物质。这里的暖色光团表示星系集中的区域；关闭纤维图层，可以单独观察这些节点。', 'Galaxy clusters contain galaxies, hot gas and dark matter. Warm concentrations show regions rich in galaxies. Hide the filament layer to examine these nodes on their own.'], [['组成', 'Contents', '星系、气体与暗物质', 'Galaxies, gas, dark matter'], ['结构角色', 'Role', '宇宙网节点', 'Cosmic web nodes']]), 'https://science.nasa.gov/mission/hubble/science/science-highlights/mapping-the-cosmic-web/'),
  item('filament', '#a5b4fc', facts(['宇宙纤维', 'Cosmic Filaments'], ['连接星系团的物质网络', 'Matter connecting galaxy clusters'], ['星系沿纤维与片状结构分布，暗物质的引力影响着这张网络的形成。蓝白色粒子勾勒出连接关系，并不表示我们直接看到了暗物质。', 'Galaxies trace filaments and sheets shaped by gravity, including that of dark matter. Blue-white particles reveal connections; they do not represent direct images of dark matter.'], [['形态', 'Shape', '纤维与片状结构', 'Filaments and sheets'], ['连接对象', 'Connects', '星系群与星系团', 'Groups and clusters']]), 'https://science.nasa.gov/mission/hubble/science/science-highlights/mapping-the-cosmic-web/'),
  item('void', '#67e8f9', facts(['宇宙空洞', 'Cosmic Voids'], ['纤维之间，星系稀少的区域', 'Sparse regions between filaments'], ['空洞并非绝对的真空，而是平均物质密度较低、星系较少的区域。青色球面只是帮助辨认的边界示意；真实空洞形状并不规则。', 'Voids are not perfect vacuums. They are underdense regions with fewer galaxies. The cyan sphere is a visual guide; real void boundaries are irregular.'], [['密度', 'Density', '低于宇宙平均值', 'Below the cosmic average'], ['轮廓', 'Outline', '仅为示意', 'Illustrative boundary']]), 'https://science.nasa.gov/mission/hubble/science/science-highlights/mapping-the-cosmic-web/'),
]
export const UNIVERSE_POSITIONS: Record<string, [number, number, number]> = { local: [0, 0, 0], cluster: [30, 8, -12], filament: [10, 1.5, -6], void: [38, 20, 35] }
