export function calculateSeedAmount(crop, area) {
  const seedAmount = crop.seedRatePerMu * area
  return {
    amount: seedAmount.toFixed(2),
    unit: crop.seedUnit.includes('株') ? '株' : '公斤',
    perMu: crop.seedRatePerMu,
    perMuUnit: crop.seedUnit
  }
}

export function calculateFertilizer(crop, area) {
  const baseFertilizer = {
    name: crop.fertilizer.base.name,
    amount: (crop.fertilizer.base.amount * area).toFixed(2),
    unit: crop.fertilizer.base.unit.includes('公斤') ? '公斤' : crop.fertilizer.base.unit,
    perMu: crop.fertilizer.base.amount,
    perMuUnit: crop.fertilizer.base.unit
  }

  const topDressing = crop.fertilizer.topDressing.map(item => ({
    stage: item.stage,
    name: item.name,
    amount: (item.amount * area).toFixed(2),
    unit: item.unit.includes('公斤') ? '公斤' : item.unit,
    perMu: item.amount,
    perMuUnit: item.unit
  }))

  return {
    base: baseFertilizer,
    topDressing
  }
}

export function calculateWaterRequirement(crop, area) {
  const waterMatch = crop.waterRequirement.match(/(\d+)-(\d+)/)
  if (waterMatch) {
    const min = parseInt(waterMatch[1]) * area
    const max = parseInt(waterMatch[2]) * area
    return `${min.toFixed(0)}-${max.toFixed(0)} 立方米`
  }
  return crop.waterRequirement
}

export function calculateYield(crop, area) {
  return {
    amount: (crop.yieldPerMu * area).toFixed(2),
    unit: '公斤',
    perMu: crop.yieldPerMu,
    perMuUnit: crop.yieldUnit
  }
}

export function getSuitableCrops(regionId, climateId, cropsData) {
  return cropsData.filter(crop => {
    const regionMatch = crop.suitableRegions.includes(regionId)
    const climateMatch = crop.suitableClimates.includes(climateId)
    return regionMatch && climateMatch
  })
}

export function generateYearlyPlan(selectedCrops, area) {
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  
  const plan = months.map(month => ({
    month,
    sowings: [],
    harvests: [],
    fieldManagement: []
  }))

  selectedCrops.forEach(crop => {
    crop.sowingSeasons.forEach(season => {
      season.months.forEach(month => {
        const monthIndex = month - 1
        if (plan[monthIndex]) {
          plan[monthIndex].sowings.push({
            crop: crop.name,
            season: season.season,
            area: (area / selectedCrops.length).toFixed(1)
          })
        }
      })

      season.harvestMonths.forEach(month => {
        const monthIndex = month - 1
        if (plan[monthIndex]) {
          plan[monthIndex].harvests.push({
            crop: crop.name,
            season: season.season,
            area: (area / selectedCrops.length).toFixed(1)
          })
        }
      })

      crop.fertilizer.topDressing.forEach(dressing => {
        const sowingStart = Math.min(...season.months)
        const stages = {
          '分蘖期': 1,
          '拔节期': 2,
          '抽穗期': 3,
          '返青期': 3,
          '大喇叭口期': 2,
          '初花期': 1,
          '开花期': 1,
          '结荚期': 2,
          '蕾期': 1,
          '花铃期': 2,
          '苔期': 2,
          '花期': 3,
          '发棵期': 1,
          '坐果期': 1,
          '盛果期': 2,
          '初瓜期': 1,
          '盛瓜期': 2,
          '初果期': 1,
          '莲座期': 1,
          '结球期': 2,
          '萌芽期': 0,
          '果实膨大期': 2,
          '春茶前': 0,
          '夏茶前': 3,
          '伸长期': 2,
          '结薯期': 2
        }
        const offset = stages[dressing.stage] || 1
        const manageMonth = sowingStart + offset
        if (manageMonth <= 12 && plan[manageMonth - 1]) {
          plan[manageMonth - 1].fieldManagement.push({
            crop: crop.name,
            type: `追施${dressing.name}`,
            amount: dressing.amount,
            unit: dressing.unit
          })
        }
      })
    })
  })

  return plan
}

export function getMonthNumber(monthName) {
  const monthMap = {
    '1月': 1, '2月': 2, '3月': 3, '4月': 4, '5月': 5, '6月': 6,
    '7月': 7, '8月': 8, '9月': 9, '10月': 10, '11月': 11, '12月': 12
  }
  return monthMap[monthName] || 0
}
