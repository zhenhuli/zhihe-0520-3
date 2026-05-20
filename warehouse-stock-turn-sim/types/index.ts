export interface Product {
  id: string
  name: string
  sku: string
  category: string
  unit: string
  shelfLifeDays: number
  warningDays: number
  createdAt: string
}

export interface Batch {
  id: string
  productId: string
  batchNo: string
  quantity: number
  receivedDate: string
  expiryDate: string
  locationId: string | null
  status: 'pending' | 'in_stock' | 'out_of_stock' | 'expired'
  inboundOrderId: string
}

export interface Location {
  id: string
  code: string
  zone: 'A' | 'B' | 'C' | 'D'
  row: number
  column: number
  level: number
  capacity: number
  used: number
  type: 'normal' | 'cold' | 'dangerous'
}

export interface InboundOrder {
  id: string
  orderNo: string
  supplier: string
  createdAt: string
  status: 'draft' | 'confirmed' | 'completed'
  items: InboundOrderItem[]
}

export interface InboundOrderItem {
  productId: string
  productName: string
  quantity: number
  batchNo: string
  receivedDate: string
  expiryDate: string
}

export interface OutboundOrder {
  id: string
  orderNo: string
  customer: string
  createdAt: string
  status: 'draft' | 'confirmed' | 'completed'
  items: OutboundOrderItem[]
}

export interface OutboundOrderItem {
  productId: string
  productName: string
  quantity: number
  allocatedBatches: AllocatedBatch[]
}

export interface AllocatedBatch {
  batchId: string
  batchNo: string
  quantity: number
}

export interface OutboundRule {
  id: string
  name: string
  priority: number
  type: 'fifo' | 'feo' | 'lifo' | 'custom'
  enabled: boolean
  description: string
}

export interface WarningItem {
  id: string
  batchId: string
  productName: string
  batchNo: string
  expiryDate: string
  daysRemaining: number
  quantity: number
  level: 'normal' | 'warning' | 'critical'
}

export interface SimulationLog {
  id: string
  timestamp: string
  type: 'inbound' | 'outbound' | 'move' | 'warning'
  message: string
  details: Record<string, any>
}

export interface Statistics {
  totalProducts: number
  totalBatches: number
  totalLocations: number
  usedLocations: number
  turnoverRate: number
  averageStorageDays: number
  warningItems: number
  criticalItems: number
  spaceUtilization: number
}
