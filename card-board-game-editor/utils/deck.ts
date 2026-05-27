import type { CardData, Deck, DeckCard, DeckValidationResult } from '../types'

function genId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function createDeck(partial?: Partial<Deck>): Deck {
  const now = Date.now()
  return {
    id: genId('deck'),
    name: '新卡组',
    description: '',
    cards: [],
    createdAt: now,
    updatedAt: now,
    ...partial,
  }
}

export function addCardToDeck(deck: Deck, cardId: string, count: number = 1): Deck {
  const existing = deck.cards.find(c => c.cardId === cardId)
  if (existing) {
    existing.count += count
  } else {
    deck.cards.push({ cardId, count })
  }
  deck.updatedAt = Date.now()
  return deck
}

export function removeCardFromDeck(deck: Deck, cardId: string, count: number = 1): Deck {
  const existing = deck.cards.find(c => c.cardId === cardId)
  if (existing) {
    existing.count -= count
    if (existing.count <= 0) {
      deck.cards = deck.cards.filter(c => c.cardId !== cardId)
    }
  }
  deck.updatedAt = Date.now()
  return deck
}

export function setCardCountInDeck(deck: Deck, cardId: string, count: number): Deck {
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
  return deck
}

export function getDeckCardCount(deck: Deck): number {
  return deck.cards.reduce((sum, c) => sum + c.count, 0)
}

export function getDeckUniqueCardCount(deck: Deck): number {
  return deck.cards.length
}

export function getDeckCards(deck: Deck, cardPool: CardData[]): CardData[] {
  const cards: CardData[] = []
  for (const deckCard of deck.cards) {
    const card = cardPool.find(c => c.id === deckCard.cardId)
    if (card) {
      for (let i = 0; i < deckCard.count; i++) {
        cards.push(card)
      }
    }
  }
  return cards
}

export function getDeckManaCurve(deck: Deck, cardPool: CardData[]): Record<number, number> {
  const curve: Record<number, number> = {}
  for (const deckCard of deck.cards) {
    const card = cardPool.find(c => c.id === deckCard.cardId)
    if (card) {
      const cost = card.cost
      curve[cost] = (curve[cost] || 0) + deckCard.count
    }
  }
  return curve
}

export function getDeckAvgCost(deck: Deck, cardPool: CardData[]): number {
  let totalCost = 0
  let totalCards = 0
  for (const deckCard of deck.cards) {
    const card = cardPool.find(c => c.id === deckCard.cardId)
    if (card) {
      totalCost += card.cost * deckCard.count
      totalCards += deckCard.count
    }
  }
  return totalCards > 0 ? totalCost / totalCards : 0
}

export function validateDeck(
  deck: Deck,
  cardPool: CardData[],
  options: {
    minCards?: number
    maxCards?: number
    maxCopies?: number
    requireAllCards?: boolean
  } = {},
): DeckValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  const { minCards = 30, maxCards = 60, maxCopies = 3, requireAllCards = true } = options

  const totalCards = getDeckCardCount(deck)
  const uniqueCards = getDeckUniqueCardCount(deck)
  const avgCost = getDeckAvgCost(deck, cardPool)
  const manaCurve = getDeckManaCurve(deck, cardPool)

  if (totalCards < minCards) {
    errors.push(`卡组卡牌数量不足，最少需要 ${minCards} 张，当前只有 ${totalCards} 张`)
  }

  if (totalCards > maxCards) {
    errors.push(`卡组卡牌数量超出上限，最多 ${maxCards} 张，当前有 ${totalCards} 张`)
  }

  for (const deckCard of deck.cards) {
    const card = cardPool.find(c => c.id === deckCard.cardId)
    if (!card) {
      if (requireAllCards) {
        errors.push(`卡牌 ID "${deckCard.cardId}" 不存在于卡池中`)
      } else {
        warnings.push(`卡牌 ID "${deckCard.cardId}" 不存在于卡池中，将被忽略`)
      }
      continue
    }

    if (deckCard.count > maxCopies) {
      errors.push(`卡牌 "${card.name}" 副本数量超过上限，最多 ${maxCopies} 张，当前有 ${deckCard.count} 张`)
    }

    if (deckCard.count <= 0) {
      warnings.push(`卡牌 "${card.name}" 的数量为 ${deckCard.count}，将被忽略`)
    }
  }

  if (uniqueCards < 10) {
    warnings.push(`卡组中不同卡牌数量较少 (${uniqueCards} 张)，建议增加卡牌多样性`)
  }

  if (avgCost < 2 || avgCost > 5) {
    warnings.push(`卡组平均费用为 ${avgCost.toFixed(1)}，建议控制在 2-5 之间`)
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: {
      totalCards,
      uniqueCards,
      avgCost: Number(avgCost.toFixed(2)),
      manaCurve,
    },
  }
}

