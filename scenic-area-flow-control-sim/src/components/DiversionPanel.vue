<template>
  <div class="control-panel">
    <h5 class="mb-3 text-warning">
      <i class="bi bi-sign-turn-slight-right me-2"></i>分流路线方案
    </h5>

    <div v-if="congestedAreas.length === 0" class="alert alert-success text-center">
      <i class="bi bi-check-circle-fill me-2"></i>
      当前所有片区运行正常，无拥堵情况
    </div>

    <div v-else>
      <div class="alert alert-danger mb-3">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        检测到 <strong>{{ congestedAreas.length }}</strong> 个拥堵片区
      </div>

      <div class="mb-3">
        <h6 class="text-muted mb-2">拥堵点位</h6>
        <div class="d-flex flex-wrap gap-2">
          <span
            v-for="area in congestedAreas"
            :key="area.id"
            class="badge bg-danger"
            style="cursor: pointer;"
            @click="$emit('area-click', area)"
          >
            {{ area.name }} ({{ Math.round(area.currentVisitors / area.maxCapacity * 100) }}%)
          </span>
        </div>
      </div>

      <div v-if="selectedCongestedArea" class="mb-3">
        <div class="card border-warning">
          <div class="card-header bg-warning text-dark">
            <i class="bi bi-geo-alt-fill me-2"></i>
            {{ selectedCongestedArea.name }} - 分流方案
          </div>
          <div class="card-body p-2">
            <div v-if="diversionRoutes.length === 0" class="text-center text-muted small">
              暂无可用分流路线
            </div>
            <div v-else class="list-group list-group-flush">
              <div
                v-for="(route, idx) in diversionRoutes"
                :key="idx"
                class="list-group-item p-2"
                style="cursor: pointer;"
                @click="$emit('show-route', route.route.path)"
              >
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <div class="fw-bold small">
                      方案 {{ idx + 1 }}: 前往 {{ route.to.name }}
                    </div>
                    <div class="text-muted" style="font-size: 0.75rem;">
                      距离: {{ route.route.distance.toFixed(1) }} · 
                      承载率: {{ Math.round(route.to.currentVisitors / route.to.maxCapacity * 100) }}%
                    </div>
                  </div>
                  <i class="bi bi-arrow-right text-primary"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mb-3">
        <h6 class="text-muted mb-2">智能路线规划</h6>
        <div class="row g-2">
          <div class="col-6">
            <label class="form-label small">起点</label>
            <select class="form-select form-select-sm" v-model="routeStart">
              <option value="">选择起点</option>
              <option v-for="area in areas" :key="area.id" :value="area.id">
                {{ area.name }}
              </option>
            </select>
          </div>
          <div class="col-6">
            <label class="form-label small">终点</label>
            <select class="form-select form-select-sm" v-model="routeEnd">
              <option value="">选择终点</option>
              <option v-for="area in areas" :key="area.id" :value="area.id">
                {{ area.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="form-check form-switch mt-2">
          <input class="form-check-input" type="checkbox" id="avoidCongested" v-model="avoidCongested">
          <label class="form-check-label small" for="avoidCongested">避开拥堵区域</label>
        </div>
        <button
          class="btn btn-primary btn-sm w-100 mt-2"
          :disabled="!routeStart || !routeEnd"
          @click="calculateRoute"
        >
          <i class="bi bi-route me-1"></i>规划最优路线
        </button>

        <div v-if="calculatedRoute && calculatedRoute.path.length > 0" class="mt-3">
          <div class="alert alert-info p-2">
            <div class="small fw-bold">推荐路线:</div>
            <div class="text-muted" style="font-size: 0.75rem;">
              {{ calculatedRoute.pathAreas.map(a => a.name).join(' → ') }}
            </div>
            <div class="mt-1 d-flex justify-content-between small">
              <span>总距离: {{ calculatedRoute.distance.toFixed(1) }}</span>
              <span v-if="calculatedRoute.hasCongested" class="text-warning">
                <i class="bi bi-exclamation-triangle"></i> 途经拥堵区
              </span>
              <span v-else class="text-success">
                <i class="bi bi-check-circle"></i> 路线通畅
              </span>
            </div>
            <button
              class="btn btn-sm btn-outline-primary w-100 mt-2"
              @click="$emit('show-route', calculatedRoute.path)"
            >
              <i class="bi bi-eye me-1"></i>在地图上显示
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { generateDiversionRoutes, findOptimalRoute } from '@/utils/flowSimulation'
import { getCongestedAreas } from '@/utils/scenicData'

const props = defineProps({
  areas: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['area-click', 'show-route'])

const routeStart = ref('')
const routeEnd = ref('')
const avoidCongested = ref(true)
const calculatedRoute = ref(null)
const selectedCongestedArea = ref(null)

const congestedAreas = computed(() => getCongestedAreas(props.areas))

const diversionRoutes = computed(() => {
  if (!selectedCongestedArea.value) return []
  return generateDiversionRoutes(props.areas, selectedCongestedArea.value.id)
})

watch(congestedAreas, (newVal) => {
  if (newVal.length > 0 && !selectedCongestedArea.value) {
    selectedCongestedArea.value = newVal[0]
  } else if (newVal.length === 0) {
    selectedCongestedArea.value = null
  }
}, { immediate: true })

const calculateRoute = () => {
  if (!routeStart.value || !routeEnd.value) return
  calculatedRoute.value = findOptimalRoute(props.areas, routeStart.value, routeEnd.value, avoidCongested.value)
  emit('show-route', calculatedRoute.value.path)
}
</script>
