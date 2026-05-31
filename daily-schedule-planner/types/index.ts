export type TaskCategory = 'study' | 'work' | 'rest' | 'sport'

export type TaskStatus = 'pending' | 'in-progress' | 'completed'

export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  name: string
  startTime: string
  endTime: string
  category: TaskCategory
  priority: TaskPriority
  note: string
  status: TaskStatus
  completedAt?: string
  incompleteReason?: string
}

export interface DaySchedule {
  date: string
  tasks: Task[]
  completionRate: number
  totalDuration: number
  completedDuration: number
}

export interface CategoryStats {
  category: TaskCategory
  count: number
  duration: number
}

export interface HistoryRecord {
  date: string
  completionRate: number
  totalTasks: number
  completedTasks: number
  totalDuration: number
  categoryStats: CategoryStats[]
}

export interface ConflictResult {
  hasConflict: boolean
  conflictingTasks: Task[]
}
