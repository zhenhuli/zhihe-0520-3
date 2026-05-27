import type {
  CardData,
  CardType,
  CardRarity,
  FactionSynergy,
  PassiveSkill,
  TriggerCondition,
  TriggerEventType,
  TurnPhase,
} from '../types'
import { TRIGGER_EVENT_LABEL, CARD_TYPES, CARD_RARITIES } from '../types'

export function createTrigger(partial?: Partial<TriggerCondition>): TriggerCondition {
  return {
    id: `trig_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    event: 'onPlay',
    description: '',
    ...partial,
  }
}

export function createPassiveSkill(partial?: Partial<PassiveSkill>): PassiveSkill {
  return {
    id: `skill_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: '新被动技能',
    description: '',
    trigger: null,
    ...partial,
  }
}

export function createSynergy(partial?: Partial<FactionSynergy>): FactionSynergy {
  return {
    id: `syn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: '新羁绊',
    requiredCount: 2,
    effect: '',
    description: '',
    ...partial,
  }
}

export function createTurnPhase(partial?: Partial<TurnPhase>): TurnPhase {
  return {
    id: `phase_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: '新阶段',
    description: '',
    actions: [],
    ...partial,
  }
}

export function createCard(partial?: Partial<CardData>): CardData {
  return {
    id: `card_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: '新卡牌',
    type: '单位',
    rarity: 'common',
    cost: 1,
    hp: 1,
    damage: 1,
    description: '在这里描述卡牌的技能与效果。',
    art: '',
    faction: '中立',
    tags: [],
    attributes: [],
    flavorText: '',
    copyCount: 3,
    passiveSkills: [],
    ...partial,
  }
}

export function defaultSynergies(): FactionSynergy[] {
  return [
    createSynergy({
      name: '烈焰同盟',
      requiredCount: 3,
      effect: '火焰派系单位获得 +1 伤害',
      description: '当你控制3张或更多火焰派系卡牌时，所有火焰单位的伤害+1。',
    }),
    createSynergy({
      name: '自然庇护',
      requiredCount: 2,
      effect: '自然派系单位获得 +2 血量',
      description: '当你控制2张或更多自然派系卡牌时，所有自然单位的血量+2。',
    }),
  ]
}

export function defaultTurnFlow(): TurnPhase[] {
  return [
    createTurnPhase({
      name: '抽牌阶段',
      description: '从牌库抽2张牌',
      actions: ['抽2张牌'],
    }),
    createTurnPhase({
      name: '行动阶段',
      description: '可以打出卡牌、使用技能、攻击',
      actions: ['打出卡牌', '使用技能', '发起攻击'],
    }),
    createTurnPhase({
      name: '结束阶段',
      description: '弃掉多余手牌，回合结束',
      actions: ['弃置手牌至上限'],
    }),
  ]
}

export function defaultPresets(): CardData[] {
  return [
    createCard({
      name: '火焰法师',
      type: '单位',
      rarity: 'rare',
      cost: 3,
      hp: 4,
      damage: 2,
      faction: '火焰',
      description: '【灼烧】对目标造成1点伤害，持续2回合。',
      flavorText: '火会吞噬一切虚妄。',
      tags: ['法师', '火焰'],
      passiveSkills: [
        createPassiveSkill({
          name: '烈焰共鸣',
          description: '当你打出另一张火焰派系卡牌时，此单位获得 +1 伤害。',
          trigger: createTrigger({
            event: 'onPlay',
            description: '打出另一张火焰卡牌时',
          }),
        }),
      ],
    }),
    createCard({
      name: '森林守卫',
      type: '单位',
      rarity: 'common',
      cost: 2,
      hp: 5,
      damage: 1,
      faction: '自然',
      description: '【嘲讽】对手必须先攻击此单位。',
      flavorText: '守护森林，即是守护生命本身。',
      tags: ['守卫', '嘲讽'],
      passiveSkills: [
        createPassiveSkill({
          name: '自然庇护',
          description: '回合开始时恢复1点血量。',
          trigger: createTrigger({
            event: 'onTurnStart',
            description: '你的回合开始时',
          }),
        }),
      ],
    }),
    createCard({
      name: '闪电链',
      type: '法术',
      rarity: 'epic',
      cost: 4,
      hp: 0,
      damage: 3,
      faction: '雷电',
      description: '对3个随机敌方单位各造成3点伤害。',
      tags: ['法术'],
    }),
  ]
}

export function cloneCard(card: CardData): CardData {
  return {
    ...card,
    id: `card_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: `${card.name} (副本)`,
    passiveSkills: (card.passiveSkills || []).map(s => ({
      ...s,
      id: `skill_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      trigger: s.trigger
        ? {
            ...s.trigger,
            id: `trig_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          }
        : null,
    })),
  }
}

