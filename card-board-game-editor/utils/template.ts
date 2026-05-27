import type {
  CardData,
  CardTemplate,
  DeckTemplate,
  Deck,
  TemplateType,
  TemplateShareLink,
  TemplateImportResult,
} from '../types'

function genId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function createCardTemplate(card: CardData, options?: Partial<CardTemplate>): CardTemplate {
  const now = Date.now()
  return {
    id: genId('ctpl'),
    name: card.name,
    description: card.description,
    card: { ...card },
    category: card.faction || '未分类',
    tags: [...(card.tags || [])],
    createdAt: now,
    updatedAt: now,
    author: '我',
    isPublic: false,
    ...options,
  }
}

export function createDeckTemplate(
  deck: Deck,
  cardPool: CardData[],
  options?: Partial<DeckTemplate>,
): DeckTemplate {
  const now = Date.now()
  return {
    id: genId('dtpl'),
    name: deck.name,
    description: deck.description,
    cards: [...deck.cards],
    category: '未分类',
    tags: [],
    cardPool: cardPool.filter(c => deck.cards.some(dc => dc.cardId === c.id)),
    createdAt: now,
    updatedAt: now,
    author: '我',
    isPublic: false,
    ...options,
  }
}

export function exportTemplateToJSON(template: CardTemplate | DeckTemplate): string {
  return JSON.stringify(
    {
      type: 'card' in template ? 'card' : 'deck',
      data: template,
      version: '1.0',
      exportedAt: Date.now(),
    },
    null,
    2,
  )
}

export function importTemplateFromJSON(json: string): TemplateImportResult {
  try {
    const parsed = JSON.parse(json)

    if (!parsed.type || !parsed.data) {
      return { success: false, error: '无效的模板格式' }
    }

    if (parsed.type === 'card') {
      return { success: true, data: parsed.data as CardTemplate }
    } else if (parsed.type === 'deck') {
      return { success: true, data: parsed.data as DeckTemplate }
    } else {
      return { success: false, error: `未知的模板类型: ${parsed.type}` }
    }
  } catch (e) {
    return {
      success: false,
      error: `解析失败: ${e instanceof Error ? e.message : '未知错误'}`,
    }
  }
}

export function createShareLink(
  templateId: string,
  templateType: TemplateType,
  expiresInHours?: number,
): TemplateShareLink {
  const shareCode = btoa(`${templateType}:${templateId}:${Date.now()}`)
    .replace(/=/g, '')
    .slice(-12)
    .toUpperCase()

  return {
    id: genId('share'),
    templateId,
    templateType,
    shareCode,
    expiresAt: expiresInHours ? Date.now() + expiresInHours * 60 * 60 * 1000 : undefined,
    accessCount: 0,
    createdAt: Date.now(),
  }
}

export function isShareLinkValid(link: TemplateShareLink): boolean {
  if (!link) return false
  if (link.expiresAt && Date.now() > link.expiresAt) return false
  return true
}

export function decodeShareCode(code: string): { templateType: TemplateType; templateId: string } | null {
  try {
    const padded = code + '='.repeat((4 - (code.length % 4)) % 4)
    const decoded = atob(padded)
    const parts = decoded.split(':')
    if (parts.length >= 2) {
      return {
        templateType: parts[0] as TemplateType,
        templateId: parts[1],
      }
    }
    return null
  } catch (e) {
    return null
  }
}

export function downloadTemplate(template: CardTemplate | DeckTemplate) {
  const json = exportTemplateToJSON(template)
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${template.name || 'template'}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function copyTemplateToClipboard(template: CardTemplate | DeckTemplate): Promise<boolean> {
  const json = exportTemplateToJSON(template)
  if (navigator.clipboard) {
    return navigator.clipboard
      .writeText(json)
      .then(() => true)
      .catch(() => false)
  }
  return Promise.resolve(false)
}

export function cardTemplateToCard(template: CardTemplate): CardData {
  return {
    id: genId('card'),
    name: template.name,
    type: template.card.type || '单位',
    rarity: template.card.rarity || 'common',
    cost: template.card.cost || 0,
    hp: template.card.hp || 0,
    damage: template.card.damage || 0,
    description: template.card.description || '',
    art: template.card.art || '',
    faction: template.card.faction || '中立',
    tags: [...(template.card.tags || [])],
    attributes: [...(template.card.attributes || [])],
    flavorText: template.card.flavorText || '',
    copyCount: template.card.copyCount || 1,
    passiveSkills: [...(template.card.passiveSkills || [])],
  }
}

export function mergeCardTemplateToCard(template: CardTemplate, target: CardData): CardData {
  return {
    ...target,
    ...template.card,
    id: target.id,
    tags: [...new Set([...(target.tags || []), ...(template.card.tags || [])])],
  }
}

export function searchTemplates<T extends CardTemplate | DeckTemplate>(
  templates: T[],
  query: string,
  filters?: { category?: string; tags?: string[] },
): T[] {
  const lowerQuery = query.toLowerCase().trim()

  return templates.filter(t => {
    const matchesQuery =
      !lowerQuery ||
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))

    const matchesCategory = !filters?.category || t.category === filters.category

    const matchesTags =
      !filters?.tags || filters.tags.length === 0 || filters.tags.every(tag => t.tags.includes(tag))

    return matchesQuery && matchesCategory && matchesTags
  })
}

export function sortTemplates<T extends CardTemplate | DeckTemplate>(
  templates: T[],
  sortBy: 'name' | 'date' | 'popularity',
  ascending = false,
): T[] {
  const sorted = [...templates]

  switch (sortBy) {
    case 'name':
      sorted.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'date':
      sorted.sort((a, b) => b.updatedAt - a.updatedAt)
      break
    case 'popularity':
    default:
      sorted.sort((a, b) => b.updatedAt - a.updatedAt)
  }

  return ascending ? sorted.reverse() : sorted
}

export function getTemplateCategories(templates: (CardTemplate | DeckTemplate)[]): string[] {
  const categories = new Set(templates.map(t => t.category).filter(Boolean))
  return Array.from(categories).sort()
}

export function defaultCardTemplates(cardPool: CardData[]): CardTemplate[] {
  return cardPool.slice(0, 3).map(card => createCardTemplate(card, {
    category: card.faction,
    isPublic: false,
  }))
}

export function validateTemplate(template: CardTemplate | DeckTemplate): string[] {
  const errors: string[] = []

  if (!template.name?.trim()) {
    errors.push('模板名称不能为空')
  }

  if (template.name && template.name.length > 100) {
    errors.push('模板名称不能超过100个字符')
  }

  if ('card' in template) {
    if (!template.card) {
      errors.push('卡牌模板缺少卡牌数据')
    }
  } else if ('cards' in template) {
    if (!template.cards || template.cards.length === 0) {
      errors.push('卡组模板至少需要一张卡牌')
    }
  }

  return errors
}
