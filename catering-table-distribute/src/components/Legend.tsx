import { Card, CardContent } from './ui/card'

export function Legend() {
  const items = [
    { label: '空闲', color: 'bg-green-500 border-green-500 bg-green-100' },
    { label: '用餐中', color: 'bg-red-500 border-red-500 bg-red-100' },
    { label: '已预订', color: 'bg-yellow-500 border-yellow-500 bg-yellow-100' },
    { label: '清洁中', color: 'bg-blue-500 border-blue-500 bg-blue-100' },
  ]

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center justify-center gap-6 flex-wrap">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${item.color.split(' ')[0]}`} />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
