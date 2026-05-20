const LIQUID_DATABASE = {
  water: { name: '纯净水', color: 'rgba(100, 180, 255, 0.6)', pH: 7.0, density: 1.0, viscosity: 1.0, solubility: 1.0 },
  hcl: { name: '盐酸', color: 'rgba(255, 220, 100, 0.5)', pH: 1.0, density: 1.18, viscosity: 1.2, solubility: 1.0 },
  naoh: { name: '氢氧化钠', color: 'rgba(200, 220, 255, 0.5)', pH: 14.0, density: 1.22, viscosity: 1.5, solubility: 1.0 },
  cuso4: { name: '硫酸铜', color: 'rgba(50, 150, 255, 0.7)', pH: 4.0, density: 1.31, viscosity: 1.3, solubility: 0.95 },
  fecl3: { name: '氯化铁', color: 'rgba(255, 180, 50, 0.7)', pH: 2.0, density: 1.45, viscosity: 1.4, solubility: 0.9 },
  phenolphthalein: { name: '酚酞指示剂', color: 'rgba(255, 240, 240, 0.4)', pH: 7.0, density: 0.95, viscosity: 0.9, solubility: 1.0 },
  oil: { name: '植物油', color: 'rgba(255, 220, 150, 0.6)', pH: 7.0, density: 0.92, viscosity: 3.0, solubility: 0.1 },
  alcohol: { name: '乙醇', color: 'rgba(220, 240, 255, 0.4)', pH: 7.0, density: 0.79, viscosity: 0.8, solubility: 1.0 },
  vinegar: { name: '醋酸', color: 'rgba(255, 250, 200, 0.5)', pH: 2.4, density: 1.05, viscosity: 1.1, solubility: 1.0 },
  ammonia: { name: '氨水', color: 'rgba(200, 255, 240, 0.5)', pH: 11.5, density: 0.91, viscosity: 0.95, solubility: 1.0 }
};

const REACTION_RULES = {
  'hcl-naoh': { type: 'neutralization', heat: 57.3, product: 'salt', color: 'rgba(255, 255, 255, 0.5)' },
  'naoh-hcl': { type: 'neutralization', heat: 57.3, product: 'salt', color: 'rgba(255, 255, 255, 0.5)' },
  'naoh-phenolphthalein': { type: 'indicator', heat: 0, product: 'indicator', color: 'rgba(255, 100, 150, 0.8)' },
  'phenolphthalein-naoh': { type: 'indicator', heat: 0, product: 'indicator', color: 'rgba(255, 100, 150, 0.8)' },
  'hcl-cuso4': { type: 'no-reaction', heat: 0, product: 'mixed' },
  'cuso4-hcl': { type: 'no-reaction', heat: 0, product: 'mixed' },
  'naoh-cuso4': { type: 'precipitate', heat: 10, product: 'Cu(OH)₂', precipitate: 'rgba(100, 150, 255, 0.8)', color: 'rgba(150, 200, 255, 0.5)' },
  'cuso4-naoh': { type: 'precipitate', heat: 10, product: 'Cu(OH)₂', precipitate: 'rgba(100, 150, 255, 0.8)', color: 'rgba(150, 200, 255, 0.5)' },
  'naoh-fecl3': { type: 'precipitate', heat: 15, product: 'Fe(OH)₃', precipitate: 'rgba(200, 100, 50, 0.8)', color: 'rgba(200, 150, 100, 0.5)' },
  'fecl3-naoh': { type: 'precipitate', heat: 15, product: 'Fe(OH)₃', precipitate: 'rgba(200, 100, 50, 0.8)', color: 'rgba(200, 150, 100, 0.5)' },
  'ammonia-hcl': { type: 'neutralization', heat: 50, product: 'NH₄Cl', color: 'rgba(255, 255, 255, 0.5)' },
  'hcl-ammonia': { type: 'neutralization', heat: 50, product: 'NH₄Cl', color: 'rgba(255, 255, 255, 0.5)' },
  'vinegar-naoh': { type: 'neutralization', heat: 55, product: '醋酸钠', color: 'rgba(255, 255, 200, 0.5)' },
  'naoh-vinegar': { type: 'neutralization', heat: 55, product: '醋酸钠', color: 'rgba(255, 255, 200, 0.5)' }
};

