<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">{{ formatDate(store.currentDate) }}</h2>
        <p class="text-gray-500">{{ getDayOfWeek(store.currentDate) }}</p>
      </div>
      <div class="flex gap-2">
        <button @click="prevDay" class="btn btn-secondary">
          ← 前一天
        </button>
        <button @click="goToday" class="btn btn-primary">
          今天
        </button>
        <button @click="nextDay" class="btn btn-secondary">
          后一天 →
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="card">
        <div class="text-sm text-gray-500">已占用时长</div>
        <div class="text-2xl font-bold text-blue-600">{{ formatMinutes(store.totalDuration) }}</div>
      </div>
      <div class="card">
        <div class="text-sm text-gray-500">空闲时长</div>
        <div class="text-2xl font-bold text-green-600">{{ formatMinutes(store.freeTime) }}</div>
      </div>
      <div class="card">
        <div class="text-sm text-gray-500">完成率</div>
        <div class="text-2xl font-bold text-purple-600">{{ store.completionRate }}%</div>
      </div>
      <div class="card">
        <div class="text-sm text-gray-500">任务数</div>
        <div class="text-2xl font-bold text-orange-600">
          {{ store.completedTasks.length }}/{{ store.tasks.length }}
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div v-for="(stats, category) in store.getCategoryStats" :key="category" class="card">
        <div class="flex items-center gap-2">
          <span class="text-lg">{{ getCategoryIcon(category) }}</span>
          <span class="font-medium">{{ getCategoryLabel(category) }}</span>
        </div>
        <div class="mt-2 text-sm text-gray-600">
          {{ stats.count }}个任务 · {{ formatMinutes(stats.duration) }}
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div class="lg:col-span-3">
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">📊 今日时间轴</h3>
          <div class="relative overflow-y-auto" style="max-height: 720px;">
            <div class="relative" ref="timelineRef" :style="{ height: totalHeight + 'px' }">
              <div
                v-for="hour in hours"
                :key="hour"
                class="absolute left-0 right-0 border-b border-gray-200"
                :style="{ top: hour * HOUR_HEIGHT + 'px', height: HOUR_HEIGHT + 'px' }"
              >
                <div class="absolute left-0 w-16 text-sm text-gray-400 pr-2 text-right" style="top: -8px;">
                  {{ String(hour).padStart(2, '0') }}:00
                </div>
                <div class="absolute left-16 right-0 top-0 h-full border-l border-gray-200"></div>
              </div>

              <div
                v-for="task in store.sortedTasks"
                :key="task.id"
                class="absolute left-16 right-4 rounded-lg p-2 cursor-pointer transition-all hover:shadow-md overflow-hidden"
                :class="[
                  getTaskBgClass(task.category),
                  `status-${task.status}`
                ]"
                :style="getTaskPositionStyle(task)"
                @click="showTaskDetail(task)"
              >
                <div class="flex items-center justify-between">
                  <span class="font-medium text-sm truncate">{{ task.name }}</span>
                  <span class="text-xs px-2 py-0.5 rounded" :class="getPriorityClass(task.priority)">
                    {{ getPriorityLabel(task.priority) }}
                  </span>
                </div>
                <div class="text-xs opacity-75 mt-1">
                  {{ task.startTime }} - {{ task.endTime }}
                </div>
                <div v-if="task.status === 'in-progress'" class="absolute top-1 right-1">
                  <span class="animate-pulse w-2 h-2 bg-yellow-400 rounded-full inline-block"></span>
                </div>
              </div>

              <div v-if="store.sortedTasks.length === 0" class="absolute inset-0 flex items-center justify-center text-gray-400">
                <div class="text-center">
                  <div class="text-4xl mb-2">📝</div>
                  <p>今天还没有任务，去任务库添加一些吧！</p>
                  <NuxtLink to="/create" class="btn btn-primary mt-4 inline-block">
                    前往任务库
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div class="card">
          <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
            <span class="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></span>
            进行中 ({{ store.inProgressTasks.length }})
          </h3>
          <div v-if="store.inProgressTasks.length === 0" class="text-gray-400 text-sm py-2">
            暂无进行中的任务
          </div>
          <div v-for="task in store.inProgressTasks" :key="task.id" class="task-item" :class="task.category">
            <div class="font-medium">{{ task.name }}</div>
            <div class="text-xs text-gray-500">{{ task.startTime }} - {{ task.endTime }}</div>
          </div>
        </div>

        <div class="card">
          <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
            <span class="w-3 h-3 bg-gray-300 rounded-full"></span>
            待完成 ({{ store.pendingTasks.length }})
          </h3>
          <div v-if="store.pendingTasks.length === 0" class="text-gray-400 text-sm py-2">
            太棒了！没有待完成任务
          </div>
          <div v-for="task in store.pendingTasks.slice(0, 5)" :key="task.id" class="task-item" :class="task.category">
            <div class="font-medium">{{ task.name }}</div>
            <div class="text-xs text-gray-500">{{ task.startTime }} - {{ task.endTime }}</div>
          </div>
          <div v-if="store.pendingTasks.length > 5" class="text-sm text-gray-400 text-center mt-2">
            还有 {{ store.pendingTasks.length - 5 }} 个任务...
          </div>
        </div>

        <div class="card">
          <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
            <span class="w-3 h-3 bg-green-500 rounded-full"></span>
            已完成 ({{ store.completedTasks.length }})
          </h3>
          <div v-if="store.completedTasks.length === 0" class="text-gray-400 text-sm py-2">
            还没有完成的任务
          </div>
          <div v-for="task in store.completedTasks.slice(0, 5)" :key="task.id" class="task-item" :class="task.category">
            <div class="font-medium line-through">{{ task.name }}</div>
            <div class="text-xs text-gray-500">{{ task.startTime }} - {{ task.endTime }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedTask" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="selectedTask = null">
      <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold">{{ selectedTask.name }}</h3>
          <button @click="selectedTask = null" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <span class="px-2 py-1 rounded text-sm" :class="getCategoryBgClass(selectedTask.category)">
              {{ getCategoryLabel(selectedTask.category) }}
            </span>
            <span class="px-2 py-1 rounded text-sm" :class="getPriorityBgClass(selectedTask.priority)">
              {{ getPriorityLabel(selectedTask.priority) }}优先级
            </span>
            <span class="px-2 py-1 rounded text-sm" :class="getStatusBgClass(selectedTask.status)">
              {{ getStatusLabel(selectedTask.status) }}
            </span>
          </div>
          <div class="text-gray-600">
            <span class="font-medium">时间：</span>
            {{ selectedTask.startTime }} - {{ selectedTask.endTime }}
            ({{ formatMinutes(getDuration(selectedTask.startTime, selectedTask.endTime)) }})
          </div>
          <div v-if="selectedTask.note" class="text-gray-600">
            <span class="font-medium">备注：</span>
            {{ selectedTask.note }}
          </div>
        </div>
        <div class="flex gap-2 mt-6">
          <NuxtLink to="/edit" class="btn btn-primary flex-1 text-center">
            编辑时间轴
          </NuxtLink>
          <button @click="deleteSelectedTask" class="btn btn-danger flex-1">
            删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useScheduleStore } from '~/stores/schedule'
