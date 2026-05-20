import { Table } from '@/types'
import { cn } from '@/lib/utils'

interface TableItemProps {
  table: Table
  onClick?: () => void
  showDetails?: boolean
}

const statusColors = {
  available: 'bg-green-100 border-green-500 text-green-700',
  occupied: 'bg-red-100 border-red-500 text-red-700',
  reserved: 'bg-yellow-100 border-yellow-500 text-yellow-700',
  cleaning: 'bg-blue-100 border-blue-500 text-blue-700',
}

export function TableItem({ table, onClick }: TableItemProps) {
  const getStatusBg = () => {
    switch (table.status) {
      case 'available':
        return 'bg-green-500'
      case 'occupied':
        return 'bg-red-500'
      case 'reserved':
        return 'bg-yellow-500'
      case 'cleaning':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getTypeSize = () => {
    switch (table.type) {
      case 'small':
        return 'w-14 h-14'
      case 'medium':
        return 'w-16 h-16'
      case 'large':
        return 'w-18 h-18'
      case 'vip':
        return 'w-20 h-20'
      default:
        return 'w-14 h-14'
    }
  }

  const getTypeLabel = () => {
    switch (table.type) {
      case 'small':
        return '2人桌'
      case 'medium':
        return '4人桌'
      case 'large':
        return '6人桌'
      case 'vip':
        return `${table.capacity}人包厢`
      default:
        return ''
    }
  }

  return (
    <div
      className={cn(
        'relative rounded-xl border-2 cursor-pointer transition-all duration-300 flex items-center justify-center',
        getTypeSize(),
        statusColors[table.status],
        'hover:scale-105 hover:shadow-lg'
      )}
      onClick={onClick}
      style={{
        position: 'absolute',
        left: `${table.position.x}%`,
        top: `${table.position.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="text-center">
        <div className="font-bold text-xs">{table.name}</div>
        <div className="text-xs opacity-80">{getTypeLabel()}</div>
        {table.currentCustomers && (
          <div className="text-xs font-semibold">
            {table.currentCustomers}/{table.capacity}人
          </div>
        )}
        {!table.currentCustomers && (
          <div className="text-xs opacity-60">{table.capacity}人</div>
        )}
      </div>
      <div
        className={cn(
          'absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white',
          getStatusBg()
        )}
      />
    </div>
  )
}
