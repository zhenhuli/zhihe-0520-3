<template>
  <div class="min-h-screen flex flex-col">
    <!-- Top bar -->
    <header class="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900/60 backdrop-blur">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl shadow-lg">
          🎴
        </div>
        <div>
          <div class="font-display text-lg font-bold text-slate-100">Card Forge</div>
          <div class="text-[11px] text-slate-500 -mt-0.5">卡牌桌游 · 规则编辑器</div>
        </div>
      </div>

      <div class="hidden md:flex items-center gap-2 text-xs text-slate-500">
        <span>📊 总卡数 <b class="text-slate-200">{{ stats.total }}</b></span>
        <span>·</span>
        <span>📦 总份数 <b class="text-slate-200">{{ stats.totalCopies }}</b></span>
        <span>·</span>
        <span>⚖ 平均费用 <b class="text-slate-200">{{ stats.avgCost }}</b></span>
        <span>·</span>
        <span>🔗 羁绊 <b class="text-slate-200">{{ stats.totalSynergies }}</b></span>
        <span>·</span>
        <span>🔄 回合阶段 <b class="text-slate-200">{{ stats.totalTurnPhases }}</b></span>
        <span>·</span>
        <span>⚙️ 规则 <b class="text-slate-200">{{ stats.totalRules }}</b></span>
        <span>·</span>
        <span>📁 方案 <b class="text-slate-200">{{ stats.totalSchemes }}</b></span>
      </div>

      <div class="flex items-center gap-2">
        <button class="btn btn-ghost text-xs" title="立即保存到本地" @click="handleSave">
          💾 保存
        </button>
      </div>
    </header>

    <!-- Toast notification -->
    <Transition name="toast">
      <div
        v-if="toast.show"
        class="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg text-sm font-medium"
        :class="toast.type === 'success'
          ? 'bg-emerald-500/90 text-white border border-emerald-400/50'
          : 'bg-red-500/90 text-white border border-red-400/50'"
      >
        {{ toast.message }}
      </div>
    </Transition>

    <!-- Main workspace -->
    <main class="flex-1 flex overflow-hidden">
      <CardList />

      <section class="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-4 p-4 overflow-y-auto">
        <div class="lg:col-span-3">
          <!-- Editor tabs -->
          <div class="flex gap-1 mb-4 border-b border-slate-800">
            <button
              v-for="tab in editorTabs"
              :key="tab.key"
              class="px-3 py-2 text-sm font-medium border-b-2 transition-colors"
              :class="activeEditorTab === tab.key
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-500 hover:text-slate-300'"
              @click="activeEditorTab = tab.key"
            >
              {{ tab.icon }} {{ tab.label }}
            </button>
          </div>

          <!-- Card editor -->
          <div v-show="activeEditorTab === 'card'">
            <CardEditor
              :card="selected"
              @update="patch => selected && updateCard(selected.id, patch)"
            />
          </div>

          <!-- Synergy editor -->
          <div v-show="activeEditorTab === 'synergy'" class="panel p-4">
            <div class="flex items-center justify-between mb-4">
              <div>
                <div class="text-sm font-semibold text-slate-200">阵营羁绊</div>
                <div class="text-xs text-slate-500 mt-0.5">定义卡牌阵营之间的羁绊效果</div>
              </div>
              <button class="btn btn-primary text-xs" @click="addSynergy">+ 新建羁绊</button>
            </div>

            <div v-if="!synergies.length" class="text-xs text-slate-500 italic py-8 text-center">
              暂无羁绊，点击「+ 新建羁绊」开始创建
            </div>

            <div class="space-y-3">
              <div
                v-for="syn in synergies"
                :key="syn.id"
                class="relative border border-slate-700/60 rounded-lg p-4 bg-slate-900/40"
              >
                <button
                  class="absolute top-3 right-3 w-6 h-6 rounded bg-slate-700 hover:bg-red-500 text-slate-300 text-xs flex items-center justify-center"
                  @click="handleRemoveSynergy(syn.id)"
                >
                  ✕
                </button>

                <div class="grid grid-cols-2 gap-3 mb-3 pr-8">
                  <div>
                    <label class="label !text-[11px] !mb-1">羁绊名称</label>
                    <input
                      class="input-sm w-full"
                      :value="syn.name"
                      placeholder="如：烈焰同盟"
                      @input="onSynergyInput(syn.id, 'name', ($event.target as HTMLInputElement).value)"
                    />
                  </div>
                  <div>
                    <label class="label !text-[11px] !mb-1">所需同阵营卡牌数</label>
                    <input
                      type="number"
                      class="input-sm w-full"
                      min="1"
                      :value="syn.requiredCount"
                      @input="onSynergyInput(syn.id, 'requiredCount', Number(($event.target as HTMLInputElement).value))"
                    />
                  </div>
                </div>

                <div class="mb-2">
                  <label class="label !text-[11px] !mb-1">效果描述</label>
                  <input
                    class="input-sm w-full"
                    :value="syn.effect"
                    placeholder="如：火焰派系单位获得 +1 伤害"
                    @input="onSynergyInput(syn.id, 'effect', ($event.target as HTMLInputElement).value)"
                  />
                </div>

                <div>
                  <label class="label !text-[11px] !mb-1">详细说明</label>
                  <textarea
                    class="input-sm w-full resize-none"
                    rows="2"
                    :value="syn.description"
                    placeholder="触发条件与具体规则说明..."
                    @input="onSynergyInput(syn.id, 'description', ($event.target as HTMLTextAreaElement).value)"
                  />
                </div>

                <div v-if="synergyErrors[syn.id]?.length" class="mt-2 px-2 py-1 rounded bg-red-500/20 border border-red-500/40">
                  <ul class="text-[11px] text-red-300 list-disc pl-4">
                    <li v-for="e in synergyErrors[syn.id]" :key="e">{{ e }}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Turn flow editor -->
          <div v-show="activeEditorTab === 'turnflow'" class="panel p-4">
            <div class="flex items-center justify-between mb-4">
              <div>
                <div class="text-sm font-semibold text-slate-200">回合流程</div>
                <div class="text-xs text-slate-500 mt-0.5">定义每回合的阶段顺序与可执行动作</div>
              </div>
              <button class="btn btn-primary text-xs" @click="addTurnPhase">+ 新建阶段</button>
            </div>

            <div v-if="!turnFlow.length" class="text-xs text-slate-500 italic py-8 text-center">
              暂无阶段，点击「+ 新建阶段」开始创建
            </div>

            <div class="space-y-3">
              <div
                v-for="(phase, pIdx) in turnFlow"
                :key="phase.id"
                class="relative border border-slate-700/60 rounded-lg p-4 bg-slate-900/40"
              >
                <div class="absolute top-3 right-3 flex gap-1">
                  <button
                    class="w-6 h-6 rounded bg-slate-700 hover:bg-indigo-500 text-slate-300 text-xs flex items-center justify-center"
                    title="上移"
                    :disabled="pIdx === 0"
                    :class="{ 'opacity-30 cursor-not-allowed': pIdx === 0 }"
                    @click="moveTurnPhase(phase.id, 'up')"
                  >
                    ▲
                  </button>
                  <button
                    class="w-6 h-6 rounded bg-slate-700 hover:bg-indigo-500 text-slate-300 text-xs flex items-center justify-center"
                    title="下移"
                    :disabled="pIdx === turnFlow.length - 1"
                    :class="{ 'opacity-30 cursor-not-allowed': pIdx === turnFlow.length - 1 }"
                    @click="moveTurnPhase(phase.id, 'down')"
                  >
                    ▼
                  </button>
                  <button
                    class="w-6 h-6 rounded bg-slate-700 hover:bg-red-500 text-slate-300 text-xs flex items-center justify-center"
                    title="删除"
                    @click="handleRemoveTurnPhase(phase.id)"
                  >
                    ✕
                  </button>
                </div>

                <div class="mb-2 pr-24">
                  <label class="label !text-[11px] !mb-1">
                    阶段 #{{ pIdx + 1 }} — 名称
                  </label>
                  <input
                    class="input-sm w-full"
                    :value="phase.name"
                    placeholder="如：抽牌阶段"
                    @input="onTurnPhaseInput(phase.id, 'name', ($event.target as HTMLInputElement).value)"
                  />
                </div>

                <div class="mb-2">
                  <label class="label !text-[11px] !mb-1">阶段说明</label>
                  <input
                    class="input-sm w-full"
                    :value="phase.description"
                    placeholder="如：从牌库抽2张牌"
                    @input="onTurnPhaseInput(phase.id, 'description', ($event.target as HTMLInputElement).value)"
                  />
                </div>

                <div>
                  <label class="label !text-[11px] !mb-1">
                    可执行动作
                    <span class="text-slate-500 font-normal ml-1">(回车添加)</span>
                  </label>
                  <div class="flex flex-wrap gap-1 mb-2">
                    <span
                      v-for="(action, aIdx) in phase.actions"
                      :key="aIdx"
                      class="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded bg-indigo-500/20 text-indigo-200 border border-indigo-500/30"
                    >
                      {{ action }}
                      <button
                        class="text-indigo-400 hover:text-red-400 ml-0.5"
                        @click="removeAction(phase.id, aIdx)"
                      >✕</button>
                    </span>
                  </div>
                  <input
                    class="input-sm w-full"
                    :placeholder="'输入动作后回车添加，如：打出卡牌'"
                    :ref="el => setActionInputRef(phase.id, el)"
                    @keyup.enter="onActionEnter(phase.id, $event)"
                  />
                </div>

                <div v-if="turnPhaseErrors[phase.id]?.length" class="mt-2 px-2 py-1 rounded bg-red-500/20 border border-red-500/40">
                  <ul class="text-[11px] text-red-300 list-disc pl-4">
                    <li v-for="e in turnPhaseErrors[phase.id]" :key="e">{{ e }}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Rule engine -->
          <div v-show="activeEditorTab === 'rules'" class="flex flex-col gap-4">
            <RuleEngine />
          </div>

          <!-- Deck builder -->
          <div v-show="activeEditorTab === 'decks'" class="flex flex-col gap-4">
            <DeckBuilder />
          </div>

          <!-- Game scheme manager -->
          <div v-show="activeEditorTab === 'schemes'" class="flex flex-col gap-4">
            <GameSchemeManager />
          </div>

          <!-- Template share -->
          <div v-show="activeEditorTab === 'templates'" class="flex flex-col gap-4">
            <TemplateShare />
          </div>

          <!-- Game simulator -->
          <div v-show="activeEditorTab === 'simulator'" class="flex flex-col gap-4">
            <GameSimulator />
          </div>

          <!-- Tips / roadmap -->
          <div class="mt-4 panel p-4">
            <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              功能总览
            </div>
            <div class="grid grid-cols-2 gap-2 text-xs text-slate-400">
              <div class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>卡牌编辑器</div>
              <div class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>羁绊 / 势力系统</div>
              <div class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>回合规则编辑器</div>
              <div class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>自定义规则引擎</div>
              <div class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>卡组构建器</div>
              <div class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>卡组导出 (TXT/JSON/CSV)</div>
              <div class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>多游戏方案切换</div>
              <div class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>卡牌模板分享</div>
              <div class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>对局模拟器</div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-2">
          <CardPreview :card="selected" />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { FactionSynergy, TurnPhase } from '../types'

