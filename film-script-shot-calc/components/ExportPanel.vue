<script setup lang="ts">
import type { Shot, CrewRole, ProductionConfig, CalculationResult } from '~/types'

const props = defineProps<{
  shots: Shot[]
  crew: CrewRole[]
  config: ProductionConfig
  result: CalculationResult
}>()

const projectInfo = ref({
  name: '',
  director: '',
  date: new Date().toISOString().split('T')[0],
})

const { formatMinutes, formatCurrency } = useCalculator()

const generateExportData = () => {
  return {
    projectInfo: projectInfo.value,
    shots: props.shots,
    crew: props.crew,
    config: props.config,
    result: props.result,
  }
}

const exportToExcel = async () => {
  try {
    const XLSX = await import('xlsx')

    const wb = XLSX.utils.book_new()

    const summaryData = [
      ['项目名称', projectInfo.value.name],
      ['导演', projectInfo.value.director],
      ['导出日期', projectInfo.value.date],
      [],
      ['测算结果'],
      ['总镜头数', props.result.totalShots, '个'],
      ['拍摄总时长', formatMinutes(props.result.totalWorkMinutes)],
      ['拍摄天数', props.result.shootingDays, '天'],
      ['拍摄周数', props.result.shootingWeeks.toFixed(1), '周'],
      ['人员总数', props.result.crewCount, '人'],
      ['单日成本', formatCurrency(props.result.dailyCost)],
      ['总成本', formatCurrency(props.result.totalCost)],
    ]

    const shotsData = [
      ['序号', '场景号', '镜头号', '描述', '拍摄时长(分钟)', '机位数量', '布场时间(分钟)', '难度'],
      ...props.shots.map((shot, index) => [
        index + 1,
        shot.sceneNumber,
        shot.shotNumber,
        shot.description,
        shot.shotDuration,
        shot.cameraCount,
        shot.setupTime,
        shot.complexity === 'easy' ? '简单' : shot.complexity === 'medium' ? '中等' : '复杂',
      ]),
    ]

    const crewData = [
      ['序号', '岗位名称', '人数', '日薪(元)', '小计(元/天)'],
      ...props.crew.map((role, index) => [
        index + 1,
        role.name,
        role.count,
        role.dailyRate,
        role.count * role.dailyRate,
      ]),
    ]

    const ws1 = XLSX.utils.aoa_to_sheet(summaryData)
    const ws2 = XLSX.utils.aoa_to_sheet(shotsData)
    const ws3 = XLSX.utils.aoa_to_sheet(crewData)

    XLSX.utils.book_append_sheet(wb, ws1, '项目概览')
    XLSX.utils.book_append_sheet(wb, ws2, '镜头明细')
    XLSX.utils.book_append_sheet(wb, ws3, '人员配置')

    const fileName = `拍摄统筹明细表_${projectInfo.value.name || '未命名项目'}_${projectInfo.value.date}.xlsx`
    XLSX.writeFile(wb, fileName)
  } catch (error) {
    console.error('导出失败:', error)
    alert('导出失败，请重试')
  }
}

const exportToJSON = () => {
  const data = generateExportData()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `拍摄统筹明细表_${projectInfo.value.name || '未命名项目'}_${projectInfo.value.date}.json`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="card">
    <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
      <span class="i-lucide-file-down w-6 h-6 text-green-600"></span>
      导出拍摄统筹明细表
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div>
        <label class="label">项目名称</label>
        <input
          v-model="projectInfo.name"
          type="text"
          class="input"
          placeholder="请输入项目名称"
        />
      </div>
      <div>
        <label class="label">导演</label>
        <input
          v-model="projectInfo.director"
          type="text"
          class="input"
          placeholder="请输入导演姓名"
        />
      </div>
      <div>
        <label class="label">导出日期</label>
        <input
          v-model="projectInfo.date"
          type="date"
          class="input"
        />
      </div>
    </div>

    <div class="flex gap-3">
      <button
        class="btn btn-success flex items-center gap-2"
        @click="exportToExcel"
      >
        <span class="i-lucide-file-spreadsheet w-5 h-5"></span>
        导出 Excel
      </button>
      <button
        class="btn btn-secondary flex items-center gap-2"
        @click="exportToJSON"
      >
        <span class="i-lucide-file-json w-5 h-5"></span>
        导出 JSON
      </button>
    </div>
  </div>
</template>
