import React from 'react';
import { Form, Button, Card, Header, Icon } from 'semantic-ui-react';

const SettingsPanel = ({ settings, onSettingsChange, onGenerate }) => {
  const handleChange = (field, value) => {
    onSettingsChange({ ...settings, [field]: value });
  };

  return (
    <Card fluid>
      <Card.Content>
        <Header as="h3">
          <Icon name="settings" />
          <Header.Content>行程参数设置</Header.Content>
        </Header>
        <Form>
          <Form.Group widths="equal">
            <Form.Input
              fluid
              label="出行天数"
              type="number"
              min="1"
              max="15"
              value={settings.days}
              onChange={(e) => handleChange('days', parseInt(e.target.value) || 1)}
              icon="calendar"
              iconPosition="left"
            />
            <Form.Input
              fluid
              label="景点数量"
              type="number"
              min="1"
              max="15"
              value={settings.spotCount}
              onChange={(e) => handleChange('spotCount', parseInt(e.target.value) || 1)}
              icon="map marker"
              iconPosition="left"
            />
            <Form.Input
              fluid
              label="游玩时长系数"
              type="number"
              min="0.5"
              max="2"
              step="0.1"
              value={settings.playDurationFactor}
              onChange={(e) => handleChange('playDurationFactor', parseFloat(e.target.value) || 1)}
              icon="clock"
              iconPosition="left"
            />
          </Form.Group>
          <Button
            primary
            fluid
            size="large"
            onClick={onGenerate}
            icon
            labelPosition="left"
          >
            <Icon name="magic" />
            生成行程计划
          </Button>
        </Form>
      </Card.Content>
    </Card>
  );
};

export default SettingsPanel;
