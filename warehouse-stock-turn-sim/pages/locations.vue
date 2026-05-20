<template>
  <div class="container">
    <div class="page-header flex flex-between">
      <div>
        <h1>🗺️ 货位管理</h1>
        <p>管理仓储货位布局与货品摆放优化</p>
      </div>
      <button class="btn btn-primary" @click="optimizeLocations">
        🔄 一键优化货位
      </button>
    </div>

    <div class="grid grid-4">
      <div class="stat-card" v-for="zone in ['A', 'B', 'C', 'D']" :key="zone">
        <div class="stat-label">{{ zone }} 区</div>
        <div class="stat-value">{{ getZoneUsed(zone) }} / {{ getZoneTotal(zone) }}</div>
        <div class="stat-change">利用率 {{ getZoneUtilization(zone) }}%</div>
      </div>
    </div>

    <div class="card">
      <h2 class="section-title">📍 货位布局图</h2>
      <div class="warehouse-layout">
        <div v-for="zone in ['A', 'B', 'C', 'D']" :key="zone" class="zone-section">
          <div class="zone-header">
            <h3>{{ zone }} 区</h3>
            <span class="zone-type">{{ zone === 'A' ? '冷藏区' : '常温区' }}</span>
          </div>
          <div class="zone-grid">
            <div
              v-for="location in getZoneLocations(zone)"
              :key="location.id"
              class="location-cell"
              :class="{
                'occupied': location.used > 0,
                'high-usage': location.used / location.capacity > 0.8
              }"
              @click="showLocationDetail(location)"
            >
              <div class="location-code">{{ location.code }}</div>
              <div class="location-usage">{{ location.used }}/{{ location.capacity }}</div>
              <div v-if="location.used > 0" class="location-product">
                {{ getLocationProduct(location.id) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2 class="section-title">📊 货位使用详情</h2>
      <table>
        <thead>
          <tr>
            <th>货位编码</th>
            <th>区域</th>
            <th>类型</th>
            <th>容量</th>
            <th>已用</th>
            <th>使用率</th>
            <th>存放货品</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="location in locations" :key="location.id">
            <td>{{ location.code }}</td>
            <td>{{ location.zone }} 区</td>
            <td>
              <span class="badge" :class="location.type === 'cold' ? 'badge-info' : 'badge-secondary'">
                {{ location.type === 'cold' ? '冷藏' : '常温' }}
              </span>
            </td>
            <td>{{ location.capacity }}</td>
            <td>{{ location.used }}</td>
            <td>
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: (location.used / location.capacity * 100) + '%' }"
                  :class="{
                    'bg-warning': location.used / location.capacity > 0.8,
                    'bg-danger': location.used / location.capacity > 0.95
                  }"
                ></div>
              </div>
              {{ Math.round(location.used / location.capacity * 100) }}%
            </td>
            <td>{{ getLocationProduct(location.id) || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showDetailModal" class="modal-overlay" @click.self="showDetailModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>货位详情</h3>
          <button class="modal-close" @click="showDetailModal = false">×</button>
        </div>
        <div class="modal-body" v-if="selectedLocation">
          <div class="grid grid-2">
            <div class="form-group">
              <label>货位编码</label>
              <div class="form-value">{{ selectedLocation.code }}</div>
            </div>
            <div class="form-group">
              <label>区域</label>
              <div class="form-value">{{ selectedLocation.zone }} 区</div>
            </div>
            <div class="form-group">
              <label>位置</label>
              <div class="form-value">第 {{ selectedLocation.row }} 排 第 {{ selectedLocation.column }} 列 第 {{ selectedLocation.level }} 层</div>
            </div>
            <div class="form-group">
              <label>类型</label>
              <div class="form-value">{{ selectedLocation.type === 'cold' ? '冷藏' : '常温' }}</div>
            </div>
            <div class="form-group">
              <label>总容量</label>
              <div class="form-value">{{ selectedLocation.capacity }}</div>
            </div>
            <div class="form-group">
              <label>已使用</label>
              <div class="form-value">{{ selectedLocation.used }}</div>
            </div>
          </div>

          <h4 class="section-title">存放批次</h4>
          <table>
            <thead>
              <tr>
                <th>货品名称</th>
                <th>批次号</th>
                <th>数量</th>
                <th>保质期至</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="batch in getLocationBatches(selectedLocation.id)" :key="batch.id">
                <td>{{ getProductName(batch.productId) }}</td>
                <td>{{ batch.batchNo }}</td>
                <td>{{ batch.quantity }}</td>
                <td>{{ batch.expiryDate }}</td>
              </tr>
              <tr v-if="getLocationBatches(selectedLocation.id).length === 0">
                <td colspan="4" class="text-center">暂无货品</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showDetailModal = false">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWarehouseStore } from '~/stores/warehouse'
import type { Location } from '~/types'

const warehouseStore = useWarehouseStore()

const showDetailModal = ref(false)
const selectedLocation = ref<Location | null>(null)

const locations = computed(() => warehouseStore.locations)
const batches = computed(() => warehouseStore.batches)
const products = computed(() => warehouseStore.products)

const getZoneLocations = (zone: string) => {
  return locations.value.filter(l => l.zone === zone)
}

const getZoneTotal = (zone: string) => {
  return getZoneLocations(zone).length
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

const getLocationProduct = (locationId: string) => {
  const batch = batches.value.find(b => b.locationId === locationId && b.status === 'in_stock')
  if (!batch) return ''
  const product = products.value.find(p => p.id === batch.productId)
  return product?.name || ''
}

const getLocationBatches = (locationId: string) => {
  return batches.value.filter(b => b.locationId === locationId && b.status === 'in_stock')
}

const getProductName = (productId: string) => {
  const product = products.value.find(p => p.id === productId)
  return product?.name || '-'
}

const showLocationDetail = (location: Location) => {
  selectedLocation.value = location
  showDetailModal.value = true
}

const optimizeLocations = () => {
  const moveCount = warehouseStore.optimizeLocations()
  alert(`货位优化完成，共移动 ${moveCount} 个批次`)
}
</script>

<style lang="scss" scoped>
.warehouse-layout {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-lg;
}

.zone-section {
  background: $bg-tertiary;
  border-radius: $border-radius-lg;
  padding: $spacing-md;
}

.zone-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;

  h3 {
    font-size: $font-size-lg;
    font-weight: 600;
    color: $primary-color;
  }
}

.zone-type {
  font-size: $font-size-xs;
  color: $text-secondary;
  background: white;
  padding: 2px 8px;
  border-radius: 4px;
}

.zone-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: $spacing-xs;
}

.location-cell {
  background: white;
  border: 2px solid $border-color;
  border-radius: $border-radius;
  padding: $spacing-sm;
  text-align: center;
  cursor: pointer;
  transition: all $transition-fast;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  &:hover {
    border-color: $primary-color;
    transform: translateY(-2px);
  }

  &.occupied {
    background: rgba(59, 130, 246, 0.1);
    border-color: $primary-color;
  }

  &.high-usage {
    background: rgba(245, 158, 11, 0.1);
    border-color: $warning-color;
  }
}

.location-code {
  font-weight: 600;
  font-size: $font-size-sm;
  color: $text-primary;
}

.location-usage {
  font-size: $font-size-xs;
  color: $text-secondary;
  margin-top: 2px;
}

.location-product {
  font-size: $font-size-xs;
  color: $primary-color;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.progress-bar {
  display: inline-block;
  width: 60px;
  height: 8px;
  background: $bg-tertiary;
  border-radius: 4px;
  margin-right: $spacing-xs;
  vertical-align: middle;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: $success-color;
  transition: width $transition-base;

  &.bg-warning {
    background: $warning-color;
  }

  &.bg-danger {
    background: $danger-color;
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: $border-radius-lg;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-lg;
  border-bottom: 1px solid $border-color;

  h3 {
    font-size: $font-size-xl;
    font-weight: 600;
  }
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: $text-secondary;
  padding: 0;
  line-height: 1;
}

.modal-body {
  padding: $spacing-lg;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-sm;
  padding: $spacing-lg;
  border-top: 1px solid $border-color;
}

.form-value {
  padding: $spacing-sm $spacing-md;
  background: $bg-tertiary;
  border-radius: $border-radius;
  font-size: $font-size-base;
}

.text-center {
  text-align: center;
  color: $text-muted;
  padding: $spacing-lg;
}

h4.section-title {
  margin-top: $spacing-lg;
  font-size: $font-size-base;
}
</style>
