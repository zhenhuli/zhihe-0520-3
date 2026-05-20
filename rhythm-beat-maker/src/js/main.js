import { Sequencer } from './sequencer.js';

document.addEventListener('DOMContentLoaded', () => {
  const sequencer = new Sequencer();
  sequencer.init();
  window.sequencer = sequencer;
});
