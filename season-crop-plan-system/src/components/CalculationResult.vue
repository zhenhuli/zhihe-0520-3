<template>
  <n-descriptions :column="2" bordered size="small">
    <n-descriptions-item label="种子用量">
      <n-text strong type="success">{{ seedResult.amount }} {{ seedResult.unit }}</n-text>
      <n-text depth="3"> ({{ seedResult.perMu }} {{ seedResult.perMuUnit }})</n-text>
    </n-descriptions-item>
    <n-descriptions-item label="预计产量">
      <n-text strong type="primary">{{ yieldResult.amount }} {{ yieldResult.unit }}</n-text>
      <n-text depth="3"> ({{ yieldResult.perMu }} {{ yieldResult.perMuUnit }})</n-text>
    </n-descriptions-item>
    <n-descriptions-item label="基肥用量">
      <n-text strong>{{ fertilizerResult.base.amount }} {{ fertilizerResult.base.unit }}</n-text>
      <n-text depth="3"> ({{ fertilizerResult.base.name }})</n-text>
    </n-descriptions-item>
    <n-descriptions-item label="总需水量">
      <n-text strong type="info">{{ waterResult }}</n-text>
    </n-descriptions-item>
    <n-descriptions-item
      v-for="(dressing, index) in fertilizerResult.topDressing"
      :key="index"
      :label="`${dressing.stage}追肥`"
      :span="2"
    >
      <n-text strong>{{ dressing.amount }} {{ dressing.unit }}</n-text>
      <n-text depth="3"> ({{ dressing.name }})</n-text>
    </n-descriptions-item>
  </n-descriptions>
</template>

<script setup>
import { computed } from 'vue'
import { 
  calculateSeedAmount, 
  calculateFertilizer, 
  calculateWaterRequirement,
  calculateYield 
} from '../utils/calculator'

const props = defineProps({
  crop: {
    type: Object,
    required: true
  },
  area: {
    type: Number,
    default: 10
  }
})

const seedResult = computed(() => 
  calculateSeedAmount(props.crop, props.area)
)

const fertilizerResult = computed(() => 
  calculateFertilizer(props.crop, props.area)
)

const waterResult = computed(() => 
  calculateWaterRequirement(props.crop, props.area)
)

const yieldResult = computed(() => 
  calculateYield(props.crop, props.area)
)
</script>
