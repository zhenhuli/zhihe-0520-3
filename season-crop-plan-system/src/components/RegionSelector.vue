<template>
  <n-card title="地域与气候选择" :bordered="false">
    <n-form label-placement="top" label-width="auto">
      <n-form-item label="选择地区">
        <n-select
          v-model:value="selectedRegion"
          :options="regionOptions"
          placeholder="请选择种植地区"
          @update:value="onRegionChange"
        />
      </n-form-item>
      <n-form-item label="气候类型">
        <n-select
          v-model:value="selectedClimate"
          :options="climateOptions"
          placeholder="请选择气候类型"
          @update:value="onClimateChange"
        />
      </n-form-item>
      <n-form-item label="土地面积（亩）">
        <n-input-number
          v-model:value="landArea"
          :min="0.1"
          :max="10000"
          placeholder="请输入土地面积"
          style="width: 100%"
          @update:value="onAreaChange"
        />
      </n-form-item>
    </n-form>

    <n-divider />

    <div v-if="selectedRegionInfo" class="region-info">
      <n-descriptions :column="1" bordered>
        <n-descriptions-item label="地区名称">
          {{ selectedRegionInfo.name }}
        </n-descriptions-item>
        <n-descriptions-item label="包含省份">
          {{ selectedRegionInfo.provinces.join('、') }}
        </n-descriptions-item>
        <n-descriptions-item label="气候类型">
          {{ selectedRegionInfo.climateName }}
        </n-descriptions-item>
        <n-descriptions-item label="无霜期">
          {{ selectedRegionInfo.frostFreeDays }}
        </n-descriptions-item>
        <n-descriptions-item label="年降水量">
          {{ selectedRegionInfo.annualRainfall }}
        </n-descriptions-item>
        <n-descriptions-item label="适宜种植季节">
          {{ selectedRegionInfo.suitableSeasons.join('、') }}
        </n-descriptions-item>
        <n-descriptions-item label="气候特点">
          {{ selectedRegionInfo.description }}
        </n-descriptions-item>
      </n-descriptions>
    </div>
  </n-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { regions, climateTypes } from '../data/regions'

const emit = defineEmits(['selectionChange'])

const selectedRegion = ref(null)
const selectedClimate = ref(null)
const landArea = ref(10)

const regionOptions = computed(() => 
  regions.map(r => ({ label: r.name, value: r.id }))
)

const climateOptions = computed(() => {
  if (selectedRegion.value) {
    const region = regions.find(r => r.id === selectedRegion.value)
    if (region) {
      return climateTypes
        .filter(c => c.id === region.climate)
        .map(c => ({ label: c.name, value: c.id }))
    }
  }
  return climateTypes.map(c => ({ label: c.name, value: c.id }))
})

const selectedRegionInfo = computed(() => {
  if (selectedRegion.value) {
    return regions.find(r => r.id === selectedRegion.value)
  }
  return null
})

function onRegionChange() {
  if (selectedRegionInfo.value) {
    selectedClimate.value = selectedRegionInfo.value.climate
  }
  emitChange()
}

function onClimateChange() {
  emitChange()
}

function onAreaChange() {
  emitChange()
}

function emitChange() {
  emit('selectionChange', {
    region: selectedRegion.value,
    climate: selectedClimate.value,
    area: landArea.value,
    regionInfo: selectedRegionInfo.value
  })
}

watch(selectedRegion, () => {
  if (selectedRegion.value && !selectedClimate.value) {
    const region = regions.find(r => r.id === selectedRegion.value)
    if (region) {
      selectedClimate.value = region.climate
    }
  }
}, { immediate: true })

defineExpose({
  selectedRegion,
  selectedClimate,
  landArea
})
</script>

<style scoped>
.region-info {
  margin-top: 16px;
}
</style>
