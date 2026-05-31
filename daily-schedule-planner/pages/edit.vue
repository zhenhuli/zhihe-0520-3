<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-800">✏️ 编辑时间轴</h2>
      <div class="flex gap-2">
        <button @click="resetChanges" class="btn btn-secondary">
          重置
        </button>
        <button @click="saveChanges" class="btn btn-primary">
          保存更改
        </button>
      </div>
    </div>

    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700 text-sm">
      <p class="font-medium mb-1">💡 使用提示：</p>
      <ul class="list-disc list-inside space-y-1">
        <li><strong>拖拽任务</strong> - 在时间调整模式下，按住任务主体上下拖动可调整开始时间</li>
        <li><strong>拉伸边缘</strong> - 拖动任务底部手柄可修改任务时长</li>
        <li><strong>排序模式</strong> - 切换到排序模式后可拖拽调整任务顺序</li>
      </ul>
    </div>

    <div class="flex gap-4 mb-4">
      <button
        @click="editMode = 'time'"
        class="px-4 py-2 rounded-lg transition-all"
        :class="editMode === 'time' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
      >
        🕐 时间调整模式
      </button>
      <button
        @click="editMode = 'order'"
        class="px-4 py-2 rounded-lg transition-all"
        :class="editMode === 'order' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
      >
        🔀 排序模式
      </button>
    </div>

    <div class="card">
      <div
        class="relative overflow-y-auto select-none"
        ref="timelineContainer"
        style="max-height: 720px;"
        @mousedown="onTimelineMouseDown"
        @mousemove="onTimelineMouseMove"
        @mouseup="onTimelineMouseUp"
        @mouseleave="onTimelineMouseUp"
      >
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
            v-for="(task, index) in localTasks"
            :key="task.id"
            :data-order-index="editMode === 'order' ? index : undefined"
            class="rounded-lg overflow-hidden group relative"
            :class="[
              getTaskBgClass(task.category),
              interactionState === 'drag-move' && dragTask?.id === task.id ? 'opacity-70 shadow-xl ring-2 ring-blue-400' : '',
              interactionState === 'resize' && dragTask?.id === task.id ? 'opacity-90 shadow-lg ring-2 ring-green-400' : '',
              editMode === 'order' ? 'relative mb-2 mx-16' : 'absolute left-16 right-4',
              editMode === 'order' && interactionState === 'order-drag' && orderDropIndex === index && orderDragIndex !== index ? 'border-t-2 border-blue-400' : ''
            ]"
            :style="editMode === 'time' ? getTaskPositionStyle(task) : {}"
          >
            <div
              class="p-3 pb-4 cursor-move"
              :class="getTaskDuration(task) < 30 ? 'pt-1.5 px-2 pb-4' : ''"
              @mousedown.prevent="editMode === 'time' ? startDragMove($event, task) : startOrderDrag($event, index)"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span :class="getTaskDuration(task) < 30 ? 'text-sm' : 'text-lg'" class="cursor-grab">⋮⋮</span>
                  <span :class="getTaskDuration(task) < 30 ? 'text-sm truncate' : 'font-medium truncate'">{{ task.name }}</span>
                </div>
                <div v-if="getTaskDuration(task) >= 30" class="flex items-center gap-2">
                  <span class="text-xs px-2 py-0.5 rounded" :class="getPriorityClass(task.priority)">
                    {{ getPriorityLabel(task.priority) }}
                  </span>
                  <button
                    @click.stop="deleteTask(task.id)"
                    class="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div v-if="getTaskDuration(task) >= 30" class="text-sm text-gray-600 mt-1">
                {{ task.startTime }} - {{ task.endTime }}
                ({{ formatMinutes(getTaskDuration(task)) }})
              </div>
              <div v-else class="text-xs text-gray-600 mt-0.5">
                {{ task.startTime }}-{{ task.endTime }}
              </div>
            </div>

            <div
              v-if="editMode === 'time'"
              class="absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize bg-black/10 hover:bg-black/20 flex items-center justify-center z-20"
              @mousedown.prevent.stop="startResize($event, task)"
            >
              <div class="w-8 h-1 bg-gray-400 rounded"></div>
            </div>
          </div>

          <div
            v-if="editMode === 'time' && ghostTask"
            class="absolute left-16 right-4 rounded-lg border-2 border-dashed border-blue-400 bg-blue-50 opacity-50 pointer-events-none"
            :style="getTaskPositionStyle(ghostTask)"
          >
            <div class="p-3">
              <div class="font-medium text-blue-700">{{ ghostTask.name }}</div>
              <div class="text-sm text-blue-500">{{ ghostTask.startTime }} - {{ ghostTask.endTime }}</div>
            </div>
          </div>

          <div v-if="localTasks.length === 0" class="absolute inset-0 flex items-center justify-center text-gray-400">
            <div class="text-center">
              <div class="text-4xl mb-2">📝</div>
              <p>还没有任务，去任务库添加一些吧！</p>
              <NuxtLink to="/create" class="btn btn-primary mt-4 inline-block">
                前往任务库
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <h3 class="text-lg font-semibold mb-4">📋 任务列表</h3>
      <div class="space-y-2">
        <div
          v-for="(task, index) in localTasks"
          :key="task.id"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div class="flex items-center gap-3">
            <span class="w-3 h-3 rounded-full" :class="getCategoryDotClass(task.category)"></span>
            <span class="font-medium">{{ task.name }}</span>
          </div>
          <div class="flex items-center gap-4 text-sm text-gray-600">
            <span>{{ task.startTime }} - {{ task.endTime }}</span>
            <span class="px-2 py-1 rounded text-xs" :class="getPriorityClass(task.priority)">
              {{ getPriorityLabel(task.priority) }}
            </span>
            <button
              @click="deleteTask(task.id)"
              class="text-red-500 hover:text-red-700"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useScheduleStore } from '~/stores/schedule'
