<template>
  <div class="container">
    <div class="page-header">
      <h1>⚙️ 出库规则</h1>
      <p>配置货品出库优先级规则，优化库存周转</p>
    </div>

    <div class="card">
      <h2 class="section-title">📋 出库策略说明</h2>
      <div class="rules-intro">
        <div class="intro-item">
          <span class="intro-icon">🔄</span>
          <div>
            <strong>FIFO (先进先出)</strong>
            <p>优先出库最早入库的批次，适合大多数商品，确保库存新鲜度</p>
          </div>
        </div>
        <div class="intro-item">
          <span class="intro-icon">⏰</span>
          <div>
            <strong>FEO (先到期先出)</strong>
            <p>优先出库保质期最早到期的批次，适合易腐商品，减少过期损失</p>
          </div>
        </div>
        <div class="intro-item">
          <span class="intro-icon">📦</span>
          <div>
            <strong>LIFO (后进先出)</strong>
            <p>优先出库最近入库的批次，适合特定场景，如大宗商品</p>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2 class="section-title">🎛️ 规则配置</h2>
      <div class="rules-list">
        <div v-for="rule in rules" :key="rule.id" class="rule-card">
          <div class="rule-header">
            <div class="rule-info">
              <h3>{{ rule.name }}</h3>
              <p>{{ rule.description }}</p>
            </div>
            <div class="rule-toggle">
              <label class="switch">
                <input type="checkbox" v-model="rule.enabled" @change="toggleRule(rule.id, rule.enabled)" />
                <span class="slider"></span>
              </label>
            </div>
          </div>
          <div class="rule-meta">
            <span class="badge badge-secondary">优先级: {{ rule.priority }}</span>
            <span class="badge" :class="rule.type === 'fifo' ? 'badge-info' : rule.type === 'feo' ? 'badge-success' : 'badge-warning'">
              {{ rule.type.toUpperCase() }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2 class="section-title">🔬 规则效果模拟</h2>
      <div class="simulation-section">
        <div class="grid grid-2">
          <div class="form-group">
            <label>选择测试货品</label>
            <select v-model="selectedProductId">
              <option value="">请选择货品</option>
              <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>出库数量</label>
            <input type="number" v-model.number="testQuantity" placeholder="输入出库数量" />
          </div>
        </div>

        <button class="btn btn-primary" @click="runSimulation" :disabled="!selectedProductId || testQuantity <= 0">
          运行模拟
        </button>

        <div v-if="simulationResult" class="simulation-result">
          <h4>模拟结果</h4>
          <table>
            <thead>
              <tr>
                <th>出库策略</th>
                <th>分配批次</th>
                <th>数量</th>
                <th>保质期至</th>
                <th>剩余天数</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(allocation, index) in simulationResult" :key="index">
                <td>{{ allocation.ruleName }}</td>
                <td>{{ allocation.batchNo }}</td>
                <td>{{ allocation.quantity }}</td>
                <td>{{ allocation.expiryDate }}</td>
                <td>
                  <span :class="allocation.daysRemaining <= 7 ? 'text-warning' : ''">
                    {{ allocation.daysRemaining }} 天
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="card">
      <h2 class="section-title">📊 出库规则统计</h2>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-icon">✅</div>
          <div>
            <div class="stat-number">{{ enabledRulesCount }}</div>
            <div class="stat-label">已启用规则</div>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon">🔄</div>
          <div>
            <div class="stat-number">{{ fifoEnabled ? '已启用' : '未启用' }}</div>
            <div class="stat-label">FIFO 先进先出</div>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon">⏰</div>
          <div>
            <div class="stat-number">{{ feoEnabled ? '已启用' : '未启用' }}</div>
            <div class="stat-label">FEO 先到期先出</div>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon">📦</div>
          <div>
            <div class="stat-number">{{ lifoEnabled ? '已启用' : '未启用' }}</div>
            <div class="stat-label">LIFO 后进先出</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWarehouseStore } from '~/stores/warehouse'

const warehouseStore = useWarehouseStore()

