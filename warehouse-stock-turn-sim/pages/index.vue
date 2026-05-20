<template>
  <div class="container">
    <div class="page-header">
      <h1>📊 数据概览</h1>
      <p>实时监控仓库运营状况与关键指标</p>
    </div>

    <div class="grid grid-4">
      <div class="stat-card">
        <div class="stat-label">货品总数</div>
        <div class="stat-value">{{ stats.totalProducts }}</div>
        <div class="stat-change up">↑ 2 新增</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">库存批次</div>
        <div class="stat-value">{{ stats.totalBatches }}</div>
        <div class="stat-change up">↑ 12 在库</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">空间利用率</div>
        <div class="stat-value">{{ stats.spaceUtilization }}%</div>
        <div class="stat-change" :class="stats.spaceUtilization > 70 ? 'up' : 'down'">
          {{ stats.spaceUtilization > 70 ? '偏高' : '正常' }}
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">平均周转天数</div>
        <div class="stat-value">{{ stats.averageStorageDays }}</div>
        <div class="stat-change down">↓ 优化中</div>
      </div>
    </div>

    <div class="grid grid-3" style="margin-top: $spacing-lg">
      <div class="stat-card">
        <div class="stat-label">已使用货位</div>
        <div class="stat-value">{{ stats.usedLocations }} / {{ stats.totalLocations }}</div>
        <div class="stat-change">货位使用率 {{ Math.round(stats.usedLocations / stats.totalLocations * 100) }}%</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">临期预警</div>
        <div class="stat-value" style="color: $warning-color">{{ stats.warningItems }}</div>
        <div class="stat-change" style="color: $warning-color">需要关注</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">过期风险</div>
        <div class="stat-value" style="color: $danger-color">{{ stats.criticalItems }}</div>
        <div class="stat-change" style="color: $danger-color">紧急处理</div>
      </div>
    </div>

    <div class="grid grid-2" style="margin-top: $spacing-lg">
      <div class="card">
        <h2 class="section-title">⚠️ 最新临期预警</h2>
        <table>
          <thead>
            <tr>
              <th>货品</th>
              <th>批次</th>
              <th>剩余天数</th>
              <th>数量</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in recentWarnings" :key="item.id">
              <td>{{ item.productName }}</td>
              <td>{{ item.batchNo }}</td>
              <td>
                <span v-if="item.daysRemaining <= 0" style="color: $danger-color">已过期</span>
                <span v-else>{{ item.daysRemaining }} 天</span>
              </td>
              <td>{{ item.quantity }}</td>
              <td>
                <span class="badge" :class="item.level === 'critical' ? 'badge-danger' : 'badge-warning'">
                  {{ item.level === 'critical' ? '紧急' : '预警' }}
                </span>
              </td>
            </tr>
            <tr v-if="recentWarnings.length === 0">
              <td colspan="5" class="text-center">暂无预警</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <h2 class="section-title">📋 最近操作日志</h2>
        <div class="log-list">
          <div v-for="log in recentLogs" :key="log.id" class="log-item">
            <span class="log-time">{{ formatTime(log.timestamp) }}</span>
            <span class="log-type" :class="`log-${log.type}`">{{ getTypeLabel(log.type) }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
          <div v-if="recentLogs.length === 0" class="text-center">暂无日志</div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2 class="section-title">📈 仓储空间分布</h2>
      <div class="zone-grid">
        <div v-for="zone in ['A', 'B', 'C', 'D']" :key="zone" class="zone-card">
          <h3>{{ zone }} 区</h3>
          <div class="zone-stats">
            <div class="zone-stat">
              <span class="label">货位数</span>
              <span class="value">{{ getZoneLocations(zone).length }}</span>
            </div>
            <div class="zone-stat">
              <span class="label">已使用</span>
              <span class="value">{{ getZoneUsed(zone) }}</span>
            </div>
            <div class="zone-stat">
              <span class="label">利用率</span>
              <span class="value">{{ getZoneUtilization(zone) }}%</span>
            </div>
          </div>
          <div class="zone-bar">
            <div class="zone-bar-fill" :style="{ width: getZoneUtilization(zone) + '%' }"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWarehouseStore } from '~/stores/warehouse'

const warehouseStore = useWarehouseStore()

const stats = computed(() => warehouseStore.statistics)
const recentWarnings = computed(() => warehouseStore.warningItems.slice(0, 5))
const recentLogs = computed(() => warehouseStore.simulationLogs.slice(0, 10))

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

const getZoneLocations = (zone: string) => {
  return warehouseStore.locations.filter(l => l.zone === zone)
}

const getZoneUsed = (zone: string) => {
  return getZoneLocations(zone).filter(l => l.used > 0).length
}

const getZoneUtilization = (zone: string) => {
  const locs = getZoneLocations(zone)
  const total = locs.reduce((sum, l) => sum + l.capacity, 0)
  const used = locs.reduce((sum, l) => sum + l.used, 0)
  return total > 0 ? Math.round((used / total) * 100) : 0
}
</script>

<style lang="scss" scoped>
.log-list {
  max-height: 300px;
  overflow-y: auto;
}

.log-item {
  display: flex;
  align-items: center;
  padding: $spacing-sm 0;
  border-bottom: 1px solid $border-color;
  font-size: $font-size-sm;
  gap: $spacing-sm;

  &:last-child {
    border-bottom: none;
  }
}

.log-time {
  color: $text-muted;
  font-family: monospace;
  flex-shrink: 0;
}

.log-type {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: $font-size-xs;
  font-weight: 500;
  flex-shrink: 0;

  &.log-inbound {
    background: rgba(16, 185, 129, 0.1);
    color: $success-color;
  }

  &.log-outbound {
    background: rgba(59, 130, 246, 0.1);
    color: $primary-color;
  }

  &.log-move {
    background: rgba(245, 158, 11, 0.1);
    color: $warning-color;
  }

  &.log-warning {
    background: rgba(100, 116, 139, 0.1);
    color: $secondary-color;
  }
}

.log-message {
  color: $text-primary;
  flex: 1;
}

.zone-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-md;
}

.zone-card {
  background: $bg-tertiary;
  border-radius: $border-radius;
  padding: $spacing-md;

  h3 {
    font-size: $font-size-xl;
    margin-bottom: $spacing-md;
    color: $primary-color;
  }
}

.zone-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: $spacing-md;
}

.zone-stat {
  text-align: center;

  .label {
    display: block;
    font-size: $font-size-xs;
    color: $text-secondary;
    margin-bottom: $spacing-xs;
  }

  .value {
    font-size: $font-size-lg;
    font-weight: 600;
    color: $text-primary;
  }
}

.zone-bar {
  height: 8px;
  background: $border-color;
  border-radius: 4px;
  overflow: hidden;

  &-fill {
    height: 100%;
    background: $primary-color;
    border-radius: 4px;
    transition: width $transition-base;
  }
}

.text-center {
  text-align: center;
  color: $text-muted;
  padding: $spacing-lg;
}
</style>
