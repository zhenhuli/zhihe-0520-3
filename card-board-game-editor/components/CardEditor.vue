<template>
  <div class="panel p-4 flex flex-col gap-4">
    <template v-if="card">
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-xs text-slate-500 mb-1">当前编辑</div>
          <input
            v-model="local.name"
            class="bg-transparent text-xl font-bold text-slate-100 outline-none focus:bg-slate-900/60 rounded px-2 py-1 -ml-2 w-full"
            placeholder="卡牌名称"
            @change="commit"
          />
        </div>
        <span class="chip shrink-0" :class="rarityClass">{{ RARITY_LABEL[card.rarity] }}</span>
      </div>

      <div class="flex gap-1 border-b border-slate-800">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="px-3 py-2 text-sm font-medium border-b-2 transition-colors"
          :class="activeTab === tab.key
            ? 'border-indigo-500 text-indigo-300'
            : 'border-transparent text-slate-500 hover:text-slate-300'"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <div v-show="activeTab === 'basic'" class="flex flex-col gap-4">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">类型</label>
            <select v-model="local.type" class="input" @change="commit">
              <option v-for="t in CARD_TYPES" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
          <div>
            <label class="label">稀有度</label>
            <select v-model="local.rarity" class="input" @change="commit">
              <option v-for="r in CARD_RARITIES" :key="r" :value="r">{{ RARITY_LABEL[r] }}</option>
            </select>
          </div>
          <div>
            <label class="label">费用 (Cost)</label>
            <input type="number" v-model.number="local.cost" class="input" min="0" @change="commit" />
          </div>
          <div>
            <label class="label">派系</label>
            <input v-model="local.faction" class="input" placeholder="如：火焰 / 自然" @change="commit" />
          </div>
          <div v-if="local.type === '单位'">
            <label class="label">血量 (HP)</label>
            <input type="number" v-model.number="local.hp" class="input" min="0" @change="commit" />
          </div>
          <div v-if="local.type === '单位'">
            <label class="label">伤害 (DMG)</label>
            <input type="number" v-model.number="local.damage" class="input" min="0" @change="commit" />
          </div>
          <div v-if="local.type !== '单位'" class="grid grid-cols-2 gap-2">
            <div>
              <label class="label">血量</label>
              <input type="number" v-model.number="local.hp" class="input" min="0" @change="commit" />
            </div>
            <div>
              <label class="label">伤害</label>
              <input type="number" v-model.number="local.damage" class="input" min="0" @change="commit" />
            </div>
          </div>
          <div>
            <label class="label">复制数量</label>
            <input type="number" v-model.number="local.copyCount" class="input" min="0" @change="commit" />
          </div>
        </div>

        <div>
          <label class="label">技能 / 描述</label>
          <textarea
            v-model="local.description"
            rows="4"
            class="input resize-none leading-relaxed"
            placeholder="描述卡牌的技能与效果，例如：【灼烧】对目标造成1点伤害..."
            @change="commit"
          />
        </div>

        <div>
          <label class="label">风味文本</label>
          <input
            v-model="local.flavorText"
            class="input italic"
            placeholder="卡牌故事或背景...（斜体显示）"
            @change="commit"
          />
        </div>

        <div>
          <label class="label">标签 (空格或逗号分隔)</label>
          <input
            :value="local.tags.join(', ')"
            class="input"
            placeholder="法师, 火焰, 远程..."
            @change="onTagsChange"
          />
        </div>

        <div>
          <label class="label">卡图 URL</label>
          <input
            v-model="local.art"
            class="input"
            placeholder="https://... 图片地址（可留空）"
            @change="commit"
          />
        </div>
      </div>

      <div v-show="activeTab === 'skills'" class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <div>
            <label class="label !mb-0">被动技能</label>
            <div class="text-xs text-slate-500 mt-1">为卡牌添加被动效果与触发条件</div>
          </div>
          <button class="btn btn-primary text-xs py-1" @click="addPassiveSkill">+ 添加技能</button>
        </div>

        <div v-if="!local.passiveSkills.length" class="text-xs text-slate-500 italic py-4 text-center">
          暂无被动技能，点击「+ 添加技能」开始创建
        </div>

        <div
          v-for="(skill, sIdx) in local.passiveSkills"
          :key="skill.id"
          class="relative border border-slate-700/60 rounded-lg p-3 bg-slate-900/40"
        >
          <button
            class="absolute top-2 right-2 w-6 h-6 rounded bg-slate-700 hover:bg-red-500 text-slate-300 text-xs flex items-center justify-center"
            @click="removePassiveSkill(sIdx)"
          >
            ✕
          </button>

          <div class="grid grid-cols-2 gap-2 mb-2 pr-8">
            <div>
              <label class="label !text-[11px] !mb-1">技能名称</label>
              <input
                v-model="skill.name"
                class="input-sm w-full"
                placeholder="如：烈焰共鸣"
                @change="commit"
              />
            </div>
            <div>
              <label class="label !text-[11px] !mb-1">触发事件</label>
              <select
                :value="skillTriggerEvent(skill.id)"
                class="input-sm w-full"
                @change="onTriggerEventChange(skill, $event)"
              >
                <option value="none">无触发条件</option>
                <option
                  v-for="(label, eventKey) in TRIGGER_EVENT_LABEL"
                  :key="eventKey"
                  :value="eventKey"
                >
                  {{ label }}
                </option>
              </select>
            </div>
          </div>

          <div class="mb-2">
            <label class="label !text-[11px] !mb-1">技能描述</label>
            <textarea
              v-model="skill.description"
              rows="2"
              class="input-sm w-full resize-none"
              placeholder="描述技能的具体效果..."
              @change="commit"
            />
          </div>

          <div v-if="skill.trigger" class="border-t border-slate-700/40 pt-2">
            <label class="label !text-[11px] !mb-1">
              触发条件说明
              <span class="text-slate-500 font-normal ml-1">
                (当「{{ TRIGGER_EVENT_LABEL[skill.trigger.event] || skill.trigger.event }}」时)
              </span>
            </label>
            <input
              v-model="skill.trigger.description"
              class="input-sm w-full"
              placeholder="如：打出另一张火焰卡牌时"
              @change="commit"
            />
          </div>
        </div>
      </div>

      <div v-show="activeTab === 'attributes'" class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <label class="label !mb-0">自定义属性</label>
          <button class="btn btn-ghost text-xs py-1" @click="addAttribute">+ 添加</button>
        </div>
        <div class="space-y-2">
          <div
            v-for="(attr, i) in local.attributes"
            :key="i"
            class="flex items-center gap-2"
          >
            <input
              v-model="attr.key"
              class="input-sm flex-1"
              placeholder="属性名 (如: 护盾)"
              @change="commit"
            />
            <input
              v-model="attr.value"
              class="input-sm w-20 text-center"
              placeholder="值"
              @change="commit"
            />
            <button
              class="w-7 h-7 rounded bg-slate-700 hover:bg-red-500 text-slate-300 text-xs"
              @click="removeAttribute(i)"
            >
              ✕
            </button>
          </div>
          <div v-if="!local.attributes.length" class="text-xs text-slate-500 italic">
            无自定义属性
          </div>
        </div>
      </div>

      <div v-if="errors.length" class="px-3 py-2 rounded-lg bg-red-500/20 border border-red-500/40">
        <div class="text-xs font-medium text-red-300 mb-1">校验错误</div>
        <ul class="text-xs text-red-200 list-disc pl-4">
          <li v-for="e in errors" :key="e">{{ e }}</li>
        </ul>
      </div>
    </template>

    <div v-else class="p-10 text-center text-slate-500">
      <div class="text-5xl mb-3">🎴</div>
      <div>选择一张卡牌或新建开始编辑</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  CARD_TYPES,
  CARD_RARITIES,
  RARITY_LABEL,
  TRIGGER_EVENT_LABEL,
  type CardData,
  type CardRarity,
  type PassiveSkill,
  type TriggerEventType,
} from '../types'
import { createPassiveSkill, createTrigger } from '../utils/card'

