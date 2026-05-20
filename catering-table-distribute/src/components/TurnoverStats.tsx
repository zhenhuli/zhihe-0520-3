import { useStore } from '@/store/useStore'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Clock, TrendingUp, BarChart3 } from 'lucide-react'

export function TurnoverStats() {
  const turnoverRecords = useStore((state) => state.turnoverRecords)
  const tables = useStore((state) => state.tables)

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    return `${minutes}分钟`
  }

  const tableTurnoverCount = tables.map(table => {
    const count = turnoverRecords.filter(r => r.tableId === table.id).length
    const totalTime = turnoverRecords
      .filter(r => r.tableId === table.id)
      .reduce((sum, r) => sum + r.duration, 0)
    const avgTime = count > 0 ? totalTime / count : 0
    return { ...table, count, avgTime }
  }).sort((a, b) => b.count - a.count)

  const avgTurnoverTime = turnoverRecords.length > 0
    ? turnoverRecords.reduce((sum, r) => sum + r.duration, 0) / turnoverRecords.length
    : 0

  const totalTurnoverTime = turnoverRecords.reduce((sum, r) => sum + r.duration, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          翻台效率统计
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">{turnoverRecords.length}</div>
            <div className="text-sm text-muted-foreground">总翻台次数</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">
              {avgTurnoverTime > 0 ? formatDuration(avgTurnoverTime) : '-'}
            </div>
            <div className="text-sm text-muted-foreground">平均用餐时长</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">
              {totalTurnoverTime > 0 ? formatDuration(totalTurnoverTime) : '-'}
            </div>
            <div className="text-sm text-muted-foreground">累计服务时长</div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            各桌位翻台排名
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {tableTurnoverCount.map((table, index) => (
              <div
                key={table.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-orange-400 text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </span>
                  <div>
                    <div className="font-medium">{table.name}</div>
                    <div className="text-xs text-muted-foreground">{table.capacity}人桌</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary">{table.count} 次</div>
                  {table.avgTime > 0 && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" />
                      平均 {formatDuration(table.avgTime)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
