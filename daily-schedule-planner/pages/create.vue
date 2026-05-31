<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-800">📚 任务库</h2>
      <button @click="openAddModal" class="btn btn-primary">
        ➕ 添加任务
      </button>
    </div>

    <div class="card">
      <div v-if="store.sortedTaskLibrary.length === 0" class="text-center py-12 text-gray-400">
        <div class="text-5xl mb-4">📭</div>
        <p>任务库中还没有任务，添加一些常用任务吧！</p>
        <button @click="openAddModal" class="btn btn-primary mt-4">
          ➕ 添加第一个任务
        </button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="task in store.sortedTaskLibrary"
          :key="task.id"
          class="border rounded-xl p-4 transition-all hover:shadow-md"
          :class="getTaskBorderClass(task.category)"
        >
          <div class="flex items-start justify-between mb-2">
            <h3 class="font-semibold text-gray-800">{{ task.name }}</h3>
            <span class="text-lg">{{ getCategoryIcon(task.category) }}</span>
          </div>

          <div class="space-y-2 text-sm text-gray-600">
            <div class="flex items-center gap-2">
              <span class="text-gray-400">⏰</span>
              <span>{{ task.startTime }} - {{ task.endTime }}</span>
              <span class="text-gray-400">({{ formatMinutes(getDuration(task.startTime, task.endTime)) }})</span>
            </div>

            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded text-xs" :class="getPriorityBgClass(task.priority)">
                {{ getPriorityLabel(task.priority) }}优先级
              </span>
            </div>

            <div v-if="task.note" class="text-gray-500 text-xs">
              💬 {{ task.note }}
            </div>
          </div>

          <div class="flex gap-2 mt-4">
            <button
              @click="addToToday(task)"
              class="btn btn-primary flex-1 text-sm py-2"
            >
              ➕ 添加到今日
            </button>
            <button
              @click="openEditModal(task)"
              class="btn btn-secondary text-sm py-2 px-3"
              title="编辑"
            >
              ✏️
            </button>
            <button
              @click="deleteTask(task)"
              class="btn btn-danger text-sm py-2 px-3"
              title="删除"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="formModal.visible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="closeFormModal">
      <div class="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-800">
            {{ formModal.isEdit ? '✏️ 编辑任务库任务' : '➕ 添加任务到任务库' }}
          </h3>
          <button @click="closeFormModal" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">任务名称</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="请输入任务名称"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">开始时间</label>
              <input
                v-model="form.startTime"
                type="time"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">结束时间</label>
              <input
                v-model="form.endTime"
                type="time"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>
          </div>

          <div v-if="form.startTime && form.endTime" class="text-sm text-gray-500">
            预计时长：{{ formatMinutes(getDuration(form.startTime, form.endTime)) }}
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">任务标签</label>
            <div class="grid grid-cols-4 gap-3">
              <button
                type="button"
                v-for="cat in categories"
                :key="cat.value"
                @click="form.category = cat.value"
                class="px-4 py-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1"
                :class="[
                  form.category === cat.value
                    ? cat.activeClass
                    : 'border-gray-200 hover:border-gray-300'
                ]"
              >
                <span class="text-xl">{{ cat.icon }}</span>
                <span class="text-sm font-medium">{{ cat.label }}</span>
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">优先级</label>
            <div class="grid grid-cols-3 gap-3">
              <button
                type="button"
                v-for="p in priorities"
                :key="p.value"
                @click="form.priority = p.value"
                class="px-4 py-3 rounded-lg border-2 transition-all"
                :class="[
                  form.priority === p.value
                    ? p.activeClass
                    : 'border-gray-200 hover:border-gray-300'
                ]"
              >
                <span class="font-medium">{{ p.label }}</span>
                <span class="text-sm block text-gray-500">{{ p.desc }}</span>
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">任务备注</label>
            <textarea
              v-model="form.note"
              placeholder="添加任务备注（可选）"
              rows="4"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
            ></textarea>
          </div>

          <div v-if="errorMessage" class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {{ errorMessage }}
          </div>

          <div class="flex gap-4 pt-4">
            <button type="submit" class="btn btn-primary flex-1 py-3 text-lg">
              {{ formModal.isEdit ? '保存修改' : '添加到任务库' }}
            </button>
            <button type="button" @click="closeFormModal" class="btn btn-secondary flex-1 py-3 text-lg">
              取消
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="conflictModal.visible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="closeConflictModal">
      <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div class="flex items-center gap-3 mb-4">
          <span class="text-3xl">⚠️</span>
          <h3 class="text-xl font-bold text-red-600">时间冲突！</h3>
        </div>

        <p class="text-gray-600 mb-4">
          任务「<span class="font-semibold">{{ conflictModal.taskName }}</span>」的时间段与今日以下任务冲突：
        </p>

        <div class="space-y-2 mb-6">
          <div
            v-for="conflictTask in conflictModal.conflictingTasks"
            :key="conflictTask.id"
            class="p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <div class="font-medium text-red-700">{{ conflictTask.name }}</div>
            <div class="text-sm text-red-600">{{ conflictTask.startTime }} - {{ conflictTask.endTime }}</div>
          </div>
        </div>

        <div class="flex gap-3">
          <button @click="closeConflictModal" class="btn btn-secondary flex-1 py-3">
            我知道了
          </button>
          <NuxtLink to="/" class="btn btn-primary flex-1 py-3 text-center">
            前往调整
          </NuxtLink>
        </div>
      </div>
    </div>

    <transition name="toast">
      <div v-if="successMessage" class="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-green-500 text-white rounded-lg shadow-lg flex items-center gap-2">
        <span class="text-lg">✅</span>
        <span class="font-medium">{{ successMessage }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useScheduleStore } from '~/stores/schedule'
