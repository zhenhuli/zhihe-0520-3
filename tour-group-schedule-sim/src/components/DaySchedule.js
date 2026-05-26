import React, { useState } from 'react';
import { Table, Label, Button, Icon, Modal, Form, Message, Rating } from 'semantic-ui-react';
import { adjustActivityTime, checkScheduleCongestion } from '../utils/scheduleGenerator';

const getActivityIcon = (type) => {
  switch (type) {
    case 'sightseeing': return 'camera';
    case 'transport': return 'bus';
    case 'rest': return 'coffee';
    case 'meal': return 'food';
    default: return 'circle';
  }
};

const getActivityColor = (type) => {
  switch (type) {
    case 'sightseeing': return 'blue';
    case 'transport': return 'grey';
    case 'rest': return 'green';
    case 'meal': return 'orange';
    default: return 'grey';
  }
};

const getActivityLabel = (type) => {
  switch (type) {
    case 'sightseeing': return '景点';
    case 'transport': return '交通';
    case 'rest': return '休息';
    case 'meal': return '用餐';
    default: return '其他';
  }
};

const DaySchedule = ({ daySchedule, onUpdate }) => {
  const [editModal, setEditModal] = useState(null);
  const [editStartTime, setEditStartTime] = useState('');
  const [editDuration, setEditDuration] = useState(60);

  const congestionIssues = checkScheduleCongestion(daySchedule);

  const handleEdit = (activity) => {
    setEditModal(activity);
    setEditStartTime(activity.startTime);
    setEditDuration(activity.duration);
  };

  const handleSave = () => {
    if (editModal) {
      const updated = adjustActivityTime(daySchedule, editModal.id, editStartTime, editDuration);
      onUpdate(updated);
      setEditModal(null);
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Icon name="calendar outline" />
        {daySchedule.date}
        <Label color="teal">
          {daySchedule.activities.filter(a => a.type === 'sightseeing').length} 个景点
        </Label>
      </h3>

      {congestionIssues.length > 0 && (
        <Message warning={congestionIssues.some(i => i.type === 'warning')} error={congestionIssues.some(i => i.type === 'danger')}>
          <Message.Header>行程提醒</Message.Header>
          <Message.List>
            {congestionIssues.map((issue, idx) => (
              <Message.Item key={idx}>{issue.message}</Message.Item>
            ))}
          </Message.List>
        </Message>
      )}

      <Table celled striped>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell width={2}>时间</Table.HeaderCell>
            <Table.HeaderCell width={2}>类型</Table.HeaderCell>
            <Table.HeaderCell width={5}>活动</Table.HeaderCell>
            <Table.HeaderCell width={2}>时长</Table.HeaderCell>
            {daySchedule.activities.some(a => a.type === 'sightseeing') && (
              <Table.HeaderCell width={2}>热度</Table.HeaderCell>
            )}
            <Table.HeaderCell width={2}>操作</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {daySchedule.activities.map((activity) => (
            <Table.Row key={activity.id}>
              <Table.Cell>
                <div>{activity.startTime} - {activity.endTime}</div>
              </Table.Cell>
              <Table.Cell>
                <Label color={getActivityColor(activity.type)} tag>
                  <Icon name={getActivityIcon(activity.type)} />
                  {getActivityLabel(activity.type)}
                </Label>
              </Table.Cell>
              <Table.Cell>
                <strong>{activity.name}</strong>
              </Table.Cell>
              <Table.Cell>{Math.floor(activity.duration / 60)}小时{activity.duration % 60 > 0 ? `${activity.duration % 60}分` : ''}</Table.Cell>
              {activity.type === 'sightseeing' ? (
                <Table.Cell>
                  <Rating icon="star" defaultRating={activity.popularity} maxRating={5} disabled />
                </Table.Cell>
              ) : (
                <Table.Cell>-</Table.Cell>
              )}
              <Table.Cell>
                <Button icon size="tiny" color="blue" onClick={() => handleEdit(activity)}>
                  <Icon name="edit" />
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      <Modal open={!!editModal} onClose={() => setEditModal(null)}>
        <Modal.Header>调整行程时间</Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Input
              label="活动名称"
              value={editModal?.name || ''}
              disabled
            />
            <Form.Group widths="equal">
              <Form.Input
                label="开始时间"
                type="time"
                value={editStartTime}
                onChange={(e) => setEditStartTime(e.target.value)}
              />
              <Form.Input
                label="持续时间（分钟）"
                type="number"
                min="15"
                step="15"
                value={editDuration}
                onChange={(e) => setEditDuration(parseInt(e.target.value) || 60)}
              />
            </Form.Group>
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={() => setEditModal(null)}>取消</Button>
          <Button primary onClick={handleSave}>
            <Icon name="save" />
            保存修改
          </Button>
        </Modal.Actions>
      </Modal>
    </div>
  );
};

export default DaySchedule;