const selectedProductId = ref('')
const testQuantity = ref(0)
const simulationResult = ref<any[] | null>(null)

const rules = computed(() => warehouseStore.outboundRules)
const products = computed(() => warehouseStore.products)
const batches = computed(() => warehouseStore.batches)

const enabledRulesCount = computed(() => rules.value.filter(r => r.enabled).length)
const fifoEnabled = computed(() => rules.value.find(r => r.type === 'fifo')?.enabled)
const feoEnabled = computed(() => rules.value.find(r => r.type === 'feo')?.enabled)
const lifoEnabled = computed(() => rules.value.find(r => r.type === 'lifo')?.enabled)

const toggleRule = (ruleId: string, enabled: boolean) => {
  warehouseStore.updateOutboundRule(ruleId, enabled)
}

const runSimulation = () => {
  if (!selectedProductId.value || testQuantity.value <= 0) return

  const productBatches = batches.value
    .filter(b => b.productId === selectedProductId.value && b.status === 'in_stock')

  const results: any[] = []

  rules.value.forEach(rule => {
    let sortedBatches = [...productBatches]

    if (rule.type === 'fifo') {
      sortedBatches.sort((a, b) => new Date(a.receivedDate).getTime() - new Date(b.receivedDate).getTime())
    } else if (rule.type === 'lifo') {
      sortedBatches.sort((a, b) => new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime())
    } else {
      sortedBatches.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
    }

    let remaining = testQuantity.value
    for (const batch of sortedBatches) {
      if (remaining <= 0) break
      const allocateQty = Math.min(remaining, batch.quantity)

      const expiryDate = new Date(batch.expiryDate)
      const today = new Date()
      const daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      results.push({
        ruleName: rule.name,
        batchNo: batch.batchNo,
        quantity: allocateQty,
        expiryDate: batch.expiryDate,
        daysRemaining
      })

      remaining -= allocateQty
    }
  })

  simulationResult.value = results
}
</script>

<style lang="scss" scoped>
.rules-intro {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-md;
}

.intro-item {
  display: flex;
  gap: $spacing-md;
  padding: $spacing-md;
  background: $bg-tertiary;
  border-radius: $border-radius;

  .intro-icon {
    font-size: 32px;
    flex-shrink: 0;
  }

  h3 {
    font-size: $font-size-base;
    margin-bottom: $spacing-xs;
  }

  p {
    font-size: $font-size-sm;
    color: $text-secondary;
    line-height: 1.5;
  }
}

.rule-card {
  background: $bg-tertiary;
  border-radius: $border-radius;
  padding: $spacing-lg;
  margin-bottom: $spacing-md;

  &:last-child {
    margin-bottom: 0;
  }
}

.rule-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: $spacing-md;
}

.rule-info {
  flex: 1;

  h3 {
    font-size: $font-size-lg;
    margin-bottom: $spacing-xs;
  }

  p {
    font-size: $font-size-sm;
    color: $text-secondary;
  }
}

.rule-meta {
  display: flex;
  gap: $spacing-sm;
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: $border-color;
    transition: .4s;
    border-radius: 26px;

    &:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }
  }

  input:checked + .slider {
    background-color: $primary-color;
  }

  input:checked + .slider:before {
    transform: translateX(24px);
  }
}

.simulation-section {
  .form-group {
    margin-bottom: $spacing-md;
  }

  button {
    margin-bottom: $spacing-lg;
  }
}

.simulation-result {
  margin-top: $spacing-lg;

  h4 {
    font-size: $font-size-base;
    margin-bottom: $spacing-md;
    font-weight: 600;
  }
}

.text-warning {
  color: $warning-color;
  font-weight: 500;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-md;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  background: $bg-tertiary;
  border-radius: $border-radius;

  .stat-icon {
    font-size: 32px;
  }

  .stat-number {
    font-size: $font-size-xl;
    font-weight: 700;
    color: $text-primary;
  }

  .stat-label {
    font-size: $font-size-sm;
    color: $text-secondary;
  }
}
</style>
