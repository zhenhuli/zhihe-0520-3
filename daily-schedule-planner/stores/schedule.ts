import { defineStore } from 'pinia'
import type { Task, TaskCategory, TaskStatus, TaskPriority, HistoryRecord, ConflictResult } from '~/types'

export const useScheduleStore = defineStore('schedule', {
  state: () => ({
    tasks: [] as Task[],
    taskLibrary: [] as Task[],
    history: [] as HistoryRecord[],
    currentDate: new Date().toISOString().split('T')[0]
  }),

  getters: {
    sortedTasks: (state) => {
      return [...state.tasks].sort((a, b) => a.startTime.localeCompare(b.startTime))
    },

    sortedTaskLibrary: (state) => {
      return [...state.taskLibrary].sort((a, b) => a.startTime.localeCompare(b.startTime))
    },

    pendingTasks: (state) => {
      return state.tasks.filter(t => t.status === 'pending')
    },

    inProgressTasks: (state) => {
      return state.tasks.filter(t => t.status === 'in-progress')
    },

    completedTasks: (state) => {
      return state.tasks.filter(t => t.status === 'completed')
    },

    completionRate: (state) => {
      if (state.tasks.length === 0) return 0
      const completed = state.tasks.filter(t => t.status === 'completed').length
      return Math.round((completed / state.tasks.length) * 100)
    },

    totalDuration: (state) => {
      return state.tasks.reduce((total, task) => {
        return total + calculateDuration(task.startTime, task.endTime)
      }, 0)
    },

    completedDuration: (state) => {
      return state.tasks
        .filter(t => t.status === 'completed')
        .reduce((total, task) => {
          return total + calculateDuration(task.startTime, task.endTime)
        }, 0)
    },

    freeTime: (state) => {
      const totalMinutes = 24 * 60
      const usedMinutes = state.tasks.reduce((total, task) => {
        return total + calculateDuration(task.startTime, task.endTime)
      }, 0)
      return Math.max(0, totalMinutes - usedMinutes)
    },

    getTasksByCategory: (state) => (category: TaskCategory) => {
      return state.tasks.filter(t => t.category === category)
    },

    getCategoryStats: (state) => {
      const stats: Record<TaskCategory, { count: number; duration: number }> = {
        study: { count: 0, duration: 0 },
        work: { count: 0, duration: 0 },
        rest: { count: 0, duration: 0 },
        sport: { count: 0, duration: 0 }
      }

      state.tasks.forEach(task => {
        stats[task.category].count++
        stats[task.category].duration += calculateDuration(task.startTime, task.endTime)
      })

      return stats
    }
  },

  actions: {
    loadTasks(date?: string) {
      const targetDate = date || this.currentDate
      const saved = localStorage.getItem(`tasks_${targetDate}`)
      if (saved) {
        this.tasks = JSON.parse(saved)
      } else {
        this.tasks = []
      }
      this.updateCurrentTaskStatus()
    },

    saveTasks(date?: string) {
      const targetDate = date || this.currentDate
      localStorage.setItem(`tasks_${targetDate}`, JSON.stringify(this.tasks))
    },

    addTask(task: Omit<Task, 'id' | 'status'>) {
      const newTask: Task = {
        ...task,
        id: generateId(),
        status: 'pending'
      }
      this.tasks.push(newTask)
      this.saveTasks()
      return newTask
    },

    updateTask(id: string, updates: Partial<Task>) {
      const index = this.tasks.findIndex(t => t.id === id)
      if (index !== -1) {
        this.tasks[index] = { ...this.tasks[index], ...updates }
        this.saveTasks()
      }
    },

    deleteTask(id: string) {
      this.tasks = this.tasks.filter(t => t.id !== id)
      this.saveTasks()
    },

    updateTaskStatus(id: string, status: TaskStatus, reason?: string) {
      const task = this.tasks.find(t => t.id === id)
      if (task) {
        task.status = status
        if (status === 'completed') {
          task.completedAt = new Date().toISOString()
          task.incompleteReason = undefined
        } else if (status === 'pending' && reason) {
          task.incompleteReason = reason
          task.completedAt = undefined
        }
        this.saveTasks()
      }
    },

    updateCurrentTaskStatus() {
      const now = new Date()
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

      this.tasks.forEach(task => {
        if (task.status === 'completed') return

        if (currentTime >= task.startTime && currentTime < task.endTime) {
          task.status = 'in-progress'
        } else if (currentTime >= task.endTime) {
          task.status = 'pending'
        } else {
          task.status = 'pending'
        }
      })
    },

    reorderTasks(startIndex: number, endIndex: number) {
      const result = Array.from(this.tasks)
      const [removed] = result.splice(startIndex, 1)
      result.splice(endIndex, 0, removed)
      this.tasks = result
      this.saveTasks()
    },

    loadTaskLibrary() {
      const saved = localStorage.getItem('task_library')
      if (saved) {
        this.taskLibrary = JSON.parse(saved)
      } else {
        this.taskLibrary = []
      }
    },

    saveTaskLibrary() {
      localStorage.setItem('task_library', JSON.stringify(this.taskLibrary))
    },

    addTaskToLibrary(task: Omit<Task, 'id' | 'status'>) {
      const newTask: Task = {
        ...task,
        id: generateId(),
        status: 'pending'
      }
      this.taskLibrary.push(newTask)
      this.saveTaskLibrary()
      return newTask
    },

    updateTaskInLibrary(id: string, updates: Partial<Task>) {
      const index = this.taskLibrary.findIndex(t => t.id === id)
      if (index !== -1) {
        this.taskLibrary[index] = { ...this.taskLibrary[index], ...updates }
        this.saveTaskLibrary()
      }
    },

    deleteTaskFromLibrary(id: string) {
      this.taskLibrary = this.taskLibrary.filter(t => t.id !== id)
      this.saveTaskLibrary()
    },

    checkConflict(startTime: string, endTime: string, excludeId?: string): ConflictResult {
      const conflictingTasks = this.tasks.filter(task => {
        if (excludeId && task.id === excludeId) return false
        return !(endTime <= task.startTime || startTime >= task.endTime)
      })
      return {
        hasConflict: conflictingTasks.length > 0,
        conflictingTasks
      }
    },

    addTaskFromLibraryToToday(libraryTaskId: string): { success: boolean; conflict?: ConflictResult } {
      const libraryTask = this.taskLibrary.find(t => t.id === libraryTaskId)
      if (!libraryTask) {
        return { success: false }
      }

      const conflict = this.checkConflict(libraryTask.startTime, libraryTask.endTime)
      if (conflict.hasConflict) {
        return { success: false, conflict }
      }

      const newTask: Task = {
        ...libraryTask,
        id: generateId(),
        status: 'pending'
      }
      this.tasks.push(newTask)
      this.saveTasks()
      return { success: true }
    },

    archiveDay() {
      const record: HistoryRecord = {
        date: this.currentDate,
        completionRate: this.completionRate,
        totalTasks: this.tasks.length,
        completedTasks: this.completedTasks.length,
        totalDuration: this.totalDuration,
        categoryStats: Object.entries(this.getCategoryStats).map(([category, stats]) => ({
          category: category as TaskCategory,
          count: stats.count,
          duration: stats.duration
        }))
      }

      const existingIndex = this.history.findIndex(h => h.date === this.currentDate)
      if (existingIndex !== -1) {
        this.history[existingIndex] = record
      } else {
        this.history.push(record)
      }
      this.saveHistory()
    },

    loadHistory() {
      const saved = localStorage.getItem('schedule_history')
      if (saved) {
        this.history = JSON.parse(saved)
      }
    },

    saveHistory() {
      localStorage.setItem('schedule_history', JSON.stringify(this.history))
    },

    getHistoryByDate(date: string) {
      return this.history.find(h => h.date === date)
    },

    setCurrentDate(date: string) {
      this.currentDate = date
      this.loadTasks(date)
    }
  }
})

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

function calculateDuration(startTime: string, endTime: string): number {
  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)
  return (endHour * 60 + endMin) - (startHour * 60 + startMin)
}
