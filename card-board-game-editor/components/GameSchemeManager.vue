<template>
  <div class="panel p-4">
    <div class="flex items-center justify-between mb-4">
      <div>
        <div class="text-sm font-semibold text-slate-200">游戏方案管理</div>
        <div class="text-xs text-slate-500 mt-0.5">管理多套游戏方案，快速切换不同游戏配置</div>
      </div>
      <div class="flex items-center gap-2">
        <button class="btn btn-ghost text-xs" @click="showImportModal = true">
          📥 导入
        </button>
        <button class="btn btn-primary text-xs" @click="handleSaveAsNew">
          💾 另存为新方案
        </button>
      </div>
    </div>

    <div class="mb-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
      <div class="flex items-center gap-3">
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-slate-200">当前方案:</span>
            <span class="text-sm text-indigo-300">{{ currentScheme?.name || '无' }}</span>
          </div>
          <div class="text-xs text-slate-500 mt-0.5">
            {{ currentScheme?.description || '无描述' }}
          </div>
        </div>
        <button
          class="btn btn-ghost text-xs"
          @click="handleUpdateCurrent"
          :disabled="!currentScheme"
        >
          💾 保存更改
        </button>
        <button
          class="btn btn-ghost text-xs"
          @click="handleClone"
          :disabled="!currentScheme"
        >
          📋 克隆
        </button>
        <button
          class="btn btn-ghost text-xs"
          @click="handleExport"
          :disabled="!currentScheme"
        >
          📤 导出
        </button>
      </div>
    </div>

    <div class="space-y-2 max-h-96 overflow-y-auto">
      <div
        v-for="scheme in schemes"
        :key="scheme.id"
        class="flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer"
        :class="[
          currentSchemeId === scheme.id
            ? 'bg-indigo-500/10 border-indigo-500/50'
            : 'bg-slate-900/30 border-slate-700/50 hover:bg-slate-800/50',
        ]"
        @click="handleSwitch(scheme.id)"
      >
        <div
          class="w-3 h-3 rounded-full flex-shrink-0"
          :class="currentSchemeId === scheme.id ? 'bg-indigo-500' : 'bg-slate-600'"
        ></div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-slate-200 truncate">{{ scheme.name }}</span>
            <span v-if="scheme.isDefault" class="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
              默认
            </span>
          </div>
          <div class="text-xs text-slate-500 truncate">{{ scheme.description || '无描述' }}</div>
          <div class="flex items-center gap-3 mt-1 text-[10px] text-slate-400">
            <span>🎴 {{ scheme.cards.length }} 张卡牌</span>
            <span>🔗 {{ scheme.synergies.length }} 羁绊</span>
            <span>🔄 {{ scheme.turnFlow.length }} 阶段</span>
            <span>⚙️ {{ scheme.rules.length }} 规则</span>
          </div>
        </div>
        <div class="flex items-center gap-1" @click.stop>
          <button
            v-if="!scheme.isDefault"
            class="w-7 h-7 rounded bg-slate-700 hover:bg-red-500 text-slate-300 text-xs flex items-center justify-center"
            title="删除方案"
            @click="handleRemove(scheme.id)"
          >
            ✕
          </button>
        </div>
      </div>
    </div>

    <div v-if="!schemes.length" class="text-xs text-slate-500 italic py-8 text-center">
      暂无游戏方案
    </div>

    <div v-if="showSaveAsModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showSaveAsModal = false">
      <div class="bg-slate-900 border border-slate-700 rounded-lg p-6 w-96 max-w-[90vw]">
        <h3 class="text-lg font-semibold text-slate-200 mb-4">另存为新方案</h3>
        <div class="space-y-3">
          <div>
            <label class="label !text-[11px] !mb-1">方案名称</label>
            <input
              class="input w-full"
              v-model="newSchemeName"
              placeholder="输入方案名称"
              @keyup.enter="confirmSaveAsNew"
            />
          </div>
          <div>
            <label class="label !text-[11px] !mb-1">方案描述 (可选)</label>
            <textarea
              class="input w-full resize-none"
              rows="2"
              v-model="newSchemeDescription"
              placeholder="描述这个方案的特点..."
            ></textarea>
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <button class="btn btn-ghost text-sm" @click="showSaveAsModal = false">取消</button>
          <button class="btn btn-primary text-sm" @click="confirmSaveAsNew">保存</button>
        </div>
      </div>
    </div>

    <div v-if="showCloneModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showCloneModal = false">
      <div class="bg-slate-900 border border-slate-700 rounded-lg p-6 w-96 max-w-[90vw]">
        <h3 class="text-lg font-semibold text-slate-200 mb-4">克隆游戏方案</h3>
        <div>
          <label class="label !text-[11px] !mb-1">新方案名称</label>
          <input
            class="input w-full"
            v-model="cloneName"
            placeholder="输入新方案名称"
            @keyup.enter="confirmClone"
          />
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <button class="btn btn-ghost text-sm" @click="showCloneModal = false">取消</button>
          <button class="btn btn-primary text-sm" @click="confirmClone">克隆</button>
        </div>
      </div>
    </div>

    <div v-if="showImportModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showImportModal = false">
      <div class="bg-slate-900 border border-slate-700 rounded-lg p-6 w-96 max-w-[90vw]">
        <h3 class="text-lg font-semibold text-slate-200 mb-4">导入游戏方案</h3>
        <div class="space-y-4">
          <div>
            <label class="label !text-[11px] !mb-1">选择 JSON 文件</label>
            <input
              type="file"
              accept=".json"
              class="input w-full text-xs"
              @change="handleImportFile"
            />
          </div>
          <div class="text-xs text-slate-500">
            或粘贴 JSON 内容：
          </div>
          <textarea
            class="input w-full resize-none font-mono text-xs"
            rows="6"
            v-model="importJSONText"
            placeholder="粘贴游戏方案的 JSON 内容..."
          ></textarea>
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <button class="btn btn-ghost text-sm" @click="showImportModal = false">取消</button>
          <button class="btn btn-primary text-sm" @click="confirmImportText" :disabled="!importJSONText.trim()">
            导入
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const {
  schemes,
  currentScheme,
  currentSchemeId,
  switchGameScheme,
  saveCurrentAsNewScheme,
  updateCurrentScheme,
  cloneCurrentScheme,
  exportCurrentScheme,
  importGameScheme,
  removeGameScheme,
} = useGameState()

