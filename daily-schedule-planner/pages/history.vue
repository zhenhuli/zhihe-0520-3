<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-800">📜 历史记录</h2>
      <div class="flex gap-2">
        <button
          @click="prevMonth" class="btn btn-secondary">
          ← 上月
        </button>
        <span class="px-4 py-2 bg-gray-100 rounded-lg font-medium">
          {{ currentMonthLabel }}
        </span>
        <button @click="nextMonth" class="btn btn-secondary">
          下月 →
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="card text-center">
        <div class="text-4xl font-bold text-blue-600">
          {{ overallStats.avgCompletionRate }}%
        </div>
        <div class="text-sm text-gray-500 mt-1">平均完成率</div>
      </div>
      <div class="card text-center">
        <div class="text-4xl font-bold text-green-600">
          {{ overallStats.totalDays }}
        </div>
        <div class="text-sm text-gray-500 mt-1">记录天数</div>
      </div>
      <div class="card text-center">
        <div class="text-4xl font-bold text-purple-600">
          {{ formatMinutes(overallStats.avgDuration) }}
        </div>
        <div class="text-sm text-gray-500 mt-1">日均有效时长</div>
      </div>
    </div>

    <div class="card">
      <h3 class="text-lg font-semibold mb-4">📊 本月日历视图</h3>
      <div class="grid grid-cols-7 gap-2">
        <div v-for="day in weekDays" :key="day" class="text-center text-sm font-medium text-gray-500 py-2">
          {{ day }}
        </div>
        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          class="aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105"
          :class="getDayClass(day)"
          @click="day.date && selectDate(day.date!)"
        >
          <span class="text-sm font-medium">{{ day.day }}</span>
          <span v-if="day.record" class="text-xs mt-1">
            {{ day.record.completionRate }}%
          </span>
        </div>
      </div>
    </div>

    <div v-if="selectedDate" class="card">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-lg font-semibold">📅 {{ formatDate(selectedDate) }} 详情</h3>
          <p class="text-gray-500 text-sm">{{ getDayOfWeek(selectedDate) }}</p>
        </div>
        <button @click="loadDayTasks(selectedDate)" class="btn btn-primary text-sm">
          查看当天任务
        </button>
      </div>

      <div v-if="selectedDayRecord" class="space-y-4">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-gray-50 rounded-lg p-3 text-center">
            <div class="text-2xl font-bold text-blue-600">
              {{ selectedDayRecord.completionRate }}%
            </div>
            <div class="text-xs text-gray-500">完成率</div>
          </div>
          <div class="bg-gray-50 rounded-lg p-3 text-center">
            <div class="text-2xl font-bold text-green-600">
              {{ selectedDayRecord.completedTasks }}/{{ selectedDayRecord.totalTasks }}
            </div>
            <div class="text-xs text-gray-500">完成任务</div>
          </div>
          <div class="bg-gray-50 rounded-lg p-3 text-center">
            <div class="text-2xl font-bold text-purple-600">
              {{ formatMinutes(selectedDayRecord.totalDuration) }}
            </div>
            <div class="text-xs text-gray-500">总时长</div>
          </div>
        </div>

        <div>
          <h4 class="text-sm font-medium text-gray-700 mb-2">分类统计</h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div v-for="stat in selectedDayRecord.categoryStats" :key="stat.category" class="flex items-center gap-2 p-2 rounded-lg" :class="getCategoryBgLight(stat.category)">
              <span class="text-xl">{{ getCategoryIcon(stat.category) }}</span>
              <div class="text-sm">
                <div class="font-medium">{{ getCategoryLabel(stat.category) }}</div>
                <div class="text-gray-500">{{ stat.count }}个 · {{ formatMinutes(stat.duration) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="selectedDayTasks.length > 0" class="mt-4">
        <h4 class="text-sm font-medium text-gray-700 mb-2">当天任务</h4>
        <div class="space-y-2">
          <div v-for="task in selectedDayTasks" :key="task.id" class="flex items-center justify-between p-3 rounded-lg" :class="getTaskBgClass(task.category)">
            <div class="flex items-center gap-3">
              <span v-if="task.status === 'completed'" class="text-green-500">✓</span>
              <span v-else class="text-gray-400">○</span>
              <span :class="{ 'line-through text-gray-400': task.status === 'completed' }">
                {{ task.name }}
              </span>
            </div>
            <span class="text-sm text-gray-500">
              {{ task.startTime }} - {{ task.endTime }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="daySummary" class="mt-4">
        <h4 class="text-sm font-medium text-gray-700 mb-2">当日总结</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-green-50 rounded-lg p-4">
            <div class="text-xs text-gray-500 mb-1">做得好的地方</div>
            <div class="text-sm">{{ daySummary.good || '暂无记录' }}</div>
          </div>
          <div class="bg-blue-50 rounded-lg p-4">
            <div class="text-xs text-gray-500 mb-1">需要改进的地方</div>
            <div class="text-sm">{{ daySummary.improve || '暂无记录' }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <h3 class="text-lg font-semibold mb-4">📋 历史记录列表</h3>
      <div class="space-y-3">
        <div
          v-for="record in sortedHistory"
          :key="record.date"
          class="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-all"
          @click="selectDate(record.date)"
        >
          <div class="flex items-center gap-4">
          </div>
          <div class="flex-1">
            <div class="font-medium">{{ formatDate(record.date) }}</div>
            <div class="text-sm text-gray-500">{{ getDayOfWeek(record.date) }}</div>
          </div>
          <div class="flex items-center gap-6">
            <div class="text-center">
              <div class="text-lg font-bold text-blue-600">{{ record.completionRate }}%</div>
              <div class="text-xs text-gray-500">完成率</div>
            </div>
            <div class="text-center">
              <div class="text-lg font-bold text-green-600">{{ record.completedTasks }}/{{ record.totalTasks }}</div>
              <div class="text-xs text-gray-500">任务</div>
            </div>
            <div class="text-center">
              <div class="text-lg font-bold text-purple-600">{{ formatMinutes(record.totalDuration) }}</div>
              <div class="text-xs text-gray-500">时长</div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="store.history.length === 0" class="text-center py-12 text-gray-400">
        <div class="text-4xl mb-2">📭</div>
        <p>还没有历史记录</p>
        <p class="text-sm mt-1">在打卡复盘页归档今日数据后，记录将显示在这里</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useScheduleStore } from '~/stores/schedule'
import type { Task } from '~/types'
import { formatMinutes, formatDate, getDayOfWeek, getCategoryLabel } from '~/utils/time'

const store = useScheduleStore()

const currentMonth = ref(new Date())
const selectedDate = ref<string | null>(null)
const selectedDayTasks = ref<Task[]>([])
const daySummary = reactive({ good: '', improve: '' })

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const currentMonthLabel = computed(() => {
  return `${currentMonth.value.getFullYear()}年${currentMonth.value.getMonth() + 1}月`
})

const overallStats = computed(() => {
  if (store.history.length === 0) {
    return {
      avgCompletionRate: 0,
      totalDays: 0,
      avgDuration: 0
    }
  }

  const totalCompletion = store.history.reduce((sum, r) => sum + r.completionRate, 0)
  const totalDuration = store.history.reduce((sum, r) => sum + r.totalDuration, 0)

  return {
    avgCompletionRate: Math.round(totalCompletion / store.history.length),
    totalDays: store.history.length,
    avgDuration: Math.round(totalDuration / store.history.length)
  }
})

const calendarDays = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  const days: Array<{ day: number; date?: string; record?: typeof store.history[0] }> = []
  
  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push({ day: 0 })
  }
  
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    const record = store.history.find(h => h.date === dateStr)
    days.push({ day: i, date: dateStr, record })
  }
  
  return days
})

