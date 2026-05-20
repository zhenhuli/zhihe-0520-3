import { useStore } from '@/store/useStore'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Users, Clock, CheckCircle } from 'lucide-react'

export function WaitingQueue() {
  const waitingQueue = useStore((state) => state.waitingQueue)
  const assignTable = useStore((state) => state.assignTable)
  const findBestTable = useStore((state) => state.findBestTable)
  const elapsedSimulationTime = useStore((state) => state.elapsedSimulationTime)

  const handleAssign = (groupId: string, groupSize: number) => {
    const table = findBestTable(groupSize)
    if (table) {
      assignTable(groupId, table.id)
    }
  }

  const formatWaitTime = (arrivedAt: number) => {
    const waitMinutes = Math.floor(elapsedSimulationTime - arrivedAt)
    if (waitMinutes < 1) return '刚刚'
    if (waitMinutes < 60) return `${waitMinutes}分钟`
    const hours = Math.floor(waitMinutes / 60)
    const mins = waitMinutes % 60
    return `${hours}小时${mins}分钟`
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">排队等待队列</CardTitle>
        <Badge variant="destructive">{waitingQueue.length} 桌等待</Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {waitingQueue.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
            暂无等待顾客
            </div>
          ) : (
            waitingQueue.map((group) => {
              const suggestedTable = findBestTable(group.size)
              return (
                <div
                  key={group.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{group.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <span>{group.size}人</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatWaitTime(group.arrivedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    disabled={!suggestedTable}
                    onClick={() => handleAssign(group.id, group.size)}
                    className="gap-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {suggestedTable ? `安排${suggestedTable.name}` : '无桌位'}
                  </Button>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
