import { useStore } from '@/store/useStore'
import { TableItem } from './TableItem'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

interface HallLayoutProps {
  area: 'hall' | 'box'
  title: string
}

export function HallLayout({ area, title }: HallLayoutProps) {
  const tables = useStore((state) => state.tables.filter(t => t.area === area))
  const updateTableStatus = useStore((state) => state.updateTableStatus)
  const completeMeal = useStore((state) => state.completeMeal)

  const handleTableClick = (tableId: string, status: string) => {
    if (status === 'occupied') {
      completeMeal(tableId)
      setTimeout(() => {
        updateTableStatus(tableId, 'available')
      }, 3000)
    } else if (status === 'cleaning') {
      updateTableStatus(tableId, 'available')
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-80 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
          {tables.map((table) => (
            <TableItem
              key={table.id}
              table={table}
              onClick={() => handleTableClick(table.id, table.status)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
