export const scenicAreas = [
  {
    id: 'main-entrance',
    name: '主入口广场',
    maxCapacity: 2000,
    currentVisitors: 0,
    x: 50,
    y: 45,
    width: 120,
    height: 80,
    color: '#4CAF50',
    popularity: 0.8,
    type: 'entrance',
    description: '景区主入口，游客集散中心'
  },
  {
    id: 'lake-area',
    name: '湖景区',
    maxCapacity: 1500,
    currentVisitors: 0,
    x: 200,
    y: 80,
    width: 140,
    height: 100,
    color: '#2196F3',
    popularity: 0.9,
    type: 'attraction',
    description: '风景秀丽的湖泊区域，可乘船游览'
  },
  {
    id: 'mountain-trail',
    name: '登山步道',
    maxCapacity: 800,
    currentVisitors: 0,
    x: 380,
    y: 50,
    width: 100,
    height: 120,
    color: '#795548',
    popularity: 0.7,
    type: 'attraction',
    description: '蜿蜒的登山步道，俯瞰全景'
  },
  {
    id: 'ancient-town',
    name: '古镇街区',
    maxCapacity: 1200,
    currentVisitors: 0,
    x: 180,
    y: 220,
    width: 130,
    height: 90,
    color: '#FF9800',
    popularity: 0.95,
    type: 'attraction',
    description: '历史悠久的古镇，特色美食购物'
  },
  {
    id: 'botanical-garden',
    name: '植物园',
    maxCapacity: 1000,
    currentVisitors: 0,
    x: 350,
    y: 200,
    width: 110,
    height: 100,
    color: '#8BC34A',
    popularity: 0.6,
    type: 'attraction',
    description: '各类珍稀植物，科普教育基地'
  },
  {
    id: 'temple-area',
    name: '古寺景区',
    maxCapacity: 600,
    currentVisitors: 0,
    x: 500,
    y: 120,
    width: 90,
    height: 110,
    color: '#9C27B0',
    popularity: 0.85,
    type: 'attraction',
    description: '千年古刹，佛教文化圣地'
  },
  {
    id: 'waterfall',
    name: '瀑布景区',
    maxCapacity: 500,
    currentVisitors: 0,
    x: 480,
    y: 260,
    width: 80,
    height: 80,
    color: '#00BCD4',
    popularity: 0.88,
    type: 'attraction',
    description: '壮观的瀑布群，天然氧吧'
  },
  {
    id: 'rest-area',
    name: '休息服务区',
    maxCapacity: 800,
    currentVisitors: 0,
    x: 80,
    y: 180,
    width: 90,
    height: 70,
    color: '#607D8B',
    popularity: 0.4,
    type: 'service',
    description: '餐饮、休息、卫生间等服务设施'
  }
]

export const areaConnections = [
  { from: 'main-entrance', to: 'lake-area', distance: 1 },
  { from: 'main-entrance', to: 'ancient-town', distance: 2 },
  { from: 'main-entrance', to: 'rest-area', distance: 1 },
  { from: 'lake-area', to: 'mountain-trail', distance: 2 },
  { from: 'lake-area', to: 'ancient-town', distance: 1.5 },
  { from: 'lake-area', to: 'temple-area', distance: 2.5 },
  { from: 'mountain-trail', to: 'temple-area', distance: 1.5 },
  { from: 'mountain-trail', to: 'waterfall', distance: 2 },
  { from: 'ancient-town', to: 'botanical-garden', distance: 1 },
  { from: 'ancient-town', to: 'rest-area', distance: 1.5 },
  { from: 'botanical-garden', to: 'temple-area', distance: 1.5 },
  { from: 'botanical-garden', to: 'waterfall', distance: 1.5 },
  { from: 'temple-area', to: 'waterfall', distance: 2 },
  { from: 'rest-area', to: 'main-entrance', distance: 1 }
]

export const getStatusLevel = (current, max) => {
  const ratio = current / max
  if (ratio < 0.5) return { level: 'normal', text: '正常', color: '#28a745' }
  if (ratio < 0.7) return { level: 'warning', text: '较拥挤', color: '#ffc107' }
  if (ratio < 0.9) return { level: 'danger', text: '拥挤', color: '#dc3545' }
  return { level: 'congested', text: '严重拥堵', color: '#721c24' }
}

export const getCongestedAreas = (areas) => {
  return areas.filter(area => {
    const ratio = area.currentVisitors / area.maxCapacity
    return ratio >= 0.8
  }).sort((a, b) => (b.currentVisitors / b.maxCapacity) - (a.currentVisitors / a.maxCapacity))
}