export function validateCard(card: CardData): string[] {
  const errors: string[] = []
  if (!card.name?.trim()) errors.push('卡牌名称不能为空')
  if (card.cost < 0) errors.push('费用不能为负')
  if (card.hp < 0) errors.push('血量不能为负')
  if (card.damage < 0) errors.push('伤害不能为负')
  ;(card.passiveSkills || []).forEach((s, i) => {
    if (!s.name?.trim()) errors.push(`被动技能 #${i + 1} 名称不能为空`)
  })
  return errors
}

export function validateSynergy(s: FactionSynergy): string[] {
  const errors: string[] = []
  if (!s.name?.trim()) errors.push('羁绊名称不能为空')
  if (s.requiredCount < 1) errors.push('羁绊所需数量必须大于0')
  return errors
}

export function validateTurnPhase(p: TurnPhase): string[] {
  const errors: string[] = []
  if (!p.name?.trim()) errors.push('阶段名称不能为空')
  return errors
}

const CSV_HEADERS = [
  'id', 'name', 'type', 'rarity', 'cost', 'hp', 'damage',
  'faction', 'description', 'flavorText', 'art', 'tags', 'copyCount', 'attributes',
  'passiveSkills',
]

function csvEscape(value: string): string {
  if (value == null) return ''
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return '"' + value.replace(/"/g, '""') + '"'
  }
  return value
}

function csvParseCell(cell: string): string {
  if (cell.startsWith('"') && cell.endsWith('"')) {
    return cell.slice(1, -1).replace(/""/g, '"')
  }
  return cell
}

export function cardsToCSV(cards: CardData[]): string {
  const lines = [CSV_HEADERS.join(',')]
  for (const card of cards) {
    const row = [
      card.id,
      card.name,
      card.type,
      card.rarity,
      String(card.cost),
      String(card.hp),
      String(card.damage),
      card.faction,
      card.description,
      card.flavorText,
      card.art,
      (card.tags || []).join('|'),
      String(card.copyCount),
      (card.attributes || []).map(a => `${a.key}:${a.value}`).join(';'),
      (card.passiveSkills || [])
        .map(s => `${s.name}::${s.description}::${s.trigger ? s.trigger.event : 'none'}::${s.trigger ? s.trigger.description : ''}`)
        .join('||'),
    ]
    lines.push(row.map(v => csvEscape(v)).join(','))
  }
  return lines.join('\n')
}

export function csvToCards(text: string): CardData[] {
  const lines = text.replace(/\r\n/g, '\n').split('\n').filter(l => l.trim())
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.trim())
  const idx = Object.fromEntries(headers.map((h, i) => [h, i]))

  const cards: CardData[] = []
  for (let i = 1; i < lines.length; i++) {
    const cells = parseCSVLine(lines[i])
    const get = (key: string) => csvParseCell(cells[idx[key]] ?? '')

    const tagsStr = get('tags')
    const attrStr = get('attributes')
    const skillStr = get('passiveSkills')

    const passiveSkills: PassiveSkill[] = skillStr
      ? skillStr.split('||').filter(Boolean).map(part => {
          const [name, desc, event, trigDesc] = part.split('::')
          return createPassiveSkill({
            name: name || '未命名技能',
            description: desc || '',
            trigger: event && event !== 'none'
              ? createTrigger({
                  event: (event as TriggerEventType) || 'custom',
                  description: trigDesc || '',
                })
              : null,
          })
        })
      : []

    const card = createCard({
      id: get('id') || undefined,
      name: get('name') || '未命名卡牌',
      type: (get('type') as CardData['type']) || '单位',
      rarity: (get('rarity') as CardData['rarity']) || 'common',
      cost: Number(get('cost')) || 0,
      hp: Number(get('hp')) || 0,
      damage: Number(get('damage')) || 0,
      faction: get('faction') || '中立',
      description: get('description') || '',
      flavorText: get('flavorText') || '',
      art: get('art') || '',
      tags: tagsStr ? tagsStr.split('|').filter(Boolean) : [],
      copyCount: Number(get('copyCount')) || 1,
      attributes: attrStr
        ? attrStr.split(';').filter(Boolean).map(pair => {
            const [k, v] = pair.split(':')
            return { key: k || '', value: isNaN(Number(v)) ? v : Number(v) }
          })
        : [],
      passiveSkills,
    })
    cards.push(card)
  }
  return cards
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        current += ch
      }
    } else {
      if (ch === ',') {
        result.push(current)
        current = ''
      } else if (ch === '"') {
        inQuotes = true
      } else {
        current += ch
      }
    }
  }
  result.push(current)
  return result
}

