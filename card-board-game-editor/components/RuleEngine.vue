<template>
  <div class="panel p-4">
    <div class="flex items-center justify-between mb-4">
      <div>
        <div class="text-sm font-semibold text-slate-200">规则引擎</div>
        <div class="text-xs text-slate-500 mt-0.5">定义游戏中的触发规则与自动效果</div>
      </div>
      <button class="btn btn-primary text-xs" @click="addRule">+ 新建规则</button>
    </div>

    <div v-if="!rules.length" class="text-xs text-slate-500 italic py-8 text-center">
      暂无规则，点击「+ 新建规则」开始创建
    </div>

    <div class="space-y-3">
      <div
        v-for="rule in rules"
        :key="rule.id"
        class="border border-slate-700/60 rounded-lg overflow-hidden"
      >
        <div
          class="flex items-center gap-3 px-4 py-3 bg-slate-900/60 cursor-pointer"
          @click="toggleRule(rule.id)"
        >
          <span class="text-lg">{{ expandedRuleId === rule.id ? '▼' : '▶' }}</span>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-medium text-slate-200 truncate">{{ rule.name }}</span>
              <span
                class="px-2 py-0.5 text-[10px] rounded-full"
                :class="rule.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-600 text-slate-400'"
              >
                {{ rule.status === 'active' ? '已启用' : '已禁用' }}
              </span>
            </div>
            <div class="text-xs text-slate-500 truncate">{{ rule.description || '无描述' }}</div>
          </div>
          <div class="flex items-center gap-1" @click.stop>
            <button
              class="w-7 h-7 rounded bg-slate-700 hover:bg-indigo-500 text-slate-300 text-xs flex items-center justify-center"
              title="复制规则"
              @click="handleDuplicateRule(rule.id)"
            >
              📋
            </button>
            <button
              class="w-7 h-7 rounded bg-slate-700 hover:bg-red-500 text-slate-300 text-xs flex items-center justify-center"
              title="删除规则"
              @click="handleRemoveRule(rule.id)"
            >
              ✕
            </button>
          </div>
        </div>

        <div v-show="expandedRuleId === rule.id" class="p-4 border-t border-slate-700/60 bg-slate-900/30">
          <div class="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label class="label !text-[11px] !mb-1">规则名称</label>
              <input
                class="input-sm w-full"
                :value="rule.name"
                placeholder="规则名称"
                @input="onRuleInput(rule.id, 'name', ($event.target as HTMLInputElement).value)"
              />
            </div>
            <div>
              <label class="label !text-[11px] !mb-1">优先级 (数字越小越先执行)</label>
              <input
                type="number"
                class="input-sm w-full"
                :value="rule.priority"
                min="0"
                @input="onRuleInput(rule.id, 'priority', Number(($event.target as HTMLInputElement).value))"
              />
            </div>
            <div>
              <label class="label !text-[11px] !mb-1">触发事件</label>
              <select
                class="input-sm w-full"
                :value="rule.trigger"
                @change="onRuleInput(rule.id, 'trigger', ($event.target as HTMLSelectElement).value)"
              >
                <option v-for="(label, key) in TRIGGER_EVENT_LABEL" :key="key" :value="key">
                  {{ label }}
                </option>
              </select>
            </div>
            <div>
              <label class="label !text-[11px] !mb-1">状态</label>
              <select
                class="input-sm w-full"
                :value="rule.status"
                @change="onRuleInput(rule.id, 'status', ($event.target as HTMLSelectElement).value)"
              >
                <option value="active">已启用</option>
                <option value="disabled">已禁用</option>
                <option value="draft">草稿</option>
              </select>
            </div>
          </div>

          <div class="mb-4">
            <label class="label !text-[11px] !mb-1">规则描述</label>
            <textarea
              class="input-sm w-full resize-none"
              rows="2"
              :value="rule.description"
              placeholder="描述规则的作用..."
              @input="onRuleInput(rule.id, 'description', ($event.target as HTMLTextAreaElement).value)"
            />
          </div>

          <div class="mb-4">
            <div class="flex items-center justify-between mb-2">
              <label class="label !text-[11px] !mb-0">触发条件 (全部满足才执行)</label>
              <button class="btn btn-ghost text-xs py-0.5" @click="addCondition(rule.id)">+ 添加条件</button>
            </div>
            <div v-if="!rule.conditions.length" class="text-xs text-slate-500 italic py-2">
              无条件限制 - 触发事件时直接执行
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="(cond, idx) in rule.conditions"
                :key="cond.id"
                class="flex items-center gap-2 p-2 bg-slate-800/50 rounded"
              >
                <span class="text-xs text-slate-400">#{{ idx + 1 }}</span>
                <select
                  class="input-sm !py-1 flex-1"
                  :value="cond.field"
                  @change="onConditionChange(rule.id, cond.id, 'field', ($event.target as HTMLSelectElement).value)"
                >
                  <option v-for="f in RULE_FIELDS" :key="f.value" :value="f.value">{{ f.label }}</option>
                </select>
                <select
                  class="input-sm !py-1 w-28"
                  :value="cond.operator"
                  @change="onConditionChange(rule.id, cond.id, 'operator', ($event.target as HTMLSelectElement).value)"
                >
                  <option v-for="op in CONDITION_OPERATORS" :key="op.value" :value="op.value">{{ op.label }}</option>
                </select>
                <input
                  class="input-sm !py-1 w-24"
                  :value="String(cond.value)"
                  placeholder="值"
                  @input="onConditionChange(rule.id, cond.id, 'value', ($event.target as HTMLInputElement).value)"
                />
                <button
                  class="w-6 h-6 rounded bg-slate-700 hover:bg-red-500 text-slate-300 text-xs flex items-center justify-center shrink-0"
                  @click="removeCondition(rule.id, cond.id)"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="label !text-[11px] !mb-0">执行动作</label>
              <button class="btn btn-ghost text-xs py-0.5" @click="addAction(rule.id)">+ 添加动作</button>
            </div>
            <div v-if="!rule.actions.length" class="text-xs text-slate-500 italic py-2">
              暂无动作 - 点击「+ 添加动作」创建
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="(action, idx) in rule.actions"
                :key="action.id"
                class="flex items-center gap-2 p-2 bg-slate-800/50 rounded"
              >
                <span class="text-xs text-slate-400">#{{ idx + 1 }}</span>
                <select
                  class="input-sm !py-1 w-32"
                  :value="action.type"
                  @change="onActionChange(rule.id, action.id, 'type', ($event.target as HTMLSelectElement).value)"
                >
                  <option v-for="t in ACTION_TYPES" :key="t.value" :value="t.value">{{ t.label }}</option>
                </select>
                <select
                  class="input-sm !py-1 w-36"
                  :value="action.target"
                  @change="onActionChange(rule.id, action.id, 'target', ($event.target as HTMLSelectElement).value)"
                >
                  <option v-for="t in TARGET_TYPES" :key="t.value" :value="t.value">{{ t.label }}</option>
                </select>
                <input
                  type="number"
                  class="input-sm !py-1 w-16"
                  :value="action.value"
                  placeholder="数值"
                  min="0"
                  @input="onActionChange(rule.id, action.id, 'value', Number(($event.target as HTMLInputElement).value))"
                />
                <input
                  v-if="action.type === 'addStatus' || action.type === 'removeStatus'"
                  class="input-sm !py-1 w-24"
                  :value="action.status || ''"
                  placeholder="状态名"
                  @input="onActionChange(rule.id, action.id, 'status', ($event.target as HTMLInputElement).value)"
                />
                <button
                  class="w-6 h-6 rounded bg-slate-700 hover:bg-red-500 text-slate-300 text-xs flex items-center justify-center shrink-0"
                  @click="removeAction(rule.id, action.id)"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          <div v-if="ruleErrors[rule.id]?.length" class="mt-3 px-2 py-1 rounded bg-red-500/20 border border-red-500/40">
            <ul class="text-[11px] text-red-300 list-disc pl-4">
              <li v-for="e in ruleErrors[rule.id]" :key="e">{{ e }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  TRIGGER_EVENT_LABEL,
  type GameRule,
  type RuleCondition,
  type RuleAction,
} from '../types'
import {
  CONDITION_OPERATORS,
  ACTION_TYPES,
  TARGET_TYPES,
  RULE_FIELDS,
} from '../utils/rules'

