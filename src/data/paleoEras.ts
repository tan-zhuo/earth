/**
 * 大陆漂移时间旅行：各地质时代的古地理贴图与说明。
 * 贴图来源：C.R. Scotese PALEOMAP Project（经 dinosaurpictures.org/ancient-earth 整理），
 * 自托管于 public/paleo/{ma}.jpg；ma=0 使用现代夜景贴图。
 * 数组按时间从最古老到现代排列。
 */
export interface PaleoEra {
  /** 距今百万年 */
  ma: number
  nameZh: string
  nameJa: string
  nameRu: string
  nameEn: string
  descZh: string
  descJa: string
  descRu: string
  descEn: string
}

export const PALEO_ERAS: PaleoEra[] = [
  { ma: 750, nameZh: '成冰纪', nameEn: 'Cryogenian', nameJa: 'クリオジェニアン', nameRu: 'Криогений', descJa: '超大陸ロディニアが分裂を始め、地球は「スノーボールアース」の時代に入る', descRu: 'Суперконтинент Родиния начинает распадаться; Земля вступает в эпоху «Земли-снежка»', descZh: '罗迪尼亚超大陆开始解体，地球进入"雪球地球"时期', descEn: 'Supercontinent Rodinia breaks apart; Earth enters the "Snowball Earth" era' },
  { ma: 600, nameZh: '埃迪卡拉纪', nameEn: 'Ediacaran', nameJa: 'エディアカラン', nameRu: 'Эдиакарий', descJa: '最初の複雑な多細胞生物が現れる', descRu: 'Появляются первые сложные многоклеточные организмы', descZh: '最早的复杂多细胞生物出现', descEn: 'The first complex multicellular life appears' },
  { ma: 540, nameZh: '寒武纪', nameEn: 'Cambrian', nameJa: 'カンブリア紀', nameRu: 'Кембрий', descJa: 'カンブリア爆発 — 主要な動物門のほとんどが出現', descRu: 'Кембрийский взрыв — появляется большинство крупных групп животных', descZh: '寒武纪生命大爆发，绝大多数动物门类涌现', descEn: 'The Cambrian explosion — most major animal groups appear' },
  { ma: 470, nameZh: '奥陶纪', nameEn: 'Ordovician', nameJa: 'オルドビス紀', nameRu: 'Ордовик', descJa: '海洋生物が繁栄し、植物が陸上へ進出し始める', descRu: 'Расцвет морской жизни; растения начинают осваивать сушу', descZh: '海洋生物繁盛，植物开始登陆', descEn: 'Marine life flourishes; plants begin to colonize land' },
  { ma: 430, nameZh: '志留纪', nameEn: 'Silurian', nameJa: 'シルル紀', nameRu: 'Силур', descJa: '陸上植物が広がり、顎を持つ魚類が現れる', descRu: 'Распространяются наземные растения; появляются челюстноротые рыбы', descZh: '陆地植物扩张，有颌鱼类出现', descEn: 'Land plants spread; jawed fish appear' },
  { ma: 370, nameZh: '泥盆纪', nameEn: 'Devonian', nameJa: 'デボン紀', nameRu: 'Девон', descJa: '魚の時代。四肢動物が初めて陸に上がる', descRu: 'Век рыб; первые четвероногие выходят на сушу', descZh: '鱼类时代，四足动物开始登上陆地', descEn: 'The Age of Fishes; tetrapods first walk onto land' },
  { ma: 300, nameZh: '石炭纪晚期', nameEn: 'Late Carboniferous', nameJa: '石炭紀後期', nameRu: 'Поздний карбон', descJa: '巨大昆虫と石炭の森。パンゲア大陸が形成されつつある', descRu: 'Гигантские насекомые и каменноугольные леса; формируется Пангея', descZh: '巨型昆虫与煤炭森林，盘古大陆正在拼合', descEn: 'Giant insects and coal forests; Pangaea is assembling' },
  { ma: 240, nameZh: '三叠纪早期', nameEn: 'Early Triassic', nameJa: '三畳紀前期', nameRu: 'Ранний триас', descJa: '超大陸パンゲアが完成し、恐竜の祖先が現れる', descRu: 'Суперконтинент Пангея сформирован; появляются предки динозавров', descZh: '盘古超大陆形成，恐龙祖先出现', descEn: 'Supercontinent Pangaea is complete; ancestors of dinosaurs appear' },
  { ma: 200, nameZh: '侏罗纪早期', nameEn: 'Early Jurassic', nameJa: 'ジュラ紀前期', nameRu: 'Ранняя юра', descJa: 'パンゲアが分裂を始め、恐竜が繁栄へ向かう', descRu: 'Пангея начинает раскалываться; динозавры становятся господствующими', descZh: '盘古大陆开始分裂，恐龙走向繁盛', descEn: 'Pangaea begins to rift apart; dinosaurs rise to dominance' },
  { ma: 170, nameZh: '侏罗纪中期', nameEn: 'Mid Jurassic', nameJa: 'ジュラ紀中期', nameRu: 'Средняя юра', descJa: '大西洋が開き始める', descRu: 'Начинает раскрываться Атлантический океан', descZh: '大西洋开始张开', descEn: 'The Atlantic Ocean starts to open' },
  { ma: 120, nameZh: '白垩纪早期', nameEn: 'Early Cretaceous', nameJa: '白亜紀前期', nameRu: 'Ранний мел', descJa: 'ゴンドワナ大陸が分裂し、被子植物が現れる', descRu: 'Гондвана распадается; появляются цветковые растения', descZh: '冈瓦纳大陆解体，开花植物出现', descEn: 'Gondwana breaks up; flowering plants appear' },
  { ma: 90, nameZh: '白垩纪晚期', nameEn: 'Late Cretaceous', nameJa: '白亜紀後期', nameRu: 'Поздний мел', descJa: '海水準が極めて高く、現在の大陸の輪郭が現れ始める', descRu: 'Уровень моря максимален; проступают очертания современных материков', descZh: '海平面极高，各大陆轮廓渐显', descEn: 'Sea levels peak; modern continents take shape' },
  { ma: 66, nameZh: '白垩纪末', nameEn: 'End Cretaceous', nameJa: '白亜紀末', nameRu: 'Конец мелового периода', descJa: '小惑星の衝突により恐竜が絶滅する', descRu: 'Падение астероида завершает эпоху динозавров', descZh: '小行星撞击，恐龙灭绝', descEn: 'Asteroid impact ends the age of dinosaurs' },
  { ma: 35, nameZh: '始新世晚期', nameEn: 'Late Eocene', nameJa: '始新世後期', nameRu: 'Поздний эоцен', descJa: 'インドがアジアに衝突し、ヒマラヤ山脈が隆起する', descRu: 'Индия сталкивается с Азией, поднимаются Гималаи', descZh: '印度板块撞向亚洲，喜马拉雅山脉隆起', descEn: 'India collides with Asia, raising the Himalayas' },
  { ma: 20, nameZh: '中新世早期', nameEn: 'Early Miocene', nameJa: '中新世前期', nameRu: 'Ранний миоцен', descJa: '大陸がほぼ現在の位置に近づき、草原が広がる', descRu: 'Материки близки к современному положению; распространяются степи', descZh: '大陆接近现代位置，草原扩张', descEn: 'Continents near their modern positions; grasslands expand' },
  { ma: 0, nameZh: '现代', nameEn: 'Present day', nameJa: '現代', nameRu: 'Современность', descJa: '私たちが暮らす今日の地球', descRu: 'Земля, какой мы знаем её сегодня', descZh: '我们今天的地球', descEn: 'The Earth as we know it today' },
]