import type { Task, TaskCategory, TaskPriority } from '~/types'
import { formatMinutes, getDuration, getPriorityLabel } from '~/utils/time'

const store = useScheduleStore()

const errorMessage = ref('')
const successMessage = ref('')

const formModal = reactive({
  visible: false,
  isEdit: false,
  editingId: null as string | null
})

const conflictModal = reactive({
  visible: false,
  taskName: '',
  conflictingTasks: [] as Task[]
})

const categories = [
  { value: 'study' as TaskCategory, label: '学习', icon: '📚', activeClass: 'border-blue-500 bg-blue-50 text-blue-700' },
  { value: 'work' as TaskCategory, label: '工作', icon: '💼', activeClass: 'border-purple-500 bg-purple-50 text-purple-700' },
  { value: 'rest' as TaskCategory, label: '休息', icon: '😴', activeClass: 'border-green-500 bg-green-50 text-green-700' },
  { value: 'sport' as TaskCategory, label: '运动', icon: '🏃', activeClass: 'border-orange-500 bg-orange-50 text-orange-700' }
]

const priorities = [
  { value: 'high' as TaskPriority, label: '高优先级', desc: '重要紧急', activeClass: 'border-red-500 bg-red-50 text-red-700' },
  { value: 'medium' as TaskPriority, label: '中优先级', desc: '重要不紧急', activeClass: 'border-yellow-500 bg-yellow-50 text-yellow-700' },
  { value: 'low' as TaskPriority, label: '低优先级', desc: '可延后', activeClass: 'border-gray-500 bg-gray-50 text-gray-700' }
]

const form = reactive({
  name: '',
  startTime: '09:00',
  endTime: '10:00',
  category: 'study' as TaskCategory,
  priority: 'medium' as TaskPriority,
  note: ''
})

onMounted(() => {
  store.loadTasks()
  store.loadTaskLibrary()
})

function openAddModal() {
  resetForm()
  formModal.visible = true
  formModal.isEdit = false
  formModal.editingId = null
}

function openEditModal(task: Task) {
  resetForm()
  formModal.visible = true
  formModal.isEdit = true
  formModal.editingId = task.id
  form.name = task.name
  form.startTime = task.startTime
  form.endTime = task.endTime
  form.category = task.category
  form.priority = task.priority
  form.note = task.note
}

function closeFormModal() {
  formModal.visible = false
  resetForm()
}

function resetForm() {
  form.name = ''
  form.startTime = '09:00'
  form.endTime = '10:00'
  form.category = 'study'
  form.priority = 'medium'
  form.note = ''
  errorMessage.value = ''
  formModal.isEdit = false
  formModal.editingId = null
}

function handleSubmit() {
  errorMessage.value = ''

  if (form.startTime >= form.endTime) {
    errorMessage.value = '结束时间必须晚于开始时间'
    return
  }

  if (formModal.isEdit && formModal.editingId) {
    store.updateTaskInLibrary(formModal.editingId, {
      name: form.name,
      startTime: form.startTime,
      endTime: form.endTime,
      category: form.category,
      priority: form.priority,
      note: form.note
    })
    successMessage.value = '✅ 任务更新成功！'
  } else {
    store.addTaskToLibrary({
      name: form.name,
      startTime: form.startTime,
      endTime: form.endTime,
      category: form.category,
      priority: form.priority,
      note: form.note
    })
    successMessage.value = '✅ 任务已添加到任务库！'
  }

  closeFormModal()
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

function deleteTask(task: Task) {
  if (confirm(`确定要从任务库中删除「${task.name}」吗？`)) {
    store.deleteTaskFromLibrary(task.id)
  }
}

function addToToday(task: Task) {
  const result = store.addTaskFromLibraryToToday(task.id)
  if (result.success) {
    successMessage.value = `✅ 「${task.name}」已添加到今日任务！`
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } else if (result.conflict) {
    conflictModal.taskName = task.name
    conflictModal.conflictingTasks = result.conflict.conflictingTasks
    conflictModal.visible = true
  }
}

function closeConflictModal() {
  conflictModal.visible = false
  conflictModal.taskName = ''
  conflictModal.conflictingTasks = []
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

function getTaskBorderClass(category: string): string {
  const classes: Record<string, string> = {
    study: 'border-blue-200 hover:border-blue-400',
    work: 'border-purple-200 hover:border-purple-400',
    rest: 'border-green-200 hover:border-green-400',
    sport: 'border-orange-200 hover:border-orange-400'
  }
  return classes[category] || 'border-gray-200 hover:border-gray-400'
}

function getPriorityBgClass(priority: string): string {
  const classes: Record<string, string> = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-gray-100 text-gray-700'
  }
  return classes[priority] || classes.medium
}
</script>
