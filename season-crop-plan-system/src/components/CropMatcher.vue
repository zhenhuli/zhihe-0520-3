<template>
  <n-card title="适宜作物匹配" :bordered="false">
    <div class="filter-bar">
      <n-select
        v-model:value="selectedCategory"
        :options="categoryOptions"
        placeholder="作物分类筛选"
        style="width: 180px"
      />
      <n-tag v-if="suitableCrops.length > 0" type="success">
        匹配到 {{ suitableCrops.length }} 种适宜作物
      </n-tag>
      <n-tag v-else-if="region && climate" type="warning">
        未匹配到适宜作物
      </n-tag>
      <n-tag v-else type="info">
        请先选择地区和气候类型
      </n-tag>
    </div>

    <n-divider />

    <div class="crop-list" v-if="suitableCrops.length > 0">
      <n-space vertical :size="12">
        <n-card
          v-for="crop in filteredCrops"
          :key="crop.id"
          hoverable
          class="crop-card"
          :class="{ selected: selectedCropIds.includes(crop.id) }"
          @click="toggleCropSelection(crop.id)"
        >
          <template #header>
            <div class="crop-header">
              <div class="crop-title">
                <n-tag :type="getCategoryTagType(crop.category)" size="small">
                  {{ crop.category }}
                </n-tag>
                <span class="crop-name">{{ crop.name }}</span>
              </div>
              <n-checkbox :checked="selectedCropIds.includes(crop.id)" />
            </div>
          </template>
          
          <n-descriptions :column="3" size="small">
            <n-descriptions-item label="生长周期">
              {{ crop.growthDays }} 天
            </n-descriptions-item>
            <n-descriptions-item label="采收期">
              {{ crop.harvestPeriod }}
            </n-descriptions-item>
            <n-descriptions-item label="亩产量">
              {{ crop.yieldPerMu }} {{ crop.yieldUnit }}
            </n-descriptions-item>
            <n-descriptions-item label="用种量">
              {{ crop.seedRatePerMu }} {{ crop.seedUnit }}
            </n-descriptions-item>
            <n-descriptions-item label="需水量">
              {{ crop.waterRequirement }}
            </n-descriptions-item>
            <n-descriptions-item label="播种季节">
              {{ crop.sowingSeasons.map(s => s.season).join('、') }}
            </n-descriptions-item>
          </n-descriptions>
          
          <div class="crop-desc">
            <n-text depth="3">{{ crop.description }}</n-text>
          </div>

          <n-collapse v-if="selectedCropIds.includes(crop.id)">
            <n-collapse-item title="查看详细种植方案" name="1">
              <div class="crop-detail">
                <n-divider />
                <h4>播种时间安排</h4>
                <n-space>
                  <n-tag v-for="season in crop.sowingSeasons" :key="season.season" type="info">
                    {{ season.season }}: {{ formatMonths(season.months) }}播种, {{ formatMonths(season.harvestMonths) }}收获
                  </n-tag>
                </n-space>
                
                <n-divider />
                <h4>肥料施用方案</h4>
                <n-descriptions :column="1" size="small">
                  <n-descriptions-item label="基肥">
                    {{ crop.fertilizer.base.name }} {{ crop.fertilizer.base.amount }} {{ crop.fertilizer.base.unit }}
                  </n-descriptions-item>
                  <n-descriptions-item
                    v-for="(dressing, index) in crop.fertilizer.topDressing"
                    :key="index"
                    :label="`追肥 - ${dressing.stage}`"
                  >
                    {{ dressing.name }} {{ dressing.amount }} {{ dressing.unit }}
                  </n-descriptions-item>
                </n-descriptions>

                <n-divider />
                <h4>水肥配比测算（{{ area }}亩）</h4>
                <CalculationResult :crop="crop" :area="area" />
              </div>
            </n-collapse-item>
          </n-collapse>
        </n-card>
      </n-space>
    </div>

    <n-empty v-else-if="region && climate" description="暂无匹配的作物，请调整筛选条件" />
    <n-empty v-else description="请先选择地区和气候类型" />

    <n-divider v-if="selectedCrops.length > 0" />
    
    <div v-if="selectedCrops.length > 0" class="selection-summary">
      <n-space justify="space-between" align="center" style="width: 100%">
        <div>
          已选择 <n-tag type="success">{{ selectedCrops.length }}</n-tag> 种作物
        </div>
        <n-space>
          <n-button size="small" @click="clearSelection">
            清空选择
          </n-button>
          <n-button type="primary" size="small" @click="generatePlan">
            生成种植计划
          </n-button>
        </n-space>
      </n-space>
    </div>
  </n-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { crops, cropCategories } from '../data/crops'
import { getSuitableCrops } from '../utils/calculator'
import CalculationResult from './CalculationResult.vue'

const props = defineProps({
  region: String,
  climate: String,
  area: {
    type: Number,
    default: 10
  }
})

const emit = defineEmits(['generatePlan'])

const selectedCategory = ref('all')
const selectedCropIds = ref([])

const categoryOptions = computed(() => 
  cropCategories.map(c => ({ label: c.name, value: c.id }))
)

const suitableCrops = computed(() => {
  if (props.region && props.climate) {
    return getSuitableCrops(props.region, props.climate, crops)
  }
  return []
})

const filteredCrops = computed(() => {
  if (selectedCategory.value === 'all') {
    return suitableCrops.value
  }
  return suitableCrops.value.filter(c => c.category === selectedCategory.value)
})

const selectedCrops = computed(() => {
  return suitableCrops.value.filter(c => selectedCropIds.value.includes(c.id))
})

function getCategoryTagType(category) {
  const types = {
    '粮食作物': 'success',
    '经济作物': 'warning',
    '蔬菜作物': 'primary',
    '果树作物': 'info'
  }
  return types[category] || 'default'
}

function formatMonths(months) {
  return months.map(m => `${m}月`).join('-')
}

function toggleCropSelection(cropId) {
  const index = selectedCropIds.value.indexOf(cropId)
  if (index > -1) {
    selectedCropIds.value.splice(index, 1)
  } else {
    selectedCropIds.value.push(cropId)
  }
}

function clearSelection() {
  selectedCropIds.value = []
}

function generatePlan() {
  emit('generatePlan', {
    crops: selectedCrops.value,
    area: props.area
  })
}

watch([() => props.region, () => props.climate], () => {
  selectedCropIds.value = []
  selectedCategory.value = 'all'
})
</script>

<style scoped>
.filter-bar {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
}

.crop-card {
  cursor: pointer;
  transition: all 0.3s;
}

.crop-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.crop-card.selected {
  border: 2px solid #18a058;
}

.crop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.crop-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.crop-name {
  font-size: 16px;
  font-weight: 600;
}

.crop-desc {
  margin-top: 12px;
}

.crop-detail {
  margin-top: 16px;
}

.crop-detail h4 {
  margin: 12px 0;
  color: #2080f0;
}

.selection-summary {
  padding: 16px;
  background: #f0f2f5;
  border-radius: 8px;
}
</style>