const {
  rules,
  ruleErrors,
  addRule,
  updateRule,
  removeRule,
  duplicateRule,
  addRuleCondition,
  removeRuleCondition,
  addRuleAction,
  removeRuleAction,
} = useGameState()

const expandedRuleId = ref<string | null>(null)

function toggleRule(ruleId: string) {
  expandedRuleId.value = expandedRuleId.value === ruleId ? null : ruleId
}

function onRuleInput(ruleId: string, field: keyof GameRule, value: string | number) {
  updateRule(ruleId, { [field]: value } as Partial<GameRule>)
}

function handleRemoveRule(ruleId: string) {
  const rule = (rules.value || []).find(r => r.id === ruleId)
  if (rule && confirm(`确定要删除规则 "${rule.name}" 吗？`)) {
    removeRule(ruleId)
    if (expandedRuleId.value === ruleId) {
      expandedRuleId.value = null
    }
  }
}

function handleDuplicateRule(ruleId: string) {
  duplicateRule(ruleId)
}

function addCondition(ruleId: string) {
  addRuleCondition(ruleId)
}

function removeCondition(ruleId: string, conditionId: string) {
  removeRuleCondition(ruleId, conditionId)
}

function onConditionChange(
  ruleId: string,
  conditionId: string,
  field: keyof RuleCondition,
  value: string | number,
) {
  const rule = (rules.value || []).find(r => r.id === ruleId)
  if (!rule) return
  const condition = rule.conditions.find(c => c.id === conditionId)
  if (!condition) return
  ;(condition as Record<string, unknown>)[field] = value
  updateRule(ruleId, { ...rule })
}

function addAction(ruleId: string) {
  addRuleAction(ruleId)
}

function removeAction(ruleId: string, actionId: string) {
  removeRuleAction(ruleId, actionId)
}

function onActionChange(
  ruleId: string,
  actionId: string,
  field: keyof RuleAction,
  value: string | number,
) {
  const rule = (rules.value || []).find(r => r.id === ruleId)
  if (!rule) return
  const action = rule.actions.find(a => a.id === actionId)
  if (!action) return
  ;(action as Record<string, unknown>)[field] = value
  updateRule(ruleId, { ...rule })
}
</script>
