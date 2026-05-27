import type {
  BattleCard,
  BattleLogEntry,
  CardData,
  GameConfig,
  GamePhase,
  PlayerState,
} from '../types'
import { DEFAULT_GAME_CONFIG } from '../types'

function genId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function cardToBattleCard(card: CardData): BattleCard {
  return {
    instanceId: genId('bc'),
    cardId: card.id,
    name: card.name,
    type: card.type,
    rarity: card.rarity,
    cost: card.cost,
    baseHp: card.hp,
    currentHp: card.hp,
    maxHp: card.hp,
    baseDamage: card.damage,
    currentDamage: card.damage,
    description: card.description,
    art: card.art,
    faction: card.faction,
    tags: card.tags,
    canAttack: false,
    hasAttacked: false,
    justPlayed: true,
    statuses: [],
  }
}

export function buildDeck(cards: CardData[]): BattleCard[] {
  const deck: BattleCard[] = []
  for (const card of cards) {
    const copies = Math.max(1, card.copyCount || 1)
    for (let i = 0; i < copies; i++) {
      deck.push(cardToBattleCard(card))
    }
  }
  return shuffle(deck)
}

export function createPlayer(
  id: string,
  name: string,
  deck: CardData[],
  config: GameConfig = DEFAULT_GAME_CONFIG,
): PlayerState {
  const battleDeck = buildDeck(deck)
  const field: (BattleCard | null)[] = Array(config.fieldSize).fill(null)

  const player: PlayerState = {
    id,
    name,
    hp: config.startingHp,
    maxHp: config.startingHp,
    mana: config.startingMana,
    maxMana: config.startingMana,
    manaPerTurn: config.manaPerTurn,
    deck: battleDeck,
    hand: [],
    field,
    graveyard: [],
    fatigue: 0,
  }

  for (let i = 0; i < config.startingHandSize && player.deck.length > 0; i++) {
    const card = player.deck.shift()!
    if (player.hand.length < config.handLimit) {
      player.hand.push(card)
    }
  }

  return player
}

export function drawCards(player: PlayerState, count: number, config: GameConfig): BattleCard[] {
  const drawn: BattleCard[] = []
  for (let i = 0; i < count; i++) {
    if (player.deck.length === 0) {
      player.fatigue += 1
      player.hp -= player.fatigue
      continue
    }
    const card = player.deck.shift()!
    if (player.hand.length < config.handLimit) {
      player.hand.push(card)
      drawn.push(card)
    } else {
      player.graveyard.push(card)
    }
  }
  return drawn
}

export function canPlayCard(player: PlayerState, card: BattleCard): boolean {
  if (player.mana < card.cost) return false
  if (card.type !== '单位') return true
  const hasEmpty = player.field.some(s => s === null)
  return hasEmpty
}

export function playCard(
  player: PlayerState,
  cardIndex: number,
  fieldSlot: number | null,
  config: GameConfig,
): { card: BattleCard; fieldIndex: number } | null {
  const card = player.hand[cardIndex]
  if (!card) return null
  if (!canPlayCard(player, card)) return null

  player.mana -= card.cost
  player.hand.splice(cardIndex, 1)

  if (card.type === '单位') {
    let slot = fieldSlot
    if (slot === null || slot < 0 || slot >= player.field.length || player.field[slot] !== null) {
      slot = player.field.findIndex(s => s === null)
      if (slot === -1) return null
    }
    card.canAttack = false
    card.hasAttacked = false
    card.justPlayed = true
    player.field[slot] = card
    return { card, fieldIndex: slot }
  }

  card.currentHp = 0
  player.graveyard.push(card)
  return { card, fieldIndex: -1 }
}

export function dealDamageToCard(card: BattleCard, amount: number): number {
  card.currentHp -= amount
  return card.currentHp
}

