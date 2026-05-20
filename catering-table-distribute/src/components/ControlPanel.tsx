import { useStore } from '@/store/useStore'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Switch } from './ui/switch'
import { Input } from './ui/input'
import { Play, Pause, RotateCcw, FastForward, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { CustomerGroup } from '@/types'

export function ControlPanel() {
  const isRunning = useStore((state) => state.isRunning)
  const simulationSpeed = useStore((state) => state.simulationSpeed)
  const config = useStore((state) => state.config)
  const setIsRunning = useStore((state) => state.setIsRunning)
  const setSimulationSpeed = useStore((state) => state.setSimulationSpeed)
  const setConfig = useStore((state) => state.setConfig)
  const resetSimulation = useStore((state) => state.resetSimulation)
  const addToQueue = useStore((state) => state.addToQueue)
  const elapsedSimulationTime = useStore((state) => state.elapsedSimulationTime)
  const currentTime = useStore((state) => state.currentTime)

  const [manualGroupSize, setManualGroupSize] = useState('')

  const handleAddCustomer = () => {
    const size = parseInt(manualGroupSize) || 2
    const group: CustomerGroup = {
      id: `manual-${Date.now()}`,
      name: `顾客${Math.floor(Math.random() * 1000)}`,
      size,
      arrivedAt: elapsedSimulationTime,
      status: 'waiting',
    }
    addToQueue(group)
    setManualGroupSize('')
  }

  const formatSimulationTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = Math.floor(minutes % 60)
    if (hours > 0) {
      return `${hours}小时${mins}分钟`
    }
    return `${mins}分钟`
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">模拟控制面板</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">模拟运行时间</div>
              <div className="text-2xl font-bold text-primary">{formatSimulationTime(elapsedSimulationTime)}</div>
              <div className="text-xs text-muted-foreground mt-1">当前时间: {formatTime(currentTime)}</div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={isRunning ? 'destructive' : 'default'}
                onClick={() => setIsRunning(!isRunning)}
                className="gap-2"
              >
                {isRunning ? (
                  <><Pause className="w-4 h-4" /> 暂停</>
                ) : (
                  <><Play className="w-4 h-4" /> 开始</>
                )}
              </Button>
              <Button variant="outline" onClick={resetSimulation} className="gap-2">
                <RotateCcw className="w-4 h-4" /> 重置
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">模拟速度</label>
              <div className="flex gap-2">
                {[1, 2, 5, 10].map((speed) => (
                  <Button
                    key={speed}
                    variant={simulationSpeed === speed ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSimulationSpeed(speed)}
                  >
                    <FastForward className="w-3 h-3 mr-1" />
                    {speed}x
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                高峰时段模式
                <Switch
                  checked={config.peakHour}
                  onCheckedChange={(checked) => {
                    setConfig({
                      peakHour: checked,
                      arrivalRate: checked ? 0.8 : 0.3,
                    })
                  }}
                />
              </label>
              <div className="text-sm text-muted-foreground">
                {config.peakHour ? '高客流模式' : '正常客流模式'}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">手动添加顾客</label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="人数"
                value={manualGroupSize}
                onChange={(e) => setManualGroupSize(e.target.value)}
                min="1"
                max="20"
                className="w-24"
              />
              <Button onClick={handleAddCustomer} className="gap-2">
                <UserPlus className="w-4 h-4" />
                添加到队列
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="text-muted-foreground">最小用餐时长</div>
              <Input
                type="number"
                value={config.minMealDuration}
                onChange={(e) => setConfig({ minMealDuration: parseInt(e.target.value) || 30 })}
                min="5"
                max="120"
              />
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">最大用餐时长</div>
              <Input
                type="number"
                value={config.maxMealDuration}
                onChange={(e) => setConfig({ maxMealDuration: parseInt(e.target.value) || 90 })}
                min="30"
                max="240"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
