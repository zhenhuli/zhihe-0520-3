import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { generateId } from '../utils/diceUtils'

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
  color: #60a5fa;
  display: flex;
  align-items: center;
  gap: 8px;
`

const Button = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  ${props => props.$primary && `
    background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
    color: white;
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(96, 165, 250, 0.4);
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
    &:hover {
      background: rgba(239, 68, 68, 0.3);
    }
  `}
`

const PresetsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
`

const PresetCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateX(4px);
  }
`

const PresetInfo = styled.div`
  flex: 1;
`

const PresetName = styled.div`
  font-weight: 600;
  color: #e4e4e7;
  margin-bottom: 4px;
`

const PresetMeta = styled.div`
  font-size: 0.8rem;
  color: #9ca3af;
  display: flex;
  gap: 12px;
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`

const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 0.9rem;
  width: 200px;

  &:focus {
    outline: none;
    border-color: #60a5fa;
  }
`

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #6b7280;
  font-size: 0.95rem;
`

const PresetManager = ({ currentConfig, currentRules, onLoadPreset }) => {
  const [presets, setPresets] = useState([])
  const [newPresetName, setNewPresetName] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('dice-presets')
    if (saved) {
      setPresets(JSON.parse(saved))
    } else {
      const defaultPresets = [
        {
          id: generateId(),
          name: '经典桌游骰子',
          config: { name: '经典桌游骰子', faces: 6, weights: [1, 1, 1, 1, 1, 1] },
          rules: {
            1: { reward: 0, penalty: 5, turnEffect: 'none', effectDuration: 0, specialEffect: '' },
            2: { reward: 5, penalty: 0, turnEffect: 'none', effectDuration: 0, specialEffect: '' },
            3: { reward: 10, penalty: 0, turnEffect: 'none', effectDuration: 0, specialEffect: '' },
            4: { reward: 15, penalty: 0, turnEffect: 'none', effectDuration: 0, specialEffect: '' },
            5: { reward: 20, penalty: 0, turnEffect: 'extra', effectDuration: 1, specialEffect: '' },
            6: { reward: 30, penalty: 0, turnEffect: 'none', effectDuration: 0, specialEffect: 'critical' }
          },
          createdAt: Date.now()
        },
        {
          id: generateId(),
          name: '冒险命运骰子',
          config: { name: '冒险命运骰子', faces: 8, weights: [1, 1, 1, 1, 1, 1, 1, 1] },
          rules: {
            1: { reward: 0, penalty: 10, turnEffect: 'skip', effectDuration: 1, specialEffect: '' },
            2: { reward: 0, penalty: 5, turnEffect: 'none', effectDuration: 0, specialEffect: '' },
            3: { reward: 5, penalty: 0, turnEffect: 'none', effectDuration: 0, specialEffect: '' },
            4: { reward: 10, penalty: 0, turnEffect: 'none', effectDuration: 0, specialEffect: 'shield' },
            5: { reward: 15, penalty: 0, turnEffect: 'none', effectDuration: 0, specialEffect: '' },
            6: { reward: 20, penalty: 0, turnEffect: 'extra', effectDuration: 1, specialEffect: '' },
            7: { reward: 25, penalty: 0, turnEffect: 'none', effectDuration: 0, specialEffect: 'steal' },
            8: { reward: 50, penalty: 0, turnEffect: 'double', effectDuration: 2, specialEffect: 'critical' }
          },
          createdAt: Date.now()
        }
      ]
      setPresets(defaultPresets)
      localStorage.setItem('dice-presets', JSON.stringify(defaultPresets))
    }
  }, [])

  const savePresets = (newPresets) => {
    setPresets(newPresets)
    localStorage.setItem('dice-presets', JSON.stringify(newPresets))
  }

  const handleSavePreset = () => {
    const name = newPresetName.trim() || currentConfig.name || '未命名方案'
    const newPreset = {
      id: generateId(),
      name,
      config: { ...currentConfig },
      rules: { ...currentRules },
      createdAt: Date.now()
    }
    savePresets([newPreset, ...presets])
    setNewPresetName('')
  }

  const handleLoadPreset = (preset) => {
    onLoadPreset(preset.config, preset.rules)
  }

  const handleDeletePreset = (id) => {
    savePresets(presets.filter(p => p.id !== id))
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('zh-CN')
  }

  return (
    <Container>
      <Title>💾 规则方案管理</Title>

      <HeaderRow>
        <Input
          type="text"
          placeholder="方案名称..."
          value={newPresetName}
          onChange={(e) => setNewPresetName(e.target.value)}
        />
        <Button $primary onClick={handleSavePreset}>
          ➕ 保存当前方案
        </Button>
      </HeaderRow>

      {presets.length === 0 ? (
        <EmptyState>
          暂无保存的方案，配置骰子后点击「保存当前方案」
        </EmptyState>
      ) : (
        <PresetsList>
          {presets.map((preset) => (
            <PresetCard key={preset.id}>
              <PresetInfo>
                <PresetName>{preset.name}</PresetName>
                <PresetMeta>
                  <span>🎲 {preset.config.faces}面骰子</span>
                  <span>📅 {formatDate(preset.createdAt)}</span>
                </PresetMeta>
              </PresetInfo>
              <ButtonGroup>
                <Button $secondary onClick={() => handleLoadPreset(preset)}>
                  📂 加载
                </Button>
                <Button $danger onClick={() => handleDeletePreset(preset.id)}>
                  🗑️ 删除
                </Button>
              </ButtonGroup>
            </PresetCard>
          ))}
        </PresetsList>
      )}
    </Container>
  )
}

export default PresetManager
