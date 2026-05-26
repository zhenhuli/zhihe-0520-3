import React from 'react'
import styled from 'styled-components'

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
  color: #a78bfa;
  display: flex;
  align-items: center;
  gap: 8px;
`

const FormGroup = styled.div`
  margin-bottom: 20px;
`

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #d1d5db;
`

const Input = styled.input`
  width: 100%;
  padding: 10px 14px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #a78bfa;
    box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.2);
  }

  &[type="number"] {
    width: 120px;
  }
`

const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
`

const Slider = styled.input`
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.1);
  outline: none;
  -webkit-appearance: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #a78bfa;
    cursor: pointer;
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.2);
    }
  }
`

const ValueDisplay = styled.span`
  min-width: 50px;
  text-align: center;
  font-weight: 600;
  color: #a78bfa;
  font-size: 1.1rem;
`

const FacesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
  margin-top: 16px;
`

const FaceCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }
`

const FaceNumber = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #fbbf24;
  margin-bottom: 8px;
`

const WeightInput = styled.input`
  width: 100%;
  padding: 6px 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.2);
  color: #fff;
  font-size: 0.9rem;
  text-align: center;

  &:focus {
    outline: none;
    border-color: #a78bfa;
  }
`

const WeightLabel = styled.div`
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 4px;
`

const DiceConfigEditor = ({ config, onChange }) => {
  const handleFacesChange = (e) => {
    const newFaces = Math.max(2, Math.min(20, parseInt(e.target.value) || 6))
    onChange({ ...config, faces: newFaces })
  }

  const handleWeightChange = (index, value) => {
    const newWeights = [...config.weights]
    newWeights[index] = Math.max(1, parseInt(value) || 1)
    onChange({ ...config, weights: newWeights })
  }

  const totalWeight = config.weights.reduce((sum, w) => sum + w, 0)

  return (
    <Container>
      <Title>🎲 骰子配置</Title>

      <FormGroup>
        <Label>骰子名称</Label>
        <Input
          type="text"
          value={config.name}
          onChange={(e) => onChange({ ...config, name: e.target.value })}
          placeholder="输入骰子规则名称"
        />
      </FormGroup>

      <FormGroup>
        <Label>骰子面数: {config.faces}</Label>
        <SliderContainer>
          <Slider
            type="range"
            min="2"
            max="20"
            value={config.faces}
            onChange={handleFacesChange}
          />
          <ValueDisplay>{config.faces}</ValueDisplay>
        </SliderContainer>
      </FormGroup>

      <FormGroup>
        <Label>点数权重设置 (总权重: {totalWeight})</Label>
        <FacesGrid>
          {config.weights.map((weight, index) => (
            <FaceCard key={index}>
              <FaceNumber>{index + 1}</FaceNumber>
              <WeightInput
                type="number"
                min="1"
                value={weight}
                onChange={(e) => handleWeightChange(index, e.target.value)}
              />
              <WeightLabel>
                {((weight / totalWeight) * 100).toFixed(1)}%
              </WeightLabel>
            </FaceCard>
          ))}
        </FacesGrid>
      </FormGroup>
    </Container>
  )
}

export default DiceConfigEditor
