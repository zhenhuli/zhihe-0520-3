<script setup lang="ts">
import type { ProductionConfig } from '~/types'

const props = defineProps<{
  config: ProductionConfig
}>()

const emit = defineEmits<{
  update: [config: ProductionConfig]
}>()

function updateField(field: keyof ProductionConfig, value: any) {
  emit('update', { ...props.config, [field]: value })
}
</script>

<template>
  <div class="card">
    <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
      <span class="i-lucide-settings w-6 h-6 text-purple-600"></span>
      拍摄配置
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label class="label">每日工作时长(小时)</label>
        <input
          type="number"
          class="input"
          :value="config.workingHoursPerDay"
          @input="updateField('workingHoursPerDay', Number(($event.target as HTMLInputElement).value))"
          min="1"
          max="24"
        />
      </div>

      <div>
        <label class="label">每周工作天数</label>
        <input
          type="number"
          class="input"
          :value="config.daysPerWeek"
          @input="updateField('daysPerWeek', Number(($event.target as HTMLInputElement).value))"
          min="1"
          max="7"
        />
      </div>

      <div>
        <label class="label">加班费率(倍)</label>
        <input
          type="number"
          class="input"
          :value="config.overtimeRate"
          @input="updateField('overtimeRate', Number(($event.target as HTMLInputElement).value))"
          min="1"
          step="0.5"
        />
      </div>
    </div>
  </div>
</template>
