<template>
  <aside class="h-full flex flex-col min-w-[260px] max-w-[320px] border-r border-slate-800 bg-slate-900/50">
    <div class="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
      <div>
        <div class="text-sm font-semibold text-slate-200">卡牌牌库</div>
        <div class="text-xs text-slate-500">共 {{ cards.length }} 张 · {{ stats.totalCopies }} 份</div>
      </div>
      <button class="btn btn-primary text-xs" @click="addCard">
        + 新建
      </button>
    </div>

    <div class="flex-1 overflow-y-auto py-2">
      <div
        v-for="card in cards"
        :key="card.id"
        class="group relative mx-2 mb-1 px-3 py-2 rounded-lg cursor-pointer transition-all"
        :class="card.id === selectedId
          ? 'bg-indigo-500/20 border border-indigo-500/50'
          : 'border border-transparent hover:bg-slate-800/70'"
        @click="selectCard(card.id)"
      >
        <div class="flex items-center gap-2">
          <div
            class="w-8 h-8 rounded-md flex items-center justify-center text-white font-bold text-sm shrink-0"
            :class="rarityBg(card.rarity)"
          >
            {{ card.cost }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium text-slate-100 truncate">{{ card.name }}</div>
            <div class="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
              <span>{{ card.type }}</span>
              <span v-if="card.type === '单位'" class="text-red-400">❤{{ card.hp }}</span>
              <span v-if="card.type === '单位'" class="text-orange-400">⚔{{ card.damage }}</span>
              <span>×{{ card.copyCount }}</span>
              <span v-if="card.passiveSkills?.length" class="text-amber-400">⚡{{ card.passiveSkills.length }}</span>
            </div>
          </div>
        </div>
        <div class="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
          <button
            class="w-6 h-6 rounded bg-slate-700 hover:bg-indigo-500 text-slate-200 text-xs flex items-center justify-center"
            title="复制"
            @click.stop="duplicateCard(card.id)"
          >
            ⎘
          </button>
          <button
            class="w-6 h-6 rounded bg-slate-700 hover:bg-red-500 text-slate-200 text-xs flex items-center justify-center"
            title="删除"
            @click.stop="handleRemove(card.id)"
          >
            ✕
          </button>
        </div>
      </div>

      <div v-if="!cards.length" class="px-4 py-8 text-center text-slate-500 text-sm">
        还没有卡牌，点击「新建」开始创作
      </div>
    </div>

    <div v-if="importSuccess" class="px-4 py-3 border-t border-slate-800">
      <div class="flex items-center justify-between mb-2">
        <div class="text-xs font-medium text-green-300">导入成功</div>
        <button class="text-xs text-slate-500 hover:text-slate-300" @click="clearImportErrors">关闭</button>
      </div>
      <div class="bg-green-500/10 border border-green-500/30 rounded p-2">
        <div class="text-xs text-green-200">{{ importSuccess }}</div>
      </div>
    </div>

    <div v-else-if="importErrors.length" class="px-4 py-3 border-t border-slate-800">
      <div class="flex items-center justify-between mb-2">
        <div class="text-xs font-medium text-red-300">导入错误 ({{ importErrors.length }})</div>
        <button class="text-xs text-slate-500 hover:text-slate-300" @click="clearImportErrors">关闭</button>
      </div>
      <div class="max-h-32 overflow-y-auto bg-red-500/10 border border-red-500/30 rounded p-2">
        <ul class="text-xs text-red-200 space-y-1">
          <li v-for="(err, idx) in importErrors" :key="idx" class="leading-relaxed">• {{ err }}</li>
        </ul>
      </div>
    </div>

    <div class="px-4 py-3 border-t border-slate-800 flex items-center gap-2">
      <button class="btn btn-ghost text-xs flex-1" @click="handleImport">导入 CSV</button>
      <button class="btn btn-ghost text-xs flex-1" @click="exportCSV">导出 CSV</button>
      <button class="btn btn-ghost text-xs" @click="clearAll" title="清空">🗑</button>
      <input ref="fileInput" type="file" accept=".csv,text/csv" class="hidden" @change="onFileChange" />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { type CardRarity } from '../types'

const { cards, selectedId, stats, importErrors, importSuccess, addCard, duplicateCard, removeCard, selectCard, exportCSV, importCSV, clearImportErrors, clearAll } = useGameState()

const fileInput = ref<HTMLInputElement | null>(null)

function rarityBg(r: CardRarity) {
  switch (r) {
    case 'rare': return 'bg-blue-500'
    case 'epic': return 'bg-purple-500'
    case 'legendary': return 'bg-amber-500'
    default: return 'bg-slate-600'
  }
}

function handleRemove(id: string) {
  const card = (cards.value || []).find(c => c.id === id)
  if (card && confirm(`确定要删除 "${card.name}" 吗？`)) {
    removeCard(id)
  }
}

function handleImport() {
  clearImportErrors()
  fileInput.value?.click()
}

async function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const result = await importCSV(file)
  if (!result.valid && !importErrors.value.length) {
    alert('导入失败：CSV 格式不正确')
  }
  input.value = ''
}
</script>
