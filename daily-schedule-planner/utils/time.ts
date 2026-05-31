export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}小时${mins > 0 ? ` ${mins}分钟` : ''}`
  }
  return `${mins}分钟`
}

export function formatTime(time: string): string {
  return time
}

export function getDuration(startTime: string, endTime: string): number {
  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)
  return (endHour * 60 + endMin) - (startHour * 60 + startMin)
}

export function addMinutes(time: string, minutes: number): string {
  const [hour, min] = time.split(':').map(Number)
  let totalMinutes = hour * 60 + min + minutes
  totalMinutes = Math.max(0, Math.min(24 * 60 - 1, totalMinutes))
  const newHour = Math.floor(totalMinutes / 60)
  const newMin = totalMinutes % 60
  return `${String(newHour).padStart(2, '0')}:${String(newMin).padStart(2, '0')}`
}

export function getTimeToMinutes(time: string): number {
  const [hour, min] = time.split(':').map(Number)
  return hour * 60 + min
}

export function minutesToTime(minutes: number): string {
  const hour = Math.floor(minutes / 60)
  const min = minutes % 60
  return `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

export function formatDate(date: string): string {
  const d = new Date(date)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

export function getDayOfWeek(date: string): string {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const d = new Date(date)
  return days[d.getDay()]
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    study: '学习',
    work: '工作',
    rest: '休息',
    sport: '运动'
  }
  return labels[category] || category
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    study: 'blue',
    work: 'purple',
    rest: 'green',
    sport: 'orange'
  }
  return colors[category] || 'gray'
}

export function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高'
  }
  return labels[priority] || priority
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: '未完成',
    'in-progress': '进行中',
    completed: '已完成'
  }
  return labels[status] || status
}
