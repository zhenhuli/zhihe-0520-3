import type { Shot, CrewRole, ProductionConfig, CalculationResult } from '~/types'

export function useCalculator() {
  const complexityMultiplier = {
    easy: 1,
    medium: 1.5,
    hard: 2,
  }

  function calculateResult(
    shots: Shot[],
    crew: CrewRole[],
    config: ProductionConfig
  ): CalculationResult {
    const totalShots = shots.length

    const totalShotMinutes = shots.reduce((sum, shot) => {
      return sum + shot.shotDuration * shot.cameraCount * complexityMultiplier[shot.complexity]
    }, 0)

    const totalSetupMinutes = shots.reduce((sum, shot) => {
      return sum + shot.setupTime * complexityMultiplier[shot.complexity]
    }, 0)

    const totalWorkMinutes = totalShotMinutes + totalSetupMinutes
    const totalWorkHours = totalWorkMinutes / 60

    const dailyWorkHours = Math.min(config.workingHoursPerDay, totalWorkHours)
    const shootingDays = Math.ceil(totalWorkHours / config.workingHoursPerDay)
    const shootingWeeks = shootingDays / config.daysPerWeek

    const crewCount = crew.reduce((sum, role) => sum + role.count, 0)
    const dailyCost = crew.reduce((sum, role) => sum + role.count * role.dailyRate, 0)
    const totalCost = dailyCost * shootingDays
    const totalCrewCost = totalCost

    return {
      totalShots,
      totalShotMinutes,
      totalSetupMinutes,
      totalWorkMinutes,
      totalWorkHours,
      dailyWorkHours,
      shootingDays,
      shootingWeeks,
      crewCount,
      totalCrewCost,
      dailyCost,
      totalCost,
    }
  }

  function formatMinutes(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return `${hours}小时${mins}分钟`
  }

  function formatCurrency(amount: number): string {
    return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return {
    calculateResult,
    formatMinutes,
    formatCurrency,
    complexityMultiplier,
  }
}
