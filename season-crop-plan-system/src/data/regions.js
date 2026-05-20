export const regions = [
  {
    id: 'northeast',
    name: '东北地区',
    provinces: ['黑龙江', '吉林', '辽宁'],
    climate: 'temperate',
    climateName: '温带季风气候',
    frostFreeDays: '140-170天',
    annualRainfall: '500-800mm',
    suitableSeasons: ['春', '夏'],
    description: '冬季寒冷漫长，夏季温暖短促，适合一季作物种植'
  },
  {
    id: 'north',
    name: '华北地区',
    provinces: ['北京', '天津', '河北', '山西', '内蒙古'],
    climate: 'temperate',
    climateName: '温带大陆性气候',
    frostFreeDays: '180-220天',
    annualRainfall: '400-800mm',
    suitableSeasons: ['春', '夏', '秋'],
    description: '四季分明，降水集中，适合小麦、玉米等作物'
  },
  {
    id: 'east',
    name: '华东地区',
    provinces: ['上海', '江苏', '浙江', '安徽', '福建', '江西', '山东'],
    climate: 'subtropical',
    climateName: '亚热带季风气候',
    frostFreeDays: '230-300天',
    annualRainfall: '1000-1800mm',
    suitableSeasons: ['春', '夏', '秋', '冬'],
    description: '气候温暖湿润，雨热同期，适合多熟制种植'
  },
  {
    id: 'central',
    name: '华中地区',
    provinces: ['河南', '湖北', '湖南'],
    climate: 'subtropical',
    climateName: '亚热带季风气候',
    frostFreeDays: '230-280天',
    annualRainfall: '800-1600mm',
    suitableSeasons: ['春', '夏', '秋', '冬'],
    description: '气候温和，雨量充沛，适合水稻、油菜等作物'
  },
  {
    id: 'south',
    name: '华南地区',
    provinces: ['广东', '广西', '海南'],
    climate: 'tropical',
    climateName: '热带/亚热带季风气候',
    frostFreeDays: '300天以上',
    annualRainfall: '1500-2000mm',
    suitableSeasons: ['春', '夏', '秋', '冬'],
    description: '全年温暖，雨量充沛，可一年三熟'
  },
  {
    id: 'southwest',
    name: '西南地区',
    provinces: ['重庆', '四川', '贵州', '云南', '西藏'],
    climate: 'plateau',
    climateName: '高原/亚热带气候',
    frostFreeDays: '200-300天',
    annualRainfall: '800-1200mm',
    suitableSeasons: ['春', '夏', '秋'],
    description: '地形复杂，气候多样，立体农业特征明显'
  },
  {
    id: 'northwest',
    name: '西北地区',
    provinces: ['陕西', '甘肃', '青海', '宁夏', '新疆'],
    climate: 'desert',
    climateName: '温带大陆性/荒漠气候',
    frostFreeDays: '150-250天',
    annualRainfall: '200-400mm',
    suitableSeasons: ['春', '夏'],
    description: '气候干燥，昼夜温差大，灌溉农业为主'
  }
]

export const climateTypes = [
  { id: 'temperate', name: '温带气候', features: ['四季分明', '雨热同期', '冬季寒冷'], crops: ['小麦', '玉米', '大豆', '高粱'] },
  { id: 'subtropical', name: '亚热带气候', features: ['温暖湿润', '无霜期长', '降水充沛'], crops: ['水稻', '油菜', '茶叶', '柑橘'] },
  { id: 'tropical', name: '热带气候', features: ['全年高温', '雨量充沛', '无霜期'], crops: ['水稻', '甘蔗', '香蕉', '菠萝'] },
  { id: 'plateau', name: '高原气候', features: ['日照充足', '昼夜温差大', '气候垂直变化'], crops: ['青稞', '马铃薯', '荞麦', '药材'] },
  { id: 'desert', name: '荒漠气候', features: ['降水稀少', '光照充足', '昼夜温差大'], crops: ['棉花', '葡萄', '哈密瓜', '小麦'] }
]
