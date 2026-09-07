/**
 * 航天器 3D 展厅的静态数据（双语）：资料卡文案 + 部件名称。
 * 模型几何在 components/space/craftBuilders.ts 中程序化生成，两边靠 id / partId 对应。
 */
import type { SpaceFacts } from './space'

export interface CraftPart {
  /** 与模型锚点 userData.partId 对应 */
  id: string
  nameZh: string
  nameEn: string
}

export interface CraftModel {
  id: string
  nameZh: string
  nameEn: string
  /** 一行分类标签，用于菜单与切换条 */
  kindZh: string
  kindEn: string
  parts: CraftPart[]
  facts: SpaceFacts
}

export const SPACECRAFT_MODELS: CraftModel[] = [
  {
    id: 'hubble',
    nameZh: '哈勃太空望远镜',
    nameEn: 'Hubble Space Telescope',
    kindZh: '空间望远镜',
    kindEn: 'Space telescope',
    parts: [
      { id: 'tube', nameZh: '主镜筒（2.4 m 主镜）', nameEn: 'Optical tube (2.4 m mirror)' },
      { id: 'panel', nameZh: '太阳能帆板', nameEn: 'Solar array' },
      { id: 'antenna', nameZh: '高增益天线', nameEn: 'High-gain antenna' },
      { id: 'aperture', nameZh: '遮光罩与舱门', nameEn: 'Aperture door' },
    ],
    facts: {
      titleZh: '哈勃太空望远镜',
      titleEn: 'Hubble Space Telescope',
      subtitleZh: 'NASA / ESA · 1990 年发射 · 仍在服役',
      subtitleEn: 'NASA / ESA · launched 1990 · still operating',
      rows: [
        { labelZh: '发射', labelEn: 'Launch', valueZh: '1990-04-24（发现号 STS-31）', valueEn: '24 Apr 1990 (STS-31 Discovery)' },
        { labelZh: '轨道', labelEn: 'Orbit', valueZh: '约 515 km 近地轨道 · 95 分钟一圈', valueEn: '~515 km LEO · 95 min period' },
        { labelZh: '尺寸', labelEn: 'Size', valueZh: '长 13.2 m · 直径 4.2 m', valueEn: '13.2 m long · 4.2 m diameter' },
        { labelZh: '质量', labelEn: 'Mass', valueZh: '11,110 公斤', valueEn: '11,110 kg' },
        { labelZh: '主镜', labelEn: 'Primary mirror', valueZh: '2.4 m · 近紫外到近红外', valueEn: '2.4 m · near-UV to near-IR' },
      ],
      descZh:
        '哈勃在大气层之上工作，避开了大气抖动与紫外吸收，分辨率长期保持在 0.05 角秒。它入轨后才发现主镜边缘被磨掉了 2.2 微米，成像模糊；1993 年航天飞机送去 COSTAR 矫正光学装置，等于给望远镜配了副眼镜。此后 5 次在轨维修让它服役至今，哈勃深场把可见宇宙推到 130 亿年前，也让哈勃常数的测量精度进入个位数百分比。',
      descEn:
        'Above the atmosphere, Hubble sidesteps atmospheric blurring and UV absorption, holding 0.05-arcsecond resolution. Its primary mirror turned out to be ground 2.2 µm too flat; the 1993 COSTAR servicing mission effectively gave it eyeglasses. Five shuttle servicing missions have kept it running for three decades, and its Deep Fields pushed the visible universe back 13 billion years.',
    },
  },
  {
    id: 'iss',
    nameZh: '国际空间站',
    nameEn: 'International Space Station',
    kindZh: '空间站',
    kindEn: 'Space station',
    parts: [
      { id: 'truss', nameZh: '主桁架（109 m）', nameEn: 'Integrated truss (109 m)' },
      { id: 'array', nameZh: '太阳翼（8 片主翼）', nameEn: 'Solar arrays (8 wings)' },
      { id: 'modules', nameZh: '加压舱段', nameEn: 'Pressurised modules' },
      { id: 'radiator', nameZh: '散热板', nameEn: 'Thermal radiators' },
      { id: 'docked', nameZh: '对接的飞船', nameEn: 'Docked spacecraft' },
    ],
    facts: {
      titleZh: '国际空间站',
      titleEn: 'International Space Station',
      subtitleZh: '五方合作 · 2000 年起持续有人驻留',
      subtitleEn: 'Five agencies · continuously crewed since 2000',
      rows: [
        { labelZh: '参与方', labelEn: 'Partners', valueZh: 'NASA / Roscosmos / ESA / JAXA / CSA', valueEn: 'NASA / Roscosmos / ESA / JAXA / CSA' },
        { labelZh: '首个舱段', labelEn: 'First module', valueZh: '1998-11-20 曙光号', valueEn: '20 Nov 1998 (Zarya)' },
        { labelZh: '轨道', labelEn: 'Orbit', valueZh: '约 400 km · 倾角 51.6° · 92 分钟一圈', valueEn: '~400 km · 51.6° · 92 min period' },
        { labelZh: '尺寸', labelEn: 'Size', valueZh: '109 × 73 m · 加压容积 916 m³', valueEn: '109 × 73 m · 916 m³ pressurised' },
        { labelZh: '质量', labelEn: 'Mass', valueZh: '约 420 吨', valueEn: '~420 t' },
      ],
      descZh:
        '国际空间站是人类送上轨道的最大结构，也是造价最高的单体工程。它以 7.66 km/s 绕地球飞行，机组每天看到 16 次日出日落。桁架两端 8 片主太阳翼提供约 120 kW 电力，白色散热板负责把废热辐射掉。自 2000 年 11 月第一批乘组入驻以来，这里从未空过一天，长期失重生理学、蛋白质结晶、微重力燃烧等研究都在此进行。按计划它将服役到 2030 年，之后受控再入。',
      descEn:
        'The largest structure humans have ever assembled in orbit, and the most expensive single project ever built. It circles Earth at 7.66 km/s, giving its crew 16 sunrises a day. Eight main solar wings supply about 120 kW, while the white radiators dump waste heat. It has been continuously inhabited since November 2000 and is slated to operate until 2030, followed by a controlled deorbit.',
    },
  },
  {
    id: 'tiangong',
    nameZh: '天宫空间站',
    nameEn: 'Tiangong Space Station',
    kindZh: '空间站',
    kindEn: 'Space station',
    parts: [
      { id: 'core', nameZh: '天和核心舱', nameEn: 'Tianhe core module' },
      { id: 'wentian', nameZh: '问天实验舱', nameEn: 'Wentian lab module' },
      { id: 'mengtian', nameZh: '梦天实验舱', nameEn: 'Mengtian lab module' },
      { id: 'wings', nameZh: '柔性太阳翼', nameEn: 'Flexible solar wings' },
      { id: 'shenzhou', nameZh: '神舟载人飞船', nameEn: 'Shenzhou crew ship' },
      { id: 'tianzhou', nameZh: '天舟货运飞船', nameEn: 'Tianzhou cargo ship' },
    ],
    facts: {
      titleZh: '天宫空间站',
      titleEn: 'Tiangong Space Station',
      subtitleZh: '中国载人航天工程 · 2022 年建成 T 字构型',
      subtitleEn: 'CMSA · T-shape completed in 2022',
      rows: [
        { labelZh: '首个舱段', labelEn: 'First module', valueZh: '2021-04-29 天和核心舱', valueEn: '29 Apr 2021 (Tianhe)' },
        { labelZh: '构型', labelEn: 'Configuration', valueZh: '天和 + 问天 + 梦天（T 字）', valueEn: 'Tianhe + Wentian + Mengtian (T-shape)' },
        { labelZh: '轨道', labelEn: 'Orbit', valueZh: '约 390 km · 倾角 41.5°', valueEn: '~390 km · 41.5° inclination' },
        { labelZh: '质量', labelEn: 'Mass', valueZh: '三舱组合体约 100 吨', valueEn: '~100 t (three modules)' },
        { labelZh: '乘组', labelEn: 'Crew', valueZh: '3 人长期驻留 · 半年轮换', valueEn: '3 long-duration crew · 6-month rotations' },
      ],
      descZh:
        '天宫是中国自主建设并运营的近地空间站，采用 T 字构型：天和核心舱居中，负责控制、能源与生活起居；问天、梦天分列两侧，装载科学实验柜并提供出舱气闸。两艘实验舱各配两翼大型柔性太阳翼，核心舱另配一对太阳翼。神舟可停靠前向或径向端口，天舟停靠后向端口；本模型展示一种简化对接构型。巡天空间望远镜计划与空间站共轨飞行，必要时对接维修。',
      descEn:
        "China's independently built and operated low-Earth-orbit station, arranged in a T shape: the Tianhe core module handles control, power and living quarters, while Wentian and Mengtian carry science racks and an airlock. Each laboratory has two large flexible solar wings, with another pair on the core module. Shenzhou uses forward or radial ports; Tianzhou docks aft. This model shows a simplified docking configuration. The Xuntian space telescope will fly in the same orbit and dock for servicing.",
    },
  },
  {
    id: 'jwst',
    nameZh: '詹姆斯·韦布空间望远镜',
    nameEn: 'James Webb Space Telescope',
    kindZh: '空间望远镜',
    kindEn: 'Space telescope',
    parts: [
      { id: 'primary', nameZh: '主镜（18 块镀金铍镜）', nameEn: 'Primary mirror (18 segments)' },
      { id: 'secondary', nameZh: '副镜与三脚支架', nameEn: 'Secondary mirror' },
      { id: 'sunshield', nameZh: '五层遮阳罩', nameEn: 'Five-layer sunshield' },
      { id: 'bus', nameZh: '航天器总线与太阳翼', nameEn: 'Spacecraft bus & solar array' },
    ],
    facts: {
      titleZh: '詹姆斯·韦布空间望远镜',
      titleEn: 'James Webb Space Telescope',
      subtitleZh: 'NASA / ESA / CSA · 位于日地 L2 点',
      subtitleEn: 'NASA / ESA / CSA · at Sun–Earth L2',
      rows: [
        { labelZh: '发射', labelEn: 'Launch', valueZh: '2021-12-25（阿丽亚娜 5）', valueEn: '25 Dec 2021 (Ariane 5)' },
        { labelZh: '位置', labelEn: 'Location', valueZh: 'L2 点晕轨道 · 距地约 150 万 km', valueEn: 'L2 halo orbit · ~1.5 million km' },
        { labelZh: '主镜', labelEn: 'Primary mirror', valueZh: '6.5 m · 18 块镀金铍镜', valueEn: '6.5 m · 18 gold-coated beryllium segments' },
        { labelZh: '遮阳罩', labelEn: 'Sunshield', valueZh: '5 层 · 21 × 14 m', valueEn: '5 layers · 21 × 14 m' },
        { labelZh: '工作温度', labelEn: 'Operating temp', valueZh: '冷侧约 -233°C', valueEn: '~-233°C on the cold side' },
      ],
      descZh:
        '宇宙膨胀把最早那批恒星与星系的紫外光拉长成了红外，所以韦布是一台红外望远镜——而红外望远镜必须够冷，否则自身热辐射就淹没了目标。网球场大小的五层遮阳罩把太阳、地球、月球的热量全挡在一侧，让镜面稳定在 40 K 以下。6.5 m 主镜由 18 块六边形铍镜拼成，发射时折叠，入轨后靠 132 台微型作动器逐块对齐到几十纳米精度。它已经拍到红移 z>13 的星系，并用透射光谱分析系外行星大气成分。',
      descEn:
        "Cosmic expansion stretches the ultraviolet light of the first stars into the infrared, so Webb is an infrared telescope — and an infrared telescope must be cold, or its own heat drowns the signal. A tennis-court-sized five-layer sunshield blocks the Sun, Earth and Moon, holding the optics below 40 K. The 6.5 m primary is 18 hexagonal beryllium segments that launched folded and were aligned to tens of nanometres by 132 actuators. It has already imaged galaxies beyond redshift 13 and reads exoplanet atmospheres by transmission spectroscopy.",
    },
  },
  {
    id: 'voyager1',
    nameZh: '旅行者 1 号',
    nameEn: 'Voyager 1',
    kindZh: '深空探测器',
    kindEn: 'Deep-space probe',
    parts: [
      { id: 'dish', nameZh: '3.7 m 高增益天线', nameEn: '3.7 m high-gain antenna' },
      { id: 'rtg', nameZh: '同位素温差电源（RTG）', nameEn: 'Radioisotope generators (RTG)' },
      { id: 'boom', nameZh: '磁强计伸杆（13 m）', nameEn: 'Magnetometer boom (13 m)' },
      { id: 'instruments', nameZh: '科学仪器平台', nameEn: 'Science instrument platform' },
      { id: 'record', nameZh: '金唱片', nameEn: 'Golden Record' },
    ],
    facts: {
      titleZh: '旅行者 1 号',
      titleEn: 'Voyager 1',
      subtitleZh: 'NASA / JPL · 1977 年发射 · 飞得最远的人造物',
      subtitleEn: 'NASA / JPL · launched 1977 · most distant human object',
      rows: [
        { labelZh: '发射', labelEn: 'Launch', valueZh: '1977-09-05', valueEn: '5 Sep 1977' },
        { labelZh: '当前距离', labelEn: 'Current distance', valueZh: '约 168 AU（单程通信约 23 小时）', valueEn: '~168 AU (~23 h one-way signal)' },
        { labelZh: '速度', labelEn: 'Speed', valueZh: '约 17 km/s（相对太阳）', valueEn: '~17 km/s relative to the Sun' },
        { labelZh: '电源', labelEn: 'Power', valueZh: '3 台钚-238 RTG · 已衰减到约 220 W', valueEn: '3 Pu-238 RTGs · down to ~220 W' },
        { labelZh: '里程碑', labelEn: 'Milestones', valueZh: '1979 木星 · 1980 土星 · 2012 星际空间', valueEn: '1979 Jupiter · 1980 Saturn · 2012 interstellar' },
      ],
      descZh:
        '旅行者 1 号赶上了 176 年一遇的行星排列，用木星、土星的引力弹弓把自己甩出太阳系。飞越土卫六后它被抛离黄道面，从此一路向北。1990 年，在卡尔·萨根的坚持下它回头拍了一张地球——只有 0.12 个像素的"暗淡蓝点"。飞船带着一张镀金铜唱片，刻着 55 种语言的问候、地球的声音与 116 幅图像。2012 年 8 月它穿过日球层顶，成为第一个进入星际空间的人造物；电力预计在 2030 年前后耗尽。',
      descEn:
        'Voyager 1 caught a planetary alignment that recurs every 176 years and slingshotted off Jupiter and Saturn out of the Solar System. Its Titan flyby threw it above the ecliptic, and in 1990 — at Carl Sagan\'s urging — it turned around to photograph Earth as a 0.12-pixel "pale blue dot". It carries a gold-plated copper record with greetings in 55 languages, sounds of Earth and 116 images. In August 2012 it crossed the heliopause into interstellar space; its power should run out around 2030.',
    },
  },
  {
    id: 'apolloLm',
    nameZh: '阿波罗登月舱',
    nameEn: 'Apollo Lunar Module',
    kindZh: '载人着陆器',
    kindEn: 'Crewed lander',
    parts: [
      { id: 'ascent', nameZh: '上升级（乘员舱）', nameEn: 'Ascent stage (crew cabin)' },
      { id: 'descent', nameZh: '下降级（含下降发动机）', nameEn: 'Descent stage' },
      { id: 'legs', nameZh: '着陆腿与足垫', nameEn: 'Landing gear' },
      { id: 'docking', nameZh: '对接口（与指令舱交会）', nameEn: 'Docking port' },
      { id: 'ladder', nameZh: '舷梯', nameEn: 'Egress ladder' },
    ],
    facts: {
      titleZh: '阿波罗登月舱',
      titleEn: 'Apollo Lunar Module',
      subtitleZh: 'NASA / 格鲁曼 · 1969 年"鹰"号首次载人登月',
      subtitleEn: 'NASA / Grumman · Eagle landed humans in 1969',
      rows: [
        { labelZh: '首次登月', labelEn: 'First landing', valueZh: '1969-07-20 阿波罗 11 号"鹰"号', valueEn: '20 Jul 1969 (Apollo 11, Eagle)' },
        { labelZh: '尺寸', labelEn: 'Size', valueZh: '高 7.04 m · 着陆腿跨距 9.4 m', valueEn: '7.04 m tall · 9.4 m leg span' },
        { labelZh: '质量', labelEn: 'Mass', valueZh: '15,200 公斤（上升级 4,700 公斤）', valueEn: '15,200 kg (ascent stage 4,700 kg)' },
        { labelZh: '乘员', labelEn: 'Crew', valueZh: '2 人 · 站立驾驶', valueEn: '2 astronauts · flown standing' },
        { labelZh: '战绩', labelEn: 'Record', valueZh: '6 次成功登月 · 12 人踏上月面', valueEn: '6 successful landings · 12 moonwalkers' },
      ],
      descZh:
        '登月舱是第一种只在真空中飞行的载人航天器，因此完全不必考虑气动外形，长成了昆虫的样子。它分两级：下降级带着 4 条着陆腿与下降发动机着陆，起飞时留在月面充当发射台；上升级点火返回月球轨道，与指令舱交会对接。为了减重，舱壁最薄处只有 0.3 mm 铝——宇航员形容"像站在锡纸罐头里"，座椅也被拿掉改为站姿驾驶。阿波罗 13 号事故中，它还临时充当了三人的救生艇。',
      descEn:
        'The first crewed vehicle designed to fly only in vacuum, which is why it looks like an insect rather than an aircraft. It staged in two: the descent stage carried the landing gear and descent engine and stayed behind as a launch pad, while the ascent stage fired back up to rendezvous with the Command Module. Weight-saving cut the hull to 0.3 mm of aluminium in places and removed the seats — the crew flew standing. During Apollo 13 it doubled as a lifeboat for three men.',
    },
  },
]

export const CRAFT_IDS = SPACECRAFT_MODELS.map((c) => c.id)

export const findCraft = (id: string): CraftModel =>
  SPACECRAFT_MODELS.find((c) => c.id === id) ?? SPACECRAFT_MODELS[0]
