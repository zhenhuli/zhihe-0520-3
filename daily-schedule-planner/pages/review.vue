<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">📝 打卡复盘</h2>
        <p class="text-gray-500">{{ formatDate(store.currentDate) }} {{ getDayOfWeek(store.currentDate) }}</p>
      </div>
      <button @click="archiveAndSave" class="btn btn-success">
        📊 归档今日数据
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="card text-center">
        <div class="text-4xl font-bold text-blue-600">{{ store.completionRate }}%</div>
        <div class="text-sm text-gray-500 mt-1">今日完成率</div>
      </div>
      <div class="card text-center">
        <div class="text-4xl font-bold text-green-600">
          {{ store.completedTasks.length }}/{{ store.tasks.length }}
        </div>
        <div class="text-sm text-gray-500 mt-1">完成任务数</div>
      </div>
      <div class="card text-center">
        <div class="text-4xl font-bold text-purple-600">
          {{ formatMinutes(store.completedDuration) }}
        </div>
        <div class="text-sm text-gray-500 mt-1">有效时长</div>
      </div>
    </div>

    <div class="card">
      <h3 class="text-lg font-semibold mb-4">📈 分类完成情况</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="(stats, category) in categoryCompletion" :key="category" class="text-center p-4 rounded-lg" :class="getCategoryBgLight(category)">
          <div class="text-2xl mb-1">{{ getCategoryIcon(category) }}</div>
          <div class="font-medium">{{ getCategoryLabel(category) }}</div>
          <div class="text-2xl font-bold mt-2">{{ stats.completed }}/{{ stats.total }}</div>
          <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              class="h-2 rounded-full transition-all"
              :class="getCategoryProgressBg(category)"
              :style="{ width: `${stats.total > 0 ? (stats.completed / stats.total * 100) : 0}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <h3 class="text-lg font-semibold mb-4">✅ 任务打卡</h3>
      
      <div class="space-y-3">
        <div
          v-for="task in store.sortedTasks"
          :key="task.id"
          class="p-4 rounded-lg border-2 transition-all"
          :class="[
            task.status === 'completed' ? 'border-green-200 bg-green-50' : 
            task.status === 'in-progress' ? 'border-yellow-200 bg-yellow-50' : 
            'border-gray-200 bg-white'
          ]"
        >
          <div class="flex items-start gap-4">
            <button
              @click="toggleTaskStatus(task)"
              class="mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
              :class="[
                task.status === 'completed' 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : 'border-gray-300 hover:border-green-500'
              ]"
            >
              <span v-if="task.status === 'completed'" class="text-sm">✓</span>
            </button>
            
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-medium" :class="{ 'line-through text-gray-400': task.status === 'completed' }">
                  {{ task.name }}
                </span>
                <span class="px-2 py-0.5 rounded text-xs" :class="getCategoryTagClass(task.category)">
                  {{ getCategoryLabel(task.category) }}
                </span>
                <span class="px-2 py-0.5 rounded text-xs" :class="getPriorityClass(task.priority)">
                  {{ getPriorityLabel(task.priority) }}
                </span>
              </div>
              <div class="text-sm text-gray-500 mt-1">
                {{ task.startTime }} - {{ task.endTime }}
                ({{ formatMinutes(getDuration(task.startTime, task.endTime)) }})
              </div>
              <div v-if="task.note" class="text-sm text-gray-500 mt-1">
                💡 {{ task.note }}
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <span 
                class="px-3 py-1 rounded-full text-xs font-medium"
                :class="getStatusClass(task.status)"
              >
                {{ getStatusLabel(task.status) }}
              </span>
            </div>
          </div>

          <div v-if="task.status !== 'completed'" class="mt-4 pl-10">
            <div v-if="showReasonInput === task.id" class="flex gap-2">
              <select
                v-model="selectedReason"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">选择未完成原因...</option>
                <option v-for="reason in incompleteReasons" :key="reason.value" :value="reason.value">
                  {{ reason.label }}
                </option>
              </select>
              <input
                v-model="customReason"
                type="text"
                placeholder="自定义原因（可选）"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <button @click="saveIncompleteReason(task)" class="btn btn-primary text-sm py-2">
                保存
              </button>
              <button @click="showReasonInput = null" class="btn btn-secondary text-sm py-2">
                取消
              </button>
            </div>
            <button 
              v-else
              @click="showReasonInput = task.id; selectedReason = ''; customReason = ''"
              class="text-sm text-gray-500 hover:text-gray-700"
            >
              📝 标记未完成原因
            </button>
          </div>

          <div v-if="task.incompleteReason" class="mt-2 pl-10 text-sm text-orange-600">
            ⚠️ 未完成原因：{{ task.incompleteReason }}
          </div>
        </div>
      </div>

      <div v-if="store.tasks.length === 0" class="text-center py-12 text-gray-400">
        <div class="text-4xl mb-2">📝</div>
        <p>今天还没有任务</p>
        <NuxtLink to="/create" class="btn btn-primary mt-4 inline-block">
          创建任务
        </NuxtLink>
      </div>
    </div>

    <div class="card">
      <h3 class="text-lg font-semibold mb-4">💭 今日总结</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">做得好的地方</label>
          <textarea
            v-model="todaySummary.good"
            rows="4"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none"
            placeholder="今天做得好的地方有哪些？"
          ></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">需要改进的地方</label>
          <textarea
            v-model="todaySummary.improve"
            rows="4"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
            placeholder="明天可以改进的地方？"
          ></textarea>
        </div>
      </div>
      <button @click="saveSummary" class="btn btn-primary mt-4">
        保存总结
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useScheduleStore } from '~/stores/schedule'
import type { Task, TaskStatus } from '~/types'
import { formatMinutes, formatDate, getDayOfWeek, getCategoryLabel, getPriorityLabel, getStatusLabel, getDuration } from '~/utils/time'

