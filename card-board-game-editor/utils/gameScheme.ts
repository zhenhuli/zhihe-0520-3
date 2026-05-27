import type {
  GameScheme,
  CardData,
  FactionSynergy,
  TurnPhase,
  GameRule,
  GameConfig,
} from '../types'
import { DEFAULT_GAME_CONFIG } from '../types'
import { defaultPresets, defaultSynergies, defaultTurnFlow } from './card'
import { defaultRules } from './rules'

function genId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function createGameScheme(partial?: Partial<GameScheme>): GameScheme {
  const now = Date.now()
  return {
    id: genId('scheme'),
    name: '新游戏方案',
    description: '',
    gameConfig: { ...DEFAULT_GAME_CONFIG },
    cards: [],
    synergies: [],
    turnFlow: [],
    rules: [],
    createdAt: now,
    updatedAt: now,
    isDefault: false,
    ...partial,
  }
}

export function cloneGameScheme(scheme: GameScheme, newName?: string): GameScheme {
  const now = Date.now()
  return {
    ...scheme,
    id: genId('scheme'),
    name: newName || `${scheme.name} (副本)`,
    createdAt: now,
    updatedAt: now,
    isDefault: false,
    cards: scheme.cards.map(c => ({ ...c })),
    synergies: scheme.synergies.map(s => ({ ...s })),
    turnFlow: scheme.turnFlow.map(t => ({ ...t })),
    rules: scheme.rules.map(r => ({ ...r })),
    gameConfig: { ...scheme.gameConfig },
  }
}

export function createDefaultGameScheme(): GameScheme {
  return createGameScheme({
    name: '默认方案',
    description: '默认的卡牌游戏方案',
    gameConfig: { ...DEFAULT_GAME_CONFIG },
    cards: defaultPresets(),
    synergies: defaultSynergies(),
    turnFlow: defaultTurnFlow(),
    rules: defaultRules(),
    isDefault: true,
  })
}

export function updateGameScheme(
  scheme: GameScheme,
  patch: Partial<GameScheme>,
): GameScheme {
  return {
    ...scheme,
    ...patch,
    updatedAt: Date.now(),
  }
}

export function updateSchemeConfig(
  scheme: GameScheme,
  configPatch: Partial<GameConfig>,
): GameScheme {
  return {
    ...scheme,
    gameConfig: { ...scheme.gameConfig, ...configPatch },
    updatedAt: Date.now(),
  }
}

export function addCardToScheme(scheme: GameScheme, card: CardData): GameScheme {
  return {
    ...scheme,
    cards: [...scheme.cards, card],
    updatedAt: Date.now(),
  }
}

export function removeCardFromScheme(scheme: GameScheme, cardId: string): GameScheme {
  return {
    ...scheme,
    cards: scheme.cards.filter(c => c.id !== cardId),
    updatedAt: Date.now(),
  }
}

export function updateCardInScheme(
  scheme: GameScheme,
  cardId: string,
  patch: Partial<CardData>,
): GameScheme {
  return {
    ...scheme,
    cards: scheme.cards.map(c => (c.id === cardId ? { ...c, ...patch } : c)),
    updatedAt: Date.now(),
  }
}

export function addSynergyToScheme(
  scheme: GameScheme,
  synergy: FactionSynergy,
): GameScheme {
  return {
    ...scheme,
    synergies: [...scheme.synergies, synergy],
    updatedAt: Date.now(),
  }
}

export function removeSynergyFromScheme(
  scheme: GameScheme,
  synergyId: string,
): GameScheme {
  return {
    ...scheme,
    synergies: scheme.synergies.filter(s => s.id !== synergyId),
    updatedAt: Date.now(),
  }
}

export function updateSynergyInScheme(
  scheme: GameScheme,
  synergyId: string,
  patch: Partial<FactionSynergy>,
): GameScheme {
  return {
    ...scheme,
    synergies: scheme.synergies.map(s => (s.id === synergyId ? { ...s, ...patch } : s)),
    updatedAt: Date.now(),
  }
}

export function addTurnPhaseToScheme(scheme: GameScheme, phase: TurnPhase): GameScheme {
  return {
    ...scheme,
    turnFlow: [...scheme.turnFlow, phase],
    updatedAt: Date.now(),
  }
}

export function removeTurnPhaseFromScheme(
  scheme: GameScheme,
  phaseId: string,
): GameScheme {
  return {
    ...scheme,
    turnFlow: scheme.turnFlow.filter(p => p.id !== phaseId),
    updatedAt: Date.now(),
  }
}

export function updateTurnPhaseInScheme(
  scheme: GameScheme,
  phaseId: string,
  patch: Partial<TurnPhase>,
): GameScheme {
  return {
    ...scheme,
    turnFlow: scheme.turnFlow.map(p => (p.id === phaseId ? { ...p, ...patch } : p)),
    updatedAt: Date.now(),
  }
}

export function addRuleToScheme(scheme: GameScheme, rule: GameRule): GameScheme {
  return {
    ...scheme,
    rules: [...scheme.rules, rule],
    updatedAt: Date.now(),
  }
}

export function removeRuleFromScheme(scheme: GameScheme, ruleId: string): GameScheme {
  return {
    ...scheme,
    rules: scheme.rules.filter(r => r.id !== ruleId),
    updatedAt: Date.now(),
  }
}

export function updateRuleInScheme(
  scheme: GameScheme,
  ruleId: string,
  patch: Partial<GameRule>,
): GameScheme {
  return {
    ...scheme,
    rules: scheme.rules.map(r => (r.id === ruleId ? { ...r, ...patch } : r)),
    updatedAt: Date.now(),
  }
}

