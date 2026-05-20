let config = null;
let particles = [];
let isPaused = false;
let isRunning = false;
let simulationData = null;
let frameCount = 0;
let maxFrames = 1000;

function initSimulation(cfg) {
  config = cfg;
  particles = [];
  frameCount = 0;
  
  const beaker = config.beaker;
  const totalParticles = 800;
  const countA = Math.floor(totalParticles * config.liquidA.ratio);
  const countB = totalParticles - countA;
  
  for (let i = 0; i < countA; i++) {
    particles.push(createParticle(config.liquidA, beaker, 'A'));
  }
  
  for (let i = 0; i < countB; i++) {
    particles.push(createParticle(config.liquidB, beaker, 'B'));
  }
  
  simulationData = {
    pH: calculateInitialPH(),
    density: (config.liquidA.density * config.liquidA.ratio + config.liquidB.density * config.liquidB.ratio),
    temperature: config.temperature,
    viscosity: (config.liquidA.viscosity * config.liquidA.ratio + config.liquidB.viscosity * config.liquidB.ratio),
    reactionType: getReactionTypeName(config.reaction.type),
    layers: 1,
    precipitate: config.reaction.precipitate ? config.reaction.product : null,
    mixLevel: 0
  };
  
  checkLayers();
}

function createParticle(liquid, beaker, type) {
  return {
    x: beaker.x + Math.random() * beaker.width,
    y: beaker.y + Math.random() * beaker.height,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    size: 3 + Math.random() * 3,
    color: liquid.color,
    type: type,
    liquidId: liquid.id,
    density: liquid.density,
    viscosity: liquid.viscosity,
    pH: liquid.pH,
    mixed: false,
    reacted: false,
    precipitate: false
  };
}

function calculateInitialPH() {
  const pH_A = config.liquidA.pH;
  const pH_B = config.liquidB.pH;
  const ratioA = config.liquidA.ratio;
  const ratioB = config.liquidB.ratio;
  
  const H_A = Math.pow(10, -pH_A);
  const H_B = Math.pow(10, -pH_B);
  const total_H = H_A * ratioA + H_B * ratioB;
  
  return -Math.log10(Math.max(total_H, 1e-14));
}

function getReactionTypeName(type) {
  const names = {
    'neutralization': '中和反应',
    'precipitate': '沉淀反应',
    'indicator': '显色反应',
    'no-reaction': '无反应',
    'mixing': '物理混合'
  };
  return names[type] || '混合';
}

function checkLayers() {
  const diff = Math.abs(config.liquidA.density - config.liquidB.density);
  const avgSolubility = (config.liquidA.solubility + config.liquidB.solubility) / 2;
  
  if (diff > 0.2 && avgSolubility < 0.5) {
    simulationData.layers = 2;
  } else {
    simulationData.layers = 1;
  }
}

function updateSimulation() {
  if (isPaused || !isRunning) return;
  
  const beaker = config.beaker;
  const tempFactor = 1 + (config.temperature - 25) / 100;
  const stirFactor = 1 + config.stirSpeed / 5;
  const timeFactor = tempFactor * stirFactor;
  
  if (config.reaction.type === 'neutralization' && frameCount < 200) {
    const heatAmount = config.reaction.heat * 0.1;
    simulationData.temperature = Math.min(100, simulationData.temperature + heatAmount / 200);
  }
  
  if (config.reaction.type !== 'no-reaction' && config.reaction.color) {
    const progress = Math.min(frameCount / 300, 1);
    updateParticleColors(progress);
  }
  
  if (config.reaction.type === 'precipitate' && frameCount > 50) {
    createPrecipitateParticles();
  }
  
  particles.forEach((particle, index) => {
    if (particle.precipitate) {
      particle.vy += 0.1;
      particle.vx *= 0.98;
      particle.vy *= 0.98;
    } else {
      if (simulationData.layers > 1) {
        const targetY = particle.type === 'A' 
          ? beaker.y + beaker.height * 0.75 
          : beaker.y + beaker.height * 0.25;
        particle.vy += (targetY - particle.y) * 0.001;
      }
      
      particle.vx += (Math.random() - 0.5) * 0.5 * timeFactor;
      particle.vy += (Math.random() - 0.5) * 0.5 * timeFactor;
      
      if (config.stirSpeed > 0) {
        const centerX = beaker.x + beaker.width / 2;
        const centerY = beaker.y + beaker.height / 2;
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        const angle = Math.atan2(dy, dx);
        const stirStrength = config.stirSpeed * 0.05;
        particle.vx += -Math.sin(angle) * stirStrength;
        particle.vy += Math.cos(angle) * stirStrength;
      }
      
      const maxSpeed = 5 * timeFactor;
      const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
      if (speed > maxSpeed) {
        particle.vx = (particle.vx / speed) * maxSpeed;
        particle.vy = (particle.vy / speed) * maxSpeed;
      }
      
      const viscosityFactor = 1 / simulationData.viscosity;
      particle.vx *= 0.98 * viscosityFactor;
      particle.vy *= 0.98 * viscosityFactor;
    }
    
    particle.x += particle.vx;
    particle.y += particle.vy;
    
    if (particle.x < beaker.x + particle.size) {
      particle.x = beaker.x + particle.size;
      particle.vx *= -0.8;
    }
    if (particle.x > beaker.x + beaker.width - particle.size) {
      particle.x = beaker.x + beaker.width - particle.size;
      particle.vx *= -0.8;
    }
    if (particle.y < beaker.y + particle.size) {
      particle.y = beaker.y + particle.size;
      particle.vy *= -0.8;
    }
    if (particle.y > beaker.y + beaker.height - particle.size) {
      particle.y = beaker.y + beaker.height - particle.size;
      particle.vy *= -0.8;
      if (particle.precipitate) {
        particle.vy = 0;
        particle.vx *= 0.9;
      }
    }
  });
  
  updateMixingData();
  
  if (frameCount % 3 === 0) {
    postState();
  }
  
  frameCount++;
  
  if (frameCount >= maxFrames) {
    isRunning = false;
    postMessage({ type: 'status', message: '模拟已达到稳定状态' });
    postMessage({ type: 'complete' });
  }
}

