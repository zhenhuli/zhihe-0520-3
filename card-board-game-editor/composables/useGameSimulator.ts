import type {
  BattleCard,
  BattleLogEntry,
  CardData,
  GameConfig,
  GamePhase,
  GameStatus,
  PlayerState,
} from '../types'
import { DEFAULT_GAME_CONFIG, PHASE_LABEL } from '../types'
import {
  canAttackWith,
  canPlayCard,
  checkFieldDeaths,
  checkWinCondition,
  createPlayer,
  endTurn,
  getTauntTargets,
  getValidAttackTargets,
  hasTaunt,
  makeLog,
  performAttack,
  playCard,
  startTurnDraw,
} from '../utils/game'

interface SimulatorState {
  players: [PlayerState, PlayerState] | null
  currentPlayerIndex: 0 | 1
  currentPhase: GamePhase
  turn: number
  status: GameStatus
  winner: string | null
  winReason: string
  logs: BattleLogEntry[]
  selectedHandIndex: number | null
  selectedFieldInstanceId: string | null
  pendingAttackInstanceId: string | null
  aiOpponent: boolean
}

export const useGameSimulator = () => {
  const state = reactive<SimulatorState>({
    players: null,
    currentPlayerIndex: 0,
    currentPhase: 'draw',
    turn: 0,
    status: 'idle',
    winner: null,
    winReason: '',
    logs: [],
    selectedHandIndex: null,
    selectedFieldInstanceId: null,
    pendingAttackInstanceId: null,
    aiOpponent: true,
  })

  const config = ref<GameConfig>({ ...DEFAULT_GAME_CONFIG })

  const currentPlayer = computed<PlayerState | null>(() => {
    if (!state.players) return null
    return state.players[state.currentPlayerIndex]
  })

  const opponent = computed<PlayerState | null>(() => {
    if (!state.players) return null
    return state.players[1 - state.currentPlayerIndex as 0 | 1]
  })

  function addLog(text: string, type: BattleLogEntry['type'] = 'info') {
    if (!state.players) return
    const p = state.players[state.currentPlayerIndex]
    state.logs.push(makeLog(state.turn, p.name, text, type))
    if (state.logs.length > 200) state.logs.shift()
  }

  function addLogFor(playerName: string, text: string, type: BattleLogEntry['type'] = 'info') {
    state.logs.push(makeLog(state.turn, playerName, text, type))
    if (state.logs.length > 200) state.logs.shift()
  }

  function initGame(playerCards: CardData[], aiCards?: CardData[], cfg?: GameConfig) {
    if (cfg) {
      Object.assign(config.value, cfg)
    }
    const actualCfg = config.value

    const p1 = createPlayer('player', '玩家', playerCards, actualCfg)
    const p2Cards = aiCards && aiCards.length ? aiCards : playerCards
    const p2 = createPlayer('ai', '电脑 AI', p2Cards, actualCfg)

    state.players = [p1, p2]
    state.currentPlayerIndex = 0
    state.currentPhase = 'draw'
    state.turn = 1
    state.status = 'playing'
    state.winner = null
    state.winReason = ''
    state.logs = []
    state.selectedHandIndex = null
    state.selectedFieldInstanceId = null
    state.pendingAttackInstanceId = null
    state.aiOpponent = true

    startTurnDraw(p1, actualCfg)

    addLogFor(p1.name, '游戏开始！先手玩家回合。', 'info')
    addLogFor(p2.name, '电脑 AI 准备就绪。', 'info')

    checkWin()
  }

  function selectHandCard(index: number) {
    if (!state.players || state.status !== 'playing') return
    state.selectedHandIndex = index
    state.selectedFieldInstanceId = null
    state.pendingAttackInstanceId = null
  }

  function selectFieldCard(instanceId: string) {
    if (!state.players || state.status !== 'playing') return
    state.selectedFieldInstanceId = instanceId
    state.pendingAttackInstanceId = null
    state.selectedHandIndex = null
  }

  function confirmAttack(targetInstanceId: string | null) {
    if (!state.players || !state.pendingAttackInstanceId || state.status !== 'playing') return

    const p = state.players[state.currentPlayerIndex]
    const opp = state.players[1 - state.currentPlayerIndex as 0 | 1]

    const attacker = p.field.find(c => c?.instanceId === state.pendingAttackInstanceId) || null
    if (!attacker || !canAttackWith(attacker)) {
      state.pendingAttackInstanceId = null
      return
    }

    let target: BattleCard | null = null
    if (targetInstanceId) {
      target = opp.field.find(c => c?.instanceId === targetInstanceId) || null
    }

    const validTargets = getValidAttackTargets(attacker, opp)
    const isValid = validTargets.some(t =>
      target ? t?.instanceId === target.instanceId : t === null,
    )
    if (!isValid) {
      state.pendingAttackInstanceId = null
      return
    }

    if (hasTaunt(opp) && !target) {
      const tauntTargets = getTauntTargets(opp)
      if (tauntTargets.length > 0) {
        state.pendingAttackInstanceId = null
        return
      }
    }

    const result = performAttack(attacker, target, opp, p)

    if (target) {
      addLog(`${attacker.name} 攻击 ${target.name}，造成 ${result.damageToTarget} 点伤害`, 'attack')
      if (result.damageToAttacker > 0) {
        addLog(`${target.name} 反击 ${attacker.name}，造成 ${result.damageToAttacker} 点伤害`, 'damage')
      }
    } else {
      addLog(`${attacker.name} 直接攻击 ${opp.name}，造成 ${result.damageToTarget} 点伤害！`, 'attack')
    }

    if (result.targetDied && target) {
      addLog(`${target.name} 阵亡！`, 'death')
    }
    if (result.attackerDied) {
      addLog(`${attacker.name} 阵亡！`, 'death')
    }

    checkFieldDeaths(p)
    checkFieldDeaths(opp)

    state.pendingAttackInstanceId = null

    checkWin()
  }

  function startAttackSelection(instanceId: string) {
    if (!state.players || state.status !== 'playing') return
    const p = state.players[state.currentPlayerIndex]
    const card = p.field.find(c => c?.instanceId === instanceId) || null
    if (!card || !canAttackWith(card)) return
    state.pendingAttackInstanceId = instanceId
    state.selectedHandIndex = null
    state.selectedFieldInstanceId = null
  }

  function playSelectedCard(slotIndex: number | null) {
    if (!state.players || state.status !== 'playing' || state.selectedHandIndex === null) return

    const p = state.players[state.currentPlayerIndex]
    const card = p.hand[state.selectedHandIndex]
    if (!card) return

    if (!canPlayCard(p, card)) {
      if (p.mana < card.cost) {
        addLog(`法力不足，无法打出 ${card.name}（需要 ${card.cost} 点法力）`, 'info')
      } else if (card.type === '单位' && !p.field.some(s => s === null)) {
        addLog(`场上已满，无法打出 ${card.name}`, 'info')
      }
      state.selectedHandIndex = null
      return
    }

    const result = playCard(p, state.selectedHandIndex, slotIndex, config.value)
    if (!result) {
      state.selectedHandIndex = null
      return
    }

    if (card.type === '单位') {
      addLog(`打出 ${card.name}（${card.cost} 法力），部署到第 ${result.fieldIndex + 1} 号位`, 'play')
    } else {
      addLog(`打出 ${card.name}（${card.cost} 法力）`, 'play')
      if (card.type === '法术' && card.currentDamage > 0) {
        const opp = state.players[1 - state.currentPlayerIndex as 0 | 1]
        const targets = opp.field.filter(c => c && c.currentHp > 0) as BattleCard[]
        if (targets.length > 0) {
          const target = targets[Math.floor(Math.random() * targets.length)]
          target.currentHp -= card.currentDamage
          addLog(`${card.name} 对 ${target.name} 造成 ${card.currentDamage} 点伤害！`, 'damage')
          if (target.currentHp <= 0) {
            addLog(`${target.name} 阵亡！`, 'death')
          }
          checkFieldDeaths(opp)
        } else {
          opp.hp -= card.currentDamage
          addLog(`${card.name} 直接对 ${opp.name} 造成 ${card.currentDamage} 点伤害！`, 'damage')
        }
      }
    }

    state.selectedHandIndex = null

    checkWin()
  }

  function goToPhase(phase: GamePhase) {
    if (!state.players || state.status !== 'playing') return
    state.currentPhase = phase
  }

  function endCurrentTurn() {
    if (!state.players || state.status !== 'playing') return

    const p = state.players[state.currentPlayerIndex]
    const opp = state.players[1 - state.currentPlayerIndex as 0 | 1]

    addLog(`${p.name} 结束回合`, 'turn')

    endTurn(p, opp, config.value)

    state.currentPlayerIndex = (1 - state.currentPlayerIndex) as 0 | 1
    state.currentPhase = 'draw'

    if (state.currentPlayerIndex === 0) {
      state.turn += 1
    }

    const nextP = state.players[state.currentPlayerIndex]
    const drawn = startTurnDraw(nextP, config.value)

    if (drawn.length > 0) {
      addLogFor(nextP.name, `抽了 ${drawn.length} 张牌`, 'draw')
    } else if (nextP.fatigue > 0 && nextP.deck.length === 0) {
      addLogFor(nextP.name, `牌库已空，受到 ${nextP.fatigue} 点疲劳伤害`, 'damage')
    }

    checkWin()

    if (state.aiOpponent && state.currentPlayerIndex === 1 && state.status === 'playing') {
      setTimeout(() => aiTakeTurn(), 600)
    }
  }

  function aiTakeTurn() {
    if (!state.players || state.status !== 'playing') return

    const ai = state.players[1]
    const human = state.players[0]

    let safety = 20
    while (safety-- > 0) {
      const playable = ai.hand
        .map((c, i) => ({ c, i }))
        .filter(({ c }) => canPlayCard(ai, c))
        .sort((a, b) => b.c.cost - a.c.cost)

      if (playable.length === 0) break

      const { c: card, i: idx } = playable[0]
      const slotIdx = ai.field.findIndex(s => s === null)

      const actualIdx = ai.hand.findIndex(h => h.instanceId === card.instanceId)
      if (actualIdx === -1) break

      playCard(ai, actualIdx, slotIdx !== -1 ? slotIdx : null, config.value)

      addLogFor(ai.name, `打出 ${card.name}（${card.cost} 法力）`, 'play')

      if (card.type === '法术' && card.currentDamage > 0) {
        const targets = human.field.filter(c => c && c.currentHp > 0) as BattleCard[]
        if (targets.length > 0) {
          const target = targets[Math.floor(Math.random() * targets.length)]
          target.currentHp -= card.currentDamage
          addLogFor(ai.name, `${card.name} 对 ${target.name} 造成 ${card.currentDamage} 点伤害！`, 'damage')
          if (target.currentHp <= 0) {
            addLogFor(ai.name, `${target.name} 阵亡！`, 'death')
          }
          checkFieldDeaths(human)
        } else {
          human.hp -= card.currentDamage
          addLogFor(ai.name, `${card.name} 直接对 ${human.name} 造成 ${card.currentDamage} 点伤害！`, 'damage')
        }
      }

      checkWin()
      if (state.status === 'ended') return
    }

    safety = 10
    while (safety-- > 0) {
      const attackers = ai.field.filter(c => c && canAttackWith(c)) as BattleCard[]
      if (attackers.length === 0) break

      const attacker = attackers[0]

      const tauntTargets = getTauntTargets(human)
      let target: BattleCard | null = null

      if (tauntTargets.length > 0) {
        target = tauntTargets[0]
      } else {
        const enemyUnits = human.field.filter(c => c && c.currentHp > 0 && c.currentDamage <= attacker.currentDamage) as BattleCard[]
        if (enemyUnits.length > 0) {
          target = enemyUnits[0]
        } else {
          target = null
        }
      }

      const validTargets = getValidAttackTargets(attacker, human)
      if (!validTargets.some(t => target ? t?.instanceId === target.instanceId : t === null)) {
        const validList = validTargets.filter(t => t !== null) as BattleCard[]
        if (validList.length > 0) {
          target = validList[0]
        } else {
          target = null
        }
      }

      const result = performAttack(attacker, target, human, ai)

      if (target) {
        addLogFor(ai.name, `${attacker.name} 攻击 ${target.name}，造成 ${result.damageToTarget} 点伤害`, 'attack')
      } else {
        addLogFor(ai.name, `${attacker.name} 直接攻击 ${human.name}，造成 ${result.damageToTarget} 点伤害！`, 'attack')
      }

      if (result.targetDied && target) {
        addLogFor(ai.name, `${target.name} 阵亡！`, 'death')
      }
      if (result.attackerDied) {
        addLogFor(ai.name, `${attacker.name} 阵亡！`, 'death')
      }

      checkFieldDeaths(ai)
      checkFieldDeaths(human)

      checkWin()
      if (state.status === 'ended') return
    }

    if (state.status === 'playing') {
      setTimeout(() => {
        if (state.status === 'playing' && state.currentPlayerIndex === 1) {
          endCurrentTurn()
        }
      }, 500)
    }
  }

  function checkWin() {
    if (!state.players) return
    const result = checkWinCondition(state.players[0], state.players[1])
    if (result.winner !== null || result.reason.includes('平局')) {
      state.status = 'ended'
      state.winner = result.winner
      state.winReason = result.reason
      addLog(result.reason, 'win')
    }
  }

  function resetGame() {
    state.players = null
    state.currentPlayerIndex = 0
    state.currentPhase = 'draw'
    state.turn = 0
    state.status = 'idle'
    state.winner = null
    state.winReason = ''
    state.logs = []
    state.selectedHandIndex = null
    state.selectedFieldInstanceId = null
    state.pendingAttackInstanceId = null
  }

  function cancelSelection() {
    state.selectedHandIndex = null
    state.selectedFieldInstanceId = null
    state.pendingAttackInstanceId = null
  }

  return {
    state,
    config,
    currentPlayer,
    opponent,
    initGame,
    selectHandCard,
    selectFieldCard,
    confirmAttack,
    startAttackSelection,
    playSelectedCard,
    goToPhase,
    endCurrentTurn,
    checkWin,
    resetGame,
    cancelSelection,
    PHASE_LABEL,
  }
}