<template>
  <div class="container">
    <div class="page-header">
      <h1>📋 库存查询</h1>
      <p>查看当前库存批次与货位信息</p>
    </div>

    <div class="card">
      <div class="filter-bar">
        <div class="filter-inputs">
          <div class="form-group">
            <input v-model="searchKeyword" placeholder="搜索货品名称、批次号..." />
          </div>
          <div class="form-group">
            <select v-model="filterStatus">
              <option value="">全部状态</option>
              <option value="in_stock">在库</option>
              <option value="out_of_stock">已出库</option>
              <option value="expired">已过期</option>
            </select>
          </div>
        </div>
        <div class="text-muted">共 {{ filteredBatches.length }} 个批次</div>
      </div>

      <table>
        <thead>
          <tr>
            <th>货品名称</th>
            <th>批次号</th>
            <th>数量</th>
            <th>入库日期</th>
            <th>保质期至</th>
            <th>剩余天数</th>
            <th>货位</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="batch in filteredBatches" :key="batch.id">
            <td>{{ getProductName(batch.productId) }}</td>
            <td>{{ batch.batchNo }}</td>
            <td>{{ batch.quantity }}</td>
            <td>{{ batch.receivedDate }}</td>
            <td>{{ batch.expiryDate }}</td>
            <td>
              <span v-if="getDaysRemaining(batch) <= 0" class="text-danger">已过期</span>
              <span v-else-if="getDaysRemaining(batch) <= 7" class="text-warning">{{ getDaysRemaining(batch) }} 天</span>
              <span v-else>{{ getDaysRemaining(batch) }} 天</span>
            </td>
            <td>
              <span class="badge badge-info">{{ getLocationCode(batch.locationId) }}</span>
            </td>
            <td>
              <span class="badge" :class="getBatchStatusClass(batch.status)">
                {{ getBatchStatusLabel(batch.status) }}
              </span>
            </td>
          </tr>
          <tr v-if="filteredBatches.length === 0">
            <td colspan="8" class="text-center">暂无数据</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card">
      <h2 class="section-title">📦 货品库存汇总</h2>
      <table>
        <thead>
          <tr>
            <th>货品名称</th>
            <th>分类</th>
            <th>总库存</th>
            <th>批次数量</th>
            <th>最早到期</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="summary in productSummary" :key="summary.productId">
            <td>{{ summary.productName }}</td>
            <td>{{ summary.category }}</td>
            <td>{{ summary.totalQuantity }}</td>
            <td>{{ summary.batchCount }}</td>
            <td>{{ summary.earliestExpiry }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWarehouseStore } from '~/stores/warehouse'

const warehouseStore = useWarehouseStore()

const searchKeyword = ref('')
const filterStatus = ref('')

const batches = computed(() => warehouseStore.batches)
const products = computed(() => warehouseStore.products)

const filteredBatches = computed(() => {
  let result = [...batches.value]

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(b => {
      const productName = getProductName(b.productId)
      return productName.toLowerCase().includes(keyword) || b.batchNo.toLowerCase().includes(keyword)
    })
  }

  if (filterStatus.value) {
    result = result.filter(b => b.status === filterStatus.value)
  }

  return result.sort((a, b) => new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime())
})

const productSummary = computed(() => {
  const summaryMap = new Map<string, any>()

  batches.value.forEach(batch => {
    if (batch.status !== 'in_stock') return

    const product = products.value.find(p => p.id === batch.productId)
    if (!product) return

    if (!summaryMap.has(batch.productId)) {
      summaryMap.set(batch.productId, {
        productId: batch.productId,
        productName: product.name,
        category: product.category,
        totalQuantity: 0,
        batchCount: 0,
        earliestExpiry: null as string | null
      })
    }

    const item = summaryMap.get(batch.productId)
    item.totalQuantity += batch.quantity
    item.batchCount += 1

    if (!item.earliestExpiry || batch.expiryDate < item.earliestExpiry) {
      item.earliestExpiry = batch.expiryDate
    }
  })

  return Array.from(summaryMap.values())
})

const getProductName = (productId: string) => {
  const product = products.value.find(p => p.id === productId)
  return product?.name || '-'
}

const getLocationCode = (locationId: string | null) => {
  if (!locationId) return '-'
  const location = warehouseStore.getLocationById(locationId)
  return location?.code || '-'
}

const getDaysRemaining = (batch: any) => {
  const expiry = new Date(batch.expiryDate)
  const today = new Date()
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

const getBatchStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'badge-secondary',
    in_stock: 'badge-success',
    out_of_stock: 'badge-info',
    expired: 'badge-danger'
  }
  return classes[status] || 'badge-secondary'
}

const getBatchStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: '待入库',
    in_stock: '在库',
    out_of_stock: '已出库',
    expired: '已过期'
  }
  return labels[status] || status
}
</script>

<style lang="scss" scoped>
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: $spacing-md;
}

.filter-inputs {
  display: flex;
  gap: $spacing-md;

  .form-group {
    margin-bottom: 0;
    min-width: 200px;

    &:last-child {
      min-width: 150px;
    }
  }
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

.text-muted {
  color: $text-muted;
  font-size: $font-size-sm;
}
</style>
