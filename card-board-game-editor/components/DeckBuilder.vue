<template>
  <div class="panel p-4">
    <div class="flex items-center justify-between mb-4">
      <div>
        <div class="text-sm font-semibold text-slate-200">卡组构建器</div>
        <div class="text-xs text-slate-500 mt-0.5">创建和管理卡组，支持导出多种格式</div>
      </div>
      <div class="flex items-center gap-2">
        <button class="btn btn-primary text-xs" @click="addDeck">+ 新建卡组</button>
      </div>
    </div>

    <div v-if="!decks.length" class="text-xs text-slate-500 italic py-8 text-center">
      暂无卡组，点击「+ 新建卡组」开始创建
    </div>

    <div v-else class="grid grid-cols-1 gap-4">
      <div
        v-for="deck in decks"
        :key="deck.id"
        class="border border-slate-700/60 rounded-lg overflow-hidden"
      >
        <div
          class="flex items-center gap-3 px-4 py-3 bg-slate-900/60 cursor-pointer"
          @click="toggleDeck(deck.id)"
        >
          <span class="text-lg">{{ expandedDeckId === deck.id ? '▼' : '▶' }}</span>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-medium text-slate-200 truncate">{{ deck.name }}</span>
              <span class="text-xs text-slate-400">
                ({{ getDeckTotalCards(deck) }} 张 / {{ deck.cards.length }} 种)
              </span>
            </div>
            <div class="text-xs text-slate-500 truncate">{{ deck.description || '无描述' }}</div>
          </div>
          <div class="flex items-center gap-1" @click.stop>
            <button
              class="w-7 h-7 rounded bg-slate-700 hover:bg-emerald-500 text-slate-300 text-xs flex items-center justify-center"
              title="导出 TXT"
              @click="exportDeck(deck, 'txt')"
            >
              📄
            </button>
            <button
              class="w-7 h-7 rounded bg-slate-700 hover:bg-blue-500 text-slate-300 text-xs flex items-center justify-center"
              title="导出 JSON"
              @click="exportDeck(deck, 'json')"
            >
              📋
            </button>
            <button
              class="w-7 h-7 rounded bg-slate-700 hover:bg-red-500 text-slate-300 text-xs flex items-center justify-center"
              title="删除卡组"
              @click="handleRemoveDeck(deck.id)"
            >
              ✕
            </button>
          </div>
        </div>

        <div v-show="expandedDeckId === deck.id" class="p-4 border-t border-slate-700/60 bg-slate-900/30">
          <div class="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label class="label !text-[11px] !mb-1">卡组名称</label>
              <input
                class="input-sm w-full"
                :value="deck.name"
                placeholder="卡组名称"
                @input="onDeckInput(deck.id, 'name', ($event.target as HTMLInputElement).value)"
              />
            </div>
            <div>
              <label class="label !text-[11px] !mb-1">平均费用</label>
              <div class="input-sm w-full bg-slate-800/50 text-slate-300">
                {{ getDeckAvgCost(deck).toFixed(2) }}
              </div>
            </div>
          </div>

          <div class="mb-4">
            <label class="label !text-[11px] !mb-1">卡组描述</label>
            <textarea
              class="input-sm w-full resize-none"
              rows="2"
              :value="deck.description"
              placeholder="描述卡组的策略..."
              @input="onDeckInput(deck.id, 'description', ($event.target as HTMLTextAreaElement).value)"
            />
          </div>

          <div class="mb-4">
            <label class="label !text-[11px] !mb-1">费用曲线</label>
            <div class="flex items-end gap-1 h-20 px-2 py-2 bg-slate-800/30 rounded">
              <div
                v-for="(count, cost) in getDeckManaCurve(deck)"
                :key="cost"
                class="flex-1 flex flex-col items-center gap-1"
              >
                <div
                  class="w-full bg-indigo-500/60 rounded-t transition-all"
                  :style="{ height: `${Math.max(4, (count / maxManaCurveCount(deck)) * 60)}px` }"
                ></div>
                <span class="text-[10px] text-slate-400">{{ cost }}</span>
              </div>
            </div>
          </div>

          <div class="mb-4">
            <div class="flex items-center justify-between mb-2">
              <label class="label !text-[11px] !mb-0">卡组卡牌</label>
              <div class="flex items-center gap-2">
                <input
                  class="input-sm !py-1 !text-xs w-40"
                  v-model="cardSearchQuery"
                  placeholder="搜索卡牌..."
                />
              </div>
            </div>

            <div class="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
              <div
                v-for="card in filteredCards"
                :key="card.id"
                class="flex items-center gap-2 p-2 bg-slate-800/50 rounded hover:bg-slate-800/70 transition-colors"
              >
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="text-xs px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-300">
                      {{ card.cost }}费
                    </span>
                    <span class="text-sm text-slate-200 truncate">{{ card.name }}</span>
                    <span class="text-xs text-slate-400">{{ card.type }}</span>
                  </div>
                  <div class="text-[11px] text-slate-500 truncate">{{ card.description }}</div>
                </div>
                <div class="flex items-center gap-1">
                  <button
                    class="w-6 h-6 rounded bg-slate-700 hover:bg-red-500 text-slate-300 text-xs flex items-center justify-center"
                    @click="decrementCard(deck.id, card.id)"
                  >
                    -
                  </button>
                  <span class="w-8 text-center text-sm text-slate-300">
                    {{ getCardCountInDeck(deck, card.id) }}
                  </span>
                  <button
                    class="w-6 h-6 rounded bg-slate-700 hover:bg-emerald-500 text-slate-300 text-xs flex items-center justify-center"
                    @click="incrementCard(deck.id, card.id)"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              class="btn btn-ghost text-xs"
              @click="validateDeckFn(deck)"
            >
              ✅ 验证卡组
            </button>
            <span v-if="validationResult[deck.id]" class="text-xs">
              <span v-if="validationResult[deck.id].valid" class="text-emerald-400">
                卡组有效！
              </span>
              <span v-else class="text-red-400">
                {{ validationResult[deck.id].errors[0] }}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Deck } from '../types'