export function validateGameScheme(scheme: GameScheme): string[] {
  const errors: string[] = []

  if (!scheme.name?.trim()) {
    errors.push('游戏方案名称不能为空')
  }

  if (scheme.cards.length === 0) {
    errors.push('游戏方案至少需要一张卡牌')
  }

  if (scheme.turnFlow.length === 0) {
    errors.push('游戏方案至少需要一个回合阶段')
  }

  const cardIds = new Set(scheme.cards.map(c => c.id))
  if (cardIds.size !== scheme.cards.length) {
    errors.push('游戏方案中存在重复的卡牌ID')
  }

  return errors
}

export function exportGameSchemeToJSON(scheme: GameScheme): string {
  return JSON.stringify(
    {
      type: 'gameScheme',
      version: '1.0',
      exportedAt: Date.now(),
      data: scheme,
    },
    null,
    2,
  )
}

export function importGameSchemeFromJSON(json: string): GameScheme | null {
  try {
    const parsed = JSON.parse(json)

    if (parsed.type === 'gameScheme' && parsed.data) {
      return {
        ...parsed.data,
        id: genId('scheme'),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isDefault: false,
      }
    }

    return null
  } catch (e) {
    console.error('导入游戏方案失败', e)
    return null
  }
}

export function downloadGameScheme(scheme: GameScheme) {
  const json = exportGameSchemeToJSON(scheme)
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${scheme.name || 'game-scheme'}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function getSchemeStats(scheme: GameScheme) {
  const totalCards = scheme.cards.length
  const totalCopies = scheme.cards.reduce((sum, c) => sum + (c.copyCount || 0), 0)
  const avgCost =
    totalCards > 0
      ? (scheme.cards.reduce((sum, c) => sum + c.cost, 0) / totalCards).toFixed(1)
      : '0.0'

  const typeCount: Record<string, number> = {}
  const factionCount: Record<string, number> = {}
  const rarityCount: Record<string, number> = {}

  scheme.cards.forEach(c => {
    typeCount[c.type] = (typeCount[c.type] || 0) + 1
    factionCount[c.faction] = (factionCount[c.faction] || 0) + 1
    rarityCount[c.rarity] = (rarityCount[c.rarity] || 0) + 1
  })

  return {
    totalCards,
    totalCopies,
    avgCost,
    totalSynergies: scheme.synergies.length,
    totalTurnPhases: scheme.turnFlow.length,
    totalRules: scheme.rules.length,
    typeCount,
    factionCount,
    rarityCount,
  }
}

export function searchGameSchemes(
  schemes: GameScheme[],
  query: string,
): GameScheme[] {
  const lowerQuery = query.toLowerCase().trim()
  if (!lowerQuery) return schemes

  return schemes.filter(
    s =>
      s.name.toLowerCase().includes(lowerQuery) ||
      s.description.toLowerCase().includes(lowerQuery),
  )
}

export function defaultGameSchemes(): GameScheme[] {
  const defaultScheme = createDefaultGameScheme()

  const aggressiveScheme = createGameScheme({
    name: '快攻模式',
    description: '高伤害、快节奏的游戏模式，适合快速对局',
    gameConfig: {
      startingHp: 15,
      startingMana: 2,
      maxMana: 8,
      manaPerTurn: 2,
      handLimit: 6,
      fieldSize: 4,
      startingHandSize: 4,
      drawPerTurn: 2,
    },
    cards: defaultPresets().map(c => ({
      ...c,
      copyCount: Math.min(4, c.copyCount + 1),
    })),
    synergies: defaultSynergies(),
    turnFlow: defaultTurnFlow(),
    rules: defaultRules(),
  })

  const controlScheme = createGameScheme({
    name: '控制模式',
    description: '高血量、慢节奏的游戏模式，适合策略博弈',
    gameConfig: {
      startingHp: 30,
      startingMana: 1,
      maxMana: 12,
      manaPerTurn: 1,
      handLimit: 10,
      fieldSize: 7,
      startingHandSize: 4,
      drawPerTurn: 1,
    },
    cards: defaultPresets(),
    synergies: defaultSynergies(),
    turnFlow: defaultTurnFlow(),
    rules: defaultRules(),
  })

  return [defaultScheme, aggressiveScheme, controlScheme]
}

export function mergeGameScheme(
  target: GameScheme,
  source: GameScheme,
  options: {
    replaceCards?: boolean
    replaceSynergies?: boolean
    replaceTurnFlow?: boolean
    replaceRules?: boolean
    replaceConfig?: boolean
  } = {},
): GameScheme {
  const {
    replaceCards = false,
    replaceSynergies = false,
    replaceTurnFlow = false,
    replaceRules = false,
    replaceConfig = false,
  } = options

  const mergedCards = replaceCards
    ? source.cards
    : [...target.cards, ...source.cards.filter(sc => !target.cards.some(tc => tc.id === sc.id))]

  const mergedSynergies = replaceSynergies
    ? source.synergies
    : [...target.synergies, ...source.synergies.filter(ss => !target.synergies.some(ts => ts.id === ss.id))]

  const mergedTurnFlow = replaceTurnFlow ? source.turnFlow : target.turnFlow
  const mergedRules = replaceRules ? source.rules : [...target.rules, ...source.rules]
  const mergedConfig = replaceConfig ? source.gameConfig : target.gameConfig

  return {
    ...target,
    cards: mergedCards,
    synergies: mergedSynergies,
    turnFlow: mergedTurnFlow,
    rules: mergedRules,
    gameConfig: mergedConfig,
    updatedAt: Date.now(),
  }
}