export function checkFieldDeaths(player: PlayerState): BattleCard[] {
  const dead: BattleCard[] = []
  for (let i = 0; i < player.field.length; i++) {
    const card = player.field[i]
    if (card && card.currentHp <= 0) {
      dead.push(card)
      player.graveyard.push(card)
      player.field[i] = null
    }
  }
  return dead
}

export function canAttackWith(card: BattleCard): boolean {
  return card.type === '单位' && card.canAttack && !card.hasAttacked && card.currentHp > 0
}

export function performAttack(
  attacker: BattleCard,
  target: BattleCard | null,
  defender: PlayerState,
  attackerPlayer: PlayerState,
): {
  damageToTarget: number
  damageToAttacker: number
  targetDied: boolean
  attackerDied: boolean
} {
  const result = {
    damageToTarget: 0,
    damageToAttacker: 0,
    targetDied: false,
    attackerDied: false,
  }

  attacker.hasAttacked = true

  if (target) {
    result.damageToTarget = attacker.currentDamage
    target.currentHp -= attacker.currentDamage
    if (target.type === '单位') {
      result.damageToAttacker = target.currentDamage
      attacker.currentHp -= target.currentDamage
    }
    if (target.currentHp <= 0) result.targetDied = true
  } else {
    result.damageToTarget = attacker.currentDamage
    defender.hp -= attacker.currentDamage
  }

  if (attacker.currentHp <= 0) result.attackerDied = true

  return result
}

export function hasTaunt(player: PlayerState): boolean {
  return player.field.some(
    c => c && c.currentHp > 0 && (c.tags.includes('嘲讽') || c.description.includes('嘲讽')),
  )
}

export function getTauntTargets(player: PlayerState): BattleCard[] {
  return player.field.filter(
    c => c && c.currentHp > 0 && (c.tags.includes('嘲讽') || c.description.includes('嘲讽')),
  ) as BattleCard[]
}

export function getValidAttackTargets(
  attacker: BattleCard,
  defender: PlayerState,
): (BattleCard | null)[] {
  const targets: (BattleCard | null)[] = []

  if (hasTaunt(defender)) {
    return getTauntTargets(defender)
  }

  targets.push(null)

  for (const c of defender.field) {
    if (c && c.currentHp > 0) {
      targets.push(c)
    }
  }

  return targets
}

export function endTurn(
  player: PlayerState,
  opponent: PlayerState,
  config: GameConfig,
): void {
  for (const c of player.field) {
    if (c) {
      c.justPlayed = false
      c.hasAttacked = false
      c.canAttack = c.type === '单位'
    }
  }
  player.maxMana = Math.min(config.maxMana, player.maxMana + config.manaPerTurn)
  player.mana = player.maxMana
}

export function startTurnDraw(player: PlayerState, config: GameConfig): BattleCard[] {
  return drawCards(player, config.drawPerTurn, config)
}

export function checkWinCondition(
  p1: PlayerState,
  p2: PlayerState,
): { winner: string | null; reason: string } {
  if (p1.hp <= 0 && p2.hp <= 0) {
    return { winner: null, reason: '双方同时阵亡，平局！' }
  }
  if (p1.hp <= 0) {
    return { winner: p2.id, reason: `${p1.name} 被击败！` }
  }
  if (p2.hp <= 0) {
    return { winner: p1.id, reason: `${p2.name} 被击败！` }
  }
  if (p1.deck.length === 0 && p1.fatigue >= 3 && p2.deck.length === 0 && p2.fatigue >= 3) {
    return { winner: null, reason: '双方牌库耗尽且疲劳值过高，平局！' }
  }
  return { winner: null, reason: '' }
}

export function makeLog(
  turn: number,
  playerName: string,
  text: string,
  type: BattleLogEntry['type'],
): BattleLogEntry {
  return {
    id: genId('log'),
    turn,
    player: playerName,
    text,
    type,
    timestamp: Date.now(),
  }
}

export { DEFAULT_GAME_CONFIG }