import { downloadDeck, validateDeck as validateDeckUtil } from '../utils/deck'

const {
  cards,
  decks,
  addDeck,
  updateDeck,
  removeDeck,
  addCardToDeck,
  removeCardFromDeck,
} = useGameState()

const expandedDeckId = ref<string | null>(null)
const cardSearchQuery = ref('')
const validationResult = ref<Record<string, ReturnType<typeof validateDeckUtil>>>({})

const filteredCards = computed(() => {
  const query = cardSearchQuery.value.toLowerCase().trim()
  if (!query) return cards.value || []
  return (cards.value || []).filter(
    c =>
      c.name.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query) ||
      c.faction.toLowerCase().includes(query),
  )
})

function toggleDeck(deckId: string) {
  expandedDeckId.value = expandedDeckId.value === deckId ? null : deckId
}

function onDeckInput(deckId: string, field: keyof Deck, value: string) {
  updateDeck(deckId, { [field]: value })
}

function handleRemoveDeck(deckId: string) {
  const deck = (decks.value || []).find(d => d.id === deckId)
  if (deck && confirm(`确定要删除卡组 "${deck.name}" 吗？`)) {
    removeDeck(deckId)
    if (expandedDeckId.value === deckId) {
      expandedDeckId.value = null
    }
  }
}

function getDeckTotalCards(deck: Deck): number {
  return deck.cards.reduce((sum, c) => sum + c.count, 0)
}

function getDeckAvgCost(deck: Deck): number {
  let totalCost = 0
  let totalCards = 0
  for (const dc of deck.cards) {
    const card = (cards.value || []).find(c => c.id === dc.cardId)
    if (card) {
      totalCost += card.cost * dc.count
      totalCards += dc.count
    }
  }
  return totalCards > 0 ? totalCost / totalCards : 0
}

function getDeckManaCurve(deck: Deck): Record<number, number> {
  const curve: Record<number, number> = {}
  for (const dc of deck.cards) {
    const card = (cards.value || []).find(c => c.id === dc.cardId)
    if (card) {
      curve[card.cost] = (curve[card.cost] || 0) + dc.count
    }
  }
  return curve
}

function maxManaCurveCount(deck: Deck): number {
  const curve = getDeckManaCurve(deck)
  return Math.max(1, ...Object.values(curve))
}

function getCardCountInDeck(deck: Deck, cardId: string): number {
  const dc = deck.cards.find(c => c.cardId === cardId)
  return dc ? dc.count : 0
}

function incrementCard(deckId: string, cardId: string) {
  addCardToDeck(deckId, cardId, 1)
}

function decrementCard(deckId: string, cardId: string) {
  removeCardFromDeck(deckId, cardId, 1)
}

function exportDeck(deck: Deck, format: 'txt' | 'json' | 'csv') {
  downloadDeck(deck, cards.value || [], format)
}

function validateDeckFn(deck: Deck) {
  const result = validateDeckUtil(deck, cards.value || [], {
    minCards: 10,
    maxCards: 100,
    maxCopies: 4,
  })
  validationResult.value[deck.id] = result
}
</script>
