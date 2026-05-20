<template>
  <div class="min-vh-100 bg-light">
    <header class="bg-white shadow-sm py-3 mb-4">
      <div class="container">
        <div class="d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center">
            <i class="bi bi-map-fill text-primary fs-3 me-3"></i>
            <div>
              <h1 class="h4 mb-0">景区客流疏导模拟调度系统</h1>
              <p class="text-muted small mb-0">Scenic Area Flow Control Simulation System</p>
            </div>
          </div>
          <div class="d-flex align-items-center gap-3">
            <span class="badge bg-secondary">
              <i class="bi bi-clock me-1"></i>
              模拟时间: {{ formatTime(timeStep) }}
            </span>
            <span
              class="badge"
              :class="isRunning ? 'bg-success' : 'bg-secondary'"
            >
              <i :class="isRunning ? 'bi bi-play-fill' : 'bi bi-pause-fill'" class="me-1"></i>
              {{ isRunning ? '运行中' : '已暂停' }}
            </span>
          </div>
        </div>
      </div>
    </header>

    <main class="container">
      <div class="row g-4">
        <div class="col-lg-3">
          <ControlPanel
            :is-running="isRunning"
            :holiday-mode="holidayMode"
            :current-speed="simulationSpeed"
            :inflow-rate="inflowRate"
            @start="startSimulation"
            @stop="stopSimulation"
            @reset="resetSimulation"
            @speed-change="setSpeed"
            @holiday-toggle="toggleHoliday"
            @inflow-change="setInflow"
          />
          
          <div class="mt-4">
            <FlowChart :history="visitorHistory" />
          </div>
        </div>

        <div class="col-lg-6">
          <div class="control-panel mb-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="mb-0 text-primary">
                <i class="bi bi-map me-2"></i>景区地图
              </h5>
              <div class="d-flex gap-2">
                <span
                  v-for="status in statusLegend"
                  :key="status.level"
                  class="badge small"
                  :style="{ backgroundColor: status.color }"
                >
                  {{ status.text }}
                </span>
              </div>
            </div>
            <ScenicMap
              :areas="areas"
              :connections="areaConnections"
              :selected-area="selectedArea"
              :route-path="displayRoute"
              @area-click="handleAreaClick"
            />
          </div>

          <div v-if="selectedArea" class="control-panel">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h5 class="mb-1">{{ selectedArea.name }}</h5>
                <p class="text-muted small mb-2">{{ selectedArea.description }}</p>
              </div>
              <button
                class="btn-close"
                @click="selectedArea = null"
              ></button>
            </div>
            <div class="row g-2 text-center">
              <div class="col-4">
                <div class="stat-card p-2">
                  <div class="fw-bold text-primary">{{ selectedArea.currentVisitors }}</div>
                  <div class="text-muted small">当前游客</div>
                </div>
              </div>
              <div class="col-4">
                <div class="stat-card p-2">
                  <div class="fw-bold text-secondary">{{ selectedArea.maxCapacity }}</div>
                  <div class="text-muted small">最大承载</div>
                </div>
              </div>
              <div class="col-4">
                <div class="stat-card p-2">
                  <div
                    class="fw-bold"
                    :class="getStatusLevel(selectedArea.currentVisitors, selectedArea.maxCapacity).level === 'normal' ? 'text-success' : 'text-danger'"
                  >
                    {{ Math.round(selectedArea.currentVisitors / selectedArea.maxCapacity * 100) }}%
                  </div>
                  <div class="text-muted small">承载率</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-3">
          <StatusPanel
            :areas="areas"
            :time-step="timeStep"
            @area-click="handleAreaClick"
          />
          
          <div class="mt-4">
            <DiversionPanel
              :areas="areas"
              @area-click="handleAreaClick"
              @show-route="showRoute"
            />
          </div>
        </div>
      </div>
    </main>

    <footer class="bg-white border-top mt-5 py-3">
      <div class="container text-center text-muted small">
        景区客流疏导模拟调度系统 v1.0 | Vue3 + Webpack + Bootstrap5
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { scenicAreas, areaConnections, getStatusLevel } from '@/utils/scenicData'
import { FlowSimulator } from '@/utils/flowSimulation'
import ScenicMap from '@/components/ScenicMap.vue'
import ControlPanel from '@/components/ControlPanel.vue'
import StatusPanel from '@/components/StatusPanel.vue'
import DiversionPanel from '@/components/DiversionPanel.vue'
import FlowChart from '@/components/FlowChart.vue'

const areas = ref(JSON.parse(JSON.stringify(scenicAreas)))
const isRunning = ref(false)
const holidayMode = ref(false)
const simulationSpeed = ref(1)
const inflowRate = ref(50)
const timeStep = ref(0)
const visitorHistory = ref([])
const selectedArea = ref(null)
const displayRoute = ref([])

let simulator = null

const statusLegend = [
  { level: 'normal', text: '正常', color: '#28a745' },
  { level: 'warning', text: '较拥挤', color: '#ffc107' },
  { level: 'danger', text: '拥挤', color: '#dc3545' },
  { level: 'congested', text: '严重拥堵', color: '#721c24' }
]

const initSimulator = () => {
  simulator = new FlowSimulator(scenicAreas)
  simulator.onUpdate = (data) => {
    areas.value = data.areas
    visitorHistory.value = data.history
    timeStep.value = data.timeStep
  }
}

const startSimulation = () => {
  if (!simulator) initSimulator()
  simulator.setHolidayMode(holidayMode.value)
  simulator.setSpeed(simulationSpeed.value)
  simulator.inflowRate = inflowRate.value
  simulator.start()
  isRunning.value = true
}

const stopSimulation = () => {
  if (simulator) {
    simulator.stop()
  }
  isRunning.value = false
}

const resetSimulation = () => {
  if (simulator) {
    simulator.reset()
  }
  isRunning.value = false
  selectedArea.value = null
  displayRoute.value = []
}

const setSpeed = (speed) => {
  simulationSpeed.value = speed
  if (simulator) {
    simulator.setSpeed(speed)
  }
}

const toggleHoliday = () => {
  holidayMode.value = !holidayMode.value
  if (simulator) {
    simulator.setHolidayMode(holidayMode.value)
  }
}

const setInflow = (rate) => {
  inflowRate.value = rate
  if (simulator) {
    simulator.inflowRate = rate
  }
}

const handleAreaClick = (area) => {
  selectedArea.value = area
  displayRoute.value = []
}

const showRoute = (path) => {
  displayRoute.value = path
}

const formatTime = (step) => {
  const hours = Math.floor(step / 60)
  const minutes = step % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

watch(areas, (newAreas) => {
  if (selectedArea.value) {
    const updated = newAreas.find(a => a.id === selectedArea.value.id)
    if (updated) {
      selectedArea.value = updated
    }
  }
}, { deep: true })

onMounted(() => {
  initSimulator()
})

onUnmounted(() => {
  if (simulator) {
    simulator.stop()
  }
})
</script>
