import { defineStore } from 'pinia'
import type {
  Product,
  Batch,
  Location,
  InboundOrder,
  OutboundOrder,
  OutboundRule,
  WarningItem,
  SimulationLog,
  Statistics,
  InboundOrderItem,
  OutboundOrderItem
} from '~/types'

const generateId = () => Math.random().toString(36).substring(2, 11)

const today = new Date()
const addDays = (date: Date, days: number) => {
  const newDate = new Date(date)
  newDate.setDate(newDate.getDate() + days)
  return newDate.toISOString().split('T')[0]
}

export const useWarehouseStore = defineStore('warehouse', {
  state: () => ({
    products: [] as Product[],
    batches: [] as Batch[],
    locations: [] as Location[],
    inboundOrders: [] as InboundOrder[],
    outboundOrders: [] as OutboundOrder[],
    outboundRules: [] as OutboundRule[],
    simulationLogs: [] as SimulationLog[],
    isSimulating: false,
    simulationSpeed: 1000
  }),

  getters: {
    warningItems: (state): WarningItem[] => {
      const warnings: WarningItem[] = []
      const today = new Date()

      state.batches.forEach(batch => {
        if (batch.status !== 'in_stock') return

        const product = state.products.find(p => p.id === batch.productId)
        if (!product) return

        const expiryDate = new Date(batch.expiryDate)
        const daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        let level: 'normal' | 'warning' | 'critical' = 'normal'
        if (daysRemaining <= 0) {
          level = 'critical'
        } else if (daysRemaining <= product.warningDays) {
          level = daysRemaining <= product.warningDays / 2 ? 'critical' : 'warning'
        }

        if (level !== 'normal') {
          warnings.push({
            id: generateId(),
            batchId: batch.id,
            productName: product.name,
            batchNo: batch.batchNo,
            expiryDate: batch.expiryDate,
            daysRemaining,
            quantity: batch.quantity,
            level
          })
        }
      })

      return warnings.sort((a, b) => a.daysRemaining - b.daysRemaining)
    },

    statistics: (state): Statistics => {
      const totalLocations = state.locations.length
      const usedLocations = state.locations.filter(l => l.used > 0).length
      const totalCapacity = state.locations.reduce((sum, l) => sum + l.capacity, 0)
      const totalUsed = state.locations.reduce((sum, l) => sum + l.used, 0)

      const inStockBatches = state.batches.filter(b => b.status === 'in_stock')
      let totalStorageDays = 0
      inStockBatches.forEach(batch => {
        const receivedDate = new Date(batch.receivedDate)
        const days = Math.ceil((today.getTime() - receivedDate.getTime()) / (1000 * 60 * 60 * 24))
        totalStorageDays += days
      })

      const warnings = state.warningItems

      return {
        totalProducts: state.products.length,
        totalBatches: inStockBatches.length,
        totalLocations,
        usedLocations,
        turnoverRate: totalCapacity > 0 ? Math.round((totalUsed / totalCapacity) * 100) : 0,
        averageStorageDays: inStockBatches.length > 0 ? Math.round(totalStorageDays / inStockBatches.length) : 0,
        warningItems: warnings.filter(w => w.level === 'warning').length,
        criticalItems: warnings.filter(w => w.level === 'critical').length,
        spaceUtilization: totalCapacity > 0 ? Math.round((totalUsed / totalCapacity) * 100) : 0
      }
    },

    getProductById: (state) => (id: string) => {
      return state.products.find(p => p.id === id)
    },

    getLocationById: (state) => (id: string) => {
      return state.locations.find(l => l.id === id)
    },

    getBatchesByProductId: (state) => (productId: string) => {
      return state.batches.filter(b => b.productId === productId && b.status === 'in_stock')
    },

    getAvailableLocations: (state) => (quantity: number) => {
      return state.locations.filter(l => l.capacity - l.used >= quantity)
    }
  },

  actions: {
    initMockData() {
      this.products = [
        { id: 'p1', name: '牛奶', sku: 'DAIRY001', category: '乳制品', unit: '箱', shelfLifeDays: 30, warningDays: 7, createdAt: addDays(today, -90) },
        { id: 'p2', name: '酸奶', sku: 'DAIRY002', category: '乳制品', unit: '箱', shelfLifeDays: 21, warningDays: 5, createdAt: addDays(today, -90) },
        { id: 'p3', name: '面包', sku: 'BAKERY001', category: '烘焙', unit: '箱', shelfLifeDays: 7, warningDays: 2, createdAt: addDays(today, -60) },
        { id: 'p4', name: '饼干', sku: 'SNACK001', category: '零食', unit: '箱', shelfLifeDays: 180, warningDays: 30, createdAt: addDays(today, -120) },
        { id: 'p5', name: '矿泉水', sku: 'BEV001', category: '饮料', unit: '箱', shelfLifeDays: 365, warningDays: 60, createdAt: addDays(today, -150) },
        { id: 'p6', name: '方便面', sku: 'FOOD001', category: '食品', unit: '箱', shelfLifeDays: 180, warningDays: 30, createdAt: addDays(today, -100) }
      ]

      this.locations = []
      const zones: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D']
      zones.forEach(zone => {
        for (let row = 1; row <= 3; row++) {
          for (let col = 1; col <= 4; col++) {
            for (let level = 1; level <= 3; level++) {
              this.locations.push({
                id: `loc-${zone}-${row}-${col}-${level}`,
                code: `${zone}${row}-${col}-${level}`,
                zone,
                row,
                column: col,
                level,
                capacity: 100,
                used: 0,
                type: zone === 'A' ? 'cold' : 'normal'
              })
            }
          }
        }
      })

      this.outboundRules = [
        { id: 'r1', name: '先进先出 (FIFO)', priority: 1, type: 'fifo', enabled: true, description: '优先出库最早入库的批次' },
        { id: 'r2', name: '先到期先出 (FEO)', priority: 2, type: 'feo', enabled: true, description: '优先出库保质期最早到期的批次' },
        { id: 'r3', name: '后进先出 (LIFO)', priority: 3, type: 'lifo', enabled: false, description: '优先出库最近入库的批次' }
      ]

      const inboundOrders: InboundOrder[] = [
        {
          id: 'in1',
          orderNo: 'IN20260501001',
          supplier: '蒙牛乳业',
          createdAt: addDays(today, -25),
          status: 'completed',
          items: [
            { productId: 'p1', productName: '牛奶', quantity: 80, batchNo: 'MN2026050101', receivedDate: addDays(today, -25), expiryDate: addDays(today, 5) },
            { productId: 'p2', productName: '酸奶', quantity: 60, batchNo: 'MN2026050102', receivedDate: addDays(today, -25), expiryDate: addDays(today, -4) }
          ]
        },
        {
          id: 'in2',
          orderNo: 'IN20260510002',
          supplier: '伊利集团',
          createdAt: addDays(today, -15),
          status: 'completed',
          items: [
            { productId: 'p1', productName: '牛奶', quantity: 100, batchNo: 'YL2026051001', receivedDate: addDays(today, -15), expiryDate: addDays(today, 15) },
            { productId: 'p2', productName: '酸奶', quantity: 80, batchNo: 'YL2026051002', receivedDate: addDays(today, -15), expiryDate: addDays(today, 6) }
          ]
        },
        {
          id: 'in3',
          orderNo: 'IN20260515003',
          supplier: '桃李面包',
          createdAt: addDays(today, -5),
          status: 'completed',
          items: [
            { productId: 'p3', productName: '面包', quantity: 50, batchNo: 'TL2026051501', receivedDate: addDays(today, -5), expiryDate: addDays(today, 2) }
          ]
        },
        {
          id: 'in4',
          orderNo: 'IN20260518004',
          supplier: '康师傅',
          createdAt: addDays(today, -2),
          status: 'completed',
          items: [
            { productId: 'p4', productName: '饼干', quantity: 120, batchNo: 'KSF2026051801', receivedDate: addDays(today, -2), expiryDate: addDays(today, 178) },
            { productId: 'p6', productName: '方便面', quantity: 200, batchNo: 'KSF2026051802', receivedDate: addDays(today, -2), expiryDate: addDays(today, 178) }
          ]
        },
        {
          id: 'in5',
          orderNo: 'IN20260520005',
          supplier: '农夫山泉',
          createdAt: addDays(today, 0),
          status: 'confirmed',
          items: [
            { productId: 'p5', productName: '矿泉水', quantity: 300, batchNo: 'NFSQ2026052001', receivedDate: addDays(today, 0), expiryDate: addDays(today, 365) }
          ]
        }
      ]

      this.inboundOrders = inboundOrders

      inboundOrders.forEach(order => {
        if (order.status === 'completed') {
          order.items.forEach((item, index) => {
            const locationIndex = (parseInt(order.id.replace('in', '')) - 1) * 2 + index
            if (locationIndex < this.locations.length) {
              const location = this.locations[locationIndex]
              const batch: Batch = {
                id: `batch-${order.id}-${index}`,
                productId: item.productId,
                batchNo: item.batchNo,
                quantity: item.quantity,
                receivedDate: item.receivedDate,
                expiryDate: item.expiryDate,
                locationId: location.id,
                status: 'in_stock',
                inboundOrderId: order.id
              }
              this.batches.push(batch)
              location.used = item.quantity
            }
          })
        }
      })

      this.outboundOrders = [
        {
          id: 'out1',
          orderNo: 'OUT20260515001',
          customer: '沃尔玛超市',
          createdAt: addDays(today, -10),
          status: 'completed',
          items: [
            { productId: 'p1', productName: '牛奶', quantity: 30, allocatedBatches: [{ batchId: 'batch-in1-0', batchNo: 'MN2026050101', quantity: 30 }] }
          ]
        },
        {
          id: 'out2',
          orderNo: 'OUT20260518002',
          customer: '家乐福',
          createdAt: addDays(today, -7),
          status: 'completed',
          items: [
            { productId: 'p1', productName: '牛奶', quantity: 50, allocatedBatches: [{ batchId: 'batch-in1-0', batchNo: 'MN2026050101', quantity: 50 }] }
          ]
        }
      ]

      this.outboundOrders.forEach(order => {
        if (order.status === 'completed') {
          order.items.forEach(item => {
            item.allocatedBatches.forEach(allocated => {
              const batch = this.batches.find(b => b.id === allocated.batchId)
              if (batch) {
                batch.quantity -= allocated.quantity
                if (batch.quantity <= 0) {
                  batch.status = 'out_of_stock'
                  const location = this.locations.find(l => l.id === batch.locationId)
                  if (location) {
                    location.used = 0
                  }
                }
              }
            })
          })
        }
      })

      this.batches.find(b => b.id === 'batch-in1-1')!.status = 'expired'

      this.addLog('warning', '系统初始化完成，已加载模拟数据', {})
    },

    addLog(type: SimulationLog['type'], message: string, details: Record<string, any>) {
      this.simulationLogs.unshift({
        id: generateId(),
        timestamp: new Date().toISOString(),
        type,
        message,
        details
      })
      if (this.simulationLogs.length > 100) {
        this.simulationLogs.pop()
      }
    },

    addProduct(product: Omit<Product, 'id' | 'createdAt'>) {
      const newProduct: Product = {
        ...product,
        id: generateId(),
        createdAt: new Date().toISOString().split('T')[0]
      }
      this.products.push(newProduct)
      this.addLog('inbound', `新增货品: ${product.name}`, { product: newProduct })
      return newProduct
    },

    createInboundOrder(order: Omit<InboundOrder, 'id' | 'createdAt' | 'status'>) {
      const newOrder: InboundOrder = {
        ...order,
        id: generateId(),
        createdAt: new Date().toISOString().split('T')[0],
        status: 'draft'
      }
      this.inboundOrders.push(newOrder)
      this.addLog('inbound', `创建入库单: ${order.orderNo}`, { order: newOrder })
      return newOrder
    },

    confirmInboundOrder(orderId: string) {
      const order = this.inboundOrders.find(o => o.id === orderId)
      if (!order) return

      order.status = 'confirmed'
      this.addLog('inbound', `确认入库单: ${order.orderNo}`, { orderId })
    },

    completeInboundOrder(orderId: string) {
      const order = this.inboundOrders.find(o => o.id === orderId)
      if (!order) return

      order.status = 'completed'

      order.items.forEach((item, index) => {
        const availableLocations = this.getAvailableLocations(item.quantity)
        const location = availableLocations[0]

        if (location) {
          const batch: Batch = {
            id: generateId(),
            productId: item.productId,
            batchNo: item.batchNo,
            quantity: item.quantity,
            receivedDate: item.receivedDate,
            expiryDate: item.expiryDate,
            locationId: location.id,
            status: 'in_stock',
            inboundOrderId: order.id
          }
          this.batches.push(batch)
          location.used += item.quantity

          this.addLog('inbound', `批次 ${item.batchNo} 入库完成，货位: ${location.code}`, {
            batch,
            location
          })
        }
      })

      this.addLog('inbound', `入库单完成: ${order.orderNo}`, { orderId })
    },

    createOutboundOrder(order: Omit<OutboundOrder, 'id' | 'createdAt' | 'status'>) {
      const newOrder: OutboundOrder = {
        ...order,
        id: generateId(),
        createdAt: new Date().toISOString().split('T')[0],
        status: 'draft'
      }
      this.outboundOrders.push(newOrder)
      this.addLog('outbound', `创建出库单: ${order.orderNo}`, { order: newOrder })
      return newOrder
    },

    allocateOutboundOrder(orderId: string) {
      const order = this.outboundOrders.find(o => o.id === orderId)
      if (!order) return

      const activeRule = this.outboundRules.find(r => r.enabled && r.type === 'feo') ||
                         this.outboundRules.find(r => r.enabled)

      order.items.forEach(item => {
        const productBatches = this.getBatchesByProductId(item.productId)
          .filter(b => b.status === 'in_stock')
          .sort((a, b) => {
            if (activeRule?.type === 'fifo') {
              return new Date(a.receivedDate).getTime() - new Date(b.receivedDate).getTime()
            } else if (activeRule?.type === 'lifo') {
              return new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime()
            } else {
              return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
            }
          })

        let remaining = item.quantity
        item.allocatedBatches = []

        for (const batch of productBatches) {
          if (remaining <= 0) break
          const allocateQty = Math.min(remaining, batch.quantity)
          item.allocatedBatches.push({
            batchId: batch.id,
            batchNo: batch.batchNo,
            quantity: allocateQty
          })
          remaining -= allocateQty
        }
      })

      this.addLog('outbound', `出库单分配完成: ${order.orderNo}`, { orderId })
    },

    completeOutboundOrder(orderId: string) {
      const order = this.outboundOrders.find(o => o.id === orderId)
      if (!order) return

      order.status = 'completed'

      order.items.forEach(item => {
        item.allocatedBatches.forEach(allocated => {
          const batch = this.batches.find(b => b.id === allocated.batchId)
          if (batch) {
            batch.quantity -= allocated.quantity
            if (batch.quantity <= 0) {
              batch.status = 'out_of_stock'
              const location = this.locations.find(l => l.id === batch.locationId)
              if (location) {
                location.used = 0
              }
            }
          }
        })
      })

      this.addLog('outbound', `出库单完成: ${order.orderNo}`, { orderId })
    },

    optimizeLocations() {
      const highTurnoverProducts = new Set<string>()
      const productInboundCount = new Map<string, number>()

      this.batches.forEach(batch => {
        if (batch.status === 'in_stock') {
          const count = productInboundCount.get(batch.productId) || 0
          productInboundCount.set(batch.productId, count + 1)
        }
      })

      const sortedProducts = Array.from(productInboundCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)

      sortedProducts.forEach(([productId]) => highTurnoverProducts.add(productId))

      const zoneALocations = this.locations.filter(l => l.zone === 'A')
      const otherLocations = this.locations.filter(l => l.zone !== 'A')

      let moveCount = 0

      this.batches.forEach(batch => {
        if (batch.status !== 'in_stock' || !batch.locationId) return

        const isHighTurnover = highTurnoverProducts.has(batch.productId)
        const currentLocation = this.locations.find(l => l.id === batch.locationId)

        if (!currentLocation) return

        if (isHighTurnover && currentLocation.zone !== 'A') {
          const availableZoneA = zoneALocations.find(l => l.capacity - l.used >= batch.quantity)
          if (availableZoneA) {
            currentLocation.used -= batch.quantity
            batch.locationId = availableZoneA.id
            availableZoneA.used += batch.quantity
            moveCount++
            this.addLog('move', `货位优化: 移动批次 ${batch.batchNo} 到 ${availableZoneA.code}`, {
              batchId: batch.id,
              from: currentLocation.code,
              to: availableZoneA.code
            })
          }
        } else if (!isHighTurnover && currentLocation.zone === 'A') {
          const availableOther = otherLocations.find(l => l.capacity - l.used >= batch.quantity)
          if (availableOther) {
            currentLocation.used -= batch.quantity
            batch.locationId = availableOther.id
            availableOther.used += batch.quantity
            moveCount++
            this.addLog('move', `货位优化: 移动批次 ${batch.batchNo} 到 ${availableOther.code}`, {
              batchId: batch.id,
              from: currentLocation.code,
              to: availableOther.code
            })
          }
        }
      })

      this.addLog('move', `货位优化完成，共移动 ${moveCount} 个批次`, { moveCount })
      return moveCount
    },

    updateOutboundRule(ruleId: string, enabled: boolean) {
      const rule = this.outboundRules.find(r => r.id === ruleId)
      if (rule) {
        rule.enabled = enabled
        this.addLog('warning', `出库规则 ${rule.name} 已${enabled ? '启用' : '禁用'}`, { ruleId, enabled })
      }
    },

    async runSimulation() {
      if (this.isSimulating) return
      this.isSimulating = true

      this.addLog('warning', '开始模拟出入库流程...', {})

      const simulateStep = () => {
        if (!this.isSimulating) return

        const random = Math.random()

        if (random < 0.3) {
          const pendingOrders = this.inboundOrders.filter(o => o.status === 'confirmed')
          if (pendingOrders.length > 0) {
            const order = pendingOrders[Math.floor(Math.random() * pendingOrders.length)]
            this.completeInboundOrder(order.id)
          }
        } else if (random < 0.6) {
          const draftOrders = this.outboundOrders.filter(o => o.status === 'draft')
          if (draftOrders.length > 0) {
            const order = draftOrders[Math.floor(Math.random() * draftOrders.length)]
            this.allocateOutboundOrder(order.id)
            order.status = 'confirmed'
          }
        } else if (random < 0.8) {
          const confirmedOrders = this.outboundOrders.filter(o => o.status === 'confirmed')
          if (confirmedOrders.length > 0) {
            const order = confirmedOrders[Math.floor(Math.random() * confirmedOrders.length)]
            this.completeOutboundOrder(order.id)
          }
        } else {
          this.optimizeLocations()
        }

        const warnings = this.warningItems
        if (warnings.length > 0) {
          this.addLog('warning', `当前有 ${warnings.length} 个临期预警`, { warningCount: warnings.length })
        }

        setTimeout(simulateStep, this.simulationSpeed)
      }

      simulateStep()
    },

    stopSimulation() {
      this.isSimulating = false
      this.addLog('warning', '模拟已停止', {})
    }
  }
})