const sortedHistory = computed(() => {
  return [...store.history].sort((a, b) => b.date.localeCompare(a.date))
})

const selectedDayRecord = computed(() => {
  if (!selectedDate.value) return null
  return store.history.find(h => h.date === selectedDate.value)
})

onMounted(() => {
  store.loadHistory()
})

function prevMonth() {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() - 1, 1)
}

function nextMonth() {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1, 1)
}

function getDayClass(day: { day: number; date?: string; record?: typeof store.history[0] }) {
  if (day.day === 0) return 'bg-transparent'
  
  const classes = [
    'border border-gray-200',
    day.record ? 'bg-blue-50' : 'bg-white'
  ]
  
  if (day.record) {
    if (day.record.completionRate >= 80) {
      classes.push('border-green-300')
    } else if (day.record.completionRate >= 50) {
      classes.push('border-yellow-300')
    } else {
      classes.push('border-red-300')
    }
  }
  
  return classes.join(' ')
}

function selectDate(date: string) {
  selectedDate.value = date
  loadDaySummary(date)
  loadDayTasks(date)
}

function loadDayTasks(date: string) {
  const saved = localStorage.getItem(`tasks_${date}`)
  if (saved) {
    selectedDayTasks.value = JSON.parse(saved)
  } else {
    selectedDayTasks.value = []
  }
}

function loadDaySummary(date: string) {
  const saved = localStorage.getItem(`summary_${date}`)
  if (saved) {
    const parsed = JSON.parse(saved)
    daySummary.good = parsed.good || ''
    daySummary.improve = parsed.improve || ''
  } else {
    daySummary.good = ''
    daySummary.improve = ''
  }
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    study: '📚',
    work: '💼',
    rest: '😴',
    sport: '🏃'
  }
  return icons[category] || '📝'
}

function getCategoryBgLight(category: string): string {
  const classes: Record<string, string> = {
    study: 'bg-blue-50',
    work: 'bg-purple-50',
    rest: 'bg-green-50',
    sport: 'bg-orange-50'
  }
  return classes[category] || 'bg-gray-50'
}

function getTaskBgClass(category: string): string {
  const classes: Record<string, string> = {
    study: 'bg-blue-50 border-l-4 border-blue-500',
    work: 'bg-purple-50 border-l-4 border-purple-500',
    rest: 'bg-green-50 border-l-4 border-green-500',
    sport: 'bg-orange-50 border-l-4 border-orange-500'
  }
  return classes[category] || 'bg-gray-50 border-l-4 border-gray-500'
}
</script>
