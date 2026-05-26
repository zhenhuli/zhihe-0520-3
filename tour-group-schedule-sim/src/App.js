import React, { useState } from 'react';
import { Container, Header, Segment, Tab, Message, Button, Icon } from 'semantic-ui-react';
import SettingsPanel from './components/SettingsPanel';
import DaySchedule from './components/DaySchedule';
import { generateSchedule } from './utils/scheduleGenerator';
import './App.css';

function App() {
  const [settings, setSettings] = useState({
    days: 3,
    spotCount: 6,
    playDurationFactor: 1
  });
  const [scheduleData, setScheduleData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const handleGenerate = () => {
    const result = generateSchedule(
      settings.days,
      settings.spotCount,
      settings.playDurationFactor
    );
    setScheduleData(result);
    setActiveTab(0);
  };

  const handleUpdateDaySchedule = (dayIndex, updatedDay) => {
    if (scheduleData) {
      const newSchedule = [...scheduleData.schedule];
      newSchedule[dayIndex] = updatedDay;
      setScheduleData({
        ...scheduleData,
        schedule: newSchedule
      });
    }
  };

  const handleExport = () => {
    if (!scheduleData) return;

    let content = '旅游团行程计划表\n';
    content += `出行天数: ${scheduleData.totalDays}天\n`;
    content += `景点数量: ${scheduleData.selectedSpots.length}个\n\n`;

    scheduleData.schedule.forEach((day) => {
      content += `===== ${day.date} =====\n`;
      content += '时间\t\t类型\t\t活动\n';
      content += '-'.repeat(50) + '\n';
      
      day.activities.forEach((activity) => {
        const typeMap = {
          sightseeing: '景点',
          transport: '交通',
          rest: '休息',
          meal: '用餐'
        };
        const typeLabel = typeMap[activity.type] || '其他';
        content += `${activity.startTime}-${activity.endTime}\t${typeLabel}\t\t${activity.name}\n`;
      });
      content += '\n';
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `行程计划表_${new Date().toLocaleDateString()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (!scheduleData) return;
    window.print();
  };

  const panes = scheduleData?.schedule.map((daySchedule, index) => ({
    menuItem: daySchedule.date,
    render: () => (
      <Tab.Pane>
        <DaySchedule
          daySchedule={daySchedule}
          onUpdate={(updated) => handleUpdateDaySchedule(index, updated)}
        />
      </Tab.Pane>
    )
  })) || [];

  return (
    <div className="App">
      <Container style={{ paddingTop: '20px', paddingBottom: '40px' }}>
        <Segment>
          <Header as="h1" textAlign="center" style={{ marginBottom: '30px' }}>
            <Icon name="suitcase" color="teal" />
            <Header.Content>
              旅游团行程调度模拟系统
              <Header.Subheader>
                智能规划每日行程，合理安排游玩、交通与休息时间
              </Header.Subheader>
            </Header.Content>
          </Header>
        </Segment>

        <SettingsPanel
          settings={settings}
          onSettingsChange={setSettings}
          onGenerate={handleGenerate}
        />

        {scheduleData && (
          <div style={{ marginTop: '20px' }}>
            <Message success>
              <Icon name="check circle" />
              行程规划完成！共 {scheduleData.totalDays} 天，包含 {scheduleData.selectedSpots.length} 个景点
            </Message>

            <div style={{ marginBottom: '20px' }}>
              <h4>已选景点：</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {scheduleData.selectedSpots.map((spot) => (
                  <div key={spot.id} style={{
                    padding: '8px 16px',
                    backgroundColor: '#f3f4f5',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Icon name="map marker alternate" color="red" />
                    {spot.name}
                  </div>
                ))}
              </div>
            </div>

            <Tab
              panes={panes}
              activeIndex={activeTab}
              onTabChange={(e, data) => setActiveTab(data.activeIndex)}
              menu={{ secondary: true, pointing: true }}
            />

            <Segment style={{ marginTop: '20px' }} textAlign="center" className="no-print-actions">
              <Button primary size="large" icon labelPosition="left" onClick={handleExport}>
                <Icon name="download" />
                导出行程计划表
              </Button>
              <Button color="green" size="large" icon labelPosition="left" style={{ marginLeft: '10px' }} onClick={handlePrint}>
                <Icon name="print" />
                打印行程单
              </Button>
            </Segment>
          </div>
        )}

        {!scheduleData && (
          <Segment placeholder style={{ marginTop: '20px' }}>
            <Header icon>
              <Icon name="map outline" />
              开始规划您的行程
              <Header.Subheader>
                点击上方"生成行程计划"按钮，系统将为您智能安排每日行程
              </Header.Subheader>
            </Header>
          </Segment>
        )}
      </Container>
    </div>
  );
}

export default App;