const props = defineProps<{
  card: CardData | null
}>()

const emit = defineEmits<{
  (e: 'update', patch: Partial<CardData>): void
}>()

const { selectedErrors } = useGameState()

const tabs = [
  { key: 'basic', label: '基础信息' },
  { key: 'skills', label: '被动技能' },
  { key: 'attributes', label: '自定义属性' },
] as const

const activeTab = ref<typeof tabs[number]['key']>('basic')

const local = reactive<CardData>({
  id: '',
  name: '',
  type: '单位',
  rarity: 'common',
  cost: 0,
  hp: 0,
  damage: 0,
  description: '',
  art: '',
  faction: '',
  tags: [],
  attributes: [],
  flavorText: '',
  copyCount: 1,
  passiveSkills: [],
})

const errors = computed(() => selectedErrors.value)

const rarityClass = computed(() => {
  switch ((local.rarity as CardRarity)) {
    case 'rare': return 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
    case 'epic': return 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
    case 'legendary': return 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
    default: return 'bg-slate-700/40 text-slate-300 border border-slate-600/40'
  }
})

watch(() => props.card, (c) => {
  if (c) Object.assign(local, c)
}, { immediate: true, deep: true })

function commit() {
  if (!props.card) return
  emit('update', { ...local })
}

function onTagsChange(e: Event) {
  const v = (e.target as HTMLInputElement).value
  local.tags = v.split(/[ ,，]+/).map(s => s.trim()).filter(Boolean)
  commit()
}

function addAttribute() {
  local.attributes.push({ key: '', value: 0 })
  commit()
}

function removeAttribute(i: number) {
  local.attributes.splice(i, 1)
  commit()
}

function addPassiveSkill() {
  local.passiveSkills.push(createPassiveSkill())
  commit()
}

function removePassiveSkill(idx: number) {
  local.passiveSkills.splice(idx, 1)
  commit()
}

function skillTriggerEvent(skillId: string): string {
  const skill = (local.passiveSkills || []).find(s => s.id === skillId)
  return skill?.trigger?.event || 'none'
}

function onTriggerEventChange(skill: PassiveSkill, e: Event) {
  const val = (e.target as HTMLSelectElement).value
  if (val === 'none') {
    skill.trigger = null
  } else {
    if (!skill.trigger) {
      skill.trigger = createTrigger({ event: val as TriggerEventType })
    } else {
      skill.trigger.event = val as TriggerEventType
    }
  }
  commit()
}
</script>
