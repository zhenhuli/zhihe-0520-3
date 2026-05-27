<template>
  <div class="flex flex-col gap-4">
    <!-- Start screen -->
    <div v-if="state.status === 'idle'" class="panel p-6 text-center">
      <div class="text-4xl mb-4">⚔️</div>
      <div class="text-lg font-bold text-slate-100 mb-2">简易对局模拟</div>
      <div class="text-sm text-slate-400 mb-6">
        使用当前编辑的卡牌构建双方牌库，开始一场模拟对局
      </div>
      <div class="text-xs text-slate-500 mb-4">
        当前牌库：<b class="text-slate-300">{{ cardCount }}</b> 张卡牌 ·
        共 <b class="text-slate-300">{{ totalCopies }}</b> 份
      </div>
      <button
        class="btn btn-primary px-6 py-3"
        :disabled="cardCount === 0"
        :class="{ 'opacity-50 cursor-not-allowed': cardCount === 0 }"
        @click="handleStartGame"
      >
        🎮 开始对局
      </button>
    </div>

    <!-- Game over screen -->
    <div v-if="state.status === 'ended'" class="panel p-6 text-center">
      <div class="text-5xl mb-4">{{ state.winner === 'player' ? '🏆' : state.winner === 'ai' ? '💀' : '🤝' }}</div>
      <div class="text-2xl font-bold mb-2" :class="winnerTextClass">
        {{ winnerText }}
      </div>
      <div class="text-sm text-slate-400 mb-6">{{ state.winReason }}</div>
      <div class="text-xs text-slate-500 mb-4">
        第 <b>{{ state.turn }}</b> 回合结束
      </div>
      <div class="flex gap-3 justify-center">
        <button class="btn btn-primary px-5 py-2" @click="handleStartGame">
          🔄 再来一局
        </button>
        <button class="btn btn-ghost px-5 py-2" @click="handleReset">
          返回编辑器
        </button>
      </div>
    </div>

    <!-- Game screen -->
    <div v-if="state.status === 'playing'" class="flex flex-col gap-4">
      <!-- Top bar: turn & phase -->
      <div class="flex items-center justify-between panel px-4 py-2">
        <div class="flex items-center gap-3 text-sm">
          <span class="text-slate-500">回合</span>
          <span class="text-xl font-bold text-indigo-300">{{ state.turn }}</span>
          <span class="text-slate-700">|</span>
          <span class="text-slate-500">阶段</span>
          <span class="font-semibold" :class="phaseTextClass">{{ PHASE_LABEL[state.currentPhase] }}</span>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="state.pendingAttackInstanceId"
            class="btn btn-ghost text-xs px-3 py-1.5"
            @click="cancelSelection"
          >
            取消攻击
          </button>
          <button
            class="btn btn-primary text-xs px-4 py-1.5"
            :disabled="!isPlayerTurn"
            :class="{ 'opacity-50 cursor-not-allowed': !isPlayerTurn }"
            @click="handleEndTurn"
          >
            {{ isPlayerTurn ? '⏭ 结束回合' : '🤖 AI 行动中...' }}
          </button>
        </div>
      </div>

      <!-- Players -->
      <div class="grid grid-cols-2 gap-4">
        <PlayerArea
          v-if="enemyData"
          :name="enemyData.name"
          :hp="enemyData.hp"
          :max-hp="enemyData.maxHp"
          :mana="enemyData.mana"
          :max-mana="enemyData.maxMana"
          :deck-count="enemyData.deck.length"
          :hand-count="enemyData.hand.length"
          :grave-count="enemyData.graveyard.length"
          :is-active="state.currentPlayerIndex === 1"
          :is-enemy="true"
        />
        <PlayerArea
          v-if="playerData"
          :name="playerData.name"
          :hp="playerData.hp"
          :max-hp="playerData.maxHp"
          :mana="playerData.mana"
          :max-mana="playerData.maxMana"
          :deck-count="playerData.deck.length"
          :hand-count="playerData.hand.length"
          :grave-count="playerData.graveyard.length"
          :is-active="state.currentPlayerIndex === 0"
          :is-enemy="false"
        />
      </div>

      <!-- Battlefield -->
      <BattleField
        v-if="playerData && enemyData"
        :player-field="playerData.field"
        :enemy-field="enemyData.field"
        :field-size="config.fieldSize"
        :pending-attack-instance-id="state.pendingAttackInstanceId"
        :selected-hand-index="state.selectedHandIndex"
        :is-player-turn="isPlayerTurn"
        :valid-enemy-target-ids="validEnemyTargetIds"
        @play-on-slot="playSelectedCard"
        @start-attack="startAttackSelection"
        @confirm-attack-target="confirmAttack"
      />

      <!-- Player hand -->
      <div v-if="playerData" class="panel p-3">
        <div class="flex items-center justify-between mb-2">
          <div class="text-[11px] text-slate-500 uppercase tracking-wider">
            我的手牌 ({{ playerData.hand.length }} / {{ config.handLimit }})
          </div>
          <div class="text-[11px] text-slate-500">
            点击卡牌选中 → 点击战场空位部署
          </div>
        </div>
        <div class="flex gap-2 overflow-x-auto pb-2 min-h-[110px]">
          <div
            v-for="(card, i) in playerData.hand"
            :key="card.instanceId"
            class="relative w-24 h-[100px] rounded-lg border-2 flex-shrink-0 cursor-pointer transition-all"
            :class="getHandCardClass(card, i)"
            @click="onHandCardClick(i)"
          >
            <div class="absolute inset-0 rounded-lg overflow-hidden" :class="cardBgClass(card.rarity)">
              <div class="h-full flex flex-col p-1.5">
                <div class="flex justify-between items-start">
                  <div class="w-6 h-6 rounded-full bg-indigo-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {{ card.cost }}
                  </div>
                  <span class="text-[9px] text-slate-300">{{ card.type }}</span>
                </div>
                <div class="text-[10px] font-bold text-white text-center leading-tight mt-1 truncate">
                  {{ card.name }}
                </div>
                <div class="flex-1 flex items-center justify-center text-lg">
                  {{ typeEmoji(card.type) }}
                </div>
                <div v-if="card.type === '单位'" class="flex justify-between text-[10px] font-bold px-1">
                  <span class="text-rose-300">❤{{ card.baseHp }}</span>
                  <span class="text-orange-300">⚔{{ card.baseDamage }}</span>
                </div>
              </div>
            </div>
            <div
              v-if="!canPlayCard(card)"
              class="absolute inset-0 rounded-lg bg-slate-900/60 flex items-center justify-center"
            >
              <span class="text-[10px] text-slate-400">
                {{ card.cost > (playerData?.mana || 0) ? '法力不足' : '场上已满' }}
              </span>
            </div>
          </div>
          <div v-if="playerData.hand.length === 0" class="text-xs text-slate-600 italic self-center mx-auto">
            手牌为空
          </div>
        </div>
      </div>

      <!-- Game log -->
      <div class="panel p-3 flex-1 min-h-[120px] max-h-[200px] overflow-y-auto">
        <div class="text-[11px] text-slate-500 uppercase tracking-wider mb-2">对局日志</div>
        <div class="space-y-1">
          <div
            v-for="log in reversedLogs"
            :key="log.id"
            class="text-xs leading-relaxed"
            :class="logTypeClass(log.type)"
          >
            <span class="text-slate-500">[T{{ log.turn }}]</span>
            <span class="text-slate-400 ml-1">{{ log.player }}:</span>
            <span class="ml-1">{{ log.text }}</span>
          </div>
          <div v-if="state.logs.length === 0" class="text-xs text-slate-600 italic">
            暂无日志
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BattleCard, CardRarity } from '../types'

