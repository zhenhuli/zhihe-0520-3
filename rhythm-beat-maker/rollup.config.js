import terser from '@rollup/plugin-terser';

export default {
  input: 'src/js/main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'iife',
    name: 'RhythmBeatMaker',
    sourcemap: true
  },
  plugins: [terser()]
};
