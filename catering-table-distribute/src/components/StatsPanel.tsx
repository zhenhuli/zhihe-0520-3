import { useStore } from '@/store/useStore'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Users, UtensilsCrossed, DollarSign, Clock, TrendingUp, Coffee } from 'lucide-react'

export function StatsPanel() {
  const tables = useStore((state) => state.tables)
  const turnoverRecords = useStore((state) => state.turnoverRecords)
  const totalCustomersServed = useStore((state) => state.totalCustomersServed)
  const totalRevenue = useStore((state) => state.totalRevenue)

  const availableTables = tables.filter(t => t.status === 'available').length
  const occupiedTables = tables.filter(t => t.status === 'occupied').length
  const cleaningTables = tables.filter(t => t.status === 'cleaning').length

  const avgTurnoverTime = turnoverRecords.length > 0
    ? turnoverRecords.reduce((sum, r) => sum + r.duration, 0) / turnoverRecords.length
    : 0

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    if (minutes < 60) return `${minutes}分钟`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}小时${mins}分钟`
  }

  const stats = [
    {
      title: '总桌位数',
      value: tables.length,
      icon: UtensilsCrossed,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      title: '空闲桌位',
      value: availableTables,
      icon: Coffee,
      color: 'text-green-600',
      bg: 'bg-green-100',
      badge: <Badge variant="success">{availableTables} 张</Badge>,
    },
    {
      title: '用餐中',
      value: occupiedTables,
      icon: Users,
      color: 'text-red-600',
      bg: 'bg-red-100',
    },
    {
      title: '清洁中',
      value: cleaningTables,
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      title: '已服务顾客',
      value: totalCustomersServed,
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    {
      title: '营业额',
      value: `¥${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
    },
    {
      title: '翻台次数',
      value: turnoverRecords.length,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bg: 'bg-indigo-100',
    },
    {
      title: '平均用餐时长',
      value: avgTurnoverTime > 0 ? formatDuration(avgTurnoverTime) : '-',
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`p-2 rounded-full ${stat.bg}`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            {stat.badge && <div className="mt-2">{stat.badge}</div>}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
