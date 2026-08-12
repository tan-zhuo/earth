/**
 * 全球主要海运贸易航线（本地精选静态数据）。
 * 航线按枢纽港分段建模（大圆弧逐段连接），近似真实海上通道走向；
 * weight 表示相对运量等级（1-3），用于线宽与颜色。
 */
export interface Port {
  id: string
  nameZh: string
  nameEn: string
  lat: number
  lng: number
}

export const PORTS: Port[] = [
  { id: 'shanghai', nameZh: '上海', nameEn: 'Shanghai', lat: 31.2, lng: 121.5 },
  { id: 'singapore', nameZh: '新加坡', nameEn: 'Singapore', lat: 1.29, lng: 103.85 },
  { id: 'busan', nameZh: '釜山', nameEn: 'Busan', lat: 35.1, lng: 129.0 },
  { id: 'tokyo', nameZh: '东京', nameEn: 'Tokyo', lat: 35.6, lng: 139.7 },
  { id: 'colombo', nameZh: '科伦坡', nameEn: 'Colombo', lat: 6.95, lng: 79.85 },
  { id: 'dubai', nameZh: '迪拜', nameEn: 'Dubai', lat: 25.0, lng: 55.06 },
  { id: 'suez', nameZh: '苏伊士', nameEn: 'Suez', lat: 29.97, lng: 32.55 },
  { id: 'piraeus', nameZh: '比雷埃夫斯', nameEn: 'Piraeus', lat: 37.94, lng: 23.64 },
  { id: 'algeciras', nameZh: '直布罗陀', nameEn: 'Gibraltar', lat: 36.13, lng: -5.45 },
  { id: 'rotterdam', nameZh: '鹿特丹', nameEn: 'Rotterdam', lat: 51.95, lng: 4.14 },
  { id: 'newyork', nameZh: '纽约', nameEn: 'New York', lat: 40.67, lng: -74.04 },
  { id: 'losangeles', nameZh: '洛杉矶', nameEn: 'Los Angeles', lat: 33.73, lng: -118.26 },
  { id: 'panama', nameZh: '巴拿马', nameEn: 'Panama', lat: 9.35, lng: -79.9 },
  { id: 'santos', nameZh: '桑托斯', nameEn: 'Santos', lat: -23.98, lng: -46.3 },
  { id: 'capetown', nameZh: '开普敦', nameEn: 'Cape Town', lat: -33.9, lng: 18.42 },
  { id: 'lagos', nameZh: '拉各斯', nameEn: 'Lagos', lat: 6.44, lng: 3.4 },
  { id: 'mumbai', nameZh: '孟买', nameEn: 'Mumbai', lat: 18.95, lng: 72.84 },
  { id: 'sydney', nameZh: '悉尼', nameEn: 'Sydney', lat: -33.85, lng: 151.2 },
  { id: 'vancouver', nameZh: '温哥华', nameEn: 'Vancouver', lat: 49.29, lng: -123.11 },
]

export interface RouteLeg {
  from: string
  to: string
  /** 相对运量 1-3 */
  weight: number
}

export const ROUTE_LEGS: RouteLeg[] = [
  // 亚欧主干线（经马六甲—苏伊士—地中海）
  { from: 'tokyo', to: 'shanghai', weight: 2 },
  { from: 'busan', to: 'shanghai', weight: 2 },
  { from: 'shanghai', to: 'singapore', weight: 3 },
  { from: 'singapore', to: 'colombo', weight: 3 },
  { from: 'colombo', to: 'suez', weight: 3 },
  { from: 'suez', to: 'piraeus', weight: 2 },
  { from: 'piraeus', to: 'algeciras', weight: 2 },
  { from: 'algeciras', to: 'rotterdam', weight: 3 },
  // 中东能源航线
  { from: 'dubai', to: 'colombo', weight: 2 },
  { from: 'dubai', to: 'suez', weight: 2 },
  { from: 'mumbai', to: 'dubai', weight: 1 },
  // 跨太平洋
  { from: 'shanghai', to: 'losangeles', weight: 3 },
  { from: 'tokyo', to: 'losangeles', weight: 2 },
  { from: 'tokyo', to: 'vancouver', weight: 1 },
  // 亚洲—美东（经巴拿马）
  { from: 'shanghai', to: 'panama', weight: 2 },
  { from: 'panama', to: 'newyork', weight: 2 },
  { from: 'losangeles', to: 'panama', weight: 1 },
  // 跨大西洋
  { from: 'rotterdam', to: 'newyork', weight: 2 },
  // 南美航线
  { from: 'santos', to: 'algeciras', weight: 1 },
  { from: 'santos', to: 'capetown', weight: 1 },
  { from: 'panama', to: 'santos', weight: 1 },
  // 非洲航线（好望角）
  { from: 'capetown', to: 'singapore', weight: 1 },
  { from: 'capetown', to: 'lagos', weight: 1 },
  { from: 'lagos', to: 'algeciras', weight: 1 },
  // 大洋洲
  { from: 'sydney', to: 'singapore', weight: 1 },
  { from: 'sydney', to: 'shanghai', weight: 2 },
]