import type { Task } from '~/types'
import { formatMinutes, formatDate, getDayOfWeek, getCategoryLabel, getPriorityLabel, getStatusLabel, getDuration, getTimeToMinutes } from '~/utils/time'

const store = useScheduleStore()
const timelineRef = ref<HTMLElement | null>(null)
const selectedTask = ref<Task | null>(null)

const HOUR_HEIGHT = 80
const totalHeight = computed(() => 24 * HOUR_HEIGHT)

const hours = computed(() => Array.from({ length: 24 }, (_, i) => i))

onMounted(() => {
  store.loadTasks()
  store.loadHistory()
})

function prevDay() {
  const date = new Date(store.currentDate)
  date.setDate(date.getDate() - 1)
  store.setCurrentDate(date.toISOString().split('T')[0])
}

function nextDay() {
  const date = new Date(store.currentDate)
  date.setDate(date.getDate() + 1)
  store.setCurrentDate(date.toISOString().split('T')[0])
}

function goToday() {
  store.setCurrentDate(new Date().toISOString().split('T')[0])
}

function getTaskPositionStyle(task: Task) {
  const startMin = getTimeToMinutes(task.startTime)
  const duration = getDuration(task.startTime, task.endTime)
  const top = (startMin / 60) * HOUR_HEIGHT
  const height = Math.max((duration / 60) * HOUR_HEIGHT, 30)
  return {
    top: `${top}px`,
    height: `${height}px`,
    zIndex: 10
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

function getTaskBgClass(category: string): string {
  const classes: Record<string, string> = {
    study: 'bg-blue-100 border-l-4 border-blue-500',
    work: 'bg-purple-100 border-l-4 border-purple-500',
    rest: 'bg-green-100 border-l-4 border-green-500',
    sport: 'bg-orange-100 border-l-4 border-orange-500'
  }
  return classes[category] || 'bg-gray-100 border-l-4 border-gray-500'
}

function getCategoryBgClass(category: string): string {
  const classes: Record<string, string> = {
    study: 'bg-blue-100 text-blue-700',
    work: 'bg-purple-100 text-purple-700',
    rest: 'bg-green-100 text-green-700',
    sport: 'bg-orange-100 text-orange-700'
  }
  return classes[category] || 'bg-gray-100 text-gray-700'
}

function getPriorityClass(priority: string): string {
  const classes: Record<string, string> = {
    high: 'bg-red-100 text-red-600',
    medium: 'bg-yellow-100 text-yellow-600',
    low: 'bg-gray-100 text-gray-600'
  }
  return classes[priority] || classes.medium
}

function getPriorityBgClass(priority: string): string {
  const classes: Record<string, string> = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-gray-100 text-gray-700'
  }
  return classes[priority] || classes.medium
}

function getStatusBgClass(status: string): string {
  const classes: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-700',
    'in-progress': 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700'
  }
  return classes[status] || classes.pending
}

function showTaskDetail(task: Task) {
  selectedTask.value = task
}

function deleteSelectedTask() {
  if (selectedTask.value && confirm('确定要删除这个任务吗？')) {
    store.deleteTask(selectedTask.value.id)
    selectedTask.value = null
  }
}
</script>