function updateParticleColors(progress) {
  const colorA = parseColor(config.liquidA.color);
  const colorB = parseColor(config.liquidB.color);
  const targetColor = config.reaction.color ? parseColor(config.reaction.color) : null;
  
  particles.forEach(particle => {
    if (!particle.reacted && Math.random() < progress * 0.1) {
      particle.reacted = true;
      if (targetColor) {
        particle.color = `rgba(${targetColor.r}, ${targetColor.g}, ${targetColor.b}, ${targetColor.a})`;
      } else {
        const r = Math.floor(colorA.r * (1 - progress) + colorB.r * progress);
        const g = Math.floor(colorA.g * (1 - progress) + colorB.g * progress);
        const b = Math.floor(colorA.b * (1 - progress) + colorB.b * progress);
        particle.color = `rgba(${r}, ${g}, ${b}, 0.6)`;
      }
    }
  });
}

function parseColor(colorStr) {
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (match) {
    return {
      r: parseInt(match[1]),
      g: parseInt(match[2]),
      b: parseInt(match[3]),
      a: match[4] ? parseFloat(match[4]) : 1
    };
  }
  return { r: 255, g: 255, b: 255, a: 1 };
}

function createPrecipitateParticles() {
  const precipitateCount = Math.floor(particles.length * 0.1);
  let created = 0;
  
  particles.forEach(particle => {
    if (!particle.precipitate && !particle.reacted && created < precipitateCount && Math.random() < 0.01) {
      particle.precipitate = true;
      particle.reacted = true;
      particle.color = config.reaction.precipitate;
      particle.size = 4 + Math.random() * 4;
      particle.vy = 0;
      created++;
    }
  });
}

function updateMixingData() {
  if (config.reaction.type === 'neutralization') {
    const progress = Math.min(frameCount / 300, 1);
    const targetPH = 7;
    simulationData.pH = simulationData.pH * (1 - progress * 0.8) + targetPH * (progress * 0.8);
  }
  
  let centerX = config.beaker.x + config.beaker.width / 2;
  let centerY = config.beaker.y + config.beaker.height / 2;
  let typeACount = 0;
  let typeBCount = 0;
  let typeADist = 0;
  let typeBDist = 0;
  
  particles.forEach(particle => {
    const dist = Math.sqrt(Math.pow(particle.x - centerX, 2) + Math.pow(particle.y - centerY, 2));
    if (particle.type === 'A') {
      typeACount++;
      typeADist += dist;
    } else {
      typeBCount++;
      typeBDist += dist;
    }
  });
  
  const avgDistA = typeACount > 0 ? typeADist / typeACount : 0;
  const avgDistB = typeBCount > 0 ? typeBDist / typeBCount : 0;
  const maxDist = Math.sqrt(Math.pow(config.beaker.width / 2, 2) + Math.pow(config.beaker.height / 2, 2));
  
  const mixingProgress = Math.min(frameCount / (500 - config.stirSpeed * 30), 1);
  const baseMix = 1 - Math.abs(avgDistA - avgDistB) / maxDist;
  simulationData.mixLevel = Math.min(1, baseMix * 0.5 + mixingProgress * 0.5);
  
  const progress = Math.min(frameCount / 200, 1);
  simulationData.viscosity = simulationData.viscosity * (1 - progress * 0.3) + (config.liquidA.viscosity + config.liquidB.viscosity) / 2 * (progress * 0.3);
}

function postState() {
  postMessage({
    type: 'state',
    particles: particles.map(p => ({
      x: p.x,
      y: p.y,
      size: p.size,
      color: p.color,
      precipitate: p.precipitate
    })),
    data: { ...simulationData }
  });
}

self.onmessage = function(e) {
  switch (e.data.type) {
    case 'start':
      initSimulation(e.data.config);
      isRunning = true;
      isPaused = false;
      postMessage({ type: 'status', message: '模拟开始运行...' });
      runSimulation();
      break;
    case 'pause':
      isPaused = true;
      break;
    case 'resume':
      isPaused = false;
      break;
    case 'stop':
      isRunning = false;
      break;
  }
};

function runSimulation() {
  if (!isRunning) return;
  
  updateSimulation();
  
  if (isRunning) {
    setTimeout(runSimulation, 16);
  }
}
