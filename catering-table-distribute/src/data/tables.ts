import { Table } from '@/types'

export const initialTables: Table[] = [
  { id: 'h1', name: '大厅1号', type: 'small', area: 'hall', capacity: 2, status: 'available', position: { x: 10, y: 15 } },
  { id: 'h2', name: '大厅2号', type: 'small', area: 'hall', capacity: 2, status: 'available', position: { x: 30, y: 15 } },
  { id: 'h3', name: '大厅3号', type: 'small', area: 'hall', capacity: 2, status: 'available', position: { x: 50, y: 15 } },
  { id: 'h4', name: '大厅4号', type: 'small', area: 'hall', capacity: 2, status: 'available', position: { x: 70, y: 15 } },
  { id: 'h5', name: '大厅5号', type: 'small', area: 'hall', capacity: 2, status: 'available', position: { x: 90, y: 15 } },
  
  { id: 'h6', name: '大厅6号', type: 'medium', area: 'hall', capacity: 4, status: 'available', position: { x: 10, y: 45 } },
  { id: 'h7', name: '大厅7号', type: 'medium', area: 'hall', capacity: 4, status: 'available', position: { x: 30, y: 45 } },
  { id: 'h8', name: '大厅8号', type: 'medium', area: 'hall', capacity: 4, status: 'available', position: { x: 50, y: 45 } },
  { id: 'h9', name: '大厅9号', type: 'medium', area: 'hall', capacity: 4, status: 'available', position: { x: 70, y: 45 } },
  { id: 'h10', name: '大厅10号', type: 'medium', area: 'hall', capacity: 4, status: 'available', position: { x: 90, y: 45 } },
  
  { id: 'h11', name: '大厅11号', type: 'large', area: 'hall', capacity: 6, status: 'available', position: { x: 20, y: 75 } },
  { id: 'h12', name: '大厅12号', type: 'large', area: 'hall', capacity: 6, status: 'available', position: { x: 50, y: 75 } },
  { id: 'h13', name: '大厅13号', type: 'large', area: 'hall', capacity: 6, status: 'available', position: { x: 80, y: 75 } },
  
  { id: 'b1', name: '包厢1号', type: 'vip', area: 'box', capacity: 8, status: 'available', position: { x: 15, y: 15 } },
  { id: 'b2', name: '包厢2号', type: 'vip', area: 'box', capacity: 10, status: 'available', position: { x: 50, y: 15 } },
  { id: 'b3', name: '包厢3号', type: 'vip', area: 'box', capacity: 12, status: 'available', position: { x: 85, y: 15 } },
  
  { id: 'b4', name: '包厢4号', type: 'vip', area: 'box', capacity: 15, status: 'available', position: { x: 30, y: 55 } },
  { id: 'b5', name: '包厢5号', type: 'vip', area: 'box', capacity: 20, status: 'available', position: { x: 70, y: 55 } },
]