const { cards, stats } = useGameState()
const sim = useGameSimulator()
const { state, config, initGame, selectHandCard, playSelectedCard, confirmAttack, startAttackSelection, endCurrentTurn, cancelSelection, resetGame, PHASE_LABEL } = sim

const cardCount = computed(() => stats.value.total)
const totalCopies = computed(() => stats.value.totalCopies)

const playerData = computed(() => state.players?.[0] || null)
const enemyData = computed(() => state.players?.[1] || null)

const isPlayerTurn = computed(() => state.currentPlayerIndex === 0)

const validEnemyTargetIds = computed<string[]>(() => {
  if (!state.pendingAttackInstanceId || !enemyData.value) return []
  const result: string[] = []
  const attacker = playerData.value?.field.find(c => c?.instanceId === state.pendingAttackInstanceId)
  if (!attacker) return result

  const hasTaunt = enemyData.value.field.some(
    c => c && c.currentHp > 0 && (c.tags.includes('嘲讽') || c.description.includes('嘲讽')),
  )

  if (hasTaunt) {
    return enemyData.value.field
      .filter(c => c && c.currentHp > 0 && (c.tags.includes('嘲讽') || c.description.includes('嘲讽')))
      .map(c => c!.instanceId)
  }

  return enemyData.value.field
    .filter(c => c && c.currentHp > 0)
    .map(c => c!.instanceId)
})

