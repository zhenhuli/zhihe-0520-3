import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  shortcuts: {
    'btn': 'px-3 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer border-none select-none',
    'btn-primary': 'bg-indigo-500 text-white hover:bg-indigo-600 active:scale-95',
    'btn-secondary': 'bg-slate-700 text-slate-100 hover:bg-slate-600 active:scale-95 border border-slate-600',
    'btn-ghost': 'bg-transparent text-slate-300 hover:bg-slate-700/60 active:scale-95 border border-slate-700',
    'btn-danger': 'bg-red-500 text-white hover:bg-red-600 active:scale-95',
    'btn-success': 'bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95',
    'panel': 'bg-slate-800/70 rounded-xl border border-slate-700/60 backdrop-blur',
    'input': 'w-full px-3 py-2 bg-slate-900/60 border border-slate-700 text-slate-100 rounded-lg outline-none transition-all focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-500',
    'input-sm': 'px-2 py-1 text-sm bg-slate-900/60 border border-slate-700 text-slate-100 rounded-md outline-none transition-all focus:ring-2 focus:ring-indigo-500',
    'label': 'block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider',
    'chip': 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
  },
  theme: {
    colors: {
      rarity: {
        common: '#94a3b8',
        rare: '#60a5fa',
        epic: '#c084fc',
        legendary: '#fbbf24',
      },
    },
  },
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        sans: 'Inter',
        display: 'Playfair Display',
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})

