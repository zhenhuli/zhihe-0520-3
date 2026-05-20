<script setup lang="ts">
import type { Shot, CrewRole, ProductionConfig } from '~/types'

const { calculateResult } = useCalculator()

const activeTab = ref<'shots' | 'crew' | 'config'>('shots')

const config = ref<ProductionConfig>({
  workingHoursPerDay: 10,
  daysPerWeek: 5,
  overtimeRate: 1.5,
})

const shots = ref<Shot[]>([
  {
    id: '1',
    sceneNumber: '01',
    shotNumber: '001',
    description: '主角走进房间的全景镜头',
    shotDuration: 2,
    cameraCount: 2,
    setupTime: 30,
    complexity: 'medium',
  },
  {
    id: '2',
    sceneNumber: '01',
    shotNumber: '002',
    description: '主角面部特写',
    shotDuration: 1,
    cameraCount: 1,
    setupTime: 15,
    complexity: 'easy',
  },
])

const crew = ref<CrewRole[]>([
  { id: '1', name: '导演', count: 1, dailyRate: 2000 },
  { id: '2', name: '摄影师', count: 2, dailyRate: 1500 },
  { id: '3', name: '灯光师', count: 2, dailyRate: 1200 },
  { id: '4', name: '录音师', count: 1, dailyRate: 1000 },
  { id: '5', name: '场务', count: 3, dailyRate: 500 },
])

const result = computed(() => {
  return calculateResult(shots.value, crew.value, config.value)
})

function addShot() {
  const newShot: Shot = {
    id: Date.now().toString(),
    sceneNumber: '',
    shotNumber: '',
    description: '',
    shotDuration: 1,
    cameraCount: 1,
    setupTime: 15,
    complexity: 'medium',
  }
  shots.value.push(newShot)
}

function updateShot(index: number, shot: Shot) {
  shots.value[index] = shot
}

function removeShot(index: number) {
  shots.value.splice(index, 1)
}

function addCrew() {
  const newCrew: CrewRole = {
    id: Date.now().toString(),
    name: '',
    count: 1,
    dailyRate: 500,
  }
  crew.value.push(newCrew)
}

function updateCrew(index: number, role: CrewRole) {
  crew.value[index] = role
}

function removeCrew(index: number) {
  crew.value.splice(index, 1)
}

const tabs = [
  { key: 'shots', label: '镜头管理', icon: 'i-lucide-film' },
  { key: 'crew', label: '人员配置', icon: 'i-lucide-users' },
  { key: 'config', label: '拍摄配置', icon: 'i-lucide-settings' },
]
</script>

<template>
  <div class="min-h-screen">
    <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span class="i-lucide-clapperboard w-6 h-6 text-white"></span>
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-800">影视拍摄工时成本测算工具</h1>
              <p class="text-sm text-gray-500">Film Production Cost Calculator</p>
            </div>
          </div>
          <div class="text-sm text-gray-500">
            {{ new Date().toLocaleDateString('zh-CN') }}
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white rounded-xl shadow-md p-1 flex gap-1">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              :class="[
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all',
                activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100',
              ]"
              @click="activeTab = tab.key as any"
            >
              <span :class="[tab.icon, 'w-5 h-5']"></span>
              {{ tab.label }}
            </button>
          </div>

          <div v-show="activeTab === 'shots'" class="space-y-4">
            <div class="flex justify-between items-center">
              <h2 class="text-lg font-semibold text-gray-800">
                镜头列表 ({{ shots.length }} 个)
              </h2>
              <button
                class="btn btn-primary flex items-center gap-2"
                @click="addShot"
              >
                <span class="i-lucide-plus w-5 h-5"></span>
                添加镜头
              </button>
            </div>

            <ShotForm
              v-for="(shot, index) in shots"
              :key="shot.id"
              :shot="shot"
              :index="index"
              @update="updateShot(index, $event)"
              @remove="removeShot(index)"
            />

            <div
              v-if="shots.length === 0"
              class="card text-center py-12"
            >
              <span class="i-lucide-film w-16 h-16 text-gray-300 mx-auto mb-4"></span>
              <p class="text-gray-500 mb-4">暂无镜头数据</p>
              <button
                class="btn btn-primary"
                @click="addShot"
              >
                添加第一个镜头
              </button>
            </div>
          </div>

          <div v-show="activeTab === 'crew'" class="card space-y-4">
            <div class="flex justify-between items-center">
              <h2 class="text-lg font-semibold text-gray-800">
                人员配置 ({{ crew.reduce((sum, c) => sum + c.count, 0) }} 人)
              </h2>
              <button
                class="btn btn-primary flex items-center gap-2"
                @click="addCrew"
              >
                <span class="i-lucide-user-plus w-5 h-5"></span>
                添加岗位
              </button>
            </div>

            <CrewForm
              v-for="(role, index) in crew"
              :key="role.id"
              :crew="role"
              :index="index"
              @update="updateCrew(index, $event)"
              @remove="removeCrew(index)"
            />

            <div
              v-if="crew.length === 0"
              class="text-center py-12"
            >
              <span class="i-lucide-users w-16 h-16 text-gray-300 mx-auto mb-4"></span>
              <p class="text-gray-500 mb-4">暂无人员配置</p>
              <button
                class="btn btn-primary"
                @click="addCrew"
              >
                添加第一个岗位
              </button>
            </div>
          </div>

          <div v-show="activeTab === 'config'">
            <ConfigForm
              :config="config"
              @update="config = $event"
            />
          </div>

          <ExportPanel
            :shots="shots"
            :crew="crew"
            :config="config"
            :result="result"
          />
        </div>

        <div class="lg:col-span-1 space-y-6">
          <ResultSummary :result="result" />

          <div class="card">
            <h3 class="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span class="i-lucide-info w-5 h-5 text-blue-500"></span>
              测算说明
            </h3>
            <ul class="text-sm text-gray-600 space-y-2">
              <li class="flex items-start gap-2">
                <span class="i-lucide-check w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"></span>
                <span>拍摄难度系数：简单 x1.0，中等 x1.5，复杂 x2.0</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="i-lucide-check w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"></span>
                <span>拍摄时长 = 单镜头时长 × 机位数量 × 难度系数</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="i-lucide-check w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"></span>
                <span>总工时 = 拍摄用时 + 布场用时</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="i-lucide-check w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"></span>
                <span>拍摄天数 = 总工时 ÷ 每日工作时长 (向上取整)</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="i-lucide-check w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"></span>
                <span>总成本 = 单日人力成本 × 拍摄天数</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>

    <footer class="bg-white border-t border-gray-200 mt-12">
      <div class="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
        影视拍摄工时成本测算工具 · Film Script Shot Calculator
      </div>
    </footer>
  </div>
</template>
