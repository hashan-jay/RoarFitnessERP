import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// frontend on 5200 — API 5188, fingerprint 5190
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5200,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5188',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5188',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 5200,
    strictPort: true,
  },
})