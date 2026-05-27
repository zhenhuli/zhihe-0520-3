<template>
  <div class="panel p-4">
    <div class="flex items-center justify-between mb-4">
      <div>
        <div class="text-sm font-semibold text-slate-200">卡牌模板</div>
        <div class="text-xs text-slate-500 mt-0.5">保存和分享卡牌模板，快速创建新卡牌</div>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="btn btn-ghost text-xs"
          @click="showImportModal = true"
          title="导入模板"
        >
          📥 导入
        </button>
        <button
          class="btn btn-primary text-xs"
          @click="createTemplateFromSelected"
          :disabled="!selected"
          title="从当前选中的卡牌创建模板"
        >
          ➕ 从当前卡牌创建
        </button>
      </div>
    </div>

    <div class="mb-4">
      <div class="flex items-center gap-2">
        <input
          class="input-sm flex-1"
          v-model="searchQuery"
          placeholder="搜索模板..."
        />
        <select
          class="input-sm w-32"
          v-model="selectedCategory"
        >
          <option value="">全部分类</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>
    </div>

    <div v-if="!filteredTemplates.length" class="text-xs text-slate-500 italic py-8 text-center">
      暂无模板，点击「从当前卡牌创建」开始创建
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
      <div
        v-for="template in filteredTemplates"
        :key="template.id"
        class="border border-slate-700/60 rounded-lg p-3 bg-slate-900/40 hover:bg-slate-800/50 transition-colors"
      >
        <div class="flex items-start justify-between gap-2 mb-2">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-medium text-slate-200 truncate">{{ template.name }}</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">
                {{ template.category }}
              </span>
            </div>
            <div class="text-xs text-slate-500 truncate mt-0.5">{{ template.description }}</div>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <button
              class="w-6 h-6 rounded bg-slate-700 hover:bg-indigo-500 text-slate-300 text-xs flex items-center justify-center"
              title="应用到当前卡牌"
              @click="applyTemplate(template.id)"
              :disabled="!selected"
            >
              ✨
            </button>
            <button
              class="w-6 h-6 rounded bg-slate-700 hover:bg-emerald-500 text-slate-300 text-xs flex items-center justify-center"
              title="创建新卡牌"
              @click="createCardFromTemplate(template.id)"
            >
              ➕
            </button>
            <button
              class="w-6 h-6 rounded bg-slate-700 hover:bg-blue-500 text-slate-300 text-xs flex items-center justify-center"
              title="导出模板"
              @click="exportTemplate(template)"
            >
              📤
            </button>
            <button
              class="w-6 h-6 rounded bg-slate-700 hover:bg-red-500 text-slate-300 text-xs flex items-center justify-center"
              title="删除模板"
              @click="handleRemove(template.id)"
            >
              ✕
            </button>
          </div>
        </div>

        <div class="flex items-center gap-2 text-[10px] text-slate-400">
          <span v-if="template.card.type" class="px-1.5 py-0.5 rounded bg-slate-700/50">
            {{ template.card.type }}
          </span>
          <span v-if="template.card.cost !== undefined" class="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
            {{ template.card.cost }}费
          </span>
          <span v-if="template.card.rarity" class="px-1.5 py-0.5 rounded" :class="rarityClass(template.card.rarity)">
            {{ template.card.rarity }}
          </span>
          <span v-if="template.card.faction" class="px-1.5 py-0.5 rounded bg-slate-700/50">
            {{ template.card.faction }}
          </span>
        </div>

        <div v-if="template.tags?.length" class="flex flex-wrap gap-1 mt-2">
          <span
            v-for="tag in template.tags"
            :key="tag"
            class="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/30 text-slate-400"
          >
            #{{ tag }}
          </span>
        </div>

        <div class="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <button
              class="text-[10px] text-slate-400 hover:text-indigo-400"
              @click="copyShareCode(template)"
            >
              🔗 复制分享码
            </button>
            <span v-if="copiedTemplateId === template.id" class="text-[10px] text-emerald-400">
              已复制!
            </span>
          </div>
          <span class="text-[10px] text-slate-500">
            {{ formatDate(template.updatedAt) }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="showImportModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showImportModal = false">
      <div class="bg-slate-900 border border-slate-700 rounded-lg p-6 w-[500px] max-w-[90vw]">
        <h3 class="text-lg font-semibold text-slate-200 mb-4">导入卡牌模板</h3>
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <input
              class="input-sm flex-1"
              v-model="shareCode"
              placeholder="粘贴分享码..."
            />
            <button class="btn btn-primary text-xs" @click="importFromShareCode">
              导入
            </button>
          </div>
          <div class="text-xs text-slate-500 text-center">或</div>
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
            placeholder="粘贴卡牌模板的 JSON 内容..."
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
import type { CardRarity, CardTemplate } from '../types'
import {
  createShareLink,
  importTemplateFromJSON,
  downloadTemplate,
  copyTemplateToClipboard,
  decodeShareCode,
} from '../utils/template'

const {
  selected,
  cardTemplates,
  addCardTemplate,
  updateCardTemplate,
  removeCardTemplate,
  applyCardTemplate,
  addCard,
  updateCard,
} = useGameState()

const searchQuery = ref('')
const selectedCategory = ref('')
const showImportModal = ref(false)
const shareCode = ref('')
const importJSONText = ref('')
const copiedTemplateId = ref<string | null>(null)

const categories = computed(() => {
  const cats = new Set((cardTemplates.value || []).map(t => t.category).filter(Boolean))
  return Array.from(cats).sort()
})

const filteredTemplates = computed(() => {
  let templates = cardTemplates.value || []

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    templates = templates.filter(
      t =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query)),
    )
  }

  if (selectedCategory.value) {
    templates = templates.filter(t => t.category === selectedCategory.value)
  }

  return templates.sort((a, b) => b.updatedAt - a.updatedAt)
})

