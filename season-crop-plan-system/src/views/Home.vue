<template>
  <div class="home-page">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <LeafOutline class="title-icon" />
          农耕时节种植规划推演系统
        </h1>
        <p class="page-subtitle">
          智能匹配适宜作物，科学测算种植方案，助力农业生产精准规划
        </p>
      </div>
    </div>

    <div class="page-content">
      <n-card :bordered="false" class="main-card">
        <n-tabs v-model:value="currentStep" type="line" size="large" class="main-tabs">
          <n-tab-pane name="0" tab="选择地域与气候">
            <template #tab>
              <div class="tab-item">
                <n-tag :type="getTabType(0)" size="small" round>1</n-tag>
                <span>选择地域与气候</span>
              </div>
            </template>
            <div class="tab-content">
              <RegionSelector ref="regionSelectorRef" @selectionChange="onSelectionChange" />
              <div class="tab-footer">
                <n-space justify="end">
                  <n-button
                    type="primary"
                    :disabled="!canGoToStep(1)"
                    @click="currentStep = '1'"
                  >
                    下一步
                    <template #icon>
                      <ChevronForwardOutline />
                    </template>
                  </n-button>
                </n-space>
              </div>
            </div>
          </n-tab-pane>

          <n-tab-pane name="1" tab="匹配适宜作物">
            <template #tab>
              <div class="tab-item">
                <n-tag :type="getTabType(1)" size="small" round>2</n-tag>
                <span>匹配适宜作物</span>
              </div>
            </template>
            <div class="tab-content">
              <div v-if="canGoToStep(1)">
                <CropMatcher
                  :region="selection.region"
                  :climate="selection.climate"
                  :area="selection.area"
                  @generatePlan="onGeneratePlan"
                />
              </div>
              <n-empty v-else description="请先完成上一步，选择地域与气候类型" />
              <div class="tab-footer">
                <n-space justify="space-between" style="width: 100%">
                  <n-button @click="currentStep = '0'">
                    <template #icon>
                      <ChevronBackOutline />
                    </template>
                    上一步
                  </n-button>
                  <n-button
                    type="primary"
                    :disabled="!canGoToStep(2)"
                    @click="currentStep = '2'"
                  >
                    下一步
                    <template #icon>
                      <ChevronForwardOutline />
                    </template>
                  </n-button>
                </n-space>
              </div>
            </div>
          </n-tab-pane>

          <n-tab-pane name="2" tab="生成种植计划">
            <template #tab>
              <div class="tab-item">
                <n-tag :type="getTabType(2)" size="small" round>3</n-tag>
                <span>生成种植计划</span>
              </div>
            </template>
            <div class="tab-content">
              <div v-if="canGoToStep(2)">
                <YearlyPlanTable
                  :crops="planData.crops"
                  :area="planData.area"
                />
              </div>
              <n-empty v-else description="请先完成上一步，选择作物并生成计划" />
              <div class="tab-footer">
                <n-space justify="start">
                  <n-button @click="currentStep = '1'">
                    <template #icon>
                      <ChevronBackOutline />
                    </template>
                    上一步
                  </n-button>
                </n-space>
              </div>
            </div>
          </n-tab-pane>
        </n-tabs>
      </n-card>
    </div>

    <n-layout-footer position="absolute" class="page-footer">
      <div class="footer-content">
        <n-text depth="3">
          农耕时节种植规划推演系统 · 基于 Vue3 + Vite + Naive UI 构建
        </n-text>
      </div>
    </n-layout-footer>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { LeafOutline, ChevronForwardOutline, ChevronBackOutline } from '@vicons/ionicons5'
import RegionSelector from '../components/RegionSelector.vue'
import CropMatcher from '../components/CropMatcher.vue'
import YearlyPlanTable from '../components/YearlyPlanTable.vue'

const currentStep = ref('0')
const regionSelectorRef = ref(null)

const selection = reactive({
  region: null,
  climate: null,
  area: 10,
  regionInfo: null
})

const planData = reactive({
  crops: [],
  area: 10
})

function getTabType(step) {
  const stepNum = parseInt(currentStep.value)
  if (step < stepNum) return 'success'
  if (step === stepNum) return 'primary'
  return 'default'
}

function canGoToStep(step) {
  if (step === 1) {
    return selection.region && selection.climate
  }
  if (step === 2) {
    return planData.crops.length > 0
  }
  return true
}

function onSelectionChange(data) {
  selection.region = data.region
  selection.climate = data.climate
  selection.area = data.area
  selection.regionInfo = data.regionInfo
}

function onGeneratePlan(data) {
  planData.crops = data.crops
  planData.area = data.area
  currentStep.value = '2'
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8f5e9 100%);
  padding-bottom: 80px;
}

.page-header {
  background: linear-gradient(135deg, #2e7d32 0%, #558b2f 100%);
  color: white;
  padding: 48px 24px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(46, 125, 50, 0.3);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.title-icon {
  font-size: 40px;
}

.page-subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

.page-content {
  max-width: 1200px;
  margin: 32px auto;
  padding: 0 24px;
}

.main-card {
  padding: 0;
}

.main-tabs {
  padding: 0;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 500;
}

.tab-content {
  padding: 24px 0;
  min-height: 500px;
  display: flex;
  flex-direction: column;
}

.tab-footer {
  margin-top: auto;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

.page-footer {
  background: white;
  border-top: 1px solid #e0e0e0;
  text-align: center;
  padding: 20px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
