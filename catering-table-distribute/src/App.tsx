import { useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { HallLayout } from '@/components/HallLayout'
import { WaitingQueue } from '@/components/WaitingQueue'
import { StatsPanel } from '@/components/StatsPanel'
import { ControlPanel } from '@/components/ControlPanel'
import { TurnoverStats } from '@/components/TurnoverStats'
import { Legend } from '@/components/Legend'
import { CustomerGroup } from '@/types'
import { UtensilsCrossed } from 'lucide-react'

function App() {
  const isRunning = useStore((state) => state.isRunning)
  const simulationSpeed = useStore((state) => state.simulationSpeed)
  const config = useStore((state) => state.config)
  const elapsedSimulationTime = useStore((state) => state.elapsedSimulationTime)
  const advanceTime = useStore((state) => state.advanceTime)
  const addToQueue = useStore((state) => state.addToQueue)
  const waitingQueue = useStore((state) => state.waitingQueue)
  const assignTable = useStore((state) => state.assignTable)
  const findBestTable = useStore((state) => state.findBestTable)
  const tables = useStore((state) => state.tables)
  const completeMeal = useStore((state) => state.completeMeal)
  const updateTableStatus = useStore((state) => state.updateTableStatus)

  useEffect(() => {
    if (!isRunning) return

    const timeStep = 1
    const interval = setInterval(() => {
      advanceTime(timeStep * simulationSpeed)
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, simulationSpeed, advanceTime])

  useEffect(() => {
    if (!isRunning) return

    if (Math.random() < config.arrivalRate * simulationSpeed * 0.1) {
      const groupSize = Math.floor(
        Math.random() * (config.maxGroupSize - config.minGroupSize + 1)
      ) + config.minGroupSize
      
      const group: CustomerGroup = {
        id: `group-${Date.now()}-${Math.random()}`,
        name: `顾客${Math.floor(Math.random() * 1000)}`,
        size: groupSize,
        arrivedAt: elapsedSimulationTime,
        status: 'waiting',
      }
      addToQueue(group)
    }

    tables.forEach((table) => {
      if (table.status === 'occupied' && table.seatedAt !== undefined && table.estimatedDuration !== undefined) {
        const elapsed = elapsedSimulationTime - table.seatedAt
        if (elapsed >= table.estimatedDuration) {
          completeMeal(table.id)
          setTimeout(() => {
            updateTableStatus(table.id, 'available')
          }, 3000 / simulationSpeed)
        }
      }
    })

    const queueCopy = [...waitingQueue]
    queueCopy.forEach((group) => {
      const bestTable = findBestTable(group.size)
      if (bestTable) {
        assignTable(group.id, bestTable.id)
      }
    })
  }, [isRunning, simulationSpeed, config, elapsedSimulationTime, addToQueue, tables, waitingQueue, assignTable, findBestTable, completeMeal, updateTableStatus])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <UtensilsCrossed className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">餐饮店前厅桌位智能分配模拟系统</h1>
              <p className="text-sm text-muted-foreground">
                实时桌位分配 · 翻台效率分析 · 客流分流模拟
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <StatsPanel />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <ControlPanel />
              <Legend />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <HallLayout area="hall" title="大厅桌位布局" />
                <HallLayout area="box" title="包厢桌位布局" />
              </div>
            </div>
            <div className="space-y-6">
              <WaitingQueue />
              <TurnoverStats />
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>餐饮店前厅桌位智能分配模拟系统 · 基于 React 18 + Vite + Shadcn UI</p>
        </div>
      </footer>
    </div>
  )
}

export default App
