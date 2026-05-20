<template>
  <div class="container">
    <div class="page-header flex flex-between">
      <div>
        <h1>📤 出库管理</h1>
        <p>管理货品出库订单与批次分配</p>
      </div>
      <button class="btn btn-primary" @click="showAddModal = true">
        + 新增出库单
      </button>
    </div>

    <div class="card">
      <h2 class="section-title">出库单列表</h2>
      <table>
        <thead>
          <tr>
            <th>出库单号</th>
            <th>客户</th>
            <th>创建时间</th>
            <th>状态</th>
            <th>货品数</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in outboundOrders" :key="order.id">
            <td>{{ order.orderNo }}</td>
            <td>{{ order.customer }}</td>
            <td>{{ order.createdAt }}</td>
            <td>
              <span class="badge" :class="getStatusClass(order.status)">
                {{ getStatusLabel(order.status) }}
              </span>
            </td>
            <td>{{ order.items.length }}</td>
            <td>
              <div class="flex flex-gap-sm">
                <button v-if="order.status === 'draft'" class="btn btn-success btn-sm" @click="allocateOrder(order.id)">
                  分配批次
                </button>
                <button v-if="order.status === 'confirmed'" class="btn btn-primary btn-sm" @click="completeOrder(order.id)">
                  出库
                </button>
                <button class="btn btn-secondary btn-sm" @click="viewOrder(order)">
                  详情
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>新增出库单</h3>
          <button class="modal-close" @click="showAddModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>出库单号</label>
            <input v-model="newOrder.orderNo" placeholder="如：OUT20260520001" />
          </div>
          <div class="form-group">
            <label>客户</label>
            <input v-model="newOrder.customer" placeholder="客户名称" />
          </div>

          <div class="form-group">
            <label>出库货品明细</label>
            <div v-for="(item, index) in newOrder.items" :key="index" class="item-row">
              <div class="grid grid-3">
                <div class="form-group">
                  <label>货品</label>
                  <select v-model="item.productId" @change="onProductChange(index)">
                    <option value="">请选择</option>
                    <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>出库数量</label>
                  <input type="number" v-model.number="item.quantity" placeholder="数量" />
                </div>
                <div class="form-group">
                  <label>可用库存</label>
                  <div class="form-value" v-if="item.productId">
                    {{ getStockQuantity(item.productId) }}
                  </div>
                </div>
              </div>
              <button v-if="newOrder.items.length > 1" class="btn btn-danger btn-sm" @click="removeItem(index)">
                删除
              </button>
            </div>
            <button class="btn btn-secondary btn-sm" @click="addItem">+ 添加货品</button>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showAddModal = false">取消</button>
          <button class="btn btn-primary" @click="submitOrder">创建出库单</button>
        </div>
      </div>
    </div>

    <div v-if="showDetailModal" class="modal-overlay" @click.self="showDetailModal = false">
      <div class="modal modal-lg">
        <div class="modal-header">
          <h3>出库单详情</h3>
          <button class="modal-close" @click="showDetailModal = false">×</button>
        </div>
        <div class="modal-body" v-if="selectedOrder">
          <div class="grid grid-2">
            <div class="form-group">
              <label>出库单号</label>
              <div class="form-value">{{ selectedOrder.orderNo }}</div>
            </div>
            <div class="form-group">
              <label>客户</label>
              <div class="form-value">{{ selectedOrder.customer }}</div>
            </div>
            <div class="form-group">
              <label>创建时间</label>
              <div class="form-value">{{ selectedOrder.createdAt }}</div>
            </div>
            <div class="form-group">
              <label>状态</label>
              <div class="form-value">
                <span class="badge" :class="getStatusClass(selectedOrder.status)">
                  {{ getStatusLabel(selectedOrder.status) }}
                </span>
              </div>
            </div>
          </div>

          <h4 class="section-title">货品明细</h4>
          <table>
            <thead>
              <tr>
                <th>货品名称</th>
                <th>出库数量</th>
                <th>分配批次</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in selectedOrder.items" :key="index">
                <td>{{ item.productName }}</td>
                <td>{{ item.quantity }}</td>
                <td>
                  <span v-for="(batch, bIndex) in item.allocatedBatches" :key="bIndex" class="badge badge-info" style="margin-right: 4px;">
                    {{ batch.batchNo }} ({{ batch.quantity }})
                  </span>
                  <span v-if="item.allocatedBatches.length === 0" class="text-muted">未分配</span>
                </td>
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
import type { OutboundOrder, OutboundOrderItem } from '~/types'

const warehouseStore = useWarehouseStore()

const showAddModal = ref(false)
const showDetailModal = ref(false)
const selectedOrder = ref<OutboundOrder | null>(null)

const outboundOrders = computed(() => warehouseStore.outboundOrders)
const products = computed(() => warehouseStore.products)

const newOrder = ref({
  orderNo: '',
  customer: '',
  items: [{
    productId: '',
    productName: '',
    quantity: 0,
    allocatedBatches: []
  }] as OutboundOrderItem[]
})

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    draft: 'badge-secondary',
    confirmed: 'badge-info',
    completed: 'badge-success'
  }
  return classes[status] || 'badge-secondary'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    draft: '草稿',
    confirmed: '已确认',
    completed: '已完成'
  }
  return labels[status] || status
}

const getStockQuantity = (productId: string) => {
  return warehouseStore.getBatchesByProductId(productId).reduce((sum, b) => sum + b.quantity, 0)
}

const onProductChange = (index: number) => {
  const productId = newOrder.value.items[index].productId
  const product = products.value.find(p => p.id === productId)
  if (product) {
    newOrder.value.items[index].productName = product.name
  }
}

const addItem = () => {
  newOrder.value.items.push({
    productId: '',
    productName: '',
    quantity: 0,
    allocatedBatches: []
  })
}

const removeItem = (index: number) => {
  newOrder.value.items.splice(index, 1)
}

const submitOrder = () => {
  if (!newOrder.value.orderNo || !newOrder.value.customer) {
    alert('请填写完整信息')
    return
  }

  const validItems = newOrder.value.items.filter(item => item.productId && item.quantity > 0)
  if (validItems.length === 0) {
    alert('请至少添加一个有效货品')
    return
  }

  warehouseStore.createOutboundOrder({
    orderNo: newOrder.value.orderNo,
    customer: newOrder.value.customer,
    items: validItems
  })

  showAddModal.value = false
  newOrder.value = {
    orderNo: '',
    customer: '',
    items: [{
      productId: '',
      productName: '',
      quantity: 0,
      allocatedBatches: []
    }]
  }
}

const allocateOrder = (orderId: string) => {
  warehouseStore.allocateOutboundOrder(orderId)
  const order = warehouseStore.outboundOrders.find(o => o.id === orderId)
  if (order) {
    order.status = 'confirmed'
  }
}

const completeOrder = (orderId: string) => {
  warehouseStore.completeOutboundOrder(orderId)
}

const viewOrder = (order: OutboundOrder) => {
  selectedOrder.value = order
  showDetailModal.value = true
}
</script>

<style lang="scss" scoped>
.btn-sm {
  padding: 4px 12px;
  font-size: $font-size-xs;
}

.item-row {
  display: flex;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;
  align-items: flex-end;
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

  &-lg {
    max-width: 1000px;
  }
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

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-sm;
  flex: 1;
}

h4.section-title {
  margin-top: $spacing-lg;
  font-size: $font-size-base;
}

.text-muted {
  color: $text-muted;
}
</style>