import type { Task } from '~/types'
import { formatMinutes, getPriorityLabel, minutesToTime, getTimeToMinutes } from '~/utils/time'

const store = useScheduleStore()
const timelineContainer = ref<HTMLElement | null>(null)
const timelineRef = ref<HTMLElement | null>(null)
const localTasks = ref<Task[]>([])
const editMode = ref<'time' | 'order'>('time')

const HOUR_HEIGHT = 80

const totalHeight = computed(() => 24 * HOUR_HEIGHT)

const hours = computed(() => Array.from({ length: 24 }, (_, i) => i))

type InteractionState = 'idle' | 'drag-move' | 'resize' | 'order-drag'
const interactionState = ref<InteractionState>('idle')
const dragTask = ref<Task | null>(null)
const dragStartY = ref(0)
const dragStartMinutes = ref(0)
const resizeStartDuration = ref(0)
const ghostTask = ref<Task | null>(null)

const orderDragIndex = ref(-1)
const orderDropIndex = ref(-1)

onMounted(() => {
  store.loadTasks()
  localTasks.value = JSON.parse(JSON.stringify(store.sortedTasks))
})

onUnmounted(() => {
  interactionState.value = 'idle'
  dragTask.value = null
  ghostTask.value = null
})

function yToMinutes(y: number): number {
  const snapped = Math.round(y / (HOUR_HEIGHT / 4)) * 15
  return Math.max(0, Math.min(24 * 60 - 15, snapped))
}

function getTaskPositionStyle(task: Task) {
  const startMin = getTimeToMinutes(task.startTime)
  const duration = getTaskDuration(task)
  const top = (startMin / 60) * HOUR_HEIGHT
  const height = Math.max((duration / 60) * HOUR_HEIGHT, 30)
  return {
    top: `${top}px`,
    height: `${height}px`,
    zIndex: 10
  }
}

