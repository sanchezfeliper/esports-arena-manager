import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@app': '/src/app',
      '@': '/src',
      '@data': '/src/data',
      '@domain': '/src/domain',
      '@services': '/src/services',
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@styles': '/src/styles',
    },
  },
})