const showSaveAsModal = ref(false)
const showCloneModal = ref(false)
const showImportModal = ref(false)
const newSchemeName = ref('')
const newSchemeDescription = ref('')
const cloneName = ref('')
const importJSONText = ref('')

function handleSwitch(schemeId: string) {
  if (schemeId === currentSchemeId.value) return
  if (confirm('切换方案将丢失当前未保存的更改，确定继续吗？')) {
    switchGameScheme(schemeId)
  }
}

function handleSaveAsNew() {
  newSchemeName.value = currentScheme.value ? `${currentScheme.value.name} (副本)` : '新方案'
  newSchemeDescription.value = currentScheme.value?.description || ''
  showSaveAsModal.value = true
}

function confirmSaveAsNew() {
  if (!newSchemeName.value.trim()) {
    alert('请输入方案名称')
    return
  }
  saveCurrentAsNewScheme(newSchemeName.value.trim(), newSchemeDescription.value.trim())
  showSaveAsModal.value = false
  newSchemeName.value = ''
  newSchemeDescription.value = ''
}

function handleUpdateCurrent() {
  updateCurrentScheme()
  alert('方案已保存！')
}

function handleClone() {
  cloneName.value = currentScheme.value ? `${currentScheme.value.name} (副本)` : '新方案'
  showCloneModal.value = true
}

function confirmClone() {
  if (!cloneName.value.trim()) {
    alert('请输入方案名称')
    return
  }
  cloneCurrentScheme(cloneName.value.trim())
  showCloneModal.value = false
  cloneName.value = ''
}

function handleExport() {
  exportCurrentScheme()
}

function handleRemove(schemeId: string) {
  const scheme = schemes.value.find(s => s.id === schemeId)
  if (!scheme) return
  if (confirm(`确定要删除方案 "${scheme.name}" 吗？此操作不可恢复。`)) {
    removeGameScheme(schemeId)
  }
}

async function handleImportFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const scheme = await importGameScheme(file)
  if (scheme) {
    alert(`成功导入方案: ${scheme.name}`)
    showImportModal.value = false
  } else {
    alert('导入失败，请检查文件格式')
  }
  input.value = ''
}

async function confirmImportText() {
  try {
    const blob = new Blob([importJSONText.value], { type: 'application/json' })
    const file = new File([blob], 'import.json', { type: 'application/json' })
    const scheme = await importGameScheme(file)
    if (scheme) {
      alert(`成功导入方案: ${scheme.name}`)
      showImportModal.value = false
      importJSONText.value = ''
    } else {
      alert('导入失败，请检查 JSON 格式')
    }
  } catch (e) {
    alert('导入失败: ' + (e as Error).message)
  }
}
</script>