function rarityClass(rarity: CardRarity | string): string {
  switch (rarity) {
    case 'rare':
      return 'bg-blue-500/20 text-blue-300'
    case 'epic':
      return 'bg-purple-500/20 text-purple-300'
    case 'legendary':
      return 'bg-amber-500/20 text-amber-300'
    default:
      return 'bg-slate-700/50 text-slate-300'
  }
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  })
}

function createTemplateFromSelected() {
  if (!selected.value) return
  const template = addCardTemplate(selected.value)
  if (template) {
    alert(`已创建模板: ${template.name}`)
  }
}

function createCardFromTemplate(templateId: string) {
  const template = (cardTemplates.value || []).find(t => t.id === templateId)
  if (!template) return

  const newCard = {
    ...template.card,
    id: `card_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: template.name,
  } as typeof selected.value

  addCard()
  const latestCard = (useGameState().cards.value || []).slice(-1)[0]
  if (latestCard) {
    updateCard(latestCard.id, newCard)
  }
}

function applyTemplate(templateId: string) {
  if (!selected.value) return
  applyCardTemplate(templateId, selected.value.id)
  alert('模板已应用到当前卡牌')
}

function exportTemplate(template: CardTemplate) {
  downloadTemplate(template)
}

function handleRemove(templateId: string) {
  const template = (cardTemplates.value || []).find(t => t.id === templateId)
  if (template && confirm(`确定要删除模板 "${template.name}" 吗？`)) {
    removeCardTemplate(templateId)
  }
}

async function copyShareCode(template: CardTemplate) {
  const shareLink = createShareLink(template.id, 'card')
  const code = `TEMPLATE:${shareLink.shareCode}`

  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(code)
      copiedTemplateId.value = template.id
      setTimeout(() => {
        copiedTemplateId.value = null
      }, 2000)
    } catch (e) {
      alert('复制失败，请手动复制')
    }
  }
}

function importFromShareCode() {
  if (!shareCode.value.trim()) {
    alert('请输入分享码')
    return
  }

  const code = shareCode.value.replace('TEMPLATE:', '').trim()
  const decoded = decodeShareCode(code)
  if (!decoded) {
    alert('无效的分享码')
    return
  }

  alert('分享码解析成功！由于本地存储限制，完整模板数据需要通过 JSON 文件导入。')
  shareCode.value = ''
}

async function handleImportFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  try {
    const text = await file.text()
    const result = importTemplateFromJSON(text)
    if (result.success && result.data) {
      const template = result.data as CardTemplate
      addCardTemplate(template.card as typeof selected.value)
      alert(`成功导入模板: ${template.name}`)
      showImportModal.value = false
    } else {
      alert('导入失败: ' + (result.error || '未知错误'))
    }
  } catch (e) {
    alert('导入失败: ' + (e as Error).message)
  }
  input.value = ''
}

async function confirmImportText() {
  try {
    const result = importTemplateFromJSON(importJSONText.value)
    if (result.success && result.data) {
      const template = result.data as CardTemplate
      addCardTemplate(template.card as typeof selected.value)
      alert(`成功导入模板: ${template.name}`)
      showImportModal.value = false
      importJSONText.value = ''
    } else {
      alert('导入失败: ' + (result.error || '未知错误'))
    }
  } catch (e) {
    alert('导入失败: ' + (e as Error).message)
  }
}
</script>