export function triggerEventLabel(event: TriggerEventType): string {
  return TRIGGER_EVENT_LABEL[event] || event
}

export interface CSVValidationError {
  row: number
  field?: string
  message: string
}

export interface CSVValidationResult {
  valid: boolean
  errors: CSVValidationError[]
  cards?: CardData[]
}

const REQUIRED_HEADERS = ['id', 'name', 'type', 'rarity', 'cost', 'hp', 'damage']

const CARD_ID_PATTERN = /^[a-zA-Z0-9_-]+$/

export function validateCSVHeaders(headers: string[]): CSVValidationError[] {
  const errors: CSVValidationError[] = []
  const lowerHeaders = headers.map(h => h.toLowerCase().trim())

  for (const required of REQUIRED_HEADERS) {
    if (!lowerHeaders.includes(required.toLowerCase())) {
      errors.push({
        row: 0,
        field: required,
        message: `缺少必需的列: ${required}`,
      })
    }
  }

  return errors
}

export function validateCardId(id: string, rowNum: number): CSVValidationError[] {
  const errors: CSVValidationError[] = []

  if (!id || !id.trim()) {
    errors.push({
      row: rowNum,
      field: 'id',
      message: `第 ${rowNum} 行: 卡片ID不能为空`,
    })
    return errors
  }

  if (id.length > 100) {
    errors.push({
      row: rowNum,
      field: 'id',
      message: `第 ${rowNum} 行: 卡片ID长度不能超过100个字符`,
    })
  }

  if (!CARD_ID_PATTERN.test(id)) {
    errors.push({
      row: rowNum,
      field: 'id',
      message: `第 ${rowNum} 行: 卡片ID只能包含字母、数字、下划线和连字符`,
    })
  }

  return errors
}

export function validateCardName(name: string, rowNum: number): CSVValidationError[] {
  const errors: CSVValidationError[] = []

  if (!name || !name.trim()) {
    errors.push({
      row: rowNum,
      field: 'name',
      message: `第 ${rowNum} 行: 卡片名称不能为空`,
    })
    return errors
  }

  if (name.length > 100) {
    errors.push({
      row: rowNum,
      field: 'name',
      message: `第 ${rowNum} 行: 卡片名称长度不能超过100个字符`,
    })
  }

  return errors
}

export function validateCardType(type: string, rowNum: number): CSVValidationError[] {
  const errors: CSVValidationError[] = []

  if (!type || !type.trim()) {
    errors.push({
      row: rowNum,
      field: 'type',
      message: `第 ${rowNum} 行: 卡片类型不能为空`,
    })
    return errors
  }

  if (!CARD_TYPES.includes(type as CardType)) {
    errors.push({
      row: rowNum,
      field: 'type',
      message: `第 ${rowNum} 行: 无效的卡片类型 "${type}"，必须是: ${CARD_TYPES.join(', ')}`,
    })
  }

  return errors
}

export function validateCardRarity(rarity: string, rowNum: number): CSVValidationError[] {
  const errors: CSVValidationError[] = []

  if (!rarity || !rarity.trim()) {
    errors.push({
      row: rowNum,
      field: 'rarity',
      message: `第 ${rowNum} 行: 卡片稀有度不能为空`,
    })
    return errors
  }

  if (!CARD_RARITIES.includes(rarity as CardRarity)) {
    errors.push({
      row: rowNum,
      field: 'rarity',
      message: `第 ${rowNum} 行: 无效的卡片稀有度 "${rarity}"，必须是: ${CARD_RARITIES.join(', ')}`,
    })
  }

  return errors
}

