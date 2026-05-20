<template>
  <div class="control-panel">
    <h5 class="mb-3 text-primary">
      <i class="bi bi-gear-fill me-2"></i>模拟控制面板
    </h5>
    
    <div class="mb-3">
      <label class="form-label">模拟速度</label>
      <div class="d-flex gap-2">
        <button
          v-for="speed in [0.5, 1, 2, 3]"
          :key="speed"
          class="btn btn-outline-primary flex-fill"
          :class="{ active: currentSpeed === speed }"
          @click="$emit('speed-change', speed)"
        >
          {{ speed }}x
        </button>
      </div>
    </div>

    <div class="mb-3 form-check form-switch">
      <input
        type="checkbox"
        class="form-check-input"
        id="holidayMode"
        :checked="holidayMode"
        @change="$emit('holiday-toggle')"
      >
      <label class="form-check-label" for="holidayMode">
        <span class="text-danger fw-bold">节假日模式</span>
        <span class="text-muted d-block small">客流量增加200%</span>
      </label>
    </div>

    <div class="mb-3">
      <label class="form-label">客流量控制</label>
      <input
        type="range"
        class="form-range"
        min="10"
        max="300"
        :value="inflowRate"
        @input="$emit('inflow-change', Number($event.target.value))"
      >
      <div class="d-flex justify-content-between small text-muted">
        <span>低</span>
        <span class="fw-bold">{{ inflowRate }}人/周期</span>
        <span>高</span>
      </div>
    </div>

    <div class="d-flex gap-2">
      <button
        v-if="!isRunning"
        class="btn btn-success flex-fill btn-action"
        @click="$emit('start')"
      >
        <i class="bi bi-play-fill me-1"></i>开始模拟
      </button>
      <button
        v-else
        class="btn btn-warning flex-fill btn-action"
        @click="$emit('stop')"
      >
        <i class="bi bi-pause-fill me-1"></i>暂停
      </button>
      <button
        class="btn btn-danger btn-action"
        @click="$emit('reset')"
      >
        <i class="bi bi-arrow-counterclockwise me-1"></i>重置
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isRunning: {
    type: Boolean,
    default: false
  },
  holidayMode: {
    type: Boolean,
    default: false
  },
  currentSpeed: {
    type: Number,
    default: 1
  },
  inflowRate: {
    type: Number,
    default: 50
  }
})

defineEmits(['start', 'stop', 'reset', 'speed-change', 'holiday-toggle', 'inflow-change'])
</script>