const {
  selected,
  stats,
  synergies,
  turnFlow,
  synergyErrors,
  turnPhaseErrors,
  loadFromStorage,
  saveToStorage,
  updateCard,
  addSynergy,
  updateSynergy,
  removeSynergy,
  addTurnPhase,
  updateTurnPhase,
  removeTurnPhase,
  moveTurnPhase,
} = useGameState()

const editorTabs = [
  { key: 'card', label: '卡牌编辑', icon: '🎴' },
  { key: 'synergy', label: '阵营羁绊', icon: '🔗' },
  { key: 'turnflow', label: '回合流程', icon: '🔄' },
  { key: 'rules', label: '规则引擎', icon: '⚙️' },
  { key: 'decks', label: '卡组构建', icon: '🃏' },
  { key: 'schemes', label: '游戏方案', icon: '📁' },
  { key: 'templates', label: '模板分享', icon: '📋' },
  { key: 'simulator', label: '对局模拟', icon: '⚔️' },
] as const

const activeEditorTab = ref<typeof editorTabs[number]['key']>('card')

const actionInputRefs = ref<Record<string, HTMLInputElement | null>>({})

const toast = reactive({
  show: false,
  type: 'success' as 'success' | 'error',
  message: '',
})

let toastTimer: ReturnType<typeof setTimeout> | null = null

