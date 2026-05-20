export interface CrewRole {
  id: string
  name: string
  count: number
  dailyRate: number
}

export interface Shot {
  id: string
  sceneNumber: string
  shotNumber: string
  description: string
  shotDuration: number
  cameraCount: number
  setupTime: number
  complexity: 'easy' | 'medium' | 'hard'
}

export interface ProductionConfig {
  workingHoursPerDay: number
  daysPerWeek: number
  overtimeRate: number
}

export interface CalculationResult {
  totalShots: number
  totalShotMinutes: number
  totalSetupMinutes: number
  totalWorkMinutes: number
  totalWorkHours: number
  dailyWorkHours: number
  shootingDays: number
  shootingWeeks: number
  crewCount: number
  totalCrewCost: number
  dailyCost: number
  totalCost: number
}

export interface ExportData {
  projectInfo: {
    name: string
    director: string
    date: string
  }
  shots: Shot[]
  crew: CrewRole[]
  config: ProductionConfig
  result: CalculationResult
}
