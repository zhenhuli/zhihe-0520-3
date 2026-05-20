export type TableType = 'small' | 'medium' | 'large' | 'vip'
export type TableArea = 'hall' | 'box'
export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning'

export interface Table {
  id: string
  name: string
  type: TableType
  area: TableArea
  capacity: number
  status: TableStatus
  position: { x: number; y: number }
  currentCustomers?: number
  seatedAt?: number
  estimatedDuration?: number
}

export interface CustomerGroup {
  id: string
  name: string
  size: number
  arrivedAt: number
  assignedTableId?: string
  status: 'waiting' | 'seated' | 'completed'
  waitTime?: number
}

export interface TurnoverRecord {
  tableId: string
  tableName: string
  customers: number
  seatedAt: number
  leftAt: number
  duration: number
}

export interface SimulationConfig {
  peakHour: boolean
  arrivalRate: number
  minGroupSize: number
  maxGroupSize: number
  minMealDuration: number
  maxMealDuration: number
}
