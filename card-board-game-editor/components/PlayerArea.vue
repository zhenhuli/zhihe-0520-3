<template>
  <div
    class="panel p-3 flex items-center gap-3"
    :class="{
      'ring-2 ring-indigo-500/60 shadow-lg shadow-indigo-500/10': isActive,
      'ring-2 ring-rose-500/40': isEnemy && isActive,
      'opacity-60': !isActive,
    }"
  >
    <div
      class="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shrink-0"
      :class="isEnemy ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'"
    >
      {{ isEnemy ? '🤖' : '👤' }}
    </div>

    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 mb-1">
        <span class="text-sm font-semibold text-slate-100 truncate">{{ name }}</span>
        <span v-if="isActive" class="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-500/40">
          行动中
        </span>
      </div>
      <div class="flex items-center gap-3 text-xs">
        <span class="flex items-center gap-1 text-rose-300" title="生命值">
          ❤ <b>{{ hp }}</b> / {{ maxHp }}
        </span>
        <span class="flex items-center gap-1 text-sky-300" title="法力">
          💎 <b>{{ mana }}</b> / {{ maxMana }}
        </span>
        <span class="flex items-center gap-1 text-slate-400" title="牌库">
          📚 <b>{{ deckCount }}</b>
        </span>
        <span class="flex items-center gap-1 text-slate-400" title="手牌">
          ✋ <b>{{ handCount }}</b>
        </span>
        <span class="flex items-center gap-1 text-slate-400" title="墓地">
          ⚰ <b>{{ graveCount }}</b>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  name: string
  hp: number
  maxHp: number
  mana: number
  maxMana: number
  deckCount: number
  handCount: number
  graveCount: number
  isActive: boolean
  isEnemy: boolean
}>()
</script>