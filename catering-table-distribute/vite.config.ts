import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import detectPort from 'detect-port'

export default defineConfig(async () => {
  const defaultPort = 5173
  const port = await detectPort(defaultPort)
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: port,
      open: true,
    },
  }
})
