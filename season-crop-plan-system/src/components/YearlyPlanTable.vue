<template>
  <n-card title="整年种植排布计划表" :bordered="false">
    <div class="plan-header">
      <n-space>
        <n-tag type="info">
          土地面积: {{ area }} 亩
        </n-tag>
        <n-tag type="success">
          作物种类: {{ crops.length }} 种
        </n-tag>
      </n-space>
      <n-space>
        <n-button size="small" @click="exportPlan">
          <template #icon>
            <DownloadOutline />
          </template>
          导出计划
        </n-button>
        <n-button size="small" type="primary" @click="printPlan">
          <template #icon>
            <PrintOutline />
          </template>
          打印计划
        </n-button>
      </n-space>
    </div>

    <n-divider />

    <div class="timeline-view">
      <n-space vertical :size="16">
        <div v-for="(monthPlan, index) in yearlyPlan" :key="index" class="month-row">
          <n-card :title="monthPlan.month" size="small" :bordered="false">
            <n-grid :cols="3" :x-gap="12">
              <n-grid-item>
                <div class="plan-section">
                  <n-tag type="success" size="small" class="section-tag">
                    <LeafOutline style="margin-right: 4px" /> 播种
                  </n-tag>
                  <n-space vertical size="small" class="section-content">
                    <div v-if="monthPlan.sowings.length === 0" class="empty-item">
                      <n-text depth="3">无播种任务</n-text>
                    </div>
                    <n-tag
                      v-for="(sowing, sIdx) in monthPlan.sowings"
                      :key="sIdx"
                      type="success"
                      size="small"
                      class="plan-tag"
                    >
                      {{ sowing.crop }} ({{ sowing.season }}) - {{ sowing.area }}亩
                    </n-tag>
                  </n-space>
                </div>
              </n-grid-item>
              <n-grid-item>
                <div class="plan-section">
                  <n-tag type="warning" size="small" class="section-tag">
                    <ConstructOutline style="margin-right: 4px" /> 田间管理
                  </n-tag>
                  <n-space vertical size="small" class="section-content">
                    <div v-if="monthPlan.fieldManagement.length === 0" class="empty-item">
                      <n-text depth="3">无管理任务</n-text>
                    </div>
                    <n-tag
                      v-for="(fm, fmIdx) in monthPlan.fieldManagement"
                      :key="fmIdx"
                      type="warning"
                      size="small"
                      class="plan-tag"
                    >
                      {{ fm.crop }}: {{ fm.type }}
                    </n-tag>
                  </n-space>
                </div>
              </n-grid-item>
              <n-grid-item>
                <div class="plan-section">
                  <n-tag type="primary" size="small" class="section-tag">
                    <BasketOutline style="margin-right: 4px" /> 收获
                  </n-tag>
                  <n-space vertical size="small" class="section-content">
                    <div v-if="monthPlan.harvests.length === 0" class="empty-item">
                      <n-text depth="3">无收获任务</n-text>
                    </div>
                    <n-tag
                      v-for="(harvest, hIdx) in monthPlan.harvests"
                      :key="hIdx"
                      type="primary"
                      size="small"
                      class="plan-tag"
                    >
                      {{ harvest.crop }} ({{ harvest.season }}) - {{ harvest.area }}亩
                    </n-tag>
                  </n-space>
                </div>
              </n-grid-item>
            </n-grid>
          </n-card>
        </div>
      </n-space>
    </div>

    <n-divider />

    <div class="summary-section">
      <h4>种植计划汇总</h4>
      <n-table :single-line="false" :bordered="true">
        <thead>
          <tr>
            <th>作物名称</th>
            <th>种植面积</th>
            <th>播种季节</th>
            <th>生长期</th>
            <th>预计产量</th>
            <th>种子用量</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="crop in crops" :key="crop.id">
            <td>{{ crop.name }}</td>
            <td>{{ (area / crops.length).toFixed(1) }} 亩</td>
            <td>{{ crop.sowingSeasons.map(s => s.season).join('、') }}</td>
            <td>{{ crop.growthDays }} 天</td>
            <td>{{ (crop.yieldPerMu * area / crops.length).toFixed(0) }} 公斤</td>
            <td>{{ (crop.seedRatePerMu * area / crops.length).toFixed(2) }} 公斤</td>
          </tr>
        </tbody>
      </n-table>
    </div>
  </n-card>
</template>

<script setup>
import { computed } from 'vue'
import { generateYearlyPlan } from '../utils/calculator'
import { 
  DownloadOutline, 
  PrintOutline, 
  LeafOutline, 
  ConstructOutline, 
  BasketOutline 
} from '@vicons/ionicons5'

const props = defineProps({
  crops: {
    type: Array,
    default: () => []
  },
  area: {
    type: Number,
    default: 10
  }
})

const yearlyPlan = computed(() => {
  if (props.crops.length > 0) {
    return generateYearlyPlan(props.crops, props.area)
  }
  return []
})

function exportPlan() {
  const data = {
    area: props.area,
    crops: props.crops.map(c => c.name),
    plan: yearlyPlan.value
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '种植计划表.json'
  a.click()
  URL.revokeObjectURL(url)
}

function printPlan() {
  window.print()
}
</script>

<style scoped>
.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.plan-section {
  min-height: 120px;
}

.section-tag {
  margin-bottom: 8px;
}

.section-content {
  min-height: 80px;
}

.plan-tag {
  width: 100%;
  justify-content: flex-start;
}

.empty-item {
  padding: 8px 0;
}

.month-row {
  margin-bottom: 8px;
}

.summary-section {
  margin-top: 24px;
}

.summary-section h4 {
  margin-bottom: 16px;
  color: #2080f0;
}

@media print {
  .plan-header {
    display: none;
  }
}
</style>