class LiquidMixingSimulator {
  constructor() {
    this.canvas = document.getElementById('simCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.worker = null;
    this.isRunning = false;
    this.isPaused = false;
    this.particles = [];
    this.simulationData = null;
    this.animationId = null;
    
    this.initElements();
    this.initEventListeners();
    this.drawEmptyBeaker();
  }

  initElements() {
    this.elements = {
      liquidA: document.getElementById('liquidA'),
      liquidB: document.getElementById('liquidB'),
      ratioA: document.getElementById('ratioA'),
      ratioB: document.getElementById('ratioB'),
      ratioAValue: document.getElementById('ratioA-value'),
      ratioBValue: document.getElementById('ratioB-value'),
      ratioADisplay: document.getElementById('ratioA-display'),
      ratioBDisplay: document.getElementById('ratioB-display'),
      temperature: document.getElementById('temperature'),
      tempValue: document.getElementById('temp-value'),
      stirSpeed: document.getElementById('stirSpeed'),
      stirValue: document.getElementById('stir-value'),
      startBtn: document.getElementById('startBtn'),
      resetBtn: document.getElementById('resetBtn'),
      pauseBtn: document.getElementById('pauseBtn'),
      statusInfo: document.getElementById('statusInfo')
    };
  }

  initEventListeners() {
    this.elements.ratioA.addEventListener('input', (e) => {
      const valA = parseInt(e.target.value);
      const valB = 100 - valA;
      this.elements.ratioB.value = valB;
      this.elements.ratioAValue.textContent = valA;
      this.elements.ratioBValue.textContent = valB;
      this.elements.ratioADisplay.textContent = valA;
      this.elements.ratioBDisplay.textContent = valB;
    });

    this.elements.ratioB.addEventListener('input', (e) => {
      const valB = parseInt(e.target.value);
      const valA = 100 - valB;
      this.elements.ratioA.value = valA;
      this.elements.ratioAValue.textContent = valA;
      this.elements.ratioBValue.textContent = valB;
      this.elements.ratioADisplay.textContent = valA;
      this.elements.ratioBDisplay.textContent = valB;
    });

    this.elements.temperature.addEventListener('input', (e) => {
      this.elements.tempValue.textContent = e.target.value;
    });

    this.elements.stirSpeed.addEventListener('input', (e) => {
      this.elements.stirValue.textContent = e.target.value;
    });

    this.elements.liquidA.addEventListener('change', () => this.updateBeforeMixData());
    this.elements.liquidB.addEventListener('change', () => this.updateBeforeMixData());

    this.elements.startBtn.addEventListener('click', () => this.startSimulation());
    this.elements.resetBtn.addEventListener('click', () => this.resetSimulation());
    this.elements.pauseBtn.addEventListener('click', () => this.togglePause());
  }

  updateBeforeMixData() {
    const liquidA = LIQUID_DATABASE[this.elements.liquidA.value];
    const liquidB = LIQUID_DATABASE[this.elements.liquidB.value];
    const temp = parseInt(this.elements.temperature.value);

    document.getElementById('before-pH-A').textContent = liquidA.pH.toFixed(1);
    document.getElementById('before-pH-B').textContent = liquidB.pH.toFixed(1);
    document.getElementById('before-density-A').textContent = liquidA.density.toFixed(2) + ' g/cm³';
    document.getElementById('before-density-B').textContent = liquidB.density.toFixed(2) + ' g/cm³';
    document.getElementById('before-temp-A').textContent = temp + '°C';
    document.getElementById('before-temp-B').textContent = temp + '°C';
    document.getElementById('before-color-A').style.background = liquidA.color;
    document.getElementById('before-color-B').style.background = liquidB.color;
  }

  startSimulation() {
    if (this.isRunning) return;

    const liquidA = LIQUID_DATABASE[this.elements.liquidA.value];
    const liquidB = LIQUID_DATABASE[this.elements.liquidB.value];
    const ratioA = parseInt(this.elements.ratioA.value) / 100;
    const ratioB = parseInt(this.elements.ratioB.value) / 100;
    const temperature = parseInt(this.elements.temperature.value);
    const stirSpeed = parseInt(this.elements.stirSpeed.value);

    this.updateBeforeMixData();

    const reactionKey = `${this.elements.liquidA.value}-${this.elements.liquidB.value}`;
    const reaction = REACTION_RULES[reactionKey] || { type: 'mixing', heat: 0, product: 'mixed' };

    const config = {
      liquidA: { ...liquidA, ratio: ratioA, id: this.elements.liquidA.value },
      liquidB: { ...liquidB, ratio: ratioB, id: this.elements.liquidB.value },
      temperature,
      stirSpeed,
      reaction,
      canvasWidth: this.canvas.width,
      canvasHeight: this.canvas.height,
      beaker: {
        x: 100,
        y: 50,
        width: 400,
        height: 400
      }
    };

    this.updateStatus('正在初始化模拟...');
    this.elements.startBtn.disabled = true;
    this.elements.pauseBtn.disabled = false;

    if (this.worker) {
      this.worker.terminate();
    }

    this.worker = new Worker('src/js/simulation.worker.js');
    
    this.worker.onmessage = (e) => {
      if (e.data.type === 'state') {
        this.particles = e.data.particles;
        this.simulationData = e.data.data;
        this.updateAfterMixData(e.data.data);
      } else if (e.data.type === 'status') {
        this.updateStatus(e.data.message);
      } else if (e.data.type === 'complete') {
        this.updateStatus('模拟完成!');
        this.elements.pauseBtn.disabled = true;
        this.elements.startBtn.disabled = false;
        this.isRunning = false;
      }
    };

    this.worker.postMessage({ type: 'start', config });

    this.isRunning = true;
    this.animate();
  }

  togglePause() {
    if (!this.isRunning) return;
    
    this.isPaused = !this.isPaused;
    this.elements.pauseBtn.textContent = this.isPaused ? '继续' : '暂停';
    this.worker.postMessage({ type: this.isPaused ? 'pause' : 'resume' });
    this.updateStatus(this.isPaused ? '已暂停' : '继续模拟...');
  }

  resetSimulation() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    this.isRunning = false;
    this.isPaused = false;
    this.particles = [];
    this.simulationData = null;
    
    this.elements.startBtn.disabled = false;
    this.elements.pauseBtn.disabled = true;
    this.elements.pauseBtn.textContent = '暂停';
    
    this.drawEmptyBeaker();
    this.clearAfterMixData();
    this.updateStatus('等待开始...');
  }

