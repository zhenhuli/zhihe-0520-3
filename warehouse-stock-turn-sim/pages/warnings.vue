<template>
  <div class="container">
    <div class="page-header">
      <h1>⚠️ 临期预警</h1>
      <p>监控货品保质期状态，及时处理临期商品</p>
    </div>

    <div class="grid grid-3">
      <div class="stat-card warning-card">
        <div class="stat-label">紧急预警</div>
        <div class="stat-value" style="color: $danger-color">{{ criticalCount }}</div>
        <div class="stat-change">需要立即处理</div>
      </div>
      <div class="stat-card warning-card">
        <div class="stat-label">临期预警</div>
        <div class="stat-value" style="color: $warning-color">{{ warningCount }}</div>
        <div class="stat-change">需要关注</div>
      </div>
      <div class="stat-card warning-card">
        <div class="stat-label">已过期</div>
        <div class="stat-value" style="color: $danger-color">{{ expiredCount }}</div>
        <div class="stat-change">请尽快清理</div>
      </div>
    </div>

    <div class="card">
      <h2 class="section-title">🚨 紧急预警 - 即将过期或已过期</h2>
      <table>
        <thead>
          <tr>
            <th>货品名称</th>
            <th>批次号</th>
            <th>数量</th>
            <th>保质期至</th>
            <th>剩余天数</th>
            <th>当前货位</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in criticalItems" :key="item.id">
            <td>{{ item.productName }}</td>
            <td>{{ item.batchNo }}</td>
            <td>{{ item.quantity }}</td>
            <td>{{ item.expiryDate }}</td>
            <td>
              <span class="text-danger" v-if="item.daysRemaining <= 0">已过期 {{ Math.abs(item.daysRemaining) }} 天</span>
              <span class="text-danger" v-else>{{ item.daysRemaining }} 天</span>
            </td>
            <td>{{ getLocationCode(item.batchId) }}</td>
            <td>
              <span class="badge badge-danger">紧急</span>
            </td>
            <td>
              <button class="btn btn-danger btn-sm" @click="handleExpired(item)">
                处理
              </button>
            </td>
          </tr>
          <tr v-if="criticalItems.length === 0">
            <td colspan="8" class="text-center">暂无紧急预警</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card">
      <h2 class="section-title">⚠️ 临期预警 - 保质期临近</h2>
      <table>
        <thead>
          <tr>
            <th>货品名称</th>
            <th>批次号</th>
            <th>数量</th>
            <th>保质期至</th>
            <th>剩余天数</th>
            <th>当前货位</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in warningItems" :key="item.id">
            <td>{{ item.productName }}</td>
            <td>{{ item.batchNo }}</td>
            <td>{{ item.quantity }}</td>
            <td>{{ item.expiryDate }}</td>
            <td>
              <span class="text-warning">{{ item.daysRemaining }} 天</span>
            </td>
            <td>{{ getLocationCode(item.batchId) }}</td>
            <td>
              <span class="badge badge-warning">预警</span>
            </td>
            <td>
              <button class="btn btn-warning btn-sm" @click="promoteOutbound(item)">
                优先出库
              </button>
            </td>
          </tr>
          <tr v-if="warningItems.length === 0">
            <td colspan="8" class="text-center">暂无临期预警</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card">
      <h2 class="section-title">📊 预警时间线</h2>
      <div class="timeline">
        <div v-for="item in allWarnings" :key="item.id" class="timeline-item" :class="item.level">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <div class="timeline-header">
              <strong>{{ item.productName }}</strong>
              <span class="badge" :class="item.level === 'critical' ? 'badge-danger' : 'badge-warning'">
                {{ item.level === 'critical' ? '紧急' : '预警' }}
              </span>
            </div>
            <div class="timeline-body">
              批次 {{ item.batchNo }} - {{ item.quantity }} 件，保质期至 {{ item.expiryDate }}
              <span v-if="item.daysRemaining <= 0" class="text-danger">（已过期 {{ Math.abs(item.daysRemaining) }} 天）</span>
              <span v-else>（剩余 {{ item.daysRemaining }} 天）</span>
            </div>
          </div>
        </div>
        <div v-if="allWarnings.length === 0" class="text-center">暂无预警数据</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWarehouseStore } from '~/stores/warehouse'

const warehouseStore = useWarehouseStore()

const allWarnings = computed(() => warehouseStore.warningItems)
const criticalItems = computed(() => allWarnings.value.filter(w => w.level === 'critical'))
const warningItems = computed(() => allWarnings.value.filter(w => w.level === 'warning'))
const criticalCount = computed(() => criticalItems.value.filter(w => w.daysRemaining > 0).length)
const warningCount = computed(() => warningItems.value.length)
const expiredCount = computed(() => criticalItems.value.filter(w => w.daysRemaining <= 0).length)

const getLocationCode = (batchId: string) => {
  const batch = warehouseStore.batches.find(b => b.id === batchId)
  if (!batch || !batch.locationId) return '-'
  const location = warehouseStore.getLocationById(batch.locationId)
  return location?.code || '-'
}

const handleExpired = (item: any) => {
  if (confirm(`确定要处理 ${item.productName} (批次: ${item.batchNo}) 吗？`)) {
    const batch = warehouseStore.batches.find(b => b.id === item.batchId)
    if (batch) {
      batch.status = 'expired'
      if (batch.locationId) {
        const location = warehouseStore.getLocationById(batch.locationId)
        if (location) {
          location.used = 0
        }
      }
      warehouseStore.addLog('warning', `已处理过期货品: ${item.productName} (${item.batchNo})`, { item })
    }
  }
}

const promoteOutbound = (item: any) => {
  warehouseStore.addLog('warning', `已标记 ${item.productName} (${item.batchNo}) 为优先出库`, { item })
  alert(`已标记 ${item.productName} (批次: ${item.batchNo}) 为优先出库`)
}
</script>

<style lang="scss" scoped>
.warning-card {
  border-left: 4px solid $warning-color;
}

.btn-sm {
  padding: 4px 12px;
  font-size: $font-size-xs;
}

.text-center {
  text-align: center;
  color: $text-muted;
  padding: $spacing-lg;
}

.text-danger {
  color: $danger-color;
  font-weight: 500;
}

.text-warning {
  color: $warning-color;
  font-weight: 500;
}

.timeline {
  position: relative;
  padding-left: 30px;

  &::before {
    content: '';
    position: absolute;
    left: 8px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: $border-color;
  }
}

.timeline-item {
  position: relative;
  padding: $spacing-md 0;
  border-bottom: 1px solid $border-color;

  &:last-child {
    border-bottom: none;
  }

  &.critical .timeline-dot {
    background: $danger-color;
  }

  &.warning .timeline-dot {
    background: $warning-color;
  }
}

.timeline-dot {
  position: absolute;
  left: -26px;
  top: 20px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: $primary-color;
  border: 2px solid white;
  box-shadow: 0 0 0 2px $border-color;
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-xs;
}

.timeline-body {
  color: $text-secondary;
  font-size: $font-size-sm;
}
</style>
