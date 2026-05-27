<template>
  <div class="space-y-4">
    <!-- Enemy field -->
    <div class="panel p-3">
      <div class="text-[11px] text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
        <span>敌方战场</span>
        <span class="text-slate-500">{{ enemyField.filter(Boolean).length }} / {{ fieldSize }}</span>
      </div>
      <div class="flex gap-2 justify-center">
        <div
          v-for="(card, i) in enemyField"
          :key="'e' + i"
          class="relative w-20 h-28 rounded-lg border-2 border-dashed flex items-center justify-center transition-all"
          :class="getEnemySlotClass(card, i)"
          @click="onEnemySlotClick(card, i)"
        >
          <template v-if="card">
            <div class="absolute inset-0 rounded-lg overflow-hidden" :class="cardBgClass(card.rarity)">
              <div class="h-full flex flex-col p-1">
                <div class="text-[9px] font-bold text-white truncate text-center leading-tight">
                  {{ card.name }}
                </div>
                <div class="flex-1 flex items-center justify-center text-2xl">
                  {{ typeEmoji(card.type) }}
                </div>
                <div class="flex justify-between text-[10px] font-bold px-0.5">
                  <span class="text-rose-300">❤{{ card.currentHp }}</span>
                  <span class="text-orange-300">⚔{{ card.currentDamage }}</span>
                </div>
              </div>
            </div>
            <div
              v-if="card.justPlayed"
              class="absolute -top-1 -right-1 text-[8px] px-1 py-0.5 rounded bg-amber-500/80 text-amber-900 font-bold"
            >
              新
            </div>
            <div
              v-if="card.hasAttacked"
              class="absolute inset-0 rounded-lg bg-slate-900/50 flex items-center justify-center"
            >
              <span class="text-[10px] text-slate-400">已行动</span>
            </div>
            <div
              v-if="isValidAttackTarget(card)"
              class="absolute inset-0 rounded-lg ring-2 ring-red-500/70 animate-pulse cursor-crosshair"
            ></div>
          </template>
          <template v-else>
            <span class="text-slate-700 text-xs">空</span>
          </template>
        </div>
      </div>
    </div>

    <!-- Middle divider -->
    <div class="relative h-6 flex items-center justify-center">
      <div class="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
      <div class="relative px-3 text-[10px] text-slate-500 uppercase tracking-widest bg-slate-900">
        战 线
      </div>
    </div>

    <!-- Player field -->
    <div class="panel p-3">
      <div class="text-[11px] text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
        <span>我方战场</span>
        <span class="text-slate-500">{{ playerField.filter(Boolean).length }} / {{ fieldSize }}</span>
      </div>
      <div class="flex gap-2 justify-center">
        <div
          v-for="(card, i) in playerField"
          :key="'p' + i"
          class="relative w-20 h-28 rounded-lg border-2 border-dashed flex items-center justify-center transition-all cursor-pointer"
          :class="getPlayerSlotClass(card, i)"
          @click="onPlayerSlotClick(card, i)"
        >
          <template v-if="card">
            <div class="absolute inset-0 rounded-lg overflow-hidden" :class="cardBgClass(card.rarity)">
              <div class="h-full flex flex-col p-1">
                <div class="text-[9px] font-bold text-white truncate text-center leading-tight">
                  {{ card.name }}
                </div>
                <div class="flex-1 flex items-center justify-center text-2xl">
                  {{ typeEmoji(card.type) }}
                </div>
                <div class="flex justify-between text-[10px] font-bold px-0.5">
                  <span class="text-rose-300">❤{{ card.currentHp }}</span>
                  <span class="text-orange-300">⚔{{ card.currentDamage }}</span>
                </div>
              </div>
            </div>
            <div
              v-if="card.justPlayed"
              class="absolute -top-1 -right-1 text-[8px] px-1 py-0.5 rounded bg-amber-500/80 text-amber-900 font-bold"
            >
              新
            </div>
            <div
              v-if="canAttackWith(card) && !card.hasAttacked"
              class="absolute inset-0 rounded-lg ring-2 ring-emerald-500/60 cursor-pointer hover:ring-emerald-400"
            ></div>
            <div
              v-if="card.hasAttacked"
              class="absolute inset-0 rounded-lg bg-slate-900/50 flex items-center justify-center"
            >
              <span class="text-[10px] text-slate-400">已行动</span>
            </div>
          </template>
          <template v-else>
            <span class="text-slate-700 text-xs">空</span>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BattleCard, CardRarity } from '../types'

const props = defineProps<{
  playerField: (BattleCard | null)[]
  enemyField: (BattleCard | null)[]
  fieldSize: number
  pendingAttackInstanceId: string | null
  selectedHandIndex: number | null
  isPlayerTurn: boolean
  validEnemyTargetIds: string[]
}>()

const emit = defineEmits<{
  (e: 'play-on-slot', slotIndex: number): void
  (e: 'start-attack', instanceId: string): void
  (e: 'confirm-attack-target', targetId: string | null): void
}>()

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

function canAttackWith(card: BattleCard) {
  return card.type === '单位' && card.canAttack && !card.hasAttacked && card.currentHp > 0 && !card.justPlayed
}

function isValidAttackTarget(card: BattleCard) {
  return props.pendingAttackInstanceId !== null && props.validEnemyTargetIds.includes(card.instanceId)
}

function getEnemySlotClass(card: BattleCard | null, _i: number) {
  if (card) {
    if (isValidAttackTarget(card)) {
      return 'border-red-500/60 bg-red-500/10 cursor-crosshair'
    }
    return 'border-slate-600/50'
  }
  return 'border-slate-700/40'
}

function getPlayerSlotClass(card: BattleCard | null, _i: number) {
  if (card) {
    if (props.pendingAttackInstanceId === card.instanceId) {
      return 'border-emerald-400/80 bg-emerald-500/10 ring-2 ring-emerald-400/50'
    }
    if (canAttackWith(card) && !card.hasAttacked) {
      return 'border-emerald-500/50 hover:bg-emerald-500/10'
    }
    return 'border-slate-600/50'
  }
  if (props.selectedHandIndex !== null && props.isPlayerTurn) {
    return 'border-indigo-500/40 bg-indigo-500/5 hover:bg-indigo-500/15'
  }
  return 'border-slate-700/40'
}

function onPlayerSlotClick(card: BattleCard | null, i: number) {
  if (!props.isPlayerTurn) return

  if (card) {
    if (props.pendingAttackInstanceId) {
      return
    }
    if (canAttackWith(card) && !card.hasAttacked) {
      emit('start-attack', card.instanceId)
    }
  } else {
    if (props.selectedHandIndex !== null) {
      emit('play-on-slot', i)
    }
  }
}

function onEnemySlotClick(card: BattleCard | null, _i: number) {
  if (!props.isPlayerTurn) return
  if (props.pendingAttackInstanceId && card && isValidAttackTarget(card)) {
    emit('confirm-attack-target', card.instanceId)
  }
}
</script>