const store = useScheduleStore()
const showReasonInput = ref<string | null>(null)
const selectedReason = ref('')
const customReason = ref('')

const todaySummary = reactive({
  good: '',
  improve: ''
})

const incompleteReasons = [
  { value: 'time_not_enough', label: '时间不够' },
  { value: 'too_difficult', label: '任务太难' },
  { value: 'distracted', label: '分心了' },
  { value: 'tired', label: '太累了' },
  { value: 'unexpected', label: '意外事件' },
  { value: 'not_important', label: '不重要' },
  { value: 'other', label: '其他' }
]

const categoryCompletion = computed(() => {
  const result: Record<string, { total: number; completed: number }> = {
    study: { total: 0, completed: 0 },
    work: { total: 0, completed: 0 },
    rest: { total: 0, completed: 0 },
    sport: { total: 0, completed: 0 }
  }

  store.tasks.forEach(task => {
    result[task.category].total++
    if (task.status === 'completed') {
      result[task.category].completed++
    }
  })

  return result
})

onMounted(() => {
  store.loadTasks()
  store.loadHistory()
  
  const savedSummary = localStorage.getItem(`summary_${store.currentDate}`)
  if (savedSummary) {
    const parsed = JSON.parse(savedSummary)
    todaySummary.good = parsed.good || ''
    todaySummary.improve = parsed.improve || ''
  }
})

function toggleTaskStatus(task: Task) {
  const newStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed'
  store.updateTaskStatus(task.id, newStatus)
}

function saveIncompleteReason(task: Task) {
  const reason = customReason.value || selectedReason.value
  if (reason) {
    store.updateTaskStatus(task.id, 'pending', reason)
    showReasonInput.value = null
    selectedReason.value = ''
    customReason.value = ''
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

function getCategoryProgressBg(category: string): string {
  const classes: Record<string, string> = {
    study: 'bg-blue-500',
    work: 'bg-purple-500',
    rest: 'bg-green-500',
    sport: 'bg-orange-500'
  }
  return classes[category] || 'bg-gray-500'
}

function getCategoryTagClass(category: string): string {
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

function getStatusClass(status: string): string {
  const classes: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-600',
    'in-progress': 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700'
  }
  return classes[status] || classes.pending
}

function saveSummary() {
  localStorage.setItem(`summary_${store.currentDate}`, JSON.stringify(todaySummary))
  alert('总结已保存！')
}

function archiveAndSave() {
  store.archiveDay()
  alert('今日数据已归档到历史记录！')
}
</script>
