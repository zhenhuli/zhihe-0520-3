export type CardType = '单位' | '法术' | '装备' | '羁绊' | '资源'
export type CardRarity = 'common' | 'rare' | 'epic' | 'legendary'

export type TriggerEventType =
  | 'onPlay'
  | 'onDeath'
  | 'onTurnStart'
  | 'onTurnEnd'
  | 'onDamage'
  | 'onHeal'
  | 'onSummon'
  | 'onDraw'
  | 'onAttack'
  | 'onDefend'
  | 'custom'

export interface CardAttribute {
  key: string
  value: number | string
}

export interface TriggerCondition {
  id: string
  event: TriggerEventType
  description: string
}

export interface PassiveSkill {
  id: string
  name: string
  description: string
  trigger: TriggerCondition | null
}

export interface FactionSynergy {
  id: string
  name: string
  requiredCount: number
  effect: string
  description: string
}

export interface TurnPhase {
  id: string
  name: string
  description: string
  actions: string[]
}

export interface CardData {
  id: string
  name: string
  type: CardType
  rarity: CardRarity
  cost: number
  hp: number
  damage: number
  description: string
  art: string
  faction: string
  tags: string[]
  attributes: CardAttribute[]
  flavorText: string
  copyCount: number
  passiveSkills: PassiveSkill[]
}

export interface GameSet {
  id: string
  name: string
  description: string
  createdAt: number
  updatedAt: number
  cards: CardData[]
  synergies: FactionSynergy[]
  turnFlow: TurnPhase[]
}

export const CARD_TYPES: CardType[] = ['单位', '法术', '装备', '羁绊', '资源']
export const CARD_RARITIES: CardRarity[] = ['common', 'rare', 'epic', 'legendary']
export const RARITY_LABEL: Record<CardRarity, string> = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
}

export const TRIGGER_EVENT_LABEL: Record<TriggerEventType, string> = {
  onPlay: '打出时',
  onDeath: '死亡时',
  onTurnStart: '回合开始时',
  onTurnEnd: '回合结束时',
  onDamage: '造成伤害时',
  onHeal: '治疗时',
  onSummon: '召唤时',
  onDraw: '抽牌时',
  onAttack: '攻击时',
  onDefend: '防御时',
  custom: '自定义',
}

// ==================== 对局模拟相关类型 ====================

export type GamePhase = 'draw' | 'main' | 'attack' | 'end'

export const PHASE_LABEL: Record<GamePhase, string> = {
  draw: '抽牌阶段',
  main: '行动阶段',
  attack: '攻击阶段',
  end: '结束阶段',
}

export type GameStatus = 'idle' | 'playing' | 'ended'

export interface BattleCard {
  instanceId: string
  cardId: string
  name: string
  type: CardType
  rarity: CardRarity
  cost: number
  baseHp: number
  currentHp: number
  maxHp: number
  baseDamage: number
  currentDamage: number
  description: string
  art: string
  faction: string
  tags: string[]
  canAttack: boolean
  hasAttacked: boolean
  justPlayed: boolean
  statuses: string[]
}

export interface PlayerState {
  id: string
  name: string
  hp: number
  maxHp: number
  mana: number
  maxMana: number
  manaPerTurn: number
  deck: BattleCard[]
  hand: BattleCard[]
  field: (BattleCard | null)[]
  graveyard: BattleCard[]
  fatigue: number
}

export interface BattleLogEntry {
  id: string
  turn: number
  player: string
  text: string
  type: 'info' | 'play' | 'attack' | 'damage' | 'death' | 'turn' | 'win' | 'draw'
  timestamp: number
}

export interface GameConfig {
  startingHp: number
  startingMana: number
  maxMana: number
  manaPerTurn: number
  handLimit: number
  fieldSize: number
  startingHandSize: number
  drawPerTurn: number
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
  startingHp: 20,
  startingMana: 1,
  maxMana: 10,
  manaPerTurn: 1,
  handLimit: 7,
  fieldSize: 5,
  startingHandSize: 3,
  drawPerTurn: 1,
}

// ==================== 规则引擎相关类型 ====================

export type RuleConditionOperator = '==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'startsWith' | 'endsWith'
export type RuleActionType = 'damage' | 'heal' | 'draw' | 'discard' | 'buff' | 'debuff' | 'summon' | 'destroy' | 'setMana' | 'addStatus' | 'removeStatus' | 'custom'
export type RuleTargetType = 'self' | 'enemy' | 'allAllies' | 'allEnemies' | 'randomAlly' | 'randomEnemy' | 'allUnits' | 'selected'
export type RuleStatus = 'active' | 'disabled' | 'draft'

export interface RuleCondition {
  id: string
  field: string
  operator: RuleConditionOperator
  value: string | number | boolean
  description?: string
}

export interface RuleAction {
  id: string
  type: RuleActionType
  target: RuleTargetType
  value: number
  status?: string
  description?: string
}

export interface GameRule {
  id: string
  name: string
  description: string
  trigger: TriggerEventType
  conditions: RuleCondition[]
  actions: RuleAction[]
  priority: number
  status: RuleStatus
  createdAt: number
  updatedAt: number
}

export interface RuleEngineState {
  rules: GameRule[]
  enabled: boolean
  executionLog: string[]
}

// ==================== 卡组相关类型 ====================

export interface DeckCard {
  cardId: string
  count: number
}

export interface Deck {
  id: string
  name: string
  description: string
  cards: DeckCard[]
  createdAt: number
  updatedAt: number
}

export interface DeckValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  stats: {
    totalCards: number
    uniqueCards: number
    avgCost: number
    manaCurve: Record<number, number>
  }
}

// ==================== 游戏方案相关类型 ====================

export interface GameScheme {
  id: string
  name: string
  description: string
  gameConfig: GameConfig
  cards: CardData[]
  synergies: FactionSynergy[]
  turnFlow: TurnPhase[]
  rules: GameRule[]
  createdAt: number
  updatedAt: number
  isDefault?: boolean
}

// ==================== 模板相关类型 ====================

export interface CardTemplate {
  id: string
  name: string
  description: string
  card: Partial<CardData>
  category: string
  tags: string[]
  createdAt: number
  updatedAt: number
  author?: string
  isPublic?: boolean
}

export interface DeckTemplate {
  id: string
  name: string
  description: string
  cards: DeckCard[]
  category: string
  tags: string[]
  cardPool: CardData[]
  createdAt: number
  updatedAt: number
  author?: string
  isPublic?: boolean
}

export type TemplateType = 'card' | 'deck'

export interface TemplateShareLink {
  id: string
  templateId: string
  templateType: TemplateType
  shareCode: string
  expiresAt?: number
  accessCount: number
  createdAt: number
}

export interface TemplateImportResult {
  success: boolean
  data?: CardTemplate | DeckTemplate
  error?: string
}