export function exportDeckToText(deck: Deck, cardPool: CardData[]): string {
  const lines: string[] = []
  lines.push(`# ${deck.name}`)
  if (deck.description) {
    lines.push(`## ${deck.description}`)
  }
  lines.push('')
  lines.push(`## 卡组信息`)
  lines.push(`- 总卡牌数: ${getDeckCardCount(deck)}`)
  lines.push(`- 不同卡牌数: ${getDeckUniqueCardCount(deck)}`)
  lines.push(`- 平均费用: ${getDeckAvgCost(deck, cardPool).toFixed(2)}`)
  lines.push('')
  lines.push('## 卡牌列表')
  lines.push('')

  const sortedCards = [...deck.cards].sort((a, b) => {
    const cardA = cardPool.find(c => c.id === a.cardId)
    const cardB = cardPool.find(c => c.id === b.cardId)
    return (cardA?.cost || 0) - (cardB?.cost || 0)
  })

  for (const deckCard of sortedCards) {
    const card = cardPool.find(c => c.id === deckCard.cardId)
    if (card) {
      lines.push(`- ${deckCard.count}x ${card.name} (${card.cost}费)`)
    }
  }

  return lines.join('\n')
}

export function exportDeckToJSON(deck: Deck, cardPool: CardData[]): string {
  const cards = deck.cards
    .map(dc => {
      const card = cardPool.find(c => c.id === dc.cardId)
      return card ? { ...card, copyCount: dc.count } : null
    })
    .filter(Boolean)

  return JSON.stringify({
    name: deck.name,
    description: deck.description,
    cards,
    stats: {
      totalCards: getDeckCardCount(deck),
      uniqueCards: getDeckUniqueCardCount(deck),
      avgCost: getDeckAvgCost(deck, cardPool),
      manaCurve: getDeckManaCurve(deck, cardPool),
    },
  }, null, 2)
}

export function exportDeckToCSV(deck: Deck, cardPool: CardData[]): string {
  const headers = ['数量', '卡牌名称', '费用', '类型', '稀有度', '派系', '描述']
  const lines = [headers.join(',')]

  for (const deckCard of deck.cards) {
    const card = cardPool.find(c => c.id === deckCard.cardId)
    if (card) {
      const row = [
        deckCard.count,
        `"${card.name.replace(/"/g, '""')}"`,
        card.cost,
        card.type,
        card.rarity,
        `"${card.faction.replace(/"/g, '""')}"`,
        `"${card.description.replace(/"/g, '""')}"`,
      ]
      lines.push(row.join(','))
    }
  }

  return lines.join('\n')
}

export function importDeckFromText(text: string, cardPool: CardData[]): Deck | null {
  try {
    const deck = createDeck()
    const lines = text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'))

    for (const line of lines) {
      const match = line.match(/- (\d+)x (.+?) \((\d+)费\)/)
      if (match) {
        const [, countStr, name] = match
        const count = parseInt(countStr, 10)
        const card = cardPool.find(c => c.name === name)
        if (card) {
          addCardToDeck(deck, card.id, count)
        }
      }
    }

    return deck.cards.length > 0 ? deck : null
  } catch (e) {
    console.error('导入卡组失败', e)
    return null
  }
}

export function importDeckFromJSON(json: string, cardPool: CardData[]): Deck | null {
  try {
    const data = JSON.parse(json)
    const deck = createDeck({
      name: data.name || '导入的卡组',
      description: data.description || '',
    })

    if (data.cards && Array.isArray(data.cards)) {
      for (const cardData of data.cards) {
        const card = cardPool.find(c => c.id === cardData.id || c.name === cardData.name)
        if (card) {
          addCardToDeck(deck, card.id, cardData.copyCount || 1)
        }
      }
    }

    return deck.cards.length > 0 ? deck : null
  } catch (e) {
    console.error('导入卡组失败', e)
    return null
  }
}

export function downloadDeck(deck: Deck, cardPool: CardData[], format: 'txt' | 'json' | 'csv') {
  let content = ''
  let mimeType = 'text/plain'
  let extension = 'txt'

  switch (format) {
    case 'json':
      content = exportDeckToJSON(deck, cardPool)
      mimeType = 'application/json'
      extension = 'json'
      break
    case 'csv':
      content = exportDeckToCSV(deck, cardPool)
      mimeType = 'text/csv'
      extension = 'csv'
      break
    default:
      content = exportDeckToText(deck, cardPool)
  }

  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${deck.name || 'deck'}.${extension}`
  a.click()
  URL.revokeObjectURL(url)
}

export function defaultDecks(cardPool: CardData[]): Deck[] {
  if (cardPool.length === 0) return []

  const deck1 = createDeck({
    name: '烈焰法师',
    description: '以火焰法术为主的快攻卡组',
  })
  cardPool.slice(0, Math.min(3, cardPool.length)).forEach(card => {
    addCardToDeck(deck1, card.id, 3)
  })

  return [deck1]
}
