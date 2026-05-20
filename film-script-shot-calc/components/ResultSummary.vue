<script setup lang="ts">
import type { CalculationResult } from '~/types'

const props = defineProps<{
  result: CalculationResult
}>()

const { formatMinutes, formatCurrency } = useCalculator()

const stats = computed(() => [
  {
    label: '总镜头数',
    value: `${props.result.totalShots} 个`,
    icon: 'i-lucide-film',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    label: '拍摄总时长',
    value: formatMinutes(props.result.totalWorkMinutes),
    icon: 'i-lucide-clock',
    color: 'bg-green-50 text-green-600',
  },
  {
    label: '拍摄天数',
    value: `${props.result.shootingDays} 天`,
    icon: 'i-lucide-calendar-days',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    label: '拍摄周数',
    value: `${props.result.shootingWeeks.toFixed(1)} 周`,
    icon: 'i-lucide-calendar',
    color: 'bg-orange-50 text-orange-600',
  },
  {
    label: '人员总数',
    value: `${props.result.crewCount} 人`,
    icon: 'i-lucide-users',
    color: 'bg-pink-50 text-pink-600',
  },
  {
    label: '单日成本',
    value: formatCurrency(props.result.dailyCost),
    icon: 'i-lucide-dollar-sign',
    color: 'bg-teal-50 text-teal-600',
  },
  {
    label: '总成本',
    value: formatCurrency(props.result.totalCost),
    icon: 'i-lucide-wallet',
    color: 'bg-red-50 text-red-600',
  },
  {
    label: '日工作时长',
    value: `${props.result.dailyWorkHours.toFixed(1)} 小时`,
    icon: 'i-lucide-timer',
    color: 'bg-indigo-50 text-indigo-600',
  },
])
</script>

<template>
  <div class="card">
    <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
      <span class="i-lucide-bar-chart-3 w-6 h-6 text-blue-600"></span>
      测算结果
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="(stat, index) in stats"
        :key="index"
        class="p-5 rounded-xl border border-gray-100 hover:shadow-md transition-shadow flex items-center gap-4"
      >
        <div :class="[stat.color, 'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0']">
          <span :class="[stat.icon, 'w-6 h-6']"></span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-sm text-gray-500 mb-1">{{ stat.label }}</div>
          <div class="text-xl font-bold text-gray-800 truncate">{{ stat.value }}</div>
        </div>
      </div>
    </div>

    <div class="mt-6 p-4 bg-blue-50 rounded-lg">
      <h3 class="font-semibold text-blue-800 mb-2">时间明细</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-600">拍摄用时:</span>
          <span class="font-medium text-gray-800">{{ formatMinutes(result.totalShotMinutes) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">布场用时:</span>
          <span class="font-medium text-gray-800">{{ formatMinutes(result.totalSetupMinutes) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">总工时:</span>
          <span class="font-medium text-gray-800">{{ formatMinutes(result.totalWorkMinutes) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