export function validateNumericField(value: string, field: string, rowNum: number, min: number = 0, max?: number): CSVValidationError[] {
  const errors: CSVValidationError[] = []

  if (value === '' || value === undefined || value === null) {
    errors.push({
      row: rowNum,
      field,
      message: `第 ${rowNum} 行: ${field} 不能为空`,
    })
    return errors
  }

  const num = Number(value)

  if (isNaN(num)) {
    errors.push({
      row: rowNum,
      field,
      message: `第 ${rowNum} 行: ${field} 必须是有效的数字`,
    })
    return errors
  }

  if (!Number.isInteger(num) && (field === 'cost' || field === 'hp' || field === 'damage' || field === 'copyCount')) {
    errors.push({
      row: rowNum,
      field,
      message: `第 ${rowNum} 行: ${field} 必须是整数`,
    })
    return errors
  }

  if (num < min) {
    errors.push({
      row: rowNum,
      field,
      message: `第 ${rowNum} 行: ${field} 不能小于 ${min}`,
    })
  }

  if (max !== undefined && num > max) {
    errors.push({
      row: rowNum,
      field,
      message: `第 ${rowNum} 行: ${field} 不能大于 ${max}`,
    })
  }

  return errors
}

export function validateCardRow(row: Record<string, string>, rowNum: number): CSVValidationError[] {
  const errors: CSVValidationError[] = []

  errors.push(...validateCardId(row.id, rowNum))
  errors.push(...validateCardName(row.name, rowNum))
  errors.push(...validateCardType(row.type, rowNum))
  errors.push(...validateCardRarity(row.rarity, rowNum))
  errors.push(...validateNumericField(row.cost, 'cost', rowNum, 0, 100))
  errors.push(...validateNumericField(row.hp, 'hp', rowNum, 0, 999))
  errors.push(...validateNumericField(row.damage, 'damage', rowNum, 0, 999))

  if (row.copyCount !== undefined && row.copyCount !== '') {
    errors.push(...validateNumericField(row.copyCount, 'copyCount', rowNum, 1, 99))
  }

  return errors
}

export function checkDuplicateIds(cardRows: { id: string; row: number }[]): CSVValidationError[] {
  const errors: CSVValidationError[] = []
  const idMap = new Map<string, number[]>()

  for (const { id, row } of cardRows) {
    if (id) {
      const rows = idMap.get(id) || []
      rows.push(row)
      idMap.set(id, rows)
    }
  }

  for (const [id, rows] of idMap) {
    if (rows.length > 1) {
      errors.push({
        row: rows[0],
        field: 'id',
        message: `卡片ID "${id}" 在第 ${rows.join(', ')} 行重复出现`,
      })
    }
  }

  return errors
}

export function validateCSV(text: string): CSVValidationResult {
  const errors: CSVValidationError[] = []
  const lines = text.replace(/\r\n/g, '\n').split('\n').filter(l => l.trim())

  if (lines.length < 2) {
    return {
      valid: false,
      errors: [{ row: 0, message: 'CSV文件为空或只有表头，没有数据行' }],
    }
  }

  const headerLine = lines[0]
  const headers = parseCSVLine(headerLine).map(h => h.trim())

  errors.push(...validateCSVHeaders(headers))

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  const headerIndex = Object.fromEntries(headers.map((h, i) => [h, i]))

  const cardRows: { id: string; row: number }[] = []
  const rowDataList: { row: Record<string, string>; rowNum: number }[] = []

  for (let i = 1; i < lines.length; i++) {
    const rowNum = i + 1
    const cells = parseCSVLine(lines[i])

    if (cells.length !== headers.length) {
      errors.push({
        row: rowNum,
        message: `第 ${rowNum} 行: 字段数量不匹配，期望 ${headers.length} 个字段，实际有 ${cells.length} 个`,
      })
      continue
    }

    const rowData: Record<string, string> = {}
    for (const header of headers) {
      rowData[header] = csvParseCell(cells[headerIndex[header]] ?? '')
    }

    cardRows.push({ id: rowData.id, row: rowNum })
    rowDataList.push({ row: rowData, rowNum })

    errors.push(...validateCardRow(rowData, rowNum))
  }

  errors.push(...checkDuplicateIds(cardRows))

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  const cards = csvToCards(text)
  return { valid: true, errors: [], cards }
}
