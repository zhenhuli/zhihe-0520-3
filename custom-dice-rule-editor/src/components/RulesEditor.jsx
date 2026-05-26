import React from 'react'
import styled from 'styled-components'
import { TURN_EFFECTS, SPECIAL_EFFECTS, getEffectIcon } from '../utils/diceUtils'

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
  color: #34d399;
  display: flex;
  align-items: center;
  gap: 8px;
`

const RulesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
`

const RuleCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }
`

const FaceHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`

const FaceNumber = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.15);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`

const InputRow = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
`

const InputGroup = styled.div`
  flex: 1;
`

const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-size: 0.85rem;
  color: #9ca3af;
`

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.2);
  color: #fff;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: #34d399;
  }
`

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.2);
  color: #fff;
  font-size: 0.9rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #34d399;
  }

  option {
    background: #1a1a2e;
    color: #fff;
  }
`

const RewardInput = styled(Input)`
  border-color: rgba(34, 197, 94, 0.3);
  color: #4ade80;
`

const PenaltyInput = styled(Input)`
  border-color: rgba(239, 68, 68, 0.3);
  color: #f87171;
`

const EffectBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  background: ${props => props.$active ? 'rgba(167, 139, 250, 0.2)' : 'rgba(255,255,255,0.05)'};
  color: ${props => props.$active ? '#a78bfa' : '#6b7280'};
`

const RulesEditor = ({ faces, rules, onChange }) => {
  const handleRuleChange = (face, field, value) => {
    const newRules = { ...rules }
    newRules[face] = {
      ...newRules[face],
      [field]: field === 'reward' || field === 'penalty' || field === 'effectDuration'
        ? parseInt(value) || 0
        : value
    }
    onChange(newRules)
  }

  return (
    <Container>
      <Title>⚖️ 奖惩规则配置</Title>

      <RulesGrid>
        {Array.from({ length: faces }, (_, i) => i + 1).map((face) => (
          <RuleCard key={face}>
            <FaceHeader>
              <FaceNumber>{face}</FaceNumber>
              <div style={{ display: 'flex', gap: '6px' }}>
                <EffectBadge $active={rules[face]?.turnEffect !== 'none'}>
                  {getEffectIcon(rules[face]?.turnEffect)}
                </EffectBadge>
                <EffectBadge $active={rules[face]?.specialEffect}>
                  {getEffectIcon(rules[face]?.specialEffect)}
                </EffectBadge>
              </div>
            </FaceHeader>

            <InputRow>
              <InputGroup>
                <Label>💰 奖励分数</Label>
                <RewardInput
                  type="number"
                  value={rules[face]?.reward || 0}
                  onChange={(e) => handleRuleChange(face, 'reward', e.target.value)}
                />
              </InputGroup>
              <InputGroup>
                <Label>💀 惩罚分数</Label>
                <PenaltyInput
                  type="number"
                  value={rules[face]?.penalty || 0}
                  onChange={(e) => handleRuleChange(face, 'penalty', e.target.value)}
                />
              </InputGroup>
            </InputRow>

            <InputGroup style={{ marginBottom: '12px' }}>
              <Label>⏱️ 回合效果</Label>
              <Select
                value={rules[face]?.turnEffect || 'none'}
                onChange={(e) => handleRuleChange(face, 'turnEffect', e.target.value)}
              >
                {TURN_EFFECTS.map(effect => (
                  <option key={effect.value} value={effect.value}>
                    {getEffectIcon(effect.value)} {effect.label}
                  </option>
                ))}
              </Select>
            </InputGroup>

            <InputGroup style={{ marginBottom: '12px' }}>
              <Label>✨ 触发特效</Label>
              <Select
                value={rules[face]?.specialEffect || ''}
                onChange={(e) => handleRuleChange(face, 'specialEffect', e.target.value)}
              >
                {SPECIAL_EFFECTS.map(effect => (
                  <option key={effect.value} value={effect.value}>
                    {getEffectIcon(effect.value)} {effect.label}
                  </option>
                ))}
              </Select>
            </InputGroup>

            {(rules[face]?.turnEffect !== 'none' || rules[face]?.specialEffect) && (
              <InputGroup>
                <Label>⏳ 效果持续回合</Label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  value={rules[face]?.effectDuration || 0}
                  onChange={(e) => handleRuleChange(face, 'effectDuration', e.target.value)}
                />
              </InputGroup>
            )}
          </RuleCard>
        ))}
      </RulesGrid>
    </Container>
  )
}

export default RulesEditor
