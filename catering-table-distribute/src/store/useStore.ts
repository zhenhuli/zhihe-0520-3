import { create } from 'zustand'
import { Table, CustomerGroup, TurnoverRecord, SimulationConfig, TableStatus } from '@/types'
import { initialTables } from '@/data/tables'

interface StoreState {
  tables: Table[]
  waitingQueue: CustomerGroup[]
  turnoverRecords: TurnoverRecord[]
  currentTime: number
  simulationStartTime: number
  elapsedSimulationTime: number
  isRunning: boolean
  simulationSpeed: number
  config: SimulationConfig
  totalCustomersServed: number
  totalRevenue: number
  
  setTables: (tables: Table[]) => void
  updateTableStatus: (tableId: string, status: TableStatus) => void
  addToQueue: (group: CustomerGroup) => void
  removeFromQueue: (groupId: string) => void
  assignTable: (groupId: string, tableId: string) => void
  completeMeal: (tableId: string) => void
  addTurnoverRecord: (record: TurnoverRecord) => void
  advanceTime: (minutes: number) => void
  setIsRunning: (running: boolean) => void
  setSimulationSpeed: (speed: number) => void
  setConfig: (config: Partial<SimulationConfig>) => void
  resetSimulation: () => void
  findBestTable: (groupSize: number) => Table | null
}

export const useStore = create<StoreState>((set, get) => ({
  tables: initialTables,
  waitingQueue: [],
  turnoverRecords: [],
  currentTime: Date.now(),
  simulationStartTime: Date.now(),
  elapsedSimulationTime: 0,
  isRunning: false,
  simulationSpeed: 1,
  config: {
    peakHour: false,
    arrivalRate: 0.3,
    minGroupSize: 1,
    maxGroupSize: 8,
    minMealDuration: 30,
    maxMealDuration: 90,
  },
  totalCustomersServed: 0,
  totalRevenue: 0,

  setTables: (tables) => set({ tables }),
  
  updateTableStatus: (tableId, status) => set((state) => ({
    tables: state.tables.map(t => t.id === tableId ? { ...t, status } : t)
  })),
  
  addToQueue: (group) => set((state) => ({
    waitingQueue: [...state.waitingQueue, { ...group, arrivedAt: state.elapsedSimulationTime }]
  })),
  
  removeFromQueue: (groupId) => set((state) => ({
    waitingQueue: state.waitingQueue.filter(g => g.id !== groupId)
  })),
  
  assignTable: (groupId, tableId) => set((state) => {
    const group = state.waitingQueue.find(g => g.id === groupId)
    if (!group) return state
    
    const mealDuration = state.config.minMealDuration + 
      Math.random() * (state.config.maxMealDuration - state.config.minMealDuration)
    
    return {
      tables: state.tables.map(t => 
        t.id === tableId 
          ? { 
              ...t, 
              status: 'occupied' as TableStatus, 
              currentCustomers: group.size,
              seatedAt: state.elapsedSimulationTime,
              estimatedDuration: mealDuration
            } 
          : t
      ),
      waitingQueue: state.waitingQueue.filter(g => g.id !== groupId)
    }
  }),
  
  completeMeal: (tableId) => set((state) => {
    const table = state.tables.find(t => t.id === tableId)
    if (!table || !table.seatedAt || !table.currentCustomers) return state
    
    const duration = state.elapsedSimulationTime - table.seatedAt
    const revenue = table.currentCustomers * 80
    
    const record: TurnoverRecord = {
      tableId: table.id,
      tableName: table.name,
      customers: table.currentCustomers,
      seatedAt: table.seatedAt,
      leftAt: state.elapsedSimulationTime,
      duration: duration * 60 * 1000
    }
    
    return {
      tables: state.tables.map(t => 
        t.id === tableId 
          ? { ...t, status: 'cleaning' as TableStatus, currentCustomers: undefined, seatedAt: undefined, estimatedDuration: undefined } 
          : t
      ),
      turnoverRecords: [...state.turnoverRecords, record],
      totalCustomersServed: state.totalCustomersServed + table.currentCustomers,
      totalRevenue: state.totalRevenue + revenue
    }
  }),
  
  addTurnoverRecord: (record) => set((state) => ({
    turnoverRecords: [...state.turnoverRecords, record]
  })),
  
  advanceTime: (minutes) => set((state) => {
    const newElapsedTime = state.elapsedSimulationTime + minutes
    return {
      elapsedSimulationTime: newElapsedTime,
      currentTime: state.simulationStartTime + newElapsedTime * 60 * 1000
    }
  }),
  
  setIsRunning: (running) => set({ isRunning: running }),
  
  setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),
  
  setConfig: (config) => set((state) => ({
    config: { ...state.config, ...config }
  })),
  
  resetSimulation: () => set({
    tables: initialTables.map(t => ({ ...t, status: 'available' as TableStatus, currentCustomers: undefined, seatedAt: undefined, estimatedDuration: undefined })),
    waitingQueue: [],
    turnoverRecords: [],
    currentTime: Date.now(),
    simulationStartTime: Date.now(),
    elapsedSimulationTime: 0,
    isRunning: false,
    totalCustomersServed: 0,
    totalRevenue: 0
  }),
  
  findBestTable: (groupSize) => {
    const { tables } = get()
    const availableTables = tables.filter(t => t.status === 'available')
    
    const suitableTables = availableTables.filter(t => t.capacity >= groupSize)
    
    if (suitableTables.length === 0) return null
    
    suitableTables.sort((a, b) => {
      const aDiff = a.capacity - groupSize
      const bDiff = b.capacity - groupSize
      if (aDiff !== bDiff) return aDiff - bDiff
      return a.capacity - b.capacity
    })
    
    return suitableTables[0]
  }
}))
