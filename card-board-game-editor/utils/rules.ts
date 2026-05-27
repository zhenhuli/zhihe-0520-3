import type {
  GameRule,
  RuleCondition,
  RuleAction,
  RuleConditionOperator,
  RuleActionType,
  RuleTargetType,
  TriggerEventType,
  BattleCard,
  PlayerState,
  GameConfig,
} from '../types'

function genId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function createRuleCondition(partial?: Partial<RuleCondition>): RuleCondition {
  return {
    id: genId('cond'),
    field: 'currentHp',
    operator: '>',
    value: 0,
    ...partial,
  }
}

export function createRuleAction(partial?: Partial<RuleAction>): RuleAction {
  return {
    id: genId('act'),
    type: 'damage',
    target: 'enemy',
    value: 1,
    ...partial,
  }
}

export function createGameRule(partial?: Partial<GameRule>): GameRule {
  const now = Date.now()
  return {
    id: genId('rule'),
    name: '新规则',
    description: '',
    trigger: 'onPlay',
    conditions: [],
    actions: [],
    priority: 100,
    status: 'active',
    createdAt: now,
    updatedAt: now,
    ...partial,
  }
}

export const CONDITION_OPERATORS: { value: RuleConditionOperator; label: string }[] = [
  { value: '==', label: '等于 (==)' },
  { value: '!=', label: '不等于 (!=)' },
  { value: '>', label: '大于 (>)' },
  { value: '<', label: '小于 (<)' },
  { value: '>=', label: '大于等于 (>=)' },
  { value: '<=', label: '小于等于 (<=)' },
  { value: 'contains', label: '包含' },
  { value: 'startsWith', label: '开头是' },
  { value: 'endsWith', label: '结尾是' },
]

export const ACTION_TYPES: { value: RuleActionType; label: string }[] = [
  { value: 'damage', label: '造成伤害' },
  { value: 'heal', label: '治疗' },
  { value: 'draw', label: '抽牌' },
  { value: 'discard', label: '弃牌' },
  { value: 'buff', label: '增益 (增加属性)' },
  { value: 'debuff', label: '减益 (减少属性)' },
  { value: 'summon', label: '召唤' },
  { value: 'destroy', label: '摧毁' },
  { value: 'setMana', label: '设置法力' },
  { value: 'addStatus', label: '添加状态' },
  { value: 'removeStatus', label: '移除状态' },
  { value: 'custom', label: '自定义' },
]

export const TARGET_TYPES: { value: RuleTargetType; label: string }[] = [
  { value: 'self', label: '自身' },
  { value: 'enemy', label: '敌方随机单位' },
  { value: 'allAllies', label: '所有友方单位' },
  { value: 'allEnemies', label: '所有敌方单位' },
  { value: 'randomAlly', label: '随机友方单位' },
  { value: 'randomEnemy', label: '随机敌方单位' },
  { value: 'allUnits', label: '所有单位' },
  { value: 'selected', label: '选中目标' },
]

export const RULE_FIELDS: { value: string; label: string }[] = [
  { value: 'currentHp', label: '当前血量' },
  { value: 'maxHp', label: '最大血量' },
  { value: 'currentDamage', label: '当前伤害' },
  { value: 'baseDamage', label: '基础伤害' },
  { value: 'cost', label: '费用' },
  { value: 'faction', label: '派系' },
  { value: 'type', label: '类型' },
  { value: 'name', label: '名称' },
  { value: 'tags', label: '标签' },
  { value: 'player.hp', label: '玩家血量' },
  { value: 'player.mana', label: '玩家法力' },
  { value: 'player.hand.length', label: '手牌数量' },
  { value: 'player.deck.length', label: '牌库数量' },
]

