const SCENIC_SPOTS = [
  { id: 1, name: '故宫博物院', baseDuration: 3, popularity: 5, type: 'culture' },
  { id: 2, name: '天安门广场', baseDuration: 1.5, popularity: 4, type: 'culture' },
  { id: 3, name: '长城', baseDuration: 4, popularity: 5, type: 'nature' },
  { id: 4, name: '颐和园', baseDuration: 3, popularity: 4, type: 'nature' },
  { id: 5, name: '天坛', baseDuration: 2, popularity: 4, type: 'culture' },
  { id: 6, name: '圆明园', baseDuration: 2.5, popularity: 3, type: 'culture' },
  { id: 7, name: '南锣鼓巷', baseDuration: 2, popularity: 4, type: 'food' },
  { id: 8, name: '798艺术区', baseDuration: 2.5, popularity: 3, type: 'culture' },
  { id: 9, name: '鸟巢水立方', baseDuration: 2, popularity: 3, type: 'modern' },
  { id: 10, name: '什刹海', baseDuration: 2, popularity: 4, type: 'nature' },
  { id: 11, name: '雍和宫', baseDuration: 1.5, popularity: 3, type: 'culture' },
  { id: 12, name: '景山公园', baseDuration: 1.5, popularity: 3, type: 'nature' },
  { id: 13, name: '北海公园', baseDuration: 2, popularity: 3, type: 'nature' },
  { id: 14, name: '恭王府', baseDuration: 2, popularity: 3, type: 'culture' },
  { id: 15, name: '王府井', baseDuration: 2, popularity: 4, type: 'shopping' },
];

const generateSchedule = (days, spotCount, playDurationFactor = 1) => {
  const selectedSpots = SCENIC_SPOTS
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(spotCount, SCENIC_SPOTS.length));

  const schedule = [];
  const spotsPerDay = Math.ceil(selectedSpots.length / days);
  
  for (let day = 1; day <= days; day++) {
    const daySpots = selectedSpots.slice((day - 1) * spotsPerDay, day * spotsPerDay);
    const daySchedule = generateDaySchedule(day, daySpots, playDurationFactor);
    schedule.push(daySchedule);
  }

  return {
    schedule,
    selectedSpots,
    totalDays: days
  };
};

const generateDaySchedule = (day, spots, playDurationFactor) => {
  const activities = [];
  let currentTime = 8 * 60; 
  
  activities.push({
    id: `day${day}-wake`,
    type: 'rest',
    name: '起床、早餐',
    startTime: formatTime(8 * 60),
    endTime: formatTime(8 * 60 + 60),
    duration: 60
  });
  currentTime += 60;

  spots.forEach((spot, index) => {
    if (index > 0) {
      const transportTime = Math.floor(30 + Math.random() * 30);
      activities.push({
        id: `day${day}-transport-${index}`,
        type: 'transport',
        name: '交通出行',
        startTime: formatTime(currentTime),
        endTime: formatTime(currentTime + transportTime),
        duration: transportTime
      });
      currentTime += transportTime;
    }

    const playDuration = Math.floor(spot.baseDuration * 60 * playDurationFactor);
    activities.push({
      id: `day${day}-spot-${spot.id}`,
      type: 'sightseeing',
      name: spot.name,
      spotId: spot.id,
      startTime: formatTime(currentTime),
      endTime: formatTime(currentTime + playDuration),
      duration: playDuration,
      popularity: spot.popularity,
      spotType: spot.type
    });
    currentTime += playDuration;

    const restTime = index < spots.length - 1 ? Math.floor(15 + Math.random() * 15) : 0;
    if (restTime > 0) {
      activities.push({
        id: `day${day}-rest-${index}`,
        type: 'rest',
        name: '短暂休息',
        startTime: formatTime(currentTime),
        endTime: formatTime(currentTime + restTime),
        duration: restTime
      });
      currentTime += restTime;
    }
  });

  if (currentTime < 12 * 60) {
    const lunchStart = Math.max(currentTime, 11.5 * 60);
    activities.push({
      id: `day${day}-lunch`,
      type: 'meal',
      name: '午餐',
      startTime: formatTime(lunchStart),
      endTime: formatTime(lunchStart + 60),
      duration: 60
    });
    currentTime = lunchStart + 60;
  } else if (currentTime >= 12 * 60 && currentTime < 13 * 60) {
    const lunchIndex = activities.findIndex(a => a.type === 'sightseeing');
    if (lunchIndex >= 0) {
      activities.splice(lunchIndex + 1, 0, {
        id: `day${day}-lunch`,
        type: 'meal',
        name: '午餐',
        startTime: formatTime(12 * 60),
        endTime: formatTime(13 * 60),
        duration: 60
      });
    }
  }

  const dinnerTime = 18 * 60;
  if (currentTime < dinnerTime) {
    activities.push({
      id: `day${day}-dinner`,
      type: 'meal',
      name: '晚餐',
      startTime: formatTime(dinnerTime),
      endTime: formatTime(dinnerTime + 60),
      duration: 60
    });
    currentTime = dinnerTime + 60;
  }

  activities.push({
    id: `day${day}-hotel`,
    type: 'rest',
    name: '返回酒店休息',
    startTime: formatTime(currentTime),
    endTime: formatTime(22 * 60),
    duration: 22 * 60 - currentTime
  });

  return {
    day,
    date: `第${day}天`,
    activities,
    totalActivityTime: activities.reduce((sum, a) => sum + a.duration, 0)
  };
};

const formatTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

const parseTime = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const adjustActivityTime = (daySchedule, activityId, newStartTime, newDuration) => {
  const activityIndex = daySchedule.activities.findIndex(a => a.id === activityId);
  if (activityIndex === -1) return daySchedule;

  const activities = [...daySchedule.activities];
  const activity = { ...activities[activityIndex] };
  
  const startMinutes = parseTime(newStartTime);
  activity.startTime = newStartTime;
  activity.duration = newDuration;
  activity.endTime = formatTime(startMinutes + newDuration);
  
  activities[activityIndex] = activity;

  for (let i = activityIndex + 1; i < activities.length; i++) {
    const prevActivity = activities[i - 1];
    const currActivity = { ...activities[i] };
    
    const prevEnd = parseTime(prevActivity.endTime);
    currActivity.startTime = formatTime(prevEnd);
    currActivity.endTime = formatTime(prevEnd + currActivity.duration);
    
    activities[i] = currActivity;
  }

  return {
    ...daySchedule,
    activities
  };
};

const checkScheduleCongestion = (daySchedule) => {
  const issues = [];
  const sightseeingActivities = daySchedule.activities.filter(a => a.type === 'sightseeing');
  
  if (sightseeingActivities.length > 4) {
    issues.push({
      type: 'warning',
      message: '今日景点较多，建议减少景点数量或延长游玩时间'
    });
  }

  let totalSightseeingTime = 0;
  sightseeingActivities.forEach(a => {
    totalSightseeingTime += a.duration;
  });

  if (totalSightseeingTime > 8 * 60) {
    issues.push({
      type: 'danger',
      message: '今日游玩时间过长，可能导致行程过于拥挤'
    });
  }

  return issues;
};

export {
  SCENIC_SPOTS,
  generateSchedule,
  generateDaySchedule,
  formatTime,
  parseTime,
  adjustActivityTime,
  checkScheduleCongestion
};
