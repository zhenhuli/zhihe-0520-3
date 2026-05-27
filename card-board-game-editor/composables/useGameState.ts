import type { CardData, FactionSynergy, TurnPhase, GameRule, GameScheme, Deck, CardTemplate, DeckTemplate } from '../types'
import {
  createCard,
  createSynergy,
  createTurnPhase,
  defaultPresets,
  defaultSynergies,
  defaultTurnFlow,
  cloneCard,
  validateCard,
  validateSynergy,
  validateTurnPhase,
  cardsToCSV,
  csvToCards,
  validateCSV,
  type CSVValidationResult,
} from '../utils/card'
import {
  createGameRule,
  defaultRules,
  validateRule,
} from '../utils/rules'
import {
  createDeck,
  defaultDecks,
  validateDeck,
} from '../utils/deck'
import {
  defaultCardTemplates,
  validateTemplate,
} from '../utils/template'
import {
  createGameScheme,
  defaultGameSchemes,
  cloneGameScheme,
  validateGameScheme,
  downloadGameScheme,
  exportGameSchemeToJSON,
  importGameSchemeFromJSON,
} from '../utils/gameScheme'

const STORAGE_KEY = 'card-forge-state-v1'
const SCHEMES_STORAGE_KEY = 'card-forge-schemes-v1'
const RULES_STORAGE_KEY = 'card-forge-rules-v1'
const DECKS_STORAGE_KEY = 'card-forge-decks-v1'
const TEMPLATES_STORAGE_KEY = 'card-forge-templates-v1'

interface State {
  cards: CardData[]
  selectedId: string | null
  synergies: FactionSynergy[]
  turnFlow: TurnPhase[]
  rules: GameRule[]
  currentSchemeId: string | null
  schemes: GameScheme[]
  decks: Deck[]
  cardTemplates: CardTemplate[]
  deckTemplates: DeckTemplate[]
}

