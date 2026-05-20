<template>
  <div class="container">
    <div class="page-header flex flex-between">
      <div>
        <h1>🎮 模拟控制</h1>
        <p>模拟仓库出入库流程，优化仓储运营效率</p>
      </div>
      <div class="flex flex-gap-sm">
        <button v-if="!isSimulating" class="btn btn-success" @click="startSimulation">
          ▶️ 开始模拟
        </button>
        <button v-else class="btn btn-danger" @click="stopSimulation">
          ⏹️ 停止模拟
        </button>
      </div>
    </div>

    <div class="grid grid-2">
      <div class="card">
        <h2 class="section-title">🎯 模拟状态</h2>
        <div class="simulation-status">
          <div class="status-indicator" :class="{ 'active': isSimulating }">
            <div class="status-dot"></div>
            <span>{{ isSimulating ? '模拟运行中' : '模拟已停止' }}</span>
          </div>
          <div class="stats-mini">
            <div class="stat-mini">
              <span class="label">已处理入库</span>
              <span class="value">{{ inboundCount }}</span>
            </div>
            <div class="stat-mini">
              <span class="label">已处理出库</span>
              <span class="value">{{ outboundCount }}</span>
            </div>
            <div class="stat-mini">
              <span class="label">货位优化</span>
              <span class="value">{{ optimizationCount }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <h2 class="section-title">⚡ 模拟速度</h2>
        <div class="speed-control">
          <input type="range" v-model.number="simulationSpeed" min="200" max="3000" step="100" />
          <div class="speed-labels">
            <span>快</span>
            <span>{{ simulationSpeed }}ms</span>
            <span>慢</span>
          </div>
        </div>
        <p class="speed-desc">调整模拟运行速度，数值越小速度越快</p>
      </div>
    </div>

    <div class="card">
      <h2 class="section-title">📊 实时统计</h2>
      <div class="grid grid-4">
        <div class="stat-card">
          <div class="stat-label">货品总数</div>
          <div class="stat-value">{{ stats.totalProducts }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">在库批次</div>
          <div class="stat-value">{{ stats.totalBatches }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">空间利用率</div>
          <div class="stat-value">{{ stats.spaceUtilization }}%</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">临期预警</div>
          <div class="stat-value" :style="{ color: warningCount > 0 ? '$danger-color' : '$success-color' }">
            {{ warningCount }}
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-2">
      <div class="card">
        <h2 class="section-title">📋 模拟操作日志</h2>
        <div class="log-container">
          <div v-for="log in recentLogs" :key="log.id" class="log-entry" :class="`log-${log.type}`">
            <div class="log-header">
              <span class="log-time">{{ formatTime(log.timestamp) }}</span>
              <span class="log-type">{{ getTypeLabel(log.type) }}</span>
            </div>
            <div class="log-message">{{ log.message }}</div>
          </div>
          <div v-if="recentLogs.length === 0" class="text-center">暂无日志</div>
        </div>
      </div>

      <div class="card">
        <h2 class="section-title">🛠️ 快捷操作</h2>
        <div class="quick-actions">
          <button class="action-btn" @click="generateRandomInbound">
            <span class="action-icon">📥</span>
            <span>生成入库单</span>
          </button>
          <button class="action-btn" @click="generateRandomOutbound">
            <span class="action-icon">📤</span>
            <span>生成出库单</span>
          </button>
          <button class="action-btn" @click="runOptimization">
            <span class="action-icon">🔄</span>
            <span>执行货位优化</span>
          </button>
          <button class="action-btn" @click="clearExpired">
            <span class="action-icon">🗑️</span>
            <span>清理过期货品</span>
          </button>
          <button class="action-btn" @click="resetData">
            <span class="action-icon">🔃</span>
            <span>重置模拟数据</span>
          </button>
        </div>

        <h3 class="section-title" style="margin-top: $spacing-lg;">📈 周转效率趋势</h3>
        <div class="trend-chart">
          <div class="trend-item" v-for="i in 7" :key="i">
            <div class="trend-bar" :style="{ height: getRandomHeight() + '%' }"></div>
            <div class="trend-label">Day {{ 8 - i }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2 class="section-title">📦 库存周转分析</h2>
      <div class="analysis-grid">
        <div class="analysis-card">
          <div class="analysis-icon">🚀</div>
          <div>
            <h4>快速周转品</h4>
            <p>平均库存天数 ≤ 7天</p>
            <div class="analysis-count">{{ fastMovingCount }} 个货品</div>
          </div>
        </div>
        <div class="analysis-card">
          <div class="analysis-icon">🐢</div>
          <div>
            <h4>慢速周转品</h4>
            <p>平均库存天数 > 30天</p>
            <div class="analysis-count">{{ slowMovingCount }} 个货品</div>
          </div>
        </div>
        <div class="analysis-card">
          <div class="analysis-icon">⚠️</div>
          <div>
            <h4>滞销风险</h4>
            <p>库存 > 90天未动销</p>
            <div class="analysis-count">{{ stagnantCount }} 个货品</div>
          </div>
        </div>
        <div class="analysis-card">
          <div class="analysis-icon">💎</div>
          <div>
            <h4>高价值品</h4>
            <p>需要重点管控</p>
            <div class="analysis-count">{{ highValueCount }} 个货品</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWarehouseStore } from '~/stores/warehouse'
import { watch } from 'vue'

const warehouseStore = useWarehouseStore()

const inboundCount = ref(0)
const outboundCount = ref(0)
const optimizationCount = ref(0)

const isSimulating = computed(() => warehouseStore.isSimulating)
const simulationSpeed = computed({
  get: () => warehouseStore.simulationSpeed,
  set: (val) => { warehouseStore.simulationSpeed = val }
})

const stats = computed(() => warehouseStore.statistics)
const warningCount = computed(() => warehouseStore.warningItems.length)
const recentLogs = computed(() => warehouseStore.simulationLogs.slice(0, 20))

const fastMovingCount = computed(() => Math.floor(Math.random() * 3) + 1)
const slowMovingCount = computed(() => Math.floor(Math.random() * 2) + 1)
const stagnantCount = computed(() => Math.floor(Math.random() * 2))
const highValueCount = computed(() => Math.floor(Math.random() * 3) + 2)

watch(() => warehouseStore.simulationLogs, (newLogs, oldLogs) => {
  if (newLogs.length > (oldLogs?.length || 0)) {
    const latestLog = newLogs[0]
    if (latestLog.type === 'inbound') inboundCount.value++
    else if (latestLog.type === 'outbound') outboundCount.value++
    else if (latestLog.type === 'move') optimizationCount.value++
  }
}, { deep: true })

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    inbound: '入库',
    outbound: '出库',
    move: '移动',
    warning: '系统'
  }
  return labels[type] || type
}

const getRandomHeight = () => {
  return Math.floor(Math.random() * 60) + 40
}

const startSimulation = () => {
  warehouseStore.runSimulation()
}

const stopSimulation = () => {
  warehouseStore.stopSimulation()
}

const generateRandomInbound = () => {
  const suppliers = ['蒙牛乳业', '伊利集团', '桃李面包', '康师傅', '农夫山泉', '统一企业']
  const orderNo = `IN${Date.now().toString().slice(-8)}`
  const supplier = suppliers[Math.floor(Math.random() * suppliers.length)]

  const items = warehouseStore.products
    .filter(() => Math.random() > 0.5)
    .slice(0, 3)
    .map(product => ({
      productId: product.id,
      productName: product.name,
      quantity: Math.floor(Math.random() * 100) + 20,
      batchNo: `${supplier.slice(0, 2)}${Date.now().toString().slice(-6)}`,
      receivedDate: new Date().toISOString().split('T')[0],
      expiryDate: (() => {
        const date = new Date()
        date.setDate(date.getDate() + Math.floor(Math.random() * product.shelfLifeDays) + 10)
        return date.toISOString().split('T')[0]
      })()
    }))

  if (items.length > 0) {
    const order = warehouseStore.createInboundOrder({ orderNo, supplier, items })
    warehouseStore.confirmInboundOrder(order.id)
    alert(`已生成入库单: ${orderNo}`)
  }
}

const generateRandomOutbound = () => {
  const customers = ['沃尔玛超市', '家乐福', '永辉超市', '大润发', '华润万家']
  const orderNo = `OUT${Date.now().toString().slice(-8)}`
  const customer = customers[Math.floor(Math.random() * customers.length)]

  const inStockProducts = warehouseStore.batches
    .filter(b => b.status === 'in_stock')
    .map(b => b.productId)

  const uniqueProducts = [...new Set(inStockProducts)]

  const items = uniqueProducts
    .filter(() => Math.random() > 0.5)
    .slice(0, 3)
    .map(productId => {
      const product = warehouseStore.getProductById(productId)
      const totalStock = warehouseStore.getBatchesByProductId(productId).reduce((sum, b) => sum + b.quantity, 0)
      return {
        productId,
        productName: product?.name || '',
        quantity: Math.min(Math.floor(Math.random() * 50) + 10, totalStock),
        allocatedBatches: []
      }
    })
    .filter(item => item.quantity > 0)

  if (items.length > 0) {
    const order = warehouseStore.createOutboundOrder({ orderNo, customer, items })
    warehouseStore.allocateOutboundOrder(order.id)
    order.status = 'confirmed'
    alert(`已生成出库单: ${orderNo}`)
  } else {
    alert('没有可出库的库存')
  }
}

const runOptimization = () => {
  const count = warehouseStore.optimizeLocations()
  alert(`货位优化完成，移动了 ${count} 个批次`)
}

const clearExpired = () => {
  let count = 0
  warehouseStore.batches.forEach(batch => {
    if (batch.status === 'in_stock') {
      const expiryDate = new Date(batch.expiryDate)
      const today = new Date()
      if (expiryDate < today) {
        batch.status = 'expired'
        if (batch.locationId) {
          const location = warehouseStore.getLocationById(batch.locationId)
          if (location) location.used = 0
        }
        count++
      }
    }
  })
  alert(`清理了 ${count} 个已过期批次`)
}

const resetData = () => {
  if (confirm('确定要重置所有模拟数据吗？')) {
    warehouseStore.initMockData()
    inboundCount.value = 0
    outboundCount.value = 0
    optimizationCount.value = 0
    alert('数据已重置')
  }
}
</script>

<style lang="scss" scoped>
.simulation-status {
  .status-indicator {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    margin-bottom: $spacing-lg;
    padding: $spacing-md;
    background: $bg-tertiary;
    border-radius: $border-radius;

    &.active {
      background: rgba(16, 185, 129, 0.1);
      color: $success-color;
    }
  }

  .status-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: $secondary-color;

    .active & {
      background: $success-color;
      animation: pulse 2s infinite;
    }
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.stats-mini {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-md;
}

.stat-mini {
  text-align: center;

  .label {
    display: block;
    font-size: $font-size-xs;
    color: $text-secondary;
    margin-bottom: $spacing-xs;
  }

  .value {
    font-size: $font-size-xl;
    font-weight: 700;
    color: $primary-color;
  }
}

.speed-control {
  input[type="range"] {
    width: 100%;
    margin-bottom: $spacing-sm;
  }

  .speed-labels {
    display: flex;
    justify-content: space-between;
    font-size: $font-size-sm;
    color: $text-secondary;
  }

  .speed-desc {
    margin-top: $spacing-sm;
    font-size: $font-size-sm;
    color: $text-muted;
  }
}

.log-container {
  max-height: 400px;
  overflow-y: auto;
}

.log-entry {
  padding: $spacing-sm;
  border-bottom: 1px solid $border-color;
  border-radius: $border-radius;
  margin-bottom: $spacing-xs;

  &.log-inbound {
    background: rgba(16, 185, 129, 0.05);
    border-left: 3px solid $success-color;
  }

  &.log-outbound {
    background: rgba(59, 130, 246, 0.05);
    border-left: 3px solid $primary-color;
  }

  &.log-move {
    background: rgba(245, 158, 11, 0.05);
    border-left: 3px solid $warning-color;
  }

  &.log-warning {
    background: rgba(100, 116, 139, 0.05);
    border-left: 3px solid $secondary-color;
  }
}

.log-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
}

.log-time {
  font-size: $font-size-xs;
  color: $text-muted;
  font-family: monospace;
}

.log-type {
  font-size: $font-size-xs;
  padding: 1px 6px;
  border-radius: 4px;
  background: $bg-tertiary;
  color: $text-secondary;
}

.log-message {
  font-size: $font-size-sm;
  color: $text-primary;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-sm;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-md;
  background: $bg-tertiary;
  border: none;
  border-radius: $border-radius;
  cursor: pointer;
  transition: all $transition-fast;
  text-align: left;

  &:hover {
    background: $border-color;
    transform: translateY(-2px);
  }

  .action-icon {
    font-size: 24px;
  }
}

.trend-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 150px;
  padding: $spacing-md 0;
}

.trend-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;
}

.trend-bar {
  width: 24px;
  background: linear-gradient(to top, $primary-color, lighten($primary-color, 20%));
  border-radius: 4px 4px 0 0;
  transition: height $transition-base;
}

.trend-label {
  font-size: $font-size-xs;
  color: $text-muted;
}

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-md;
}

.analysis-card {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-lg;
  background: $bg-tertiary;
  border-radius: $border-radius-lg;

  .analysis-icon {
    font-size: 36px;
  }

  h4 {
    font-size: $font-size-base;
    margin-bottom: 2px;
  }

  p {
    font-size: $font-size-xs;
    color: $text-secondary;
    margin-bottom: $spacing-xs;
  }

  .analysis-count {
    font-size: $font-size-xl;
    font-weight: 700;
    color: $primary-color;
  }
}

.text-center {
  text-align: center;
  color: $text-muted;
  padding: $spacing-lg;
}

h3.section-title {
  font-size: $font-size-base;
}
</style>
