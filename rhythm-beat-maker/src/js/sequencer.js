import { AudioEngine } from './audioEngine.js';

export class Sequencer {
  constructor() {
    this.audioEngine = new AudioEngine();
    this.bpm = 120;
    this.steps = 16;
    this.currentStep = 0;
    this.isPlaying = false;
    this.intervalId = null;
    this.lookahead = 0.1;
    this.scheduleAheadTime = 0.1;
    this.nextNoteTime = 0;
    
    this.tracks = [
      { id: 'kick', name: '底鼓', icon: '🥁', type: 'drums', steps: new Array(16).fill(false) },
      { id: 'snare', name: '军鼓', icon: '🪘', type: 'drums', steps: new Array(16).fill(false) },
      { id: 'hihat', name: '踩镲', icon: '🎶', type: 'drums', steps: new Array(16).fill(false) },
      { id: 'bass', name: '贝斯', icon: '🎸', type: 'bass', steps: new Array(16).fill(false) },
      { id: 'lead', name: '主音', icon: '🎹', type: 'melody', steps: new Array(16).fill(false) },
      { id: 'chord', name: '和弦', icon: '🎼', type: 'melody', steps: new Array(16).fill(false) }
    ];
    
    this.patterns = [];
    this.loadPatternsFromStorage();
  }

  init() {
    this.audioEngine.init();
    this.renderSequencer();
    this.bindEvents();
    this.renderPatternList();
  }

  renderSequencer() {
    const sequencerEl = document.getElementById('sequencer');
    sequencerEl.innerHTML = '';
    
    this.tracks.forEach(track => {
      const trackEl = document.createElement('div');
      trackEl.className = `track track-${track.type}`;
      
      const labelEl = document.createElement('div');
      labelEl.className = 'track-label';
      labelEl.innerHTML = `<span class="icon">${track.icon}</span> ${track.name}`;
      
      const padsEl = document.createElement('div');
      padsEl.className = 'pads';
      
      for (let i = 0; i < this.steps; i++) {
        const pad = document.createElement('div');
        pad.className = 'pad';
        pad.dataset.trackId = track.id;
        pad.dataset.step = i;
        
        if (i % 4 === 0) {
          pad.classList.add('beat-marker');
        }
        
        if (track.steps[i]) {
          pad.classList.add('active');
        }
        
        pad.addEventListener('click', () => this.togglePad(track.id, i));
        padsEl.appendChild(pad);
      }
      
      trackEl.appendChild(labelEl);
      trackEl.appendChild(padsEl);
      sequencerEl.appendChild(trackEl);
    });
  }

  togglePad(trackId, stepIndex) {
    const track = this.tracks.find(t => t.id === trackId);
    if (track) {
      track.steps[stepIndex] = !track.steps[stepIndex];
      this.updatePadUI(trackId, stepIndex);
      
      if (!this.isPlaying) {
        this.audioEngine.init();
        if (track.steps[stepIndex]) {
          this.audioEngine.playTrack(trackId, stepIndex, this.audioEngine.getCurrentTime() + 0.05);
        }
      }
    }
  }

  updatePadUI(trackId, stepIndex) {
    const pad = document.querySelector(`.pad[data-track-id="${trackId}"][data-step="${stepIndex}"]`);
    const track = this.tracks.find(t => t.id === trackId);
    if (pad && track) {
      pad.classList.toggle('active', track.steps[stepIndex]);
    }
  }

  setBpm(bpm) {
    this.bpm = bpm;
    document.getElementById('bpmValue').textContent = bpm;
  }

  play() {
    if (this.isPlaying) return;
    
    this.audioEngine.init();
    this.isPlaying = true;
    this.currentStep = 0;
    this.nextNoteTime = this.audioEngine.getCurrentTime() + 0.1;
    document.getElementById('playBtn').textContent = '⏸ 暂停';
    
    this.scheduler();
  }