const reversedLogs = computed(() => [...state.logs].reverse())

const winnerText = computed(() => {
  if (state.winner === 'player') return '胜利！'
  if (state.winner === 'ai') return '失败...'
  return '平局'
})

const winnerTextClass = computed(() => {
  if (state.winner === 'player') return 'text-amber-300'
  if (state.winner === 'ai') return 'text-rose-300'
  return 'text-slate-300'
})

const phaseTextClass = computed(() => {
  switch (state.currentPhase) {
    case 'draw': return 'text-sky-300'
    case 'main': return 'text-emerald-300'
    case 'attack': return 'text-amber-300'
    case 'end': return 'text-slate-400'
    default: return 'text-slate-300'
  }
})

function cardBgClass(rarity: CardRarity) {
  switch (rarity) {
    case 'rare': return 'bg-gradient-to-br from-blue-800 via-blue-900 to-slate-900'
    case 'epic': return 'bg-gradient-to-br from-purple-800 via-purple-900 to-slate-900'
    case 'legendary': return 'bg-gradient-to-br from-amber-700 via-amber-800 to-slate-900'
    default: return 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900'
  }
}

function typeEmoji(type: string) {
  if (type === '法术') return '✨'
  if (type === '装备') return '🗡'
  if (type === '羁绊') return '🔗'
  if (type === '资源') return '💎'
  return '🛡'
}

function canPlayCard(card: BattleCard) {
  if (!playerData.value) return false
  if (playerData.value.mana < card.cost) return false
  if (card.type !== '单位') return true
  return playerData.value.field.some(s => s === null)
}

function getHandCardClass(card: BattleCard, i: number) {
  const selected = state.selectedHandIndex === i
  const playable = canPlayCard(card) && isPlayerTurn.value

  if (selected) {
    return 'border-indigo-400 ring-2 ring-indigo-400/50 -translate-y-2'
  }
  if (playable) {
    return 'border-emerald-500/50 hover:-translate-y-1 hover:border-emerald-400'
  }
  return 'border-slate-600/40'
}

function onHandCardClick(i: number) {
  if (!isPlayerTurn.value) return
  if (state.selectedHandIndex === i) {
    const card = playerData.value?.hand[i]
    if (card && card.type !== '单位') {
      playSelectedCard(null)
    } else {
      cancelSelection()
    }
  } else {
    selectHandCard(i)
  }
}

function logTypeClass(type: string) {
  switch (type) {
    case 'play': return 'text-sky-300'
    case 'attack': return 'text-amber-300'
    case 'damage': return 'text-rose-300'
    case 'death': return 'text-red-400'
    case 'turn': return 'text-indigo-300'
    case 'win': return 'text-emerald-300 font-bold'
    case 'draw': return 'text-cyan-300'
    default: return 'text-slate-400'
  }
}

function handleStartGame() {
  if (cards.value.length === 0) {
    alert('请先创建至少一张卡牌再开始对局')
    return
  }
  initGame(cards.value)
}

function handleEndTurn() {
  endCurrentTurn()
}

function handleReset() {
  resetGame()
}
</script>