import React, { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import { rollWeightedDice, getEffectIcon } from '../utils/diceUtils'

const Container = styled.div`
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`

const Title = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 20px;
  color: #f472b6;
  display: flex;
  align-items: center;
  gap: 8px;
`

const ControlPanel = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
  align-items: center;
`

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  ${props => props.$primary && `
    background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
    color: white;
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(167, 139, 250, 0.4);
    }
  `}

  ${props => props.$secondary && `
    background: rgba(255, 255, 255, 0.1);
    color: #e4e4e7;
    border: 1px solid rgba(255, 255, 255, 0.2);
    &:hover {
      background: rgba(255, 255, 255, 0.15);
    }
  `}

  ${props => props.$danger && `
    background: rgba(239, 68, 68, 0.2);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.3);
    &:hover {
      background: rgba(239, 68, 68, 0.3);
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
`

const Input = styled.input`
  padding: 10px 14px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 0.95rem;
  width: 80px;

  &:focus {
    outline: none;
    border-color: #f472b6;
  }
`

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #9ca3af;
  font-size: 0.9rem;
`

const DiceDisplay = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 30px 0;
`

const Dice = styled.div`
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.5rem;
  font-weight: bold;
  color: #1a1a2e;
  box-shadow: 0 10px 30px rgba(251, 191, 36, 0.3);
  transition: transform 0.1s ease;
  
  ${props => props.$rolling && `
    animation: diceRoll 0.5s ease-in-out infinite;
  `}

  @keyframes diceRoll {
    0%, 100% { transform: rotate(0deg) scale(1); }
    25% { transform: rotate(15deg) scale(1.1); }
    50% { transform: rotate(-10deg) scale(1.05); }
    75% { transform: rotate(5deg) scale(1.1); }
  }
`

const PlayersPanel = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`

const PlayerCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid ${props => props.$active ? '#f472b6' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  transition: all 0.3s ease;
  
  ${props => props.$active && `
    box-shadow: 0 0 20px rgba(244, 114, 182, 0.3);
  `}
`

const PlayerName = styled.div`
  font-weight: 600;
  margin-bottom: 8px;
  color: #e4e4e7;
`

const PlayerScore = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #fbbf24;
`

const PlayerEffects = styled.div`
  display: flex;
  gap: 4px;
  justify-content: center;
  margin-top: 8px;
  flex-wrap: wrap;
`

const EffectTag = styled.span`
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 10px;
  background: rgba(167, 139, 250, 0.2);
  color: #a78bfa;
`

const GameLog = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 16px;
  max-height: 300px;
  overflow-y: auto;
  font-size: 0.9rem;
`

const LogEntry = styled.div`
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 6px;
  background: rgba(255, 255, 255, 0.05);
  
  ${props => props.$type === 'reward' && `
    background: rgba(34, 197, 94, 0.15);
    border-left: 3px solid #22c55e;
  `}
  
  ${props => props.$type === 'penalty' && `
    background: rgba(239, 68, 68, 0.15);
    border-left: 3px solid #ef4444;
  `}
  
  ${props => props.$type === 'effect' && `
    background: rgba(167, 139, 250, 0.15);
    border-left: 3px solid #a78bfa;
  `}
`

const RoundInfo = styled.div`
  text-align: center;
  font-size: 1.1rem;
  margin-bottom: 16px;
  color: #9ca3af;
`

const GameSimulator = ({ diceConfig, rules }) => {
  const [players, setPlayers] = useState([
    { id: 1, name: '玩家1', score: 0, effects: [] },
    { id: 2, name: '玩家2', score: 0, effects: [] },
  ])
  const [currentPlayer, setCurrentPlayer] = useState(0)
  const [round, setRound] = useState(1)
  const [maxRounds, setMaxRounds] = useState(10)
  const [diceValue, setDiceValue] = useState(null)
  const [isRolling, setIsRolling] = useState(false)
  const [gameLog, setGameLog] = useState([])
  const [gameOver, setGameOver] = useState(false)
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)

  const addLog = useCallback((message, type = 'normal') => {
    setGameLog(prev => [{ message, type, timestamp: Date.now() }, ...prev].slice(0, 50))
  }, [])

  const processTurnEffects = useCallback((playerIndex, currentPlayers) => {
    const player = currentPlayers[playerIndex]
    let skipTurn = false
    let extraTurn = false

    const activeEffects = player.effects.filter(e => e.duration > 0)
    activeEffects.forEach(effect => {
      if (effect.type === 'skip' || effect.type === 'freeze') {
        skipTurn = true
        addLog(`${player.name} 因 ${getEffectIcon(effect.type)} 效果跳过本回合`, 'effect')
      }
      if (effect.type === 'extra') {
        extraTurn = true
      }
    })

    const updatedEffects = activeEffects
      .map(e => ({ ...e, duration: e.duration - 1 }))
      .filter(e => e.duration > 0)

    return { skipTurn, extraTurn, updatedEffects }
  }, [addLog])

  const applyRule = useCallback((playerIndex, rolledValue, currentPlayers) => {
    const rule = rules[rolledValue] || { reward: 0, penalty: 0, turnEffect: 'none', effectDuration: 0, specialEffect: '' }
    const player = currentPlayers[playerIndex]
    const newPlayers = currentPlayers.map(p => ({ ...p, effects: [...p.effects] }))
    
    let hasShield = newPlayers[playerIndex].effects.some(e => e.type === 'shield')
    let isCritical = newPlayers[playerIndex].effects.some(e => e.type === 'critical')
    let isLucky = newPlayers[playerIndex].effects.some(e => e.type === 'lucky')

    let reward = rule.reward || 0
    let penalty = rule.penalty || 0

    if (isCritical && reward > 0) {
      reward *= 2
      addLog('💥 暴击效果触发！奖励翻倍！', 'effect')
    }

    if (isLucky && reward === 0) {
      reward = 10
      addLog('🍀 幸运效果触发！获得保底奖励！', 'effect')
    }

    if (hasShield && penalty > 0) {
      penalty = 0
      addLog('🛡️ 护盾效果触发！免疫惩罚！', 'effect')
      newPlayers[playerIndex].effects = newPlayers[playerIndex].effects.filter(e => e.type !== 'shield')
    }

    if (rule.specialEffect === 'steal' && currentPlayers.length > 1) {
      const otherPlayers = currentPlayers.filter((_, i) => i !== playerIndex)
      const targetIndex = Math.floor(Math.random() * otherPlayers.length)
      const stealAmount = Math.min(20, otherPlayers[targetIndex].score)
      if (stealAmount > 0) {
        reward += stealAmount
        const realTargetIndex = currentPlayers.findIndex(p => p.id === otherPlayers[targetIndex].id)
        newPlayers[realTargetIndex] = {
          ...newPlayers[realTargetIndex],
          score: newPlayers[realTargetIndex].score - stealAmount
        }
        addLog(`🎭 偷窃成功！从 ${otherPlayers[targetIndex].name} 处偷取 ${stealAmount} 分！`, 'effect')
      }
    }

    if (rule.specialEffect === 'exchange' && currentPlayers.length > 1) {
      const otherPlayers = currentPlayers.filter((_, i) => i !== playerIndex)
      const targetIndex = Math.floor(Math.random() * otherPlayers.length)
      const realTargetIndex = currentPlayers.findIndex(p => p.id === otherPlayers[targetIndex].id)
      const tempScore = newPlayers[playerIndex].score
      newPlayers[playerIndex] = {
        ...newPlayers[playerIndex],
        score: newPlayers[realTargetIndex].score
      }
      newPlayers[realTargetIndex] = {
        ...newPlayers[realTargetIndex],
        score: tempScore
      }
      addLog(`🔀 交换效果！与 ${otherPlayers[targetIndex].name} 交换分数！`, 'effect')
    }

    newPlayers[playerIndex] = {
      ...newPlayers[playerIndex],
      score: newPlayers[playerIndex].score + reward - penalty
    }

    if (reward > 0) {
      addLog(`${player.name} 获得 ${reward} 分奖励！`, 'reward')
    }
    if (penalty > 0) {
      addLog(`${player.name} 受到 ${penalty} 分惩罚！`, 'penalty')
    }

    if (rule.turnEffect && rule.turnEffect !== 'none') {
      const newEffect = {
        type: rule.turnEffect,
        duration: rule.effectDuration || 1
      }
      newPlayers[playerIndex] = {
        ...newPlayers[playerIndex],
        effects: [...newPlayers[playerIndex].effects, newEffect]
      }
      addLog(`${player.name} 获得效果: ${getEffectIcon(rule.turnEffect)} 持续 ${rule.effectDuration || 1} 回合`, 'effect')
    }

    if (rule.specialEffect === 'shield') {
      newPlayers[playerIndex] = {
        ...newPlayers[playerIndex],
        effects: [...newPlayers[playerIndex].effects, { type: 'shield', duration: 999 }]
      }
    }
    if (rule.specialEffect === 'critical') {
      newPlayers[playerIndex] = {
        ...newPlayers[playerIndex],
        effects: [...newPlayers[playerIndex].effects, { type: 'critical', duration: 1 }]
      }
    }
    if (rule.specialEffect === 'lucky') {
      newPlayers[playerIndex] = {
        ...newPlayers[playerIndex],
        effects: [...newPlayers[playerIndex].effects, { type: 'lucky', duration: 1 }]
      }
    }

    return newPlayers
  }, [rules, addLog])

  const rollDice = useCallback(() => {
    if (isRolling || gameOver) return

    setIsRolling(true)
    setDiceValue(null)

    setTimeout(() => {
      const rolled = rollWeightedDice(diceConfig.weights)
      setDiceValue(rolled)
      setIsRolling(false)

      const { skipTurn, extraTurn, updatedEffects } = processTurnEffects(currentPlayer, players)
      
      let newPlayers = players.map(p => ({ ...p, effects: [...p.effects] }))
      newPlayers[currentPlayer] = {
        ...newPlayers[currentPlayer],
        effects: updatedEffects
      }

      if (!skipTurn) {
        addLog(`🎲 ${players[currentPlayer].name} 掷出了 ${rolled} 点！`)
        newPlayers = applyRule(currentPlayer, rolled, newPlayers)
      }

      setPlayers([...newPlayers])

      let nextPlayer = currentPlayer + 1
      if (nextPlayer >= players.length) {
        nextPlayer = 0
        if (round >= maxRounds) {
          setGameOver(true)
          addLog('🏆 游戏结束！', 'effect')
          return
        }
        setRound(prev => prev + 1)
      }

      if (extraTurn) {
        addLog(`${players[currentPlayer].name} 获得额外回合！`, 'effect')
        setCurrentPlayer(currentPlayer)
      } else {
        setCurrentPlayer(nextPlayer)
      }
    }, 800)
  }, [isRolling, gameOver, diceConfig.weights, currentPlayer, players, round, maxRounds, processTurnEffects, applyRule, addLog])

  const resetGame = () => {
    setPlayers([
      { id: 1, name: '玩家1', score: 0, effects: [] },
      { id: 2, name: '玩家2', score: 0, effects: [] },
    ])
    setCurrentPlayer(0)
    setRound(1)
    setDiceValue(null)
    setGameLog([])
    setGameOver(false)
    setIsAutoPlaying(false)
  }

  useEffect(() => {
    let timer
    if (isAutoPlaying && !gameOver && !isRolling) {
      timer = setTimeout(rollDice, 1000)
    }
    return () => clearTimeout(timer)
  }, [isAutoPlaying, gameOver, isRolling, rollDice])

  return (
    <Container>
      <Title>🎮 对局模拟器</Title>

      <RoundInfo>
        📅 第 <strong style={{ color: '#fbbf24' }}>{round}</strong> / {maxRounds} 回合
        {gameOver && ' - 游戏结束！'}
      </RoundInfo>

      <ControlPanel>
        <Label>
          玩家数:
          <Input
            type="number"
            min="2"
            max="6"
            value={players.length}
            onChange={(e) => {
              const count = Math.max(2, Math.min(6, parseInt(e.target.value) || 2))
              const newPlayers = Array.from({ length: count }, (_, i) => ({
                id: i + 1,
                name: `玩家${i + 1}`,
                score: 0,
                effects: []
              }))
              setPlayers(newPlayers)
              resetGame()
            }}
            disabled={round > 1}
          />
        </Label>
        <Label>
          总回合:
          <Input
            type="number"
            min="1"
            max="100"
            value={maxRounds}
            onChange={(e) => setMaxRounds(Math.max(1, parseInt(e.target.value) || 10))}
          />
        </Label>
        <Button $primary onClick={rollDice} disabled={isRolling || gameOver}>
          🎲 掷骰子
        </Button>
        <Button 
          $secondary 
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          disabled={gameOver}
        >
          {isAutoPlaying ? '⏸️ 暂停' : '▶️ 自动'}
        </Button>
        <Button $danger onClick={resetGame}>
          🔄 重置
        </Button>
      </ControlPanel>

      <DiceDisplay>
        <Dice $rolling={isRolling}>
          {isRolling ? '?' : diceValue || '-'}
        </Dice>
      </DiceDisplay>

      <PlayersPanel>
        {players.map((player, index) => (
          <PlayerCard key={player.id} $active={index === currentPlayer && !gameOver}>
            <PlayerName>
              {index === currentPlayer && !gameOver && '👉 '}
              {player.name}
            </PlayerName>
            <PlayerScore>{player.score}</PlayerScore>
            <PlayerEffects>
              {player.effects.map((effect, i) => (
                <EffectTag key={i}>
                  {getEffectIcon(effect.type)} 
                  {effect.duration < 999 ? `×${effect.duration}` : ''}
                </EffectTag>
              ))}
            </PlayerEffects>
          </PlayerCard>
        ))}
      </PlayersPanel>

      <GameLog>
        {gameLog.map((log, index) => (
          <LogEntry key={log.timestamp + index} $type={log.type}>
            {log.message}
          </LogEntry>
        ))}
        {gameLog.length === 0 && (
          <div style={{ color: '#6b7280', textAlign: 'center' }}>
            点击「掷骰子」开始游戏
          </div>
        )}
      </GameLog>
    </Container>
  )
}

export default GameSimulator
