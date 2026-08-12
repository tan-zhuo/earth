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
  nameEn: string
  descZh: string
  descEn: string
}

export const PALEO_ERAS: PaleoEra[] = [
  { ma: 750, nameZh: '成冰纪', nameEn: 'Cryogenian', descZh: '罗迪尼亚超大陆开始解体，地球进入"雪球地球"时期', descEn: 'Supercontinent Rodinia breaks apart; Earth enters the "Snowball Earth" era' },
  { ma: 600, nameZh: '埃迪卡拉纪', nameEn: 'Ediacaran', descZh: '最早的复杂多细胞生物出现', descEn: 'The first complex multicellular life appears' },
  { ma: 540, nameZh: '寒武纪', nameEn: 'Cambrian', descZh: '寒武纪生命大爆发，绝大多数动物门类涌现', descEn: 'The Cambrian explosion — most major animal groups appear' },
  { ma: 470, nameZh: '奥陶纪', nameEn: 'Ordovician', descZh: '海洋生物繁盛，植物开始登陆', descEn: 'Marine life flourishes; plants begin to colonize land' },
  { ma: 430, nameZh: '志留纪', nameEn: 'Silurian', descZh: '陆地植物扩张，有颌鱼类出现', descEn: 'Land plants spread; jawed fish appear' },
  { ma: 370, nameZh: '泥盆纪', nameEn: 'Devonian', descZh: '鱼类时代，四足动物开始登上陆地', descEn: 'The Age of Fishes; tetrapods first walk onto land' },
  { ma: 300, nameZh: '石炭纪晚期', nameEn: 'Late Carboniferous', descZh: '巨型昆虫与煤炭森林，盘古大陆正在拼合', descEn: 'Giant insects and coal forests; Pangaea is assembling' },
  { ma: 240, nameZh: '三叠纪早期', nameEn: 'Early Triassic', descZh: '盘古超大陆形成，恐龙祖先出现', descEn: 'Supercontinent Pangaea is complete; ancestors of dinosaurs appear' },
  { ma: 200, nameZh: '侏罗纪早期', nameEn: 'Early Jurassic', descZh: '盘古大陆开始分裂，恐龙走向繁盛', descEn: 'Pangaea begins to rift apart; dinosaurs rise to dominance' },
  { ma: 170, nameZh: '侏罗纪中期', nameEn: 'Mid Jurassic', descZh: '大西洋开始张开', descEn: 'The Atlantic Ocean starts to open' },
  { ma: 120, nameZh: '白垩纪早期', nameEn: 'Early Cretaceous', descZh: '冈瓦纳大陆解体，开花植物出现', descEn: 'Gondwana breaks up; flowering plants appear' },
  { ma: 90, nameZh: '白垩纪晚期', nameEn: 'Late Cretaceous', descZh: '海平面极高，各大陆轮廓渐显', descEn: 'Sea levels peak; modern continents take shape' },
  { ma: 66, nameZh: '白垩纪末', nameEn: 'End Cretaceous', descZh: '小行星撞击，恐龙灭绝', descEn: 'Asteroid impact ends the age of dinosaurs' },
  { ma: 35, nameZh: '始新世晚期', nameEn: 'Late Eocene', descZh: '印度板块撞向亚洲，喜马拉雅山脉隆起', descEn: 'India collides with Asia, raising the Himalayas' },
  { ma: 20, nameZh: '中新世早期', nameEn: 'Early Miocene', descZh: '大陆接近现代位置，草原扩张', descEn: 'Continents near their modern positions; grasslands expand' },
  { ma: 0, nameZh: '现代', nameEn: 'Present day', descZh: '我们今天的地球', descEn: 'The Earth as we know it today' },
]