  updateStatus(message) {
    this.elements.statusInfo.innerHTML = `<p>${message}</p>`;
  }

  updateAfterMixData(data) {
    document.getElementById('after-pH').textContent = data.pH.toFixed(2);
    document.getElementById('after-density').textContent = data.density.toFixed(3) + ' g/cm³';
    document.getElementById('after-temp').textContent = data.temperature.toFixed(1) + '°C';
    document.getElementById('after-viscosity').textContent = data.viscosity.toFixed(2) + ' cP';
    document.getElementById('after-reaction').textContent = data.reactionType;
    document.getElementById('after-layers').textContent = data.layers > 1 ? `${data.layers} 层` : '互溶';
    document.getElementById('after-precipitate').textContent = data.precipitate || '无';
    document.getElementById('after-mix-level').textContent = (data.mixLevel * 100).toFixed(1) + '%';
  }

  clearAfterMixData() {
    const fields = ['pH', 'density', 'temp', 'viscosity', 'reaction', 'layers', 'precipitate', 'mix-level'];
    fields.forEach(field => {
      document.getElementById(`after-${field}`).textContent = '-';
    });
  }

  drawEmptyBeaker() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const beakerX = 100;
    const beakerY = 50;
    const beakerWidth = 400;
    const beakerHeight = 400;
    
    this.ctx.beginPath();
    this.ctx.moveTo(beakerX - 20, beakerY);
    this.ctx.lineTo(beakerX - 10, beakerY + beakerHeight + 20);
    this.ctx.lineTo(beakerX + beakerWidth + 10, beakerY + beakerHeight + 20);
    this.ctx.lineTo(beakerX + beakerWidth + 20, beakerY);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
    
    this.ctx.beginPath();
    this.ctx.moveTo(beakerX - 15, beakerY);
    this.ctx.lineTo(beakerX - 5, beakerY + beakerHeight + 15);
    this.ctx.lineTo(beakerX + beakerWidth + 5, beakerY + beakerHeight + 15);
    this.ctx.lineTo(beakerX + beakerWidth + 15, beakerY);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    for (let i = 0; i <= 5; i++) {
      const y = beakerY + beakerHeight - (i * beakerHeight / 5);
      this.ctx.beginPath();
      this.ctx.moveTo(beakerX - 10, y);
      this.ctx.lineTo(beakerX, y);
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }
    
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const y = beakerY + beakerHeight - (i * beakerHeight / 5);
      this.ctx.fillText(`${i * 100}ml`, beakerX - 15, y + 4);
    }
  }

  animate() {
    if (!this.isRunning) return;
    
    this.drawEmptyBeaker();
    this.drawParticles();
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  drawParticles() {
    if (!this.particles || this.particles.length === 0) return;
    
    this.ctx.save();
    
    const beakerX = 100;
    const beakerY = 50;
    const beakerWidth = 400;
    const beakerHeight = 400;
    
    this.ctx.beginPath();
    this.ctx.moveTo(beakerX, beakerY);
    this.ctx.lineTo(beakerX, beakerY + beakerHeight);
    this.ctx.lineTo(beakerX + beakerWidth, beakerY + beakerHeight);
    this.ctx.lineTo(beakerX + beakerWidth, beakerY);
    this.ctx.clip();
    
    this.particles.forEach(particle => {
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fillStyle = particle.color;
      this.ctx.fill();
      
      if (particle.precipitate) {
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size * 1.5, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
      }
    });
    
    this.ctx.restore();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.simulator = new LiquidMixingSimulator();
});
