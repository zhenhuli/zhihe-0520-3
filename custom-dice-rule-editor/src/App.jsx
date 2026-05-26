import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import DiceConfigEditor from './components/DiceConfigEditor'
import RulesEditor from './components/RulesEditor'
import GameSimulator from './components/GameSimulator'
import PresetManager from './components/PresetManager'
import { generateDefaultWeights, generateDefaultRules } from './utils/diceUtils'

const AppContainer = styled.div`
  min-height: 100vh;
  padding: 20px;
`

const Header = styled.header`
  text-align: center;
  margin-bottom: 30px;
`

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #a78bfa 0%, #f472b6 50%, #fbbf24 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
`

const Subtitle = styled.p`
  color: #9ca3af;
  font-size: 1rem;
`

const TabContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`

const TabButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  justify-content: center;
  flex-wrap: wrap;
`

const TabButton = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  background: ${props => props.$active 
    ? 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)' 
    : 'rgba(255, 255, 255, 0.05)'
  };
  color: ${props => props.$active ? '#fff' : '#9ca3af'};
  border: 1px solid ${props => props.$active ? 'transparent' : 'rgba(255, 255, 255, 0.1)'};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: ${props => props.$active 
      ? 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)' 
      : 'rgba(255, 255, 255, 0.1)'
    };
    transform: translateY(-2px);
  }
`

const TabContent = styled.div`
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`

const App = () => {
  const [activeTab, setActiveTab] = useState('config')
  
  const [diceConfig, setDiceConfig] = useState({
    name: '自定义骰子',
    faces: 6,
    weights: generateDefaultWeights(6)
  })
  
  const [rules, setRules] = useState(generateDefaultRules(6))

  useEffect(() => {
    if (diceConfig.weights.length !== diceConfig.faces) {
      const newWeights = generateDefaultWeights(diceConfig.faces)
      setDiceConfig(prev => ({ ...prev, weights: newWeights }))
      setRules(generateDefaultRules(diceConfig.faces))
    }
  }, [diceConfig.faces])

  const handleLoadPreset = (config, presetRules) => {
    setDiceConfig(config)
    setRules(presetRules)
  }

  const tabs = [
    { id: 'config', label: '🎲 骰子配置', icon: '⚙️' },
    { id: 'rules', label: '⚖️ 奖惩规则', icon: '📜' },
    { id: 'simulator', label: '🎮 对局模拟', icon: '🎯' },
    { id: 'presets', label: '💾 方案管理', icon: '📦' }
  ]

  return (
    <AppContainer>
      <Header>
        <Title>🎲 桌游自定义骰子规则编辑器</Title>
        <Subtitle>
          创建独特的骰子规则，自定义点数权重、奖惩规则和特效，模拟真实对局体验
        </Subtitle>
      </Header>

      <TabContainer>
        <TabButtons>
          {tabs.map(tab => (
            <TabButton
              key={tab.id}
              $active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </TabButton>
          ))}
        </TabButtons>

        <TabContent>
          {activeTab === 'config' && (
            <Grid>
              <DiceConfigEditor 
                config={diceConfig} 
                onChange={setDiceConfig} 
              />
              <PresetManager
                currentConfig={diceConfig}
                currentRules={rules}
                onLoadPreset={handleLoadPreset}
              />
            </Grid>
          )}

          {activeTab === 'rules' && (
            <RulesEditor
              faces={diceConfig.faces}
              rules={rules}
              onChange={setRules}
            />
          )}

          {activeTab === 'simulator' && (
            <GameSimulator
              diceConfig={diceConfig}
              rules={rules}
            />
          )}

          {activeTab === 'presets' && (
            <PresetManager
              currentConfig={diceConfig}
              currentRules={rules}
              onLoadPreset={handleLoadPreset}
            />
          )}
        </TabContent>
      </TabContainer>
    </AppContainer>
  )
}

export default App
