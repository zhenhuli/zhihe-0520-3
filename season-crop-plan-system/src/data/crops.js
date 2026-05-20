export const crops = [
  {
    id: 'rice',
    name: '水稻',
    category: '粮食作物',
    suitableClimates: ['subtropical', 'tropical', 'temperate'],
    suitableRegions: ['east', 'central', 'south', 'southwest', 'northeast'],
    seedRatePerMu: 3,
    seedUnit: '公斤/亩',
    growthDays: 120,
    harvestPeriod: '30天',
    fertilizer: {
      base: { name: '有机肥', amount: 1500, unit: '公斤/亩' },
      topDressing: [
        { stage: '分蘖期', name: '尿素', amount: 10, unit: '公斤/亩' },
        { stage: '拔节期', name: '复合肥', amount: 20, unit: '公斤/亩' },
        { stage: '抽穗期', name: '钾肥', amount: 8, unit: '公斤/亩' }
      ]
    },
    waterRequirement: '400-600立方米/亩',
    sowingSeasons: [
      { season: '早稻', months: [3, 4], harvestMonths: [7, 8] },
      { season: '中稻', months: [4, 5], harvestMonths: [8, 9] },
      { season: '晚稻', months: [6, 7], harvestMonths: [10, 11] }
    ],
    yieldPerMu: 500,
    yieldUnit: '公斤/亩',
    description: '主要粮食作物，喜高温多湿，需充足水分'
  },
  {
    id: 'wheat',
    name: '小麦',
    category: '粮食作物',
    suitableClimates: ['temperate', 'subtropical', 'desert'],
    suitableRegions: ['north', 'east', 'central', 'northwest', 'northeast'],
    seedRatePerMu: 10,
    seedUnit: '公斤/亩',
    growthDays: 230,
    harvestPeriod: '15天',
    fertilizer: {
      base: { name: '有机肥', amount: 2000, unit: '公斤/亩' },
      topDressing: [
        { stage: '返青期', name: '尿素', amount: 15, unit: '公斤/亩' },
        { stage: '拔节期', name: '复合肥', amount: 25, unit: '公斤/亩' }
      ]
    },
    waterRequirement: '300-400立方米/亩',
    sowingSeasons: [
      { season: '冬小麦', months: [9, 10], harvestMonths: [5, 6] },
      { season: '春小麦', months: [2, 3], harvestMonths: [7, 8] }
    ],
    yieldPerMu: 400,
    yieldUnit: '公斤/亩',
    description: '主要粮食作物，耐寒耐旱，适应性强'
  },
  {
    id: 'corn',
    name: '玉米',
    category: '粮食作物',
    suitableClimates: ['temperate', 'subtropical', 'desert'],
    suitableRegions: ['northeast', 'north', 'east', 'central', 'northwest'],
    seedRatePerMu: 2.5,
    seedUnit: '公斤/亩',
    growthDays: 110,
    harvestPeriod: '20天',
    fertilizer: {
      base: { name: '复合肥', amount: 50, unit: '公斤/亩' },
      topDressing: [
        { stage: '拔节期', name: '尿素', amount: 20, unit: '公斤/亩' },
        { stage: '大喇叭口期', name: '尿素', amount: 25, unit: '公斤/亩' }
      ]
    },
    waterRequirement: '250-350立方米/亩',
    sowingSeasons: [
      { season: '春玉米', months: [4, 5], harvestMonths: [8, 9] },
      { season: '夏玉米', months: [6, 7], harvestMonths: [9, 10] }
    ],
    yieldPerMu: 600,
    yieldUnit: '公斤/亩',
    description: '高产粮食作物，喜温暖，需充足光照'
  },
  {
    id: 'soybean',
    name: '大豆',
    category: '经济作物',
    suitableClimates: ['temperate', 'subtropical'],
    suitableRegions: ['northeast', 'north', 'east', 'central'],
    seedRatePerMu: 5,
    seedUnit: '公斤/亩',
    growthDays: 100,
    harvestPeriod: '15天',
    fertilizer: {
      base: { name: '有机肥', amount: 1000, unit: '公斤/亩' },
      topDressing: [
        { stage: '初花期', name: '磷肥', amount: 15, unit: '公斤/亩' }
      ]
    },
    waterRequirement: '200-300立方米/亩',
    sowingSeasons: [
      { season: '春大豆', months: [4, 5], harvestMonths: [8, 9] },
      { season: '夏大豆', months: [6, 7], harvestMonths: [9, 10] }
    ],
    yieldPerMu: 200,
    yieldUnit: '公斤/亩',
    description: '重要油料作物，根瘤菌固氮，耐瘠薄'
  },
  {
    id: 'peanut',
    name: '花生',
    category: '经济作物',
    suitableClimates: ['temperate', 'subtropical', 'tropical'],
    suitableRegions: ['east', 'central', 'south', 'north'],
    seedRatePerMu: 15,
    seedUnit: '公斤/亩',
    growthDays: 130,
    harvestPeriod: '20天',
    fertilizer: {
      base: { name: '有机肥', amount: 1500, unit: '公斤/亩' },
      topDressing: [
        { stage: '开花期', name: '磷肥', amount: 20, unit: '公斤/亩' },
        { stage: '结荚期', name: '钾肥', amount: 10, unit: '公斤/亩' }
      ]
    },
    waterRequirement: '250-350立方米/亩',
    sowingSeasons: [
      { season: '春花生', months: [4, 5], harvestMonths: [8, 9] }
    ],
    yieldPerMu: 300,
    yieldUnit: '公斤/亩',
    description: '重要油料作物，喜沙质土壤，耐旱怕涝'
  },
  {
    id: 'cotton',
    name: '棉花',
    category: '经济作物',
    suitableClimates: ['temperate', 'desert'],
    suitableRegions: ['northwest', 'north', 'east'],
    seedRatePerMu: 2,
    seedUnit: '公斤/亩',
    growthDays: 150,
    harvestPeriod: '60天',
    fertilizer: {
      base: { name: '有机肥', amount: 2000, unit: '公斤/亩' },
      topDressing: [
        { stage: '蕾期', name: '尿素', amount: 15, unit: '公斤/亩' },
        { stage: '花铃期', name: '复合肥', amount: 30, unit: '公斤/亩' }
      ]
    },
    waterRequirement: '300-400立方米/亩',
    sowingSeasons: [
      { season: '春棉', months: [3, 4], harvestMonths: [9, 10] }
    ],
    yieldPerMu: 250,
    yieldUnit: '公斤/亩',
    description: '重要纺织原料，喜温喜光，生长期长'
  },
  {
    id: 'rape',
    name: '油菜',
    category: '经济作物',
    suitableClimates: ['subtropical', 'temperate'],
    suitableRegions: ['east', 'central', 'southwest', 'north'],
    seedRatePerMu: 0.5,
    seedUnit: '公斤/亩',
    growthDays: 210,
    harvestPeriod: '15天',
    fertilizer: {
      base: { name: '有机肥', amount: 1500, unit: '公斤/亩' },
      topDressing: [
        { stage: '苔期', name: '尿素', amount: 10, unit: '公斤/亩' },
        { stage: '花期', name: '硼肥', amount: 1, unit: '公斤/亩' }
      ]
    },
    waterRequirement: '250-350立方米/亩',
    sowingSeasons: [
      { season: '冬油菜', months: [9, 10], harvestMonths: [4, 5] },
      { season: '春油菜', months: [3, 4], harvestMonths: [7, 8] }
    ],
    yieldPerMu: 150,
    yieldUnit: '公斤/亩',
    description: '主要油料作物，耐寒，适合轮作'
  },
  {
    id: 'potato',
    name: '马铃薯',
    category: '蔬菜作物',
    suitableClimates: ['temperate', 'subtropical', 'plateau'],
    suitableRegions: ['northeast', 'north', 'east', 'southwest', 'northwest'],
    seedRatePerMu: 120,
    seedUnit: '公斤/亩',
    growthDays: 90,
    harvestPeriod: '20天',
    fertilizer: {
      base: { name: '有机肥', amount: 2000, unit: '公斤/亩' },
      topDressing: [
        { stage: '发棵期', name: '复合肥', amount: 30, unit: '公斤/亩' }
      ]
    },
    waterRequirement: '200-300立方米/亩',
    sowingSeasons: [
      { season: '春马铃薯', months: [2, 3], harvestMonths: [5, 6] },
      { season: '秋马铃薯', months: [8, 9], harvestMonths: [11, 12] }
    ],
    yieldPerMu: 2000,
    yieldUnit: '公斤/亩',
    description: '高产蔬菜，喜冷凉，耐贮藏'
  },
  {
    id: 'tomato',
    name: '番茄',
    category: '蔬菜作物',
    suitableClimates: ['temperate', 'subtropical', 'tropical'],
    suitableRegions: ['east', 'central', 'south', 'north', 'southwest'],
    seedRatePerMu: 0.05,
    seedUnit: '公斤/亩',
    growthDays: 110,
    harvestPeriod: '60天',
    fertilizer: {
      base: { name: '有机肥', amount: 3000, unit: '公斤/亩' },
      topDressing: [
        { stage: '坐果期', name: '复合肥', amount: 25, unit: '公斤/亩' },
        { stage: '盛果期', name: '钾肥', amount: 15, unit: '公斤/亩' }
      ]
    },
    waterRequirement: '300-400立方米/亩',
    sowingSeasons: [
      { season: '春番茄', months: [1, 2], harvestMonths: [5, 6] },
      { season: '秋番茄', months: [7, 8], harvestMonths: [10, 11] }
    ],
    yieldPerMu: 5000,
    yieldUnit: '公斤/亩',
    description: '主要蔬菜，喜温暖，需充足水肥'
  },
  {
    id: 'cucumber',
    name: '黄瓜',
    category: '蔬菜作物',
    suitableClimates: ['temperate', 'subtropical', 'tropical'],
    suitableRegions: ['east', 'central', 'south', 'north', 'southwest'],
    seedRatePerMu: 0.15,
    seedUnit: '公斤/亩',
    growthDays: 60,
    harvestPeriod: '90天',
    fertilizer: {
      base: { name: '有机肥', amount: 3000, unit: '公斤/亩' },
      topDressing: [
        { stage: '初瓜期', name: '复合肥', amount: 20, unit: '公斤/亩' },
        { stage: '盛瓜期', name: '复合肥', amount: 30, unit: '公斤/亩' }
      ]
    },
    waterRequirement: '400-500立方米/亩',
    sowingSeasons: [
      { season: '春黄瓜', months: [2, 3], harvestMonths: [4, 7] },
      { season: '秋黄瓜', months: [7, 8], harvestMonths: [9, 11] }
    ],
    yieldPerMu: 4000,
    yieldUnit: '公斤/亩',
    description: '主要蔬菜，喜温暖湿润，需水量大'
  },
  {
    id: 'chili',
    name: '辣椒',
    category: '蔬菜作物',
    suitableClimates: ['subtropical', 'tropical', 'temperate'],
    suitableRegions: ['east', 'central', 'south', 'southwest', 'north'],
    seedRatePerMu: 0.05,
    seedUnit: '公斤/亩',
    growthDays: 120,
    harvestPeriod: '90天',
    fertilizer: {
      base: { name: '有机肥', amount: 2500, unit: '公斤/亩' },
      topDressing: [
        { stage: '初果期', name: '复合肥', amount: 20, unit: '公斤/亩' },
        { stage: '盛果期', name: '钾肥', amount: 10, unit: '公斤/亩' }
      ]
    },
    waterRequirement: '250-350立方米/亩',
    sowingSeasons: [
      { season: '春辣椒', months: [1, 2], harvestMonths: [5, 8] },
      { season: '秋辣椒', months: [7, 8], harvestMonths: [10, 12] }
    ],
    yieldPerMu: 2500,
    yieldUnit: '公斤/亩',
    description: '重要调味蔬菜，喜温暖，耐旱怕涝'
  },
  {
    id: 'cabbage',
    name: '白菜',
    category: '蔬菜作物',
    suitableClimates: ['temperate', 'subtropical'],
    suitableRegions: ['north', 'east', 'central', 'southwest', 'northwest'],
    seedRatePerMu: 0.1,
    seedUnit: '公斤/亩',
    growthDays: 80,
    harvestPeriod: '20天',
    fertilizer: {
      base: { name: '有机肥', amount: 2000, unit: '公斤/亩' },
      topDressing: [
        { stage: '莲座期', name: '尿素', amount: 15, unit: '公斤/亩' },
        { stage: '结球期', name: '复合肥', amount: 25, unit: '公斤/亩' }
      ]
    },
    waterRequirement: '250-350立方米/亩',
    sowingSeasons: [
      { season: '秋白菜', months: [7, 8], harvestMonths: [10, 11] },
      { season: '春白菜', months: [2, 3], harvestMonths: [5, 6] }
    ],
    yieldPerMu: 5000,
    yieldUnit: '公斤/亩',
    description: '主要蔬菜，喜冷凉，耐贮藏'
  },
  {
    id: 'apple',
    name: '苹果',
    category: '果树作物',
    suitableClimates: ['temperate'],
    suitableRegions: ['north', 'northwest', 'northeast'],
    seedRatePerMu: 30,
    seedUnit: '株/亩',
    growthDays: 1095,
    harvestPeriod: '30天',
    fertilizer: {
      base: { name: '有机肥', amount: 3000, unit: '公斤/亩' },
      topDressing: [
        { stage: '萌芽期', name: '氮肥', amount: 20, unit: '公斤/亩' },
        { stage: '果实膨大期', name: '复合肥', amount: 40, unit: '公斤/亩' }
      ]
    },
    waterRequirement: '200-300立方米/亩',
    sowingSeasons: [
      { season: '栽植', months: [3, 4], harvestMonths: [9, 10] }
    ],
    yieldPerMu: 2500,
    yieldUnit: '公斤/亩',
    description: '主要水果，多年生，喜冷凉干燥气候'
  },
  {
    id: 'orange',
    name: '柑橘',
    category: '果树作物',
    suitableClimates: ['subtropical', 'tropical'],
    suitableRegions: ['south', 'east', 'central', 'southwest'],
    seedRatePerMu: 50,
    seedUnit: '株/亩',
    growthDays: 1095,
    harvestPeriod: '60天',
    fertilizer: {
      base: { name: '有机肥', amount: 2500, unit: '公斤/亩' },
      topDressing: [
        { stage: '萌芽期', name: '氮肥', amount: 15, unit: '公斤/亩' },
        { stage: '果实膨大期', name: '复合肥', amount: 30, unit: '公斤/亩' }
      ]
    },
    waterRequirement: '300-400立方米/亩',
    sowingSeasons: [
      { season: '栽植', months: [2, 3], harvestMonths: [10, 12] }
    ],
    yieldPerMu: 2000,
    yieldUnit: '公斤/亩',
    description: '主要水果，多年生，喜温暖湿润气候'
  },
  {
    id: 'grape',
    name: '葡萄',
    category: '果树作物',
    suitableClimates: ['temperate', 'desert', 'subtropical'],
    suitableRegions: ['northwest', 'north', 'east', 'southwest'],
    seedRatePerMu: 150,
    seedUnit: '株/亩',
    growthDays: 730,
    harvestPeriod: '30天',
    fertilizer: {
      base: { name: '有机肥', amount: 3000, unit: '公斤/亩' },
      topDressing: [
        { stage: '萌芽期', name: '氮肥', amount: 20, unit: '公斤/亩' },
        { stage: '果实膨大期', name: '复合肥', amount: 40, unit: '公斤/亩' }
      ]
    },
    waterRequirement: '250-350立方米/亩',
    sowingSeasons: [
      { season: '栽植', months: [3, 4], harvestMonths: [8, 9] }
    ],
    yieldPerMu: 2000,
    yieldUnit: '公斤/亩',
    description: '重要水果，多年生，喜干燥气候'
  },
  {
    id: 'tea',
    name: '茶叶',
    category: '经济作物',
    suitableClimates: ['subtropical', 'tropical'],
    suitableRegions: ['south', 'east', 'central', 'southwest'],
    seedRatePerMu: 6000,
    seedUnit: '株/亩',
    growthDays: 1095,
    harvestPeriod: '180天',
    fertilizer: {
      base: { name: '有机肥', amount: 2000, unit: '公斤/亩' },
      topDressing: [
        { stage: '春茶前', name: '氮肥', amount: 30, unit: '公斤/亩' },
        { stage: '夏茶前', name: '复合肥', amount: 20, unit: '公斤/亩' }
      ]
    },
    waterRequirement: '300-400立方米/亩',
    sowingSeasons: [
      { season: '栽植', months: [2, 3], harvestMonths: [3, 9] }
    ],
    yieldPerMu: 100,
    yieldUnit: '公斤/亩',
    description: '重要经济作物，喜温暖湿润，喜酸性土壤'
  },
  {
    id: 'sugarcane',
    name: '甘蔗',
    category: '经济作物',
    suitableClimates: ['tropical', 'subtropical'],
    suitableRegions: ['south', 'southwest'],
    seedRatePerMu: 800,
    seedUnit: '公斤/亩',
    growthDays: 300,
    harvestPeriod: '60天',
    fertilizer: {
      base: { name: '有机肥', amount: 2000, unit: '公斤/亩' },
      topDressing: [
        { stage: '分蘖期', name: '氮肥', amount: 30, unit: '公斤/亩' },
        { stage: '伸长期', name: '复合肥', amount: 50, unit: '公斤/亩' }
      ]
    },
    waterRequirement: '500-700立方米/亩',
    sowingSeasons: [
      { season: '春植蔗', months: [2, 3], harvestMonths: [11, 12] }
    ],
    yieldPerMu: 6000,
    yieldUnit: '公斤/亩',
    description: '主要糖料作物，喜高温，需水量大'
  },
  {
    id: 'sweetpotato',
    name: '红薯',
    category: '粮食作物',
    suitableClimates: ['temperate', 'subtropical', 'tropical'],
    suitableRegions: ['east', 'central', 'south', 'southwest', 'north'],
    seedRatePerMu: 30,
    seedUnit: '公斤/亩',
    growthDays: 150,
    harvestPeriod: '30天',
    fertilizer: {
      base: { name: '有机肥', amount: 2000, unit: '公斤/亩' },
      topDressing: [
        { stage: '结薯期', name: '钾肥', amount: 20, unit: '公斤/亩' }
      ]
    },
    waterRequirement: '200-300立方米/亩',
    sowingSeasons: [
      { season: '春红薯', months: [4, 5], harvestMonths: [9, 10] },
      { season: '夏红薯', months: [6, 7], harvestMonths: [10, 11] }
    ],
    yieldPerMu: 2500,
    yieldUnit: '公斤/亩',
    description: '高产杂粮，耐旱耐瘠薄，适应性广'
  },
  {
    id: 'sorghum',
    name: '高粱',
    category: '粮食作物',
    suitableClimates: ['temperate', 'desert'],
    suitableRegions: ['northeast', 'north', 'northwest'],
    seedRatePerMu: 1.5,
    seedUnit: '公斤/亩',
    growthDays: 120,
    harvestPeriod: '15天',
    fertilizer: {
      base: { name: '复合肥', amount: 40, unit: '公斤/亩' },
      topDressing: [
        { stage: '拔节期', name: '尿素', amount: 15, unit: '公斤/亩' }
      ]
    },
    waterRequirement: '200-300立方米/亩',
    sowingSeasons: [
      { season: '春高粱', months: [4, 5], harvestMonths: [8, 9] }
    ],
    yieldPerMu: 400,
    yieldUnit: '公斤/亩',
    description: '耐旱耐涝，适应性强，可做饲料和酿酒'
  },
  {
    id: 'millet',
    name: '谷子',
    category: '粮食作物',
    suitableClimates: ['temperate', 'desert'],
    suitableRegions: ['north', 'northwest', 'northeast'],
    seedRatePerMu: 0.75,
    seedUnit: '公斤/亩',
    growthDays: 110,
    harvestPeriod: '15天',
    fertilizer: {
      base: { name: '有机肥', amount: 1500, unit: '公斤/亩' },
      topDressing: [
        { stage: '拔节期', name: '尿素', amount: 10, unit: '公斤/亩' }
      ]
    },
    waterRequirement: '150-250立方米/亩',
    sowingSeasons: [
      { season: '春谷子', months: [4, 5], harvestMonths: [8, 9] }
    ],
    yieldPerMu: 300,
    yieldUnit: '公斤/亩',
    description: '耐旱耐瘠薄，营养价值高'
  }
]

export const cropCategories = [
  { id: 'all', name: '全部作物' },
  { id: '粮食作物', name: '粮食作物' },
  { id: '经济作物', name: '经济作物' },
  { id: '蔬菜作物', name: '蔬菜作物' },
  { id: '果树作物', name: '果树作物' }
]