export function evaluateCondition(
  condition: RuleCondition,
  source: BattleCard,
  owner: PlayerState,
  opponent: PlayerState,
): boolean {
  const fieldValue = getFieldValue(condition.field, source, owner, opponent)
  const targetValue = condition.value

  switch (condition.operator) {
    case '==':
      return fieldValue === targetValue
    case '!=':
      return fieldValue !== targetValue
    case '>':
      return Number(fieldValue) > Number(targetValue)
    case '<':
      return Number(fieldValue) < Number(targetValue)
    case '>=':
      return Number(fieldValue) >= Number(targetValue)
    case '<=':
      return Number(fieldValue) <= Number(targetValue)
    case 'contains':
      return String(fieldValue).includes(String(targetValue))
    case 'startsWith':
      return String(fieldValue).startsWith(String(targetValue))
    case 'endsWith':
      return String(fieldValue).endsWith(String(targetValue))
    default:
      return false
  }
}

function getFieldValue(
  field: string,
  source: BattleCard,
  owner: PlayerState,
  opponent: PlayerState,
): unknown {
  if (field.startsWith('player.')) {
    const playerField = field.replace('player.', '')
    if (playerField === 'hp') return owner.hp
    if (playerField === 'mana') return owner.mana
    if (playerField === 'hand.length') return owner.hand.length
    if (playerField === 'deck.length') return owner.deck.length
  }
  if (field.startsWith('opponent.')) {
    const oppField = field.replace('opponent.', '')
    if (oppField === 'hp') return opponent.hp
    if (oppField === 'mana') return opponent.mana
    if (oppField === 'hand.length') return opponent.hand.length
    if (oppField === 'deck.length') return opponent.deck.length
  }
  if (field === 'tags') {
    return (source.tags || []).join(',')
  }
  return (source as Record<string, unknown>)[field]
}

export function evaluateConditions(
  conditions: RuleCondition[],
  source: BattleCard,
  owner: PlayerState,
  opponent: PlayerState,
): boolean {
  if (!conditions || conditions.length === 0) return true
  return conditions.every(c => evaluateCondition(c, source, owner, opponent))
}

export interface RuleExecutionContext {
  source: BattleCard
  owner: PlayerState
  opponent: PlayerState
  config: GameConfig
  selectedTarget?: BattleCard | null
}

export function executeAction(
  action: RuleAction,
  context: RuleExecutionContext,
): string {
  const { source, owner, opponent, config, selectedTarget } = context

  const targets = resolveTargets(action.target, context)

  switch (action.type) {
    case 'damage':
      targets.forEach(t => {
        if (t) t.currentHp -= action.value
      })
      return `对 ${targets.length} 个目标造成 ${action.value} 点伤害`

    case 'heal':
      targets.forEach(t => {
        if (t) t.currentHp = Math.min(t.maxHp, t.currentHp + action.value)
      })
      return `为 ${targets.length} 个目标恢复 ${action.value} 点血量`

    case 'draw':
      for (let i = 0; i < action.value; i++) {
        if (owner.deck.length > 0 && owner.hand.length < config.handLimit) {
          const card = owner.deck.shift()
          if (card) owner.hand.push(card)
        }
      }
      return `抽了 ${action.value} 张牌`

    case 'discard':
      for (let i = 0; i < action.value && owner.hand.length > 0; i++) {
        const discarded = owner.hand.pop()
        if (discarded) owner.graveyard.push(discarded)
      }
      return `弃掉了 ${action.value} 张牌`

    case 'buff':
      targets.forEach(t => {
        if (t) {
          t.currentDamage += action.value
          t.currentHp += action.value
          t.maxHp += action.value
        }
      })
      return `为 ${targets.length} 个目标增加 ${action.value} 属性`

    case 'debuff':
      targets.forEach(t => {
        if (t) {
          t.currentDamage = Math.max(0, t.currentDamage - action.value)
          t.currentHp -= action.value
        }
      })
      return `为 ${targets.length} 个目标减少 ${action.value} 属性`

    case 'destroy':
      targets.forEach(t => {
        if (t) {
          t.currentHp = 0
          owner.graveyard.push(t)
        }
      })
      return `摧毁了 ${targets.length} 个目标`

    case 'addStatus':
      if (action.status) {
        targets.forEach(t => {
          if (t && !t.statuses.includes(action.status!)) {
            t.statuses.push(action.status!)
          }
        })
        return `为 ${targets.length} 个目标添加状态: ${action.status}`
      }
      return '添加状态失败: 未指定状态名'

    case 'removeStatus':
      if (action.status) {
        targets.forEach(t => {
          if (t) {
            t.statuses = t.statuses.filter(s => s !== action.status)
          }
        })
        return `为 ${targets.length} 个目标移除状态: ${action.status}`
      }
      return '移除状态失败: 未指定状态名'

    case 'setMana':
      owner.mana = Math.max(0, Math.min(owner.maxMana, action.value))
      return `设置法力为 ${action.value}`

    default:
      return `执行自定义动作: ${action.type}`
  }
}

