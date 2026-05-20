export class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.isPlaying = false;
  }

  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.7;
      this.masterGain.connect(this.audioContext.destination);
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  playKick(time) {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
    
    gain.gain.setValueAtTime(1, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(time);
    osc.stop(time + 0.5);
  }

  playSnare(time) {
    const noiseBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.2, this.audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.audioContext.createBufferSource();
    noise.buffer = noiseBuffer;
    
    const noiseGain = this.audioContext.createGain();
    noiseGain.gain.setValueAtTime(1, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
    
    const noiseFilter = this.audioContext.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;
    
    const osc = this.audioContext.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(250, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.1);
    
    const oscGain = this.audioContext.createGain();
    oscGain.gain.setValueAtTime(0.5, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    
    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    
    noise.start(time);
    noise.stop(time + 0.2);
    osc.start(time);
    osc.stop(time + 0.1);
  }

  playHiHat(time) {
    const noiseBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.05, this.audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.audioContext.createBufferSource();
    noise.buffer = noiseBuffer;
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
    
    const highpass = this.audioContext.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 7000;
    
    noise.connect(highpass);
    highpass.connect(gain);
    gain.connect(this.masterGain);
    
    noise.start(time);
    noise.stop(time + 0.05);
  }

  playBass(time, frequency = 55) {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(frequency, time);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, time);
    filter.frequency.exponentialRampToValueAtTime(100, time + 0.3);
    
    gain.gain.setValueAtTime(0.6, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(time);
    osc.stop(time + 0.3);
  }

  playMelody(time, frequency = 440) {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(frequency, time);
    
    gain.gain.setValueAtTime(0.15, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(time);
    osc.stop(time + 0.2);
  }

  playTrack(trackType, stepIndex, time) {
    switch (trackType) {
      case 'kick':
        this.playKick(time);
        break;
      case 'snare':
        this.playSnare(time);
        break;
      case 'hihat':
        this.playHiHat(time);
        break;
      case 'bass':
        const bassNotes = [55, 65.41, 73.42, 82.41];
        this.playBass(time, bassNotes[stepIndex % bassNotes.length]);
        break;
      case 'lead':
        const leadNotes = [440, 493.88, 523.25, 587.33, 659.25, 698.46, 783.99, 880];
        this.playMelody(time, leadNotes[stepIndex % leadNotes.length]);
        break;
      case 'chord':
        const chordNotes = [329.63, 392, 493.88];
        chordNotes.forEach(note => this.playMelody(time, note));
        break;
    }
  }

  getCurrentTime() {
    return this.audioContext ? this.audioContext.currentTime : 0;
  }
}
