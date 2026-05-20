export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['nuxt-windicss'],
  windicss: {
    scan: {
      dirs: ['./'],
      exclude: ['.nuxt/**', 'node_modules/**']
    }
  },
  css: ['virtual:windi.css']
})
