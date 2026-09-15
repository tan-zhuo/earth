/**
 * 航天器 3D 展厅的静态数据（多语言）：资料卡文案 + 部件名称。
 * 模型几何在 components/space/craftBuilders.ts 中程序化生成，两边靠 id / partId 对应。
 */
import type { SpaceFacts } from './space'

export interface CraftPart {
  /** 与模型锚点 userData.partId 对应 */
  id: string
  nameZh: string
  nameEn: string
  nameJa: string
  nameRu: string
}

export interface CraftModel {
  id: string
  nameZh: string
  nameEn: string
  nameJa: string
  nameRu: string
  /** 一行分类标签，用于菜单与切换条 */
  kindZh: string
  kindEn: string
  kindJa: string
  kindRu: string
  parts: CraftPart[]
  facts: SpaceFacts
}

export const SPACECRAFT_MODELS: CraftModel[] = [
  {
    id: 'hubble',
    nameZh: '哈勃太空望远镜',
    nameEn: 'Hubble Space Telescope',
    nameJa: 'ハッブル宇宙望遠鏡',
    nameRu: 'Космический телескоп «Хаббл»',
    kindZh: '空间望远镜',
    kindEn: 'Space telescope',
    kindJa: '宇宙望遠鏡',
    kindRu: 'Космический телескоп',
    parts: [
      { id: 'tube', nameZh: '主镜筒（2.4 m 主镜）', nameEn: 'Optical tube (2.4 m mirror)', nameJa: '鏡筒（2.4 m 主鏡）', nameRu: 'Оптическая труба (зеркало 2,4 м)' },
      { id: 'panel', nameZh: '太阳能帆板', nameEn: 'Solar array', nameJa: '太陽電池パドル', nameRu: 'Солнечная батарея' },
      { id: 'antenna', nameZh: '高增益天线', nameEn: 'High-gain antenna', nameJa: '高利得アンテナ', nameRu: 'Остронаправленная антенна' },
      { id: 'aperture', nameZh: '遮光罩与舱门', nameEn: 'Aperture door', nameJa: '開口部の扉', nameRu: 'Крышка апертуры' },
    ],
    facts: {
      titleZh: '哈勃太空望远镜',
      titleEn: 'Hubble Space Telescope',
      titleJa: 'ハッブル宇宙望遠鏡',
      titleRu: 'Космический телескоп «Хаббл»',
      subtitleZh: 'NASA / ESA · 1990 年发射 · 仍在服役',
      subtitleEn: 'NASA / ESA · launched 1990 · still operating',
      subtitleJa: 'NASA / ESA · 1990 年打ち上げ · 現在も運用中',
      subtitleRu: 'NASA / ESA · запущен в 1990 году · работает до сих пор',
      rows: [
        { labelZh: '发射', labelEn: 'Launch', labelJa: '打ち上げ', labelRu: 'Запуск', valueZh: '1990-04-24（发现号 STS-31）', valueEn: '24 Apr 1990 (STS-31 Discovery)', valueJa: '1990 年 4 月 24 日（ディスカバリー STS-31）', valueRu: '24 апреля 1990 г. (STS-31, «Дискавери»)' },
        { labelZh: '轨道', labelEn: 'Orbit', labelJa: '軌道', labelRu: 'Орбита', valueZh: '约 515 km 近地轨道 · 95 分钟一圈', valueEn: '~515 km LEO · 95 min period', valueJa: '約 515 km の低軌道 · 周期 95 分', valueRu: 'НОО ~515 км · период 95 мин' },
        { labelZh: '尺寸', labelEn: 'Size', labelJa: '大きさ', labelRu: 'Размеры', valueZh: '长 13.2 m · 直径 4.2 m', valueEn: '13.2 m long · 4.2 m diameter', valueJa: '全長 13.2 m · 直径 4.2 m', valueRu: 'длина 13,2 м · диаметр 4,2 м' },
        { labelZh: '质量', labelEn: 'Mass', labelJa: '質量', labelRu: 'Масса', valueZh: '11,110 公斤', valueEn: '11,110 kg', valueJa: '11,110 kg', valueRu: '11 110 кг' },
        { labelZh: '主镜', labelEn: 'Primary mirror', labelJa: '主鏡', labelRu: 'Главное зеркало', valueZh: '2.4 m · 近紫外到近红外', valueEn: '2.4 m · near-UV to near-IR', valueJa: '2.4 m · 近紫外〜近赤外', valueRu: '2,4 м · от ближнего УФ до ближнего ИК' },
      ],
      descZh:
        '哈勃在大气层之上工作，避开了大气抖动与紫外吸收，分辨率长期保持在 0.05 角秒。它入轨后才发现主镜边缘被磨掉了 2.2 微米，成像模糊；1993 年航天飞机送去 COSTAR 矫正光学装置，等于给望远镜配了副眼镜。此后 5 次在轨维修让它服役至今，哈勃深场把可见宇宙推到 130 亿年前，也让哈勃常数的测量精度进入个位数百分比。',
      descEn:
        'Above the atmosphere, Hubble sidesteps atmospheric blurring and UV absorption, holding 0.05-arcsecond resolution. Its primary mirror turned out to be ground 2.2 µm too flat; the 1993 COSTAR servicing mission effectively gave it eyeglasses. Five shuttle servicing missions have kept it running for three decades, and its Deep Fields pushed the visible universe back 13 billion years.',
      descJa:
        'ハッブルは大気圏の外で観測するため、大気の揺らぎや紫外線の吸収を受けず、0.05 秒角の分解能を保っています。打ち上げ後、主鏡の縁が 2.2 µm 削られすぎていて像がぼやけることが判明しました。1993 年にスペースシャトルが補正光学装置 COSTAR を届け、いわば望遠鏡に眼鏡をかけたのです。その後 5 回の軌道上修理で現在も運用が続き、ハッブル・ディープフィールドは観測可能な宇宙を 130 億年前まで押し広げ、ハッブル定数の測定精度も数パーセントにまで高めました。',
      descRu:
        'Работая над атмосферой, «Хаббл» избавлен от атмосферных искажений и поглощения ультрафиолета и сохраняет разрешение 0,05 угловой секунды. Уже на орбите выяснилось, что край главного зеркала сошлифован на 2,2 мкм лишнего и изображение размыто; в 1993 году шаттл доставил корректирующую оптику COSTAR — по сути, телескопу выдали очки. Пять миссий обслуживания продлили его работу до наших дней, «Глубокие поля Хаббла» отодвинули видимую Вселенную на 13 млрд лет назад, а постоянная Хаббла стала известна с точностью до нескольких процентов.',
    },
  },
  {
    id: 'iss',
    nameZh: '国际空间站',
    nameEn: 'International Space Station',
    nameJa: '国際宇宙ステーション',
    nameRu: 'Международная космическая станция',
    kindZh: '空间站',
    kindEn: 'Space station',
    kindJa: '宇宙ステーション',
    kindRu: 'Космическая станция',
    parts: [
      { id: 'truss', nameZh: '主桁架（109 m）', nameEn: 'Integrated truss (109 m)', nameJa: 'トラス構造（109 m）', nameRu: 'Интегрированная ферма (109 м)' },
      { id: 'array', nameZh: '太阳翼（8 片主翼）', nameEn: 'Solar arrays (8 wings)', nameJa: '太陽電池パドル（主翼 8 枚）', nameRu: 'Солнечные батареи (8 крыльев)' },
      { id: 'modules', nameZh: '加压舱段', nameEn: 'Pressurised modules', nameJa: '与圧モジュール', nameRu: 'Гермомодули' },
      { id: 'radiator', nameZh: '散热板', nameEn: 'Thermal radiators', nameJa: 'ラジエーター', nameRu: 'Радиаторы' },
      { id: 'docked', nameZh: '对接的飞船', nameEn: 'Docked spacecraft', nameJa: 'ドッキング中の宇宙船', nameRu: 'Пристыкованные корабли' },
    ],
    facts: {
      titleZh: '国际空间站',
      titleEn: 'International Space Station',
      titleJa: '国際宇宙ステーション',
      titleRu: 'Международная космическая станция',
      subtitleZh: '五方合作 · 2000 年起持续有人驻留',
      subtitleEn: 'Five agencies · continuously crewed since 2000',
      subtitleJa: '5 機関の共同運用 · 2000 年から常時有人滞在',
      subtitleRu: 'Пять агентств · постоянный экипаж с 2000 года',
      rows: [
        { labelZh: '参与方', labelEn: 'Partners', labelJa: '参加機関', labelRu: 'Участники', valueZh: 'NASA / Roscosmos / ESA / JAXA / CSA', valueEn: 'NASA / Roscosmos / ESA / JAXA / CSA', valueJa: 'NASA / ロスコスモス / ESA / JAXA / CSA', valueRu: 'NASA / Роскосмос / ЕКА / JAXA / CSA' },
        { labelZh: '首个舱段', labelEn: 'First module', labelJa: '最初のモジュール', labelRu: 'Первый модуль', valueZh: '1998-11-20 曙光号', valueEn: '20 Nov 1998 (Zarya)', valueJa: '1998 年 11 月 20 日（ザーリャ）', valueRu: '20 ноября 1998 г. («Заря»)' },
        { labelZh: '轨道', labelEn: 'Orbit', labelJa: '軌道', labelRu: 'Орбита', valueZh: '约 400 km · 倾角 51.6° · 92 分钟一圈', valueEn: '~400 km · 51.6° · 92 min period', valueJa: '約 400 km · 傾斜角 51.6° · 周期 92 分', valueRu: '~400 км · наклонение 51,6° · период 92 мин' },
        { labelZh: '尺寸', labelEn: 'Size', labelJa: '大きさ', labelRu: 'Размеры', valueZh: '109 × 73 m · 加压容积 916 m³', valueEn: '109 × 73 m · 916 m³ pressurised', valueJa: '109 × 73 m · 与圧容積 916 m³', valueRu: '109 × 73 м · гермообъём 916 м³' },
        { labelZh: '质量', labelEn: 'Mass', labelJa: '質量', labelRu: 'Масса', valueZh: '约 420 吨', valueEn: '~420 t', valueJa: '約 420 t', valueRu: '~420 т' },
      ],
      descZh:
        '国际空间站是人类送上轨道的最大结构，也是造价最高的单体工程。它以 7.66 km/s 绕地球飞行，机组每天看到 16 次日出日落。桁架两端 8 片主太阳翼提供约 120 kW 电力，白色散热板负责把废热辐射掉。自 2000 年 11 月第一批乘组入驻以来，这里从未空过一天，长期失重生理学、蛋白质结晶、微重力燃烧等研究都在此进行。按计划它将服役到 2030 年，之后受控再入。',
      descEn:
        'The largest structure humans have ever assembled in orbit, and the most expensive single project ever built. It circles Earth at 7.66 km/s, giving its crew 16 sunrises a day. Eight main solar wings supply about 120 kW, while the white radiators dump waste heat. It has been continuously inhabited since November 2000 and is slated to operate until 2030, followed by a controlled deorbit.',
      descJa:
        '国際宇宙ステーションは人類が軌道上に組み立てた最大の構造物であり、史上最も高額な単一プロジェクトです。秒速 7.66 km で地球を周回し、クルーは 1 日に 16 回の日の出と日の入りを見ます。トラス両端の 8 枚の主太陽電池パドルが約 120 kW を供給し、白いラジエーターが排熱を宇宙へ放出します。2000 年 11 月に最初のクルーが滞在して以来、一日も無人になったことはなく、長期無重力の生理学、タンパク質結晶化、微小重力燃焼などの研究が行われています。2030 年まで運用された後、制御落下させる計画です。',
      descRu:
        'Крупнейшее сооружение, когда-либо собранное людьми на орбите, и самый дорогой отдельный проект в истории. Станция облетает Землю со скоростью 7,66 км/с, и экипаж видит 16 восходов в сутки. Восемь основных солнечных крыльев дают около 120 кВт, а белые радиаторы сбрасывают избыточное тепло. С ноября 2000 года станция ни дня не пустовала: здесь изучают физиологию длительной невесомости, кристаллизацию белков, горение в микрогравитации. Эксплуатация планируется до 2030 года с последующим управляемым сведением с орбиты.',
    },
  },
  {
    id: 'tiangong',
    nameZh: '天宫空间站',
    nameEn: 'Tiangong Space Station',
    nameJa: '天宮宇宙ステーション',
    nameRu: 'Космическая станция «Тяньгун»',
    kindZh: '空间站',
    kindEn: 'Space station',
    kindJa: '宇宙ステーション',
    kindRu: 'Космическая станция',
    parts: [
      { id: 'core', nameZh: '天和核心舱', nameEn: 'Tianhe core module', nameJa: 'コアモジュール「天和」', nameRu: 'Базовый модуль «Тяньхэ»' },
      { id: 'wentian', nameZh: '问天实验舱', nameEn: 'Wentian lab module', nameJa: '実験モジュール「問天」', nameRu: 'Лабораторный модуль «Вэньтянь»' },
      { id: 'mengtian', nameZh: '梦天实验舱', nameEn: 'Mengtian lab module', nameJa: '実験モジュール「夢天」', nameRu: 'Лабораторный модуль «Мэнтянь»' },
      { id: 'wings', nameZh: '柔性太阳翼', nameEn: 'Flexible solar wings', nameJa: 'フレキシブル太陽電池パドル', nameRu: 'Гибкие солнечные крылья' },
      { id: 'shenzhou', nameZh: '神舟载人飞船', nameEn: 'Shenzhou crew ship', nameJa: '有人宇宙船「神舟」', nameRu: 'Пилотируемый корабль «Шэньчжоу»' },
      { id: 'tianzhou', nameZh: '天舟货运飞船', nameEn: 'Tianzhou cargo ship', nameJa: '補給船「天舟」', nameRu: 'Грузовой корабль «Тяньчжоу»' },
    ],
    facts: {
      titleZh: '天宫空间站',
      titleEn: 'Tiangong Space Station',
      titleJa: '天宮宇宙ステーション',
      titleRu: 'Космическая станция «Тяньгун»',
      subtitleZh: '中国载人航天工程 · 2022 年建成 T 字构型',
      subtitleEn: 'CMSA · T-shape completed in 2022',
      subtitleJa: '中国有人宇宙飛行計画 · 2022 年に T 字形で完成',
      subtitleRu: 'CMSA · Т-образная конфигурация завершена в 2022 году',
      rows: [
        { labelZh: '首个舱段', labelEn: 'First module', labelJa: '最初のモジュール', labelRu: 'Первый модуль', valueZh: '2021-04-29 天和核心舱', valueEn: '29 Apr 2021 (Tianhe)', valueJa: '2021 年 4 月 29 日（天和）', valueRu: '29 апреля 2021 г. («Тяньхэ»)' },
        { labelZh: '构型', labelEn: 'Configuration', labelJa: '構成', labelRu: 'Конфигурация', valueZh: '天和 + 问天 + 梦天（T 字）', valueEn: 'Tianhe + Wentian + Mengtian (T-shape)', valueJa: '天和 + 問天 + 夢天（T 字形）', valueRu: '«Тяньхэ» + «Вэньтянь» + «Мэнтянь» (Т-образная)' },
        { labelZh: '轨道', labelEn: 'Orbit', labelJa: '軌道', labelRu: 'Орбита', valueZh: '约 390 km · 倾角 41.5°', valueEn: '~390 km · 41.5° inclination', valueJa: '約 390 km · 傾斜角 41.5°', valueRu: '~390 км · наклонение 41,5°' },
        { labelZh: '质量', labelEn: 'Mass', labelJa: '質量', labelRu: 'Масса', valueZh: '三舱组合体约 100 吨', valueEn: '~100 t (three modules)', valueJa: '3 モジュール結合体で約 100 t', valueRu: '~100 т (три модуля)' },
        { labelZh: '乘组', labelEn: 'Crew', labelJa: 'クルー', labelRu: 'Экипаж', valueZh: '3 人长期驻留 · 半年轮换', valueEn: '3 long-duration crew · 6-month rotations', valueJa: '3 人が長期滞在 · 半年ごとに交代', valueRu: '3 человека · смена раз в полгода' },
      ],
      descZh:
        '天宫是中国自主建设并运营的近地空间站，采用 T 字构型：天和核心舱居中，负责控制、能源与生活起居；问天、梦天分列两侧，装载科学实验柜并提供出舱气闸。两艘实验舱各配两翼大型柔性太阳翼，核心舱另配一对太阳翼。神舟可停靠前向或径向端口，天舟停靠后向端口；本模型展示一种简化对接构型。巡天空间望远镜计划与空间站共轨飞行，必要时对接维修。',
      descEn:
        "China's independently built and operated low-Earth-orbit station, arranged in a T shape: the Tianhe core module handles control, power and living quarters, while Wentian and Mengtian carry science racks and an airlock. Each laboratory has two large flexible solar wings, with another pair on the core module. Shenzhou uses forward or radial ports; Tianzhou docks aft. This model shows a simplified docking configuration. The Xuntian space telescope will fly in the same orbit and dock for servicing.",
      descJa:
        '天宮は中国が独自に建設・運用する低軌道の宇宙ステーションで、T 字形に構成されています。中央のコアモジュール「天和」が制御・電力・居住を担い、両側の「問天」「夢天」が科学実験ラックと船外活動用エアロックを備えます。実験モジュールにはそれぞれ大型のフレキシブル太陽電池パドルが 2 枚あり、天和にももう 1 対あります。神舟は前方または径方向のポートに、天舟は後方ポートにドッキングします。このモデルは簡略化したドッキング構成の一例です。巡天宇宙望遠鏡は同じ軌道を飛行し、必要に応じてドッキングして整備を受ける予定です。',
      descRu:
        'Китайская околоземная станция, построенная и эксплуатируемая самостоятельно, имеет Т-образную конфигурацию: в центре базовый модуль «Тяньхэ» отвечает за управление, энергоснабжение и жилые помещения, а по бокам лабораторные модули «Вэньтянь» и «Мэнтянь» несут научные стойки и шлюз для выхода в открытый космос. У каждой лаборатории по два больших гибких солнечных крыла, ещё одна пара — на базовом модуле. «Шэньчжоу» стыкуется к переднему или радиальному порту, «Тяньчжоу» — к кормовому; модель показывает упрощённую конфигурацию стыковки. Телескоп «Сюньтянь» будет летать на той же орбите и при необходимости стыковаться для обслуживания.',
    },
  },
  {
    id: 'jwst',
    nameZh: '詹姆斯·韦布空间望远镜',
    nameEn: 'James Webb Space Telescope',
    nameJa: 'ジェイムズ・ウェッブ宇宙望遠鏡',
    nameRu: 'Космический телескоп «Джеймс Уэбб»',
    kindZh: '空间望远镜',
    kindEn: 'Space telescope',
    kindJa: '宇宙望遠鏡',
    kindRu: 'Космический телескоп',
    parts: [
      { id: 'primary', nameZh: '主镜（18 块镀金铍镜）', nameEn: 'Primary mirror (18 segments)', nameJa: '主鏡（金コーティングのベリリウム鏡 18 枚）', nameRu: 'Главное зеркало (18 сегментов)' },
      { id: 'secondary', nameZh: '副镜与三脚支架', nameEn: 'Secondary mirror', nameJa: '副鏡と三脚支持構造', nameRu: 'Вторичное зеркало' },
      { id: 'sunshield', nameZh: '五层遮阳罩', nameEn: 'Five-layer sunshield', nameJa: '5 層のサンシールド', nameRu: 'Пятислойный солнцезащитный экран' },
      { id: 'bus', nameZh: '航天器总线与太阳翼', nameEn: 'Spacecraft bus & solar array', nameJa: '衛星バスと太陽電池パドル', nameRu: 'Служебный модуль и солнечная батарея' },
    ],
    facts: {
      titleZh: '詹姆斯·韦布空间望远镜',
      titleEn: 'James Webb Space Telescope',
      titleJa: 'ジェイムズ・ウェッブ宇宙望遠鏡',
      titleRu: 'Космический телескоп «Джеймс Уэбб»',
      subtitleZh: 'NASA / ESA / CSA · 位于日地 L2 点',
      subtitleEn: 'NASA / ESA / CSA · at Sun–Earth L2',
      subtitleJa: 'NASA / ESA / CSA · 太陽–地球系 L2 点',
      subtitleRu: 'NASA / ЕКА / CSA · в точке L2 системы Солнце–Земля',
      rows: [
        { labelZh: '发射', labelEn: 'Launch', labelJa: '打ち上げ', labelRu: 'Запуск', valueZh: '2021-12-25（阿丽亚娜 5）', valueEn: '25 Dec 2021 (Ariane 5)', valueJa: '2021 年 12 月 25 日（アリアン 5）', valueRu: '25 декабря 2021 г. («Ариан-5»)' },
        { labelZh: '位置', labelEn: 'Location', labelJa: '位置', labelRu: 'Расположение', valueZh: 'L2 点晕轨道 · 距地约 150 万 km', valueEn: 'L2 halo orbit · ~1.5 million km', valueJa: 'L2 点のハロー軌道 · 地球から約 150 万 km', valueRu: 'гало-орбита у L2 · ~1,5 млн км' },
        { labelZh: '主镜', labelEn: 'Primary mirror', labelJa: '主鏡', labelRu: 'Главное зеркало', valueZh: '6.5 m · 18 块镀金铍镜', valueEn: '6.5 m · 18 gold-coated beryllium segments', valueJa: '6.5 m · 金コーティングのベリリウム鏡 18 枚', valueRu: '6,5 м · 18 бериллиевых сегментов с золотым покрытием' },
        { labelZh: '遮阳罩', labelEn: 'Sunshield', labelJa: 'サンシールド', labelRu: 'Солнцезащитный экран', valueZh: '5 层 · 21 × 14 m', valueEn: '5 layers · 21 × 14 m', valueJa: '5 層 · 21 × 14 m', valueRu: '5 слоёв · 21 × 14 м' },
        { labelZh: '工作温度', labelEn: 'Operating temp', labelJa: '動作温度', labelRu: 'Рабочая температура', valueZh: '冷侧约 -233°C', valueEn: '~-233°C on the cold side', valueJa: '低温側で約 -233°C', valueRu: '~-233 °C на холодной стороне' },
      ],
      descZh:
        '宇宙膨胀把最早那批恒星与星系的紫外光拉长成了红外，所以韦布是一台红外望远镜——而红外望远镜必须够冷，否则自身热辐射就淹没了目标。网球场大小的五层遮阳罩把太阳、地球、月球的热量全挡在一侧，让镜面稳定在 40 K 以下。6.5 m 主镜由 18 块六边形铍镜拼成，发射时折叠，入轨后靠 132 台微型作动器逐块对齐到几十纳米精度。它已经拍到红移 z>13 的星系，并用透射光谱分析系外行星大气成分。',
      descEn:
        "Cosmic expansion stretches the ultraviolet light of the first stars into the infrared, so Webb is an infrared telescope — and an infrared telescope must be cold, or its own heat drowns the signal. A tennis-court-sized five-layer sunshield blocks the Sun, Earth and Moon, holding the optics below 40 K. The 6.5 m primary is 18 hexagonal beryllium segments that launched folded and were aligned to tens of nanometres by 132 actuators. It has already imaged galaxies beyond redshift 13 and reads exoplanet atmospheres by transmission spectroscopy.",
      descJa:
        '宇宙の膨張によって最初期の恒星や銀河の紫外線は赤外線へと引き伸ばされるため、ウェッブは赤外線望遠鏡です。そして赤外線望遠鏡は十分に冷たくなければ、自らの熱放射が観測対象をかき消してしまいます。テニスコートほどの 5 層サンシールドが太陽・地球・月の熱を片側で遮り、鏡面を 40 K 以下に保ちます。6.5 m の主鏡は 18 枚の六角形ベリリウム鏡で構成され、折りたたんで打ち上げた後、132 基の小型アクチュエーターで数十ナノメートルの精度に調整されました。すでに赤方偏移 z>13 の銀河を撮影し、透過分光で系外惑星の大気成分も分析しています。',
      descRu:
        'Расширение Вселенной растягивает ультрафиолетовый свет первых звёзд и галактик в инфракрасный диапазон, поэтому «Уэбб» — инфракрасный телескоп. А такой телескоп должен быть очень холодным, иначе собственное тепловое излучение заглушит сигнал. Пятислойный экран размером с теннисный корт закрывает его от Солнца, Земли и Луны и удерживает оптику ниже 40 К. Главное зеркало 6,5 м собрано из 18 шестиугольных бериллиевых сегментов: оно стартовало в сложенном виде, а на орбите 132 привода выровняли сегменты с точностью до десятков нанометров. Телескоп уже снял галактики с красным смещением z>13 и изучает атмосферы экзопланет методом трансмиссионной спектроскопии.',
    },
  },
  {
    id: 'voyager1',
    nameZh: '旅行者 1 号',
    nameEn: 'Voyager 1',
    nameJa: 'ボイジャー 1 号',
    nameRu: '«Вояджер-1»',
    kindZh: '深空探测器',
    kindEn: 'Deep-space probe',
    kindJa: '深宇宙探査機',
    kindRu: 'Зонд дальнего космоса',
    parts: [
      { id: 'dish', nameZh: '3.7 m 高增益天线', nameEn: '3.7 m high-gain antenna', nameJa: '3.7 m 高利得アンテナ', nameRu: 'Остронаправленная антенна 3,7 м' },
      { id: 'rtg', nameZh: '同位素温差电源（RTG）', nameEn: 'Radioisotope generators (RTG)', nameJa: '原子力電池（RTG）', nameRu: 'Радиоизотопные генераторы (РИТЭГ)' },
      { id: 'boom', nameZh: '磁强计伸杆（13 m）', nameEn: 'Magnetometer boom (13 m)', nameJa: '磁力計ブーム（13 m）', nameRu: 'Штанга магнитометра (13 м)' },
      { id: 'instruments', nameZh: '科学仪器平台', nameEn: 'Science instrument platform', nameJa: '科学観測機器プラットフォーム', nameRu: 'Платформа научных приборов' },
      { id: 'record', nameZh: '金唱片', nameEn: 'Golden Record', nameJa: 'ゴールデンレコード', nameRu: 'Золотая пластинка' },
    ],
    facts: {
      titleZh: '旅行者 1 号',
      titleEn: 'Voyager 1',
      titleJa: 'ボイジャー 1 号',
      titleRu: '«Вояджер-1»',
      subtitleZh: 'NASA / JPL · 1977 年发射 · 飞得最远的人造物',
      subtitleEn: 'NASA / JPL · launched 1977 · most distant human object',
      subtitleJa: 'NASA / JPL · 1977 年打ち上げ · 最も遠くにある人工物',
      subtitleRu: 'NASA / JPL · запущен в 1977 году · самый далёкий рукотворный объект',
      rows: [
        { labelZh: '发射', labelEn: 'Launch', labelJa: '打ち上げ', labelRu: 'Запуск', valueZh: '1977-09-05', valueEn: '5 Sep 1977', valueJa: '1977 年 9 月 5 日', valueRu: '5 сентября 1977 г.' },
        { labelZh: '当前距离', labelEn: 'Current distance', labelJa: '現在の距離', labelRu: 'Текущее расстояние', valueZh: '约 168 AU（单程通信约 23 小时）', valueEn: '~168 AU (~23 h one-way signal)', valueJa: '約 168 AU（片道通信で約 23 時間）', valueRu: '~168 а. е. (сигнал в одну сторону ~23 ч)' },
        { labelZh: '速度', labelEn: 'Speed', labelJa: '速度', labelRu: 'Скорость', valueZh: '约 17 km/s（相对太阳）', valueEn: '~17 km/s relative to the Sun', valueJa: '太陽に対して約 17 km/s', valueRu: '~17 км/с относительно Солнца' },
        { labelZh: '电源', labelEn: 'Power', labelJa: '電源', labelRu: 'Питание', valueZh: '3 台钚-238 RTG · 已衰减到约 220 W', valueEn: '3 Pu-238 RTGs · down to ~220 W', valueJa: 'プルトニウム 238 の RTG 3 基 · 約 220 W まで低下', valueRu: '3 РИТЭГа на плутонии-238 · осталось ~220 Вт' },
        { labelZh: '里程碑', labelEn: 'Milestones', labelJa: '主な出来事', labelRu: 'Вехи', valueZh: '1979 木星 · 1980 土星 · 2012 星际空间', valueEn: '1979 Jupiter · 1980 Saturn · 2012 interstellar', valueJa: '1979 木星 · 1980 土星 · 2012 星間空間', valueRu: '1979 Юпитер · 1980 Сатурн · 2012 межзвёздное пространство' },
      ],
      descZh:
        '旅行者 1 号赶上了 176 年一遇的行星排列，用木星、土星的引力弹弓把自己甩出太阳系。飞越土卫六后它被抛离黄道面，从此一路向北。1990 年，在卡尔·萨根的坚持下它回头拍了一张地球——只有 0.12 个像素的"暗淡蓝点"。飞船带着一张镀金铜唱片，刻着 55 种语言的问候、地球的声音与 116 幅图像。2012 年 8 月它穿过日球层顶，成为第一个进入星际空间的人造物；电力预计在 2030 年前后耗尽。',
      descEn:
        'Voyager 1 caught a planetary alignment that recurs every 176 years and slingshotted off Jupiter and Saturn out of the Solar System. Its Titan flyby threw it above the ecliptic, and in 1990 — at Carl Sagan\'s urging — it turned around to photograph Earth as a 0.12-pixel "pale blue dot". It carries a gold-plated copper record with greetings in 55 languages, sounds of Earth and 116 images. In August 2012 it crossed the heliopause into interstellar space; its power should run out around 2030.',
      descJa:
        'ボイジャー 1 号は 176 年に一度の惑星の並びを利用し、木星と土星のスイングバイで太陽系の外へ飛び出しました。タイタンへの接近通過で黄道面から外れ、以後は北へ向かっています。1990 年にはカール・セーガンの強い求めで振り返って地球を撮影し、わずか 0.12 ピクセルの「ペイル・ブルー・ドット」を写しました。探査機には、55 の言語によるあいさつ、地球の音、116 枚の画像を刻んだ金メッキの銅製レコードが積まれています。2012 年 8 月にヘリオポーズを越えて初めて星間空間に入った人工物となり、電力は 2030 年ごろに尽きる見込みです。',
      descRu:
        '«Вояджер-1» застал парад планет, повторяющийся раз в 176 лет, и с помощью гравитационных манёвров у Юпитера и Сатурна покинул Солнечную систему. Пролёт мимо Титана вывел его из плоскости эклиптики. В 1990 году по настоянию Карла Сагана зонд обернулся и сфотографировал Землю — «бледно-голубую точку» размером 0,12 пикселя. На борту — позолоченная медная пластинка с приветствиями на 55 языках, звуками Земли и 116 изображениями. В августе 2012 года аппарат пересёк гелиопаузу и первым из рукотворных объектов вышел в межзвёздное пространство; энергии хватит примерно до 2030 года.',
    },
  },
  {
    id: 'apolloLm',
    nameZh: '阿波罗登月舱',
    nameEn: 'Apollo Lunar Module',
    nameJa: 'アポロ月着陸船',
    nameRu: 'Лунный модуль «Аполлона»',
    kindZh: '载人着陆器',
    kindEn: 'Crewed lander',
    kindJa: '有人着陸船',
    kindRu: 'Пилотируемый посадочный модуль',
    parts: [
      { id: 'ascent', nameZh: '上升级（乘员舱）', nameEn: 'Ascent stage (crew cabin)', nameJa: '上昇段（乗員室）', nameRu: 'Взлётная ступень (кабина экипажа)' },
      { id: 'descent', nameZh: '下降级（含下降发动机）', nameEn: 'Descent stage', nameJa: '降下段（降下用エンジン付き）', nameRu: 'Посадочная ступень (с посадочным двигателем)' },
      { id: 'legs', nameZh: '着陆腿与足垫', nameEn: 'Landing gear', nameJa: '着陸脚とフットパッド', nameRu: 'Посадочные опоры' },
      { id: 'docking', nameZh: '对接口（与指令舱交会）', nameEn: 'Docking port', nameJa: 'ドッキングポート（司令船とランデブー）', nameRu: 'Стыковочный узел (для командного модуля)' },
      { id: 'ladder', nameZh: '舷梯', nameEn: 'Egress ladder', nameJa: 'はしご', nameRu: 'Трап' },
    ],
    facts: {
      titleZh: '阿波罗登月舱',
      titleEn: 'Apollo Lunar Module',
      titleJa: 'アポロ月着陸船',
      titleRu: 'Лунный модуль «Аполлона»',
      subtitleZh: 'NASA / 格鲁曼 · 1969 年"鹰"号首次载人登月',
      subtitleEn: 'NASA / Grumman · Eagle landed humans in 1969',
      subtitleJa: 'NASA / グラマン · 1969 年「イーグル」が初の有人月面着陸',
      subtitleRu: 'NASA / Grumman · «Игл» высадил людей на Луну в 1969 году',
      rows: [
        { labelZh: '首次登月', labelEn: 'First landing', labelJa: '初の月面着陸', labelRu: 'Первая посадка', valueZh: '1969-07-20 阿波罗 11 号"鹰"号', valueEn: '20 Jul 1969 (Apollo 11, Eagle)', valueJa: '1969 年 7 月 20 日（アポロ 11 号「イーグル」）', valueRu: '20 июля 1969 г. («Аполлон-11», «Игл»)' },
        { labelZh: '尺寸', labelEn: 'Size', labelJa: '大きさ', labelRu: 'Размеры', valueZh: '高 7.04 m · 着陆腿跨距 9.4 m', valueEn: '7.04 m tall · 9.4 m leg span', valueJa: '高さ 7.04 m · 着陸脚の幅 9.4 m', valueRu: 'высота 7,04 м · размах опор 9,4 м' },
        { labelZh: '质量', labelEn: 'Mass', labelJa: '質量', labelRu: 'Масса', valueZh: '15,200 公斤（上升级 4,700 公斤）', valueEn: '15,200 kg (ascent stage 4,700 kg)', valueJa: '15,200 kg（上昇段 4,700 kg）', valueRu: '15 200 кг (взлётная ступень 4 700 кг)' },
        { labelZh: '乘员', labelEn: 'Crew', labelJa: '乗員', labelRu: 'Экипаж', valueZh: '2 人 · 站立驾驶', valueEn: '2 astronauts · flown standing', valueJa: '2 人 · 立ったまま操縦', valueRu: '2 астронавта · пилотирование стоя' },
        { labelZh: '战绩', labelEn: 'Record', labelJa: '実績', labelRu: 'Итоги', valueZh: '6 次成功登月 · 12 人踏上月面', valueEn: '6 successful landings · 12 moonwalkers', valueJa: '月面着陸 6 回成功 · 12 人が月面に', valueRu: '6 успешных посадок · 12 человек на Луне' },
      ],
      descZh:
        '登月舱是第一种只在真空中飞行的载人航天器，因此完全不必考虑气动外形，长成了昆虫的样子。它分两级：下降级带着 4 条着陆腿与下降发动机着陆，起飞时留在月面充当发射台；上升级点火返回月球轨道，与指令舱交会对接。为了减重，舱壁最薄处只有 0.3 mm 铝——宇航员形容"像站在锡纸罐头里"，座椅也被拿掉改为站姿驾驶。阿波罗 13 号事故中，它还临时充当了三人的救生艇。',
      descEn:
        'The first crewed vehicle designed to fly only in vacuum, which is why it looks like an insect rather than an aircraft. It staged in two: the descent stage carried the landing gear and descent engine and stayed behind as a launch pad, while the ascent stage fired back up to rendezvous with the Command Module. Weight-saving cut the hull to 0.3 mm of aluminium in places and removed the seats — the crew flew standing. During Apollo 13 it doubled as a lifeboat for three men.',
      descJa:
        '月着陸船は真空中だけを飛ぶ初めての有人宇宙機で、空力的な形状を考える必要がなかったため、昆虫のような姿になりました。2 段式で、降下段は 4 本の着陸脚と降下用エンジンで着陸し、離陸時には月面に残って発射台となります。上昇段は点火して月周回軌道に戻り、司令船とランデブー・ドッキングします。軽量化のため船体の最も薄い部分はわずか 0.3 mm のアルミで、飛行士は「アルミ缶の中に立っているよう」と表現しました。座席も取り外され、立ったまま操縦しました。アポロ 13 号の事故では 3 人の救命ボートとしても活躍しました。',
      descRu:
        'Первый пилотируемый аппарат, созданный только для полётов в вакууме, поэтому об аэродинамике думать не пришлось — и он стал похож на насекомое. Модуль двухступенчатый: посадочная ступень с четырьмя опорами и посадочным двигателем садилась на Луну и при старте оставалась на поверхности как стартовый стол, а взлётная ступень возвращалась на лунную орбиту для стыковки с командным модулем. Ради экономии массы обшивка местами была всего 0,3 мм алюминия — астронавты говорили, что стоят «в консервной банке из фольги», а кресла убрали, и пилотировали стоя. Во время аварии «Аполлона-13» модуль послужил спасательной шлюпкой для троих.',
    },
  },
]

export const CRAFT_IDS = SPACECRAFT_MODELS.map((c) => c.id)

export const findCraft = (id: string): CraftModel =>
  SPACECRAFT_MODELS.find((c) => c.id === id) ?? SPACECRAFT_MODELS[0]
