<template>
  <div class="control-panel">
    <h5 class="mb-3 text-success">
      <i class="bi bi-graph-up me-2"></i>实时客流状态
    </h5>

    <div class="row g-2 mb-3">
      <div class="col-6">
        <div class="stat-card text-center">
          <div class="stat-number">{{ totalVisitors }}</div>
          <div class="small text-muted">总游客数</div>
        </div>
      </div>
      <div class="col-6">
        <div class="stat-card text-center">
          <div class="stat-number" :class="congestedCount > 0 ? 'text-danger' : 'text-success'">
            {{ congestedCount }}
          </div>
          <div class="small text-muted">拥堵片区</div>
        </div>
      </div>
    </div>

    <div class="mb-3">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <span class="form-label mb-0">模拟时间</span>
        <span class="fw-bold text-primary">{{ formatTime(timeStep) }}</span>
      </div>
      <div class="progress" style="height: 8px;">
        <div
          class="progress-bar progress-bar-striped progress-bar-animated"
          :style="{ width: Math.min(timeStep * 2, 100) + '%' }"
        ></div>
      </div>
    </div>

    <div class="mb-3">
      <div class="d-flex justify-content-between mb-1">
        <span class="small text-muted">景区总承载量</span>
        <span class="small">{{ totalVisitors }}/{{ totalCapacity }}</span>
      </div>
      <div class="progress" style="height: 6px;">
        <div
          class="progress-bar"
          :class="getProgressBarClass()"
          :style="{ width: (totalVisitors / totalCapacity * 100) + '%' }"
        ></div>
      </div>
    </div>

    <div class="mb-2">
      <h6 class="text-muted mb-2">片区状态列表</h6>
      <div class="list-group" style="max-height: 250px; overflow-y: auto;">
        <div
          v-for="area in sortedAreas"
          :key="area.id"
          class="list-group-item list-group-item-action p-2 area-card"
          :class="[`status-${getStatusLevel(area.currentVisitors, area.maxCapacity).level}`]"
          @click="$emit('area-click', area)"
        >
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <div class="fw-bold small">{{ area.name }}</div>
              <div class="text-muted" style="font-size: 0.75rem;">
                {{ getStatusLevel(area.currentVisitors, area.maxCapacity).text }}
              </div>
            </div>
            <div class="text-end">
              <div class="fw-bold">{{ area.currentVisitors }}</div>
              <div class="text-muted" style="font-size: 0.75rem;">
                /{{ area.maxCapacity }}
              </div>
            </div>
          </div>
          <div class="progress mt-1" style="height: 4px;">
            <div
              class="progress-bar"
              :class="getProgressClass(area)"
              :style="{ width: (area.currentVisitors / area.maxCapacity * 100) + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getStatusLevel } from '@/utils/scenicData'

const props = defineProps({
  areas: {
    type: Array,
    required: true
  },
  timeStep: {
    type: Number,
    default: 0
  }
})

defineEmits(['area-click'])

const totalVisitors = computed(() => {
  return props.areas.reduce((sum, a) => sum + a.currentVisitors, 0)
})

const totalCapacity = computed(() => {
  return props.areas.reduce((sum, a) => sum + a.maxCapacity, 0)
})

const congestedCount = computed(() => {
  return props.areas.filter(a => a.currentVisitors / a.maxCapacity >= 0.8).length
})

const sortedAreas = computed(() => {
  return [...props.areas].sort((a, b) => {
    const ratioA = a.currentVisitors / a.maxCapacity
    const ratioB = b.currentVisitors / b.maxCapacity
    return ratioB - ratioA
  })
})

const formatTime = (step) => {
  const hours = Math.floor(step / 60)
  const minutes = step % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

const getProgressBarClass = () => {
  const ratio = totalVisitors.value / totalCapacity.value
  if (ratio < 0.5) return 'bg-success'
  if (ratio < 0.7) return 'bg-warning'
  return 'bg-danger'
}

const getProgressClass = (area) => {
  const status = getStatusLevel(area.currentVisitors, area.maxCapacity)
  switch (status.level) {
    case 'normal': return 'bg-success'
    case 'warning': return 'bg-warning'
    case 'danger': return 'bg-danger'
    case 'congested': return 'bg-danger'
    default: return 'bg-primary'
  }
}
</script>
