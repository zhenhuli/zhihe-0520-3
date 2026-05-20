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
    'btn': 'px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer border-none',
    'btn-primary': 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95',
    'btn-secondary': 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:scale-95',
    'btn-danger': 'bg-red-500 text-white hover:bg-red-600 active:scale-95',
    'btn-success': 'bg-green-500 text-white hover:bg-green-600 active:scale-95',
    'card': 'bg-white rounded-xl shadow-md p-6 border border-gray-100',
    'input': 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all',
    'label': 'block text-sm font-medium text-gray-700 mb-1',
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
        sans: 'DM Sans',
        serif: 'DM Serif Display',
        mono: 'DM Mono',
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})