export const useGameState = () => {
  const cards = useState<CardData[]>('game-cards', () => [])
  const selectedId = useState<string | null>('game-selected-id', () => null)
  const synergies = useState<FactionSynergy[]>('game-synergies', () => [])
  const turnFlow = useState<TurnPhase[]>('game-turn-flow', () => [])
  const rules = useState<GameRule[]>('game-rules', () => [])
  const currentSchemeId = useState<string | null>('game-current-scheme', () => null)
  const schemes = useState<GameScheme[]>('game-schemes', () => [])
  const decks = useState<Deck[]>('game-decks', () => [])
  const cardTemplates = useState<CardTemplate[]>('game-card-templates', () => [])
  const deckTemplates = useState<DeckTemplate[]>('game-deck-templates', () => [])
  const importErrors = useState<string[]>('import-errors', () => [])
  const importSuccess = useState<string | null>('import-success', () => null)

  const selected = computed(() =>
    (cards.value || []).find(c => c.id === selectedId.value) || null,
  )

  const currentScheme = computed(() =>
    (schemes.value || []).find(s => s.id === currentSchemeId.value) || null,
  )

  const loadFromStorage = () => {
    if (import.meta.server) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const data: State = JSON.parse(raw)
        if (Array.isArray(data.cards) && data.cards.length) {
          cards.value = data.cards
          selectedId.value = data.selectedId || data.cards[0]?.id || null
        } else {
          cards.value = defaultPresets()
          selectedId.value = cards.value[0]?.id || null
        }
        if (Array.isArray(data.synergies) && data.synergies.length) {
          synergies.value = data.synergies
        } else {
          synergies.value = defaultSynergies()
        }
        if (Array.isArray(data.turnFlow) && data.turnFlow.length) {
          turnFlow.value = data.turnFlow
        } else {
          turnFlow.value = defaultTurnFlow()
        }
      } else {
        cards.value = defaultPresets()
        selectedId.value = cards.value[0]?.id || null
        synergies.value = defaultSynergies()
        turnFlow.value = defaultTurnFlow()
      }

      const rulesRaw = localStorage.getItem(RULES_STORAGE_KEY)
      if (rulesRaw) {
        const rulesData = JSON.parse(rulesRaw)
        if (Array.isArray(rulesData) && rulesData.length) {
          rules.value = rulesData
        } else {
          rules.value = defaultRules()
        }
      } else {
        rules.value = defaultRules()
      }

      const schemesRaw = localStorage.getItem(SCHEMES_STORAGE_KEY)
      if (schemesRaw) {
        const schemesData = JSON.parse(schemesRaw)
        if (Array.isArray(schemesData) && schemesData.length) {
          schemes.value = schemesData
          currentSchemeId.value = schemesData[0]?.id || null
        } else {
          schemes.value = defaultGameSchemes()
          currentSchemeId.value = schemes.value[0]?.id || null
        }
      } else {
        schemes.value = defaultGameSchemes()
        currentSchemeId.value = schemes.value[0]?.id || null
      }

      const decksRaw = localStorage.getItem(DECKS_STORAGE_KEY)
      if (decksRaw) {
        const decksData = JSON.parse(decksRaw)
        if (Array.isArray(decksData) && decksData.length) {
          decks.value = decksData
        } else {
          decks.value = defaultDecks(cards.value)
        }
      } else {
        decks.value = defaultDecks(cards.value)
      }

      const templatesRaw = localStorage.getItem(TEMPLATES_STORAGE_KEY)
      if (templatesRaw) {
        const templatesData = JSON.parse(templatesRaw)
        if (templatesData.cardTemplates) {
          cardTemplates.value = templatesData.cardTemplates
        } else {
          cardTemplates.value = defaultCardTemplates(cards.value)
        }
        if (templatesData.deckTemplates) {
          deckTemplates.value = templatesData.deckTemplates
        }
      } else {
        cardTemplates.value = defaultCardTemplates(cards.value)
      }
    } catch (e) {
      console.warn('读取本地存档失败', e)
      cards.value = defaultPresets()
      selectedId.value = cards.value[0]?.id || null
      synergies.value = defaultSynergies()
      turnFlow.value = defaultTurnFlow()
      rules.value = defaultRules()
      schemes.value = defaultGameSchemes()
      currentSchemeId.value = schemes.value[0]?.id || null
      decks.value = defaultDecks(cards.value)
      cardTemplates.value = defaultCardTemplates(cards.value)
    }
  }

  const saveToStorage = (): boolean => {
    if (import.meta.server) return false
    try {
      const data: State = {
        cards: cards.value || [],
        selectedId: selectedId.value,
        synergies: synergies.value || [],
        turnFlow: turnFlow.value || [],
        rules: rules.value || [],
        currentSchemeId: currentSchemeId.value,
        schemes: schemes.value || [],
        decks: decks.value || [],
        cardTemplates: cardTemplates.value || [],
        deckTemplates: deckTemplates.value || [],
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(rules.value || []))
      localStorage.setItem(SCHEMES_STORAGE_KEY, JSON.stringify(schemes.value || []))
      localStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(decks.value || []))
      localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify({
        cardTemplates: cardTemplates.value || [],
        deckTemplates: deckTemplates.value || [],
      }))
      return true
    } catch (e) {
      console.warn('保存本地存档失败', e)
      return false
    }
  }

  const addCard = () => {
    const card = createCard()
    cards.value.push(card)
    selectedId.value = card.id
    saveToStorage()
  }

  const duplicateCard = (id: string) => {
    const idx = cards.value.findIndex(c => c.id === id)
    if (idx === -1) return
    const copy = cloneCard(cards.value[idx])
    cards.value.splice(idx + 1, 0, copy)
    selectedId.value = copy.id
    saveToStorage()
  }

  const removeCard = (id: string) => {
    const idx = cards.value.findIndex(c => c.id === id)
    if (idx === -1) return
    cards.value.splice(idx, 1)
    if (selectedId.value === id) {
      selectedId.value = cards.value[idx]?.id || cards.value[idx - 1]?.id || null
    }
    saveToStorage()
  }

  const selectCard = (id: string | null) => {
    selectedId.value = id
    saveToStorage()
  }

  const updateCard = (id: string, patch: Partial<CardData>) => {
    const idx = cards.value.findIndex(c => c.id === id)
    if (idx === -1) return
    cards.value[idx] = { ...cards.value[idx], ...patch }
    saveToStorage()
  }

  const addSynergy = () => {
    synergies.value.push(createSynergy())
    saveToStorage()
  }

  const updateSynergy = (id: string, patch: Partial<FactionSynergy>) => {
    const idx = synergies.value.findIndex(s => s.id === id)
    if (idx === -1) return
    synergies.value[idx] = { ...synergies.value[idx], ...patch }
    saveToStorage()
  }

  const removeSynergy = (id: string) => {
    const idx = synergies.value.findIndex(s => s.id === id)
    if (idx === -1) return
    synergies.value.splice(idx, 1)
    saveToStorage()
  }

  const addTurnPhase = () => {
    turnFlow.value.push(createTurnPhase())
    saveToStorage()
  }

  const updateTurnPhase = (id: string, patch: Partial<TurnPhase>) => {
    const idx = turnFlow.value.findIndex(p => p.id === id)
    if (idx === -1) return
    turnFlow.value[idx] = { ...turnFlow.value[idx], ...patch }
    saveToStorage()
  }

  const removeTurnPhase = (id: string) => {
    const idx = turnFlow.value.findIndex(p => p.id === id)
    if (idx === -1) return
    turnFlow.value.splice(idx, 1)
    saveToStorage()
  }

  const moveTurnPhase = (id: string, direction: 'up' | 'down') => {
    const idx = turnFlow.value.findIndex(p => p.id === id)
    if (idx === -1) return
    const target = direction === 'up' ? idx - 1 : idx + 1
    if (target < 0 || target >= turnFlow.value.length) return
    const [item] = turnFlow.value.splice(idx, 1)
    turnFlow.value.splice(target, 0, item)
    saveToStorage()
  }

  const exportCSV = () => {
    const csv = cardsToCSV(cards.value)
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `card-game-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importCSV = async (file: File): Promise<CSVValidationResult> => {
    const text = await file.text()
    try {
      const result = validateCSV(text)
      if (result.valid && result.cards && result.cards.length) {
        let updatedCount = 0
        let addedCount = 0

        for (const newCard of result.cards) {
          const existingIdx = cards.value.findIndex(c => c.id === newCard.id)
          if (existingIdx !== -1) {
            cards.value[existingIdx] = { ...newCard }
            updatedCount++
          } else {
            cards.value.push(newCard)
            addedCount++
          }
        }

        selectedId.value = result.cards[0]?.id || null
        importErrors.value = []
        saveToStorage()

        if (updatedCount > 0 || addedCount > 0) {
          const msg: string[] = []
          if (updatedCount > 0) msg.push(`更新了 ${updatedCount} 张卡片`)
          if (addedCount > 0) msg.push(`新增了 ${addedCount} 张卡片`)
          importSuccess.value = `导入成功：${msg.join('，')}`
        }
      } else {
        importErrors.value = result.errors.map(e => e.message)
        importSuccess.value = null
      }
      return result
    } catch (e) {
      console.warn('导入失败', e)
      const errorMsg = e instanceof Error ? e.message : '未知错误'
      importErrors.value = [`导入失败: ${errorMsg}`]
      importSuccess.value = null
      return { valid: false, errors: [{ row: 0, message: errorMsg }] }
    }
  }

  const clearImportErrors = () => {
    importErrors.value = []
    importSuccess.value = null
  }

  const clearAll = () => {
    if (!confirm('确定要清空全部卡牌吗？此操作不可恢复。')) return
    cards.value = []
    selectedId.value = null
    saveToStorage()
  }

  const selectedErrors = computed(() =>
    selected.value ? validateCard(selected.value) : [],
  )

  const synergyErrors = computed(() => {
    const errs: Record<string, string[]> = {}
    ;(synergies.value || []).forEach(s => {
      const e = validateSynergy(s)
      if (e.length) errs[s.id] = e
    })
    return errs
  })

  const turnPhaseErrors = computed(() => {
    const errs: Record<string, string[]> = {}
    ;(turnFlow.value || []).forEach(p => {
      const e = validateTurnPhase(p)
      if (e.length) errs[p.id] = e
    })
    return errs
  })

  const stats = computed(() => ({
    total: (cards.value || []).length,
    totalCopies: (cards.value || []).reduce((s, c) => s + (c.copyCount || 0), 0),
    avgCost: (cards.value || []).length
      ? ((cards.value || []).reduce((s, c) => s + c.cost, 0) / (cards.value || []).length).toFixed(1)
      : '0.0',
    totalSynergies: (synergies.value || []).length,
    totalTurnPhases: (turnFlow.value || []).length,
    totalRules: (rules.value || []).length,
    totalSchemes: (schemes.value || []).length,
    totalDecks: (decks.value || []).length,
    totalCardTemplates: (cardTemplates.value || []).length,
  }))

  const ruleErrors = computed(() => {
    const errs: Record<string, string[]> = {}
    ;(rules.value || []).forEach(r => {
      const e = validateRule(r)
      if (e.length) errs[r.id] = e
    })
    return errs
  })

  const addRule = () => {
    rules.value.push(createGameRule())
    saveToStorage()
  }

  const updateRule = (id: string, patch: Partial<GameRule>) => {
    const idx = rules.value.findIndex(r => r.id === id)
    if (idx === -1) return
    rules.value[idx] = { ...rules.value[idx], ...patch, updatedAt: Date.now() }
    saveToStorage()
  }

  const removeRule = (id: string) => {
    const idx = rules.value.findIndex(r => r.id === id)
    if (idx === -1) return
    rules.value.splice(idx, 1)
    saveToStorage()
  }

  const duplicateRule = (id: string) => {
    const idx = rules.value.findIndex(r => r.id === id)
    if (idx === -1) return
    const original = rules.value[idx]
    const copy = createGameRule({
      ...original,
      name: `${original.name} (副本)`,
    })
    rules.value.splice(idx + 1, 0, copy)
    saveToStorage()
  }

  const addRuleCondition = (ruleId: string) => {
    const rule = rules.value.find(r => r.id === ruleId)
    if (!rule) return
    rule.conditions.push({
      id: `cond_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      field: 'currentHp',
      operator: '>',
      value: 0,
    })
    rule.updatedAt = Date.now()
    saveToStorage()
  }

  const removeRuleCondition = (ruleId: string, conditionId: string) => {
    const rule = rules.value.find(r => r.id === ruleId)
    if (!rule) return
    rule.conditions = rule.conditions.filter(c => c.id !== conditionId)
    rule.updatedAt = Date.now()
    saveToStorage()
  }

  const addRuleAction = (ruleId: string) => {
    const rule = rules.value.find(r => r.id === ruleId)
    if (!rule) return
    rule.actions.push({
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: 'damage',
      target: 'enemy',
      value: 1,
    })
    rule.updatedAt = Date.now()
    saveToStorage()
  }

  const removeRuleAction = (ruleId: string, actionId: string) => {
    const rule = rules.value.find(r => r.id === ruleId)
    if (!rule) return
    rule.actions = rule.actions.filter(a => a.id !== actionId)
    rule.updatedAt = Date.now()
    saveToStorage()
  }

  const switchGameScheme = (schemeId: string) => {
    const scheme = schemes.value.find(s => s.id === schemeId)
    if (!scheme) return

    currentSchemeId.value = schemeId
    cards.value = scheme.cards.map(c => ({ ...c }))
    synergies.value = scheme.synergies.map(s => ({ ...s }))
    turnFlow.value = scheme.turnFlow.map(t => ({ ...t }))
    rules.value = scheme.rules.map(r => ({ ...r }))

    if (cards.value.length > 0) {
      selectedId.value = cards.value[0].id
    }

    saveToStorage()
  }

  const saveCurrentAsNewScheme = (name: string, description: string = '') => {
    const newScheme = createGameScheme({
      name,
      description,
      cards: cards.value.map(c => ({ ...c })),
      synergies: synergies.value.map(s => ({ ...s })),
      turnFlow: turnFlow.value.map(t => ({ ...t })),
      rules: rules.value.map(r => ({ ...r })),
    })
    schemes.value.push(newScheme)
    currentSchemeId.value = newScheme.id
    saveToStorage()
    return newScheme
  }

  const updateCurrentScheme = () => {
    if (!currentSchemeId.value) return
    const idx = schemes.value.findIndex(s => s.id === currentSchemeId.value)
    if (idx === -1) return
    schemes.value[idx] = {
      ...schemes.value[idx],
      cards: cards.value.map(c => ({ ...c })),
      synergies: synergies.value.map(s => ({ ...s })),
      turnFlow: turnFlow.value.map(t => ({ ...t })),
      rules: rules.value.map(r => ({ ...r })),
      updatedAt: Date.now(),
    }
    saveToStorage()
  }

  const addGameScheme = () => {
    const scheme = createGameScheme()
    schemes.value.push(scheme)
    saveToStorage()
    return scheme
  }

  const removeGameScheme = (schemeId: string) => {
    const idx = schemes.value.findIndex(s => s.id === schemeId)
    if (idx === -1) return
    if (schemes.value.length <= 1) {
      alert('至少需要保留一个游戏方案')
      return
    }
    schemes.value.splice(idx, 1)
    if (currentSchemeId.value === schemeId) {
      currentSchemeId.value = schemes.value[0]?.id || null
      if (schemes.value[0]) {
        switchGameScheme(schemes.value[0].id)
      }
    }
    saveToStorage()
  }

  const cloneCurrentScheme = (newName: string) => {
    if (!currentScheme.value) return
    const cloned = cloneGameScheme(currentScheme.value, newName)
    schemes.value.push(cloned)
    saveToStorage()
    return cloned
  }

  const exportCurrentScheme = () => {
    if (!currentScheme.value) return
    downloadGameScheme(currentScheme.value)
  }

  const importGameScheme = (file: File): Promise<GameScheme | null> => {
    return file.text().then(text => {
      const scheme = importGameSchemeFromJSON(text)
      if (scheme) {
        schemes.value.push(scheme)
        saveToStorage()
      }
      return scheme
    })
  }

  const addDeck = () => {
    decks.value.push(createDeck())
    saveToStorage()
  }

  const updateDeck = (id: string, patch: Partial<Deck>) => {
    const idx = decks.value.findIndex(d => d.id === id)
    if (idx === -1) return
    decks.value[idx] = { ...decks.value[idx], ...patch, updatedAt: Date.now() }
    saveToStorage()
  }

  const removeDeck = (id: string) => {
    const idx = decks.value.findIndex(d => d.id === id)
    if (idx === -1) return
    decks.value.splice(idx, 1)
    saveToStorage()
  }

  const addCardToDeck = (deckId: string, cardId: string, count: number = 1) => {
    const deck = decks.value.find(d => d.id === deckId)
    if (!deck) return
    const existing = deck.cards.find(c => c.cardId === cardId)
    if (existing) {
      existing.count += count
    } else {
      deck.cards.push({ cardId, count })
    }
    deck.updatedAt = Date.now()
    saveToStorage()
  }

  const removeCardFromDeck = (deckId: string, cardId: string, count: number = 1) => {
    const deck = decks.value.find(d => d.id === deckId)
    if (!deck) return
    const existing = deck.cards.find(c => c.cardId === cardId)
    if (existing) {
      existing.count -= count
      if (existing.count <= 0) {
        deck.cards = deck.cards.filter(c => c.cardId !== cardId)
      }
    }
    deck.updatedAt = Date.now()
    saveToStorage()
  }

  const setCardCountInDeck = (deckId: string, cardId: string, count: number) => {
    const deck = decks.value.find(d => d.id === deckId)
    if (!deck) return
    if (count <= 0) {
      deck.cards = deck.cards.filter(c => c.cardId !== cardId)
    } else {
      const existing = deck.cards.find(c => c.cardId === cardId)
      if (existing) {
        existing.count = count
      } else {
        deck.cards.push({ cardId, count })
      }
    }
    deck.updatedAt = Date.now()
    saveToStorage()
  }

  const addCardTemplate = (card: CardData) => {
    const template = {
      id: `ctpl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: card.name,
      description: card.description,
      card: { ...card },
      category: card.faction || '未分类',
      tags: [...(card.tags || [])],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      author: '我',
      isPublic: false,
    }
    cardTemplates.value.push(template)
    saveToStorage()
    return template
  }

  const updateCardTemplate = (id: string, patch: Partial<CardTemplate>) => {
    const idx = cardTemplates.value.findIndex(t => t.id === id)
    if (idx === -1) return
    cardTemplates.value[idx] = { ...cardTemplates.value[idx], ...patch, updatedAt: Date.now() }
    saveToStorage()
  }

  const removeCardTemplate = (id: string) => {
    const idx = cardTemplates.value.findIndex(t => t.id === id)
    if (idx === -1) return
    cardTemplates.value.splice(idx, 1)
    saveToStorage()
  }

  const applyCardTemplate = (templateId: string, targetCardId: string) => {
    const template = cardTemplates.value.find(t => t.id === templateId)
    const card = cards.value.find(c => c.id === targetCardId)
    if (!template || !card) return
    Object.assign(card, template.card, { id: card.id })
    saveToStorage()
  }

  return {
    cards,
    selectedId,
    selected,
    synergies,
    turnFlow,
    rules,
    currentSchemeId,
    currentScheme,
    schemes,
    decks,
    cardTemplates,
    deckTemplates,
    selectedErrors,
    synergyErrors,
    turnPhaseErrors,
    ruleErrors,
    importErrors,
    importSuccess,
    stats,
    loadFromStorage,
    saveToStorage,
    addCard,
    duplicateCard,
    removeCard,
    selectCard,
    updateCard,
    addSynergy,
    updateSynergy,
    removeSynergy,
    addTurnPhase,
    updateTurnPhase,
    removeTurnPhase,
    moveTurnPhase,
    exportCSV,
    importCSV,
    clearImportErrors,
    clearAll,
    addRule,
    updateRule,
    removeRule,
    duplicateRule,
    addRuleCondition,
    removeRuleCondition,
    addRuleAction,
    removeRuleAction,
    switchGameScheme,
    saveCurrentAsNewScheme,
    updateCurrentScheme,
    addGameScheme,
    removeGameScheme,
    cloneCurrentScheme,
    exportCurrentScheme,
    importGameScheme,
    addDeck,
    updateDeck,
    removeDeck,
    addCardToDeck,
    removeCardFromDeck,
    setCardCountInDeck,
    addCardTemplate,
    updateCardTemplate,
    removeCardTemplate,
    applyCardTemplate,
  }
}