function getTaskDuration(task: Task): number {
  return getTimeToMinutes(task.endTime) - getTimeToMinutes(task.startTime)
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

function getCategoryDotClass(category: string): string {
  const classes: Record<string, string> = {
    study: 'bg-blue-500',
    work: 'bg-purple-500',
    rest: 'bg-green-500',
    sport: 'bg-orange-500'
  }
  return classes[category] || 'bg-gray-500'
}

function getPriorityClass(priority: string): string {
  const classes: Record<string, string> = {
    high: 'bg-red-100 text-red-600',
    medium: 'bg-yellow-100 text-yellow-600',
    low: 'bg-gray-100 text-gray-600'
  }
  return classes[priority] || classes.medium
}

function getTimelineOffset(): number {
  if (!timelineRef.value) return 0
  return timelineRef.value.getBoundingClientRect().top
}

function startDragMove(event: MouseEvent, task: Task) {
  interactionState.value = 'drag-move'
  dragTask.value = task
  dragStartY.value = event.clientY
  dragStartMinutes.value = getTimeToMinutes(task.startTime)
  resizeStartDuration.value = getTaskDuration(task)

  ghostTask.value = { ...task }
}

function startResize(event: MouseEvent, task: Task) {
  interactionState.value = 'resize'
  dragTask.value = task
  dragStartY.value = event.clientY
  resizeStartDuration.value = getTaskDuration(task)
  ghostTask.value = null
}

function startOrderDrag(event: MouseEvent, index: number) {
  interactionState.value = 'order-drag'
  orderDragIndex.value = index
  orderDropIndex.value = index
  dragTask.value = localTasks.value[index]
}

function onTimelineMouseDown(event: MouseEvent) {
}

function onTimelineMouseMove(event: MouseEvent) {
  if (interactionState.value === 'drag-move' && dragTask.value) {
    const deltaY = event.clientY - dragStartY.value
    const deltaMinutes = Math.round(deltaY / HOUR_HEIGHT * 60 / 15) * 15
    const newStartMin = Math.max(0, Math.min(24 * 60 - resizeStartDuration.value, dragStartMinutes.value + deltaMinutes))
    const newEndMin = newStartMin + resizeStartDuration.value

    const task = localTasks.value.find(t => t.id === dragTask.value!.id)
    if (task) {
      task.startTime = minutesToTime(newStartMin)
      task.endTime = minutesToTime(newEndMin)
    }

    if (ghostTask.value) {
      ghostTask.startTime = minutesToTime(newStartMin)
      ghostTask.endTime = minutesToTime(newEndMin)
    }
  }

  if (interactionState.value === 'resize' && dragTask.value) {
    const deltaY = event.clientY - dragStartY.value
    const deltaMinutes = Math.round(deltaY / HOUR_HEIGHT * 60 / 15) * 15
    const newDuration = Math.max(15, resizeStartDuration.value + deltaMinutes)
    const startMin = getTimeToMinutes(dragTask.value.startTime)
    const newEndMin = Math.min(24 * 60, startMin + newDuration)

    const task = localTasks.value.find(t => t.id === dragTask.value!.id)
    if (task) {
      task.endTime = minutesToTime(newEndMin)
    }
  }

  if (interactionState.value === 'order-drag') {
    const target = (event.target as HTMLElement).closest('[data-order-index]')
    if (target) {
      const idx = parseInt((target as HTMLElement).dataset.orderIndex || '0')
      orderDropIndex.value = idx
    }
  }
}

function onTimelineMouseUp() {
  if (interactionState.value === 'order-drag' && orderDragIndex.value !== -1 && orderDropIndex.value !== -1 && orderDragIndex.value !== orderDropIndex.value) {
    const result = Array.from(localTasks.value)
    const [removed] = result.splice(orderDragIndex.value, 1)
    result.splice(orderDropIndex.value, 0, removed)
    localTasks.value = result
  }

  interactionState.value = 'idle'
  dragTask.value = null
  ghostTask.value = null
  orderDragIndex.value = -1
  orderDropIndex.value = -1
}

function deleteTask(id: string) {
  if (confirm('确定要删除这个任务吗？')) {
    localTasks.value = localTasks.value.filter(t => t.id !== id)
  }
}

function resetChanges() {
  localTasks.value = JSON.parse(JSON.stringify(store.sortedTasks))
}

function saveChanges() {
  localTasks.value.forEach(task => {
    store.updateTask(task.id, {
      startTime: task.startTime,
      endTime: task.endTime
    })
  })
  store.saveTasks()
  alert('更改已保存！')
}
</script>
