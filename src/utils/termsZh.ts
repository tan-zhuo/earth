/**
 * Factbook 资源/农产品/工业清单的中文术语词典。
 * 这类清单词汇高度标准化，逐词翻译可覆盖绝大多数条目；
 * 词典未收录的词保留英文原文。
 */
const DICT: Record<string, string> = {
  // ---- 矿产与能源 ----
  'coal': '煤炭', 'iron ore': '铁矿石', 'petroleum': '石油', 'crude petroleum': '原油',
  'refined petroleum': '成品油', 'oil': '石油', 'crude oil': '原油', 'natural gas': '天然气',
  'gold': '金', 'silver': '银', 'copper': '铜', 'uranium': '铀', 'bauxite': '铝土矿',
  'alumina': '氧化铝', 'aluminum': '铝', 'aluminium': '铝', 'timber': '木材', 'lumber': '木材',
  'hydropower': '水力发电', 'hydropower potential': '水能资源', 'hydroelectric power': '水力发电',
  'rare earth elements': '稀土元素', 'rare earths': '稀土', 'tungsten': '钨', 'antimony': '锑',
  'manganese': '锰', 'magnetite': '磁铁矿', 'molybdenum': '钼', 'vanadium': '钒', 'zinc': '锌',
  'lead': '铅', 'tin': '锡', 'nickel': '镍', 'phosphates': '磷矿', 'phosphate rock': '磷矿',
  'potash': '钾盐', 'salt': '盐', 'sulfur': '硫磺', 'graphite': '石墨', 'chromium': '铬',
  'chromite': '铬铁矿', 'cobalt': '钴', 'lithium': '锂', 'mercury': '汞', 'asbestos': '石棉',
  'limestone': '石灰岩', 'marble': '大理石', 'granite': '花岗岩', 'gypsum': '石膏',
  'clay': '黏土', 'kaolin': '高岭土', 'sand': '沙', 'gravel': '砾石', 'stone': '石材',
  'diamonds': '钻石', 'gemstones': '宝石', 'precious stones': '宝石', 'platinum': '铂金',
  'palladium': '钯', 'titanium': '钛', 'zirconium': '锆', 'silica': '硅石', 'quartz': '石英',
  'feldspar': '长石', 'mica': '云母', 'barite': '重晶石', 'boron': '硼', 'bromine': '溴',
  'magnesium': '镁', 'soda ash': '纯碱', 'peat': '泥炭', 'geothermal power': '地热能',
  'geothermal energy': '地热能', 'solar power': '太阳能', 'solar': '太阳能', 'wind power': '风能',
  'wind': '风能', 'helium': '氦', 'arsenic': '砷', 'bismuth': '铋', 'cadmium': '镉',
  'ferrosilicon': '硅铁', 'gallium': '镓', 'germanium': '锗', 'hafnium': '铪', 'indium': '铟',
  'niobium': '铌', 'tantalum': '钽', 'tellurium': '碲', 'selenium': '硒', 'strontium': '锶',
  'rhenium': '铼', 'beryllium': '铍', 'fluorspar': '萤石', 'talc': '滑石', 'dolomite': '白云石',
  'pumice': '浮石', 'perlite': '珍珠岩', 'shale oil': '页岩油', 'oil shale': '油页岩',
  'tar sands': '油砂', 'forests': '森林', 'forest': '森林', 'wildlife': '野生动物',
  'pastures': '牧场', 'pastureland': '牧场', 'grazing land': '牧场', 'farmland': '农田',
  'water': '水资源', 'freshwater': '淡水', 'fish': '鱼类', 'fisheries': '渔业资源',
  'arable land': '耕地', 'fertile soil': '沃土', 'fertile soils': '沃土', 'iron': '铁',
  'steel': '钢铁', 'iron and steel': '钢铁', 'scrap iron': '废铁',
  // ---- 农产品 ----
  'maize': '玉米', 'corn': '玉米', 'rice': '稻米', 'wheat': '小麦', 'vegetables': '蔬菜',
  'sugarcane': '甘蔗', 'sugar cane': '甘蔗', 'sugar beets': '甜菜', 'sugar beet': '甜菜',
  'sugar': '糖', 'potatoes': '马铃薯', 'sweet potatoes': '红薯', 'cassava': '木薯',
  'soybeans': '大豆', 'soybean': '大豆', 'barley': '大麦', 'oats': '燕麦', 'rye': '黑麦',
  'sorghum': '高粱', 'millet': '小米', 'cotton': '棉花', 'seed cotton': '籽棉',
  'tobacco': '烟草', 'tea': '茶叶', 'coffee': '咖啡', 'cocoa': '可可', 'cocoa beans': '可可豆',
  'bananas': '香蕉', 'plantains': '大蕉', 'oranges': '橙子', 'tangerines': '柑橘',
  'apples': '苹果', 'grapes': '葡萄', 'olives': '橄榄', 'olive oil': '橄榄油',
  'palm oil': '棕榈油', 'oil palm fruit': '油棕果', 'coconuts': '椰子', 'copra': '椰干',
  'rubber': '橡胶', 'natural rubber': '天然橡胶', 'groundnuts': '花生', 'peanuts': '花生',
  'sunflower seeds': '葵花籽', 'sunflower seed': '葵花籽', 'rapeseed': '油菜籽',
  'sesame': '芝麻', 'sesame seeds': '芝麻', 'dates': '椰枣', 'figs': '无花果',
  'tomatoes': '番茄', 'onions': '洋葱', 'cucumbers': '黄瓜', 'cucumbers/gherkins': '黄瓜',
  'watermelons': '西瓜', 'melons': '甜瓜', 'cantaloupes': '哈密瓜', 'mangoes': '芒果',
  'mangoes/guavas': '芒果/番石榴', 'pineapples': '菠萝', 'papayas': '木瓜',
  'avocados': '牛油果', 'cabbages': '卷心菜', 'carrots': '胡萝卜', 'carrots/turnips': '胡萝卜/芜菁',
  'chillies/peppers': '辣椒', 'peppers': '辣椒', 'garlic': '大蒜', 'ginger': '姜',
  'beans': '豆类', 'green beans': '青豆', 'chickpeas': '鹰嘴豆', 'chick peas': '鹰嘴豆',
  'lentils': '小扁豆', 'peas': '豌豆', 'yams': '山药', 'taro': '芋头', 'plantain': '大蕉',
  'milk': '牛奶', 'eggs': '鸡蛋', 'beef': '牛肉', 'pork': '猪肉', 'poultry': '禽肉',
  'chicken': '鸡肉', 'mutton': '羊肉', 'lamb': '羔羊肉', 'goat': '山羊', 'goat meat': '山羊肉',
  'goat milk': '山羊奶', 'sheep milk': '绵羊奶', 'camel milk': '骆驼奶', 'camel meat': '骆驼肉',
  'buffalo milk': '水牛奶', 'wool': '羊毛', 'honey': '蜂蜜', 'fruit': '水果', 'fruits': '水果',
  'citrus': '柑橘', 'citrus fruit': '柑橘', 'grain': '谷物', 'cereals': '谷物',
  'livestock': '畜牧', 'cattle': '牛', 'sheep': '绵羊', 'pigs': '猪', 'dairy products': '乳制品',
  'dairy': '乳制品', 'shrimp': '虾', 'prawns': '对虾', 'seafood': '海产品', 'nuts': '坚果',
  'almonds': '杏仁', 'pistachios': '开心果', 'hazelnuts': '榛子', 'walnuts': '核桃',
  'cashews': '腰果', 'cashew nuts': '腰果', 'cloves': '丁香', 'vanilla': '香草',
  'spices': '香料', 'tropical fruit': '热带水果', 'other meats': '其他肉类', 'meat': '肉类',
  'pulses': '豆类', 'jute': '黄麻', 'flax': '亚麻', 'silk': '蚕丝', 'hides': '皮革',
  'skins': '毛皮', 'flowers': '花卉', 'cut flowers': '鲜切花', 'oilseeds': '油籽',
  'apricots': '杏', 'peaches': '桃', 'peaches/nectarines': '桃/油桃', 'pears': '梨',
  'plums': '李子', 'cherries': '樱桃', 'strawberries': '草莓', 'blueberries': '蓝莓',
  'lemons': '柠檬', 'lemons/limes': '柠檬/青柠', 'grapefruit': '柚子', 'kiwifruit': '猕猴桃',
  'quinoa': '藜麦', 'triticale': '黑小麦', 'buckwheat': '荞麦', 'mushrooms': '蘑菇',
  'mushrooms/truffles': '蘑菇/松露', 'hops': '啤酒花', 'wine': '葡萄酒', 'beer': '啤酒',
  // ---- 工业 ----
  'mining': '采矿', 'machinery': '机械', 'textiles': '纺织', 'apparel': '服装',
  'clothing': '服装', 'garments': '成衣', 'food processing': '食品加工', 'food products': '食品',
  'processed food': '加工食品', 'chemicals': '化工', 'chemical products': '化工产品',
  'fertilizers': '化肥', 'fertilizer': '化肥', 'cement': '水泥', 'electronics': '电子',
  'consumer electronics': '消费电子', 'automobiles': '汽车', 'motor vehicles': '汽车',
  'cars': '汽车', 'vehicles': '车辆', 'auto parts': '汽车零部件', 'vehicle parts': '汽车零部件',
  'shipbuilding': '造船', 'aircraft': '飞机', 'aerospace': '航空航天',
  'telecommunications': '电信', 'telecommunications equipment': '电信设备',
  'petroleum refining': '炼油', 'oil refining': '炼油', 'petrochemicals': '石化',
  'pharmaceuticals': '制药', 'medicaments': '药品', 'packaged medicines': '包装药品',
  'tourism': '旅游业', 'banking': '银行业', 'finance': '金融', 'financial services': '金融服务',
  'insurance': '保险', 'construction': '建筑', 'paper': '造纸', 'paper products': '纸制品',
  'pulp': '纸浆', 'wood products': '木制品', 'wood': '木材', 'furniture': '家具',
  'toys': '玩具', 'footwear': '制鞋', 'shoes': '鞋类', 'leather': '皮革',
  'leather goods': '皮革制品', 'glass': '玻璃', 'ceramics': '陶瓷', 'rubber products': '橡胶制品',
  'plastics': '塑料', 'plastic products': '塑料制品', 'sugar processing': '制糖',
  'sugar refining': '制糖', 'brewing': '酿酒', 'distilling': '蒸馏酒', 'beverages': '饮料',
  'tobacco products': '烟草制品', 'fishing': '渔业', 'fish processing': '水产加工',
  'forestry': '林业', 'agriculture': '农业', 'energy': '能源', 'electricity': '电力',
  'software': '软件', 'information technology': '信息技术', 'semiconductors': '半导体',
  'integrated circuits': '集成电路', 'machine building': '机械制造', 'metallurgy': '冶金',
  'metals': '金属', 'metal products': '金属制品', 'coal mining': '采煤',
  'light industry': '轻工业', 'handicrafts': '手工艺品', 'carpets': '地毯',
  'transport equipment': '运输设备', 'transportation equipment': '运输设备',
  'shipping': '航运', 'offshore financial services': '离岸金融服务', 'real estate': '房地产',
  'defense products': '国防产品', 'arms': '武器', 'weapons': '武器', 'satellites': '卫星',
  'computers': '计算机', 'broadcasting equipment': '广播设备', 'office machinery': '办公设备',
  'gas turbines': '燃气轮机', 'ships': '船舶', 'boats': '船艇', 'trucks': '卡车',
  'motorcycles': '摩托车', 'bicycles': '自行车', 'jewelry': '珠宝', 'watches': '钟表',
  'precision instruments': '精密仪器', 'optical instruments': '光学仪器',
  'medical equipment': '医疗设备', 'scientific instruments': '科学仪器', 'diamonds cutting': '钻石加工',
  'diamond cutting': '钻石加工', 'gas': '天然气', 'liquefied natural gas': '液化天然气',
  'aluminum products': '铝制品', 'copper products': '铜制品', 'gold mining': '采金',
  'soap': '肥皂', 'cigarettes': '香烟', 'flour': '面粉', 'flour milling': '面粉加工',
  'palm kernels': '棕榈仁', 'cotton yarn': '棉纱', 'cotton lint': '皮棉',
  'crude oil production': '原油开采', 'oil production': '石油开采',
  'basic petrochemicals': '基础石化产品', 'ammonia': '氨', 'industrial gases': '工业气体',
  'sodium hydroxide (caustic soda)': '烧碱', 'caustic soda': '烧碱',
  'commercial ship repair': '商船维修', 'commercial aircraft repair': '商用飞机维修',
  'natural gas production': '天然气开采', 'phosphate mining': '磷矿开采',
  'aluminum smelting': '铝冶炼', 'copper smelting': '铜冶炼', 'zinc smelting': '锌冶炼',
  'oil refineries': '炼油厂', 'sawmills': '锯木厂', 'meat processing': '肉类加工',
  'meat packing': '肉类加工', 'dairy processing': '乳品加工', 'canning': '罐头加工',
  'wine making': '酿酒', 'winemaking': '酿酒', 'olive oil production': '橄榄油生产',
}

/**
 * 将 factbook 英文清单逐词翻译为中文（未收录词保留英文）。
 * 输入形如 "coal, iron ore, petroleum"，输出 "煤炭、铁矿石、石油"。
 */
export function translateTerms(text: string): string {
  return text
    .split(/[,;]\s*/)
    .map((raw) => {
      let item = raw.trim().replace(/^and\s+/i, '')
      if (!item) return null
      const key = item.toLowerCase()
      return DICT[key] ?? DICT[key.replace(/s$/, '')] ?? item
    })
    .filter(Boolean)
    .join('、')
}