  pause() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    document.getElementById('playBtn').textContent = '▶ 播放';
    this.clearCurrentStepHighlight();
  }

  stop() {
    this.pause();
    this.currentStep = 0;
  }

  scheduler() {
    if (!this.isPlaying) return;
    
    while (this.nextNoteTime < this.audioEngine.getCurrentTime() + this.scheduleAheadTime) {
      this.scheduleNote(this.currentStep, this.nextNoteTime);
      this.nextStep();
    }
    
    this.intervalId = setTimeout(() => this.scheduler(), 25);
  }

  scheduleNote(stepIndex, time) {
    this.tracks.forEach(track => {
      if (track.steps[stepIndex]) {
        this.audioEngine.playTrack(track.id, stepIndex, time);
      }
    });
    
    requestAnimationFrame(() => {
      this.highlightCurrentStep(stepIndex);
    });
  }

  nextStep() {
    const secondsPerStep = 60.0 / this.bpm / 4.0;
    this.nextNoteTime += secondsPerStep;
    this.currentStep = (this.currentStep + 1) % this.steps;
  }

  highlightCurrentStep(stepIndex) {
    document.querySelectorAll('.pad.current').forEach(pad => {
      pad.classList.remove('current');
    });
    
    document.querySelectorAll(`.pad[data-step="${stepIndex}"]`).forEach(pad => {
      pad.classList.add('current');
    });
  }

  clearCurrentStepHighlight() {
    document.querySelectorAll('.pad.current').forEach(pad => {
      pad.classList.remove('current');
    });
  }

  clearAll() {
    this.tracks.forEach(track => {
      track.steps.fill(false);
    });
    this.renderSequencer();
  }

  savePattern(name) {
    const pattern = {
      id: Date.now(),
      name: name || `片段 ${this.patterns.length + 1}`,
      bpm: this.bpm,
      tracks: this.tracks.map(track => ({
        id: track.id,
        steps: [...track.steps]
      })),
      createdAt: new Date().toISOString()
    };
    
    this.patterns.push(pattern);
    this.savePatternsToStorage();
    this.renderPatternList();
    return pattern;
  }

  loadPattern(patternId) {
    const pattern = this.patterns.find(p => p.id === patternId);
    if (!pattern) return;
    
    this.setBpm(pattern.bpm);
    document.getElementById('bpm').value = pattern.bpm;
    
    pattern.tracks.forEach(patternTrack => {
      const track = this.tracks.find(t => t.id === patternTrack.id);
      if (track) {
        track.steps = [...patternTrack.steps];
      }
    });
    
    this.renderSequencer();
  }

  deletePattern(patternId) {
    this.patterns = this.patterns.filter(p => p.id !== patternId);
    this.savePatternsToStorage();
    this.renderPatternList();
  }

  savePatternsToStorage() {
    try {
      localStorage.setItem('rhythmBeatMaker_patterns', JSON.stringify(this.patterns));
    } catch (e) {
      console.warn('无法保存到 localStorage:', e);
    }
  }

  loadPatternsFromStorage() {
    try {
      const stored = localStorage.getItem('rhythmBeatMaker_patterns');
      if (stored) {
        this.patterns = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('无法从 localStorage 加载:', e);
      this.patterns = [];
    }
  }

  renderPatternList() {
    const listEl = document.getElementById('patternList');
    listEl.innerHTML = '';
    
    if (this.patterns.length === 0) {
      listEl.innerHTML = '<p style="color: #8892b0; font-size: 0.9rem;">暂无保存的片段，点击上方按钮保存当前编排</p>';
      return;
    }
    
    this.patterns.forEach(pattern => {
      const itemEl = document.createElement('div');
      itemEl.className = 'pattern-item';
      itemEl.innerHTML = `
        <span class="pattern-name">${pattern.name}</span>
        <div class="pattern-actions">
          <button class="load-btn" data-id="${pattern.id}">加载</button>
          <button class="delete-btn" data-id="${pattern.id}">删除</button>
        </div>
      `;
      listEl.appendChild(itemEl);
    });
    
    listEl.querySelectorAll('.load-btn').forEach(btn => {
      btn.addEventListener('click', () => this.loadPattern(parseInt(btn.dataset.id)));
    });
    
    listEl.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => this.deletePattern(parseInt(btn.dataset.id)));
    });
  }

  showModal(title, defaultValue = '') {
    return new Promise((resolve) => {
      const overlay = document.getElementById('modalOverlay');
      const titleEl = document.getElementById('modalTitle');
      const inputEl = document.getElementById('modalInput');
      const confirmBtn = document.getElementById('modalConfirm');
      const cancelBtn = document.getElementById('modalCancel');
      
      titleEl.textContent = title;
      inputEl.value = defaultValue;
      overlay.classList.add('active');
      
      setTimeout(() => inputEl.focus(), 100);
      
      const handleConfirm = () => {
        const value = inputEl.value.trim();
        cleanup();
        resolve(value || defaultValue);
      };
      
      const handleCancel = () => {
        cleanup();
        resolve(null);
      };
      
      const handleKeydown = (e) => {
        if (e.key === 'Enter') {
          handleConfirm();
        } else if (e.key === 'Escape') {
          handleCancel();
        }
      };
      
      const cleanup = () => {
        overlay.classList.remove('active');
        confirmBtn.removeEventListener('click', handleConfirm);
        cancelBtn.removeEventListener('click', handleCancel);
        inputEl.removeEventListener('keydown', handleKeydown);
      };
      
      confirmBtn.addEventListener('click', handleConfirm);
      cancelBtn.addEventListener('click', handleCancel);
      inputEl.addEventListener('keydown', handleKeydown);
    });
  }

  showConfirm(message) {
    return new Promise((resolve) => {
      const overlay = document.getElementById('modalOverlay');
      const titleEl = document.getElementById('modalTitle');
      const inputEl = document.getElementById('modalInput');
      const confirmBtn = document.getElementById('modalConfirm');
      const cancelBtn = document.getElementById('modalCancel');
      
      titleEl.textContent = message;
      inputEl.style.display = 'none';
      overlay.classList.add('active');
      
      const handleConfirm = () => {
        cleanup();
        resolve(true);
      };
      
      const handleCancel = () => {
        cleanup();
        resolve(false);
      };
      
      const handleKeydown = (e) => {
        if (e.key === 'Enter') {
          handleConfirm();
        } else if (e.key === 'Escape') {
          handleCancel();
        }
      };
      
      const cleanup = () => {
        overlay.classList.remove('active');
        inputEl.style.display = 'block';
        confirmBtn.removeEventListener('click', handleConfirm);
        cancelBtn.removeEventListener('click', handleCancel);
        document.removeEventListener('keydown', handleKeydown);
      };
      
      confirmBtn.addEventListener('click', handleConfirm);
      cancelBtn.addEventListener('click', handleCancel);
      document.addEventListener('keydown', handleKeydown);
    });
  }

  bindEvents() {
    document.getElementById('bpm').addEventListener('input', (e) => {
      this.setBpm(parseInt(e.target.value));
    });
    
    document.getElementById('playBtn').addEventListener('click', () => {
      if (this.isPlaying) {
        this.pause();
      } else {
        this.play();
      }
    });
    
    document.getElementById('stopBtn').addEventListener('click', () => {
      this.stop();
    });
    
    document.getElementById('clearBtn').addEventListener('click', async () => {
      const confirmed = await this.showConfirm('确定要清空所有节拍吗？');
      if (confirmed) {
        this.clearAll();
      }
    });
    
    document.getElementById('savePatternBtn').addEventListener('click', async () => {
      const name = await this.showModal('保存片段', `片段 ${this.patterns.length + 1}`);
      if (name !== null) {
        this.savePattern(name);
      }
    });
  }
}