function showToast(message: string, type: 'success' | 'error' = 'success') {
  toast.message = message
  toast.type = type
  toast.show = true
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toast.show = false
  }, 2000)
}

function handleSave() {
  const ok = saveToStorage()
  if (ok) {
    showToast('✅ 保存成功', 'success')
  } else {
    showToast('❌ 保存失败，请检查本地存储权限', 'error')
  }
}

function setActionInputRef(phaseId: string, el: unknown) {
  actionInputRefs.value[phaseId] = el as HTMLInputElement | null
}

function onSynergyInput(id: string, field: keyof FactionSynergy, value: string | number) {
  updateSynergy(id, { [field]: value } as Partial<FactionSynergy>)
}

function handleRemoveSynergy(id: string) {
  const syn = (synergies.value || []).find(s => s.id === id)
  if (syn && confirm(`确定要删除羁绊 "${syn.name}" 吗？`)) {
    removeSynergy(id)
  }
}

function onTurnPhaseInput(id: string, field: keyof TurnPhase, value: string) {
  updateTurnPhase(id, { [field]: value } as Partial<TurnPhase>)
}

function handleRemoveTurnPhase(id: string) {
  const phase = (turnFlow.value || []).find(p => p.id === id)
  if (phase && confirm(`确定要删除阶段 "${phase.name}" 吗？`)) {
    removeTurnPhase(id)
  }
}

function onActionEnter(phaseId: string, e: KeyboardEvent) {
  const input = e.target as HTMLInputElement
  const value = input.value.trim()
  if (!value) return
  const phase = (turnFlow.value || []).find(p => p.id === phaseId)
  if (!phase) return
  const newActions = [...phase.actions, value]
  updateTurnPhase(phaseId, { actions: newActions })
  input.value = ''
}

function removeAction(phaseId: string, actionIdx: number) {
  const phase = (turnFlow.value || []).find(p => p.id === phaseId)
  if (!phase) return
  const newActions = phase.actions.filter((_, i) => i !== actionIdx)
  updateTurnPhase(phaseId, { actions: newActions })
}

onMounted(() => {
  loadFromStorage()
})
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translate(-50%, -20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px);
}
</style>