function resolveTargets(
  targetType: RuleTargetType,
  context: RuleExecutionContext,
): (BattleCard | null)[] {
  const { owner, opponent, selectedTarget } = context
  const allyUnits = owner.field.filter(c => c && c.currentHp > 0) as BattleCard[]
  const enemyUnits = opponent.field.filter(c => c && c.currentHp > 0) as BattleCard[]

  switch (targetType) {
    case 'self':
      return [context.source]
    case 'enemy':
      return enemyUnits.length > 0 ? [enemyUnits[Math.floor(Math.random() * enemyUnits.length)]] : []
    case 'allAllies':
      return allyUnits
    case 'allEnemies':
      return enemyUnits
    case 'randomAlly':
      return allyUnits.length > 0 ? [allyUnits[Math.floor(Math.random() * allyUnits.length)]] : []
    case 'randomEnemy':
      return enemyUnits.length > 0 ? [enemyUnits[Math.floor(Math.random() * enemyUnits.length)]] : []
    case 'allUnits':
      return [...allyUnits, ...enemyUnits]
    case 'selected':
      return selectedTarget ? [selectedTarget] : []
    default:
      return []
  }
}

export function executeRule(
  rule: GameRule,
  context: RuleExecutionContext,
): { executed: boolean; logs: string[] } {
  if (rule.status !== 'active') {
    return { executed: false, logs: [] }
  }

  const logs: string[] = []

  const conditionPassed = evaluateConditions(rule.conditions, context.source, context.owner, context.opponent)
  if (!conditionPassed) {
    logs.push(`规则 "${rule.name}" 条件不满足，跳过`)
    return { executed: false, logs }
  }

  logs.push(`执行规则: ${rule.name}`)

  for (const action of rule.actions) {
    const result = executeAction(action, context)
    logs.push(`  ${result}`)
  }

  return { executed: true, logs }
}

export interface RuleEngineExecutionResult {
  triggered: number
  executed: number
  logs: string[]
}

export function executeRulesForEvent(
  rules: GameRule[],
  event: TriggerEventType,
  context: RuleExecutionContext,
): RuleEngineExecutionResult {
  const matchingRules = rules
    .filter(r => r.trigger === event && r.status === 'active')
    .sort((a, b) => a.priority - b.priority)

  const result: RuleEngineExecutionResult = {
    triggered: matchingRules.length,
    executed: 0,
    logs: [],
  }

  for (const rule of matchingRules) {
    const execution = executeRule(rule, context)
    result.logs.push(...execution.logs)
    if (execution.executed) {
      result.executed++
    }
  }

  return result
}

export function defaultRules(): GameRule[] {
  return [
    createGameRule({
      name: '烈焰共鸣',
      description: '当打出一张火焰卡牌时，所有友方火焰单位获得 +1 伤害',
      trigger: 'onPlay',
      priority: 10,
      conditions: [
        createRuleCondition({
          field: 'faction',
          operator: '==',
          value: '火焰',
        }),
      ],
      actions: [
        createRuleAction({
          type: 'buff',
          target: 'allAllies',
          value: 1,
        }),
      ],
    }),
    createGameRule({
      name: '自然庇护',
      description: '回合开始时，所有友方自然单位恢复 1 点血量',
      trigger: 'onTurnStart',
      priority: 20,
      conditions: [],
      actions: [
        createRuleAction({
          type: 'heal',
          target: 'allAllies',
          value: 1,
        }),
      ],
    }),
  ]
}

export function validateRule(rule: GameRule): string[] {
  const errors: string[] = []
  if (!rule.name?.trim()) errors.push('规则名称不能为空')
  if (rule.actions.length === 0) errors.push('规则至少需要一个动作')
  return errors
}
