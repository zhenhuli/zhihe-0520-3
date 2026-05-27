<template>
  <div class="panel p-6 flex flex-col items-center gap-4">
    <div class="text-xs font-medium text-slate-400 uppercase tracking-widest">卡牌预览</div>

    <div
      class="relative w-[280px] h-[400px] rounded-2xl overflow-hidden shadow-2xl transition-transform duration-300 hover:scale-[1.02]"
      :class="frameClass"
    >
      <!-- rarity glow -->
      <div class="absolute inset-0 opacity-30" :class="glowClass"></div>

      <!-- background gradient -->
      <div class="absolute inset-0" :class="bgClass"></div>

      <!-- art area -->
      <div class="relative h-[160px] overflow-hidden border-b border-white/10">
        <img
          v-if="card?.art"
          :src="card.art"
          class="w-full h-full object-cover"
          alt=""
          @error="onArtError"
        />
        <div v-else class="w-full h-full flex items-center justify-center text-6xl bg-black/30">
          {{ defaultEmoji }}
        </div>
        <div class="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/60 to-transparent"></div>

        <!-- cost badge -->
        <div
          class="absolute top-2 left-2 w-12 h-12 rounded-full flex items-center justify-center text-2xl font-black shadow-lg border-2 border-white/40"
          :class="costBgClass"
        >
          {{ card?.cost ?? 0 }}
        </div>

        <!-- rarity gem -->
        <div
          class="absolute top-2 right-2 w-6 h-6 rounded-full shadow-lg border border-white/40"
          :class="gemClass"
        ></div>
      </div>

      <!-- name bar -->
      <div class="relative px-3 py-2 flex items-center justify-between">
        <div class="font-display font-bold text-lg text-white drop-shadow truncate flex-1">
          {{ card?.name || '新卡牌' }}
        </div>
        <span class="ml-2 px-2 py-0.5 text-[10px] uppercase tracking-wider rounded bg-black/40 text-white/80 border border-white/20">
          {{ card?.type || '单位' }}
        </span>
      </div>

      <!-- faction & tags -->
      <div class="px-3 flex flex-wrap gap-1 items-center">
        <span v-if="card?.faction" class="chip bg-amber-400/20 text-amber-200 border border-amber-400/30">
          {{ card.faction }}
        </span>
        <span
          v-for="tag in card?.tags?.slice(0, 3) || []"
          :key="tag"
          class="chip bg-slate-600/40 text-slate-200 border border-slate-400/30"
        >
          {{ tag }}
        </span>
      </div>

      <!-- description -->
      <div class="relative px-3 py-2 flex-1 flex flex-col overflow-hidden">
        <div class="text-[13px] leading-relaxed text-white/95 whitespace-pre-wrap flex-1 overflow-auto">
          <span v-html="renderDescription"></span>
        </div>

        <!-- passive skills section -->
        <div v-if="card?.passiveSkills?.length" class="mt-2 space-y-1 border-t border-white/10 pt-2">
          <div
            v-for="skill in card.passiveSkills"
            :key="skill.id"
            class="text-[11px] text-white/80"
          >
            <span class="text-amber-300 font-bold">⚡ {{ skill.name }}</span>
            <span v-if="skill.trigger" class="text-cyan-300 ml-1">
              [{{ TRIGGER_EVENT_LABEL[skill.trigger.event] || skill.trigger.event }}]
            </span>
            <span class="block text-white/70 mt-0.5">{{ skill.description }}</span>
          </div>
        </div>

        <div v-if="card?.flavorText" class="text-[11px] italic text-white/60 mt-2 border-t border-white/10 pt-2">
          "{{ card.flavorText }}"
        </div>
      </div>

      <!-- footer stats -->
      <div v-if="card?.type === '单位'" class="relative px-3 pb-3 flex items-center justify-between">
        <div
          class="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-bold shadow-lg border-2 border-white/30"
          :title="'血量 ' + (card?.hp ?? 0)"
        >
          {{ card?.hp ?? 0 }}
        </div>
        <div
          class="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold shadow-lg border-2 border-white/30"
          :title="'伤害 ' + (card?.damage ?? 0)"
        >
          {{ card?.damage ?? 0 }}
        </div>
      </div>

      <!-- custom attributes chips -->
      <div v-if="card?.attributes?.length" class="absolute top-[172px] right-2 flex flex-col gap-1">
        <div
          v-for="(a, i) in card.attributes"
          :key="i"
          v-show="a.key"
          class="px-2 py-0.5 text-[10px] font-bold rounded bg-black/70 text-white border border-white/20"
        >
          {{ a.key }}: {{ a.value }}
        </div>
      </div>
    </div>

    <div class="flex items-center gap-3 text-xs text-slate-400">
      <span>卡牌 ID: <span class="font-mono text-slate-500">{{ card?.id?.slice(0, 14) }}</span></span>
      <span>·</span>
      <span>共 <span class="text-slate-200 font-semibold">{{ card?.copyCount ?? 0 }}</span> 份</span>
      <span v-if="card?.passiveSkills?.length">·</span>
      <span v-if="card?.passiveSkills?.length">
        <span class="text-amber-300 font-semibold">{{ card.passiveSkills.length }}</span> 个被动技能
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TRIGGER_EVENT_LABEL, type CardData, type CardRarity } from '../types'

const props = defineProps<{
  card: CardData | null
}>()

const rarity = computed<CardRarity>(() => props.card?.rarity || 'common')

const frameClass = computed(() => {
  const r = rarity.value
  if (r === 'legendary') return 'border-2 border-amber-400'
  if (r === 'epic') return 'border-2 border-purple-400'
  if (r === 'rare') return 'border-2 border-blue-400'
  return 'border border-slate-600'
})

const glowClass = computed(() => {
  const r = rarity.value
  if (r === 'legendary') return 'bg-amber-500/30 shadow-[0_0_40px_rgba(251,191,36,0.5)]'
  if (r === 'epic') return 'bg-purple-500/30'
  if (r === 'rare') return 'bg-blue-500/30'
  return 'bg-slate-500/10'
})

const bgClass = computed(() => {
  const r = rarity.value
  if (r === 'legendary') return 'bg-gradient-to-br from-amber-900 via-slate-900 to-slate-950'
  if (r === 'epic') return 'bg-gradient-to-br from-purple-900 via-slate-900 to-slate-950'
  if (r === 'rare') return 'bg-gradient-to-br from-blue-900 via-slate-900 to-slate-950'
  return 'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950'
})

const costBgClass = computed(() => {
  if (rarity.value === 'legendary') return 'bg-amber-500 text-slate-900'
  return 'bg-indigo-500'
})

const gemClass = computed(() => {
  if (rarity.value === 'legendary') return 'bg-amber-400'
  if (rarity.value === 'epic') return 'bg-purple-400'
  if (rarity.value === 'rare') return 'bg-blue-400'
  return 'bg-slate-400'
})

const defaultEmoji = computed(() => {
  const t = props.card?.type
  if (t === '法术') return '✨'
  if (t === '装备') return '🗡'
  if (t === '羁绊') return '🔗'
  if (t === '资源') return '💎'
  return '🛡'
})

const renderDescription = computed(() => {
  if (!props.card?.description) return ''
  return props.card.description
    .replace(/【([^】]+)】/g, '<span class="text-amber-300 font-bold">【$1】</span>')
    .replace(/\{(\d+)\}/g, '<span class="text-cyan-300 font-bold">$1</span>')
})

function onArtError(e: Event) {
  (e.target as HTMLImageElement).style.display = 'none'
}
</script>
