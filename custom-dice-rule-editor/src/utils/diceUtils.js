export const rollDice = (faces) => {
  return Math.floor(Math.random() * faces) + 1
}

export const rollWeightedDice = (weights) => {
  const totalWeight = weights.reduce((sum, w) => sum + w, 0)
  let random = Math.random() * totalWeight
  
  for (let i = 0; i < weights.length; i++) {
    random -= weights[i]
    if (random <= 0) {
      return i + 1
    }
  }
  
  return weights.length
}

export const generateDefaultWeights = (faces) => {
  return Array(faces).fill(1)
}

export const generateDefaultRules = (faces) => {
  const rules = {}
  for (let i = 1; i <= faces; i++) {
    rules[i] = {
      reward: 0,
      penalty: 0,
      turnEffect: 'none',
      effectDuration: 0,
      specialEffect: ''
    }
  }
  return rules
}

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export const TURN_EFFECTS = [
  { value: 'none', label: '无效果' },
  { value: 'skip', label: '跳过下回合' },
  { value: 'double', label: '双倍回合' },
  { value: 'extra', label: '额外回合' },
  { value: 'reverse', label: '反转顺序' },
  { value: 'freeze', label: '冻结一回合' }
]

export const SPECIAL_EFFECTS = [
  { value: '', label: '无特效' },
  { value: 'critical', label: '暴击 - 奖励翻倍' },
  { value: 'lucky', label: '幸运 - 下次必定中奖' },
  { value: 'shield', label: '护盾 - 免疫下次惩罚' },
  { value: 'steal', label: '偷窃 - 偷取其他玩家奖励' },
  { value: 'exchange', label: '交换 - 与随机玩家交换分数' },
  { value: 'teleport', label: '传送 - 跳到指定位置' }
]

export const getEffectIcon = (effect) => {
  const icons = {
    'none': '⚪',
    'skip': '⏭️',
    'double': '⏩',
    'extra': '➕',
    'reverse': '🔄',
    'freeze': '❄️',
    'critical': '💥',
    'lucky': '🍀',
    'shield': '🛡️',
    'steal': '🎭',
    'exchange': '🔀',
    'teleport': '🌀'
  }
  return icons[effect] || '✨'
}
