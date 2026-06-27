import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split React core (~140 KiB) — cached across all pages
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Split Swiper (~60 KiB) — only needed on Home/ProductList pages
          'vendor-swiper': ['swiper'],
        }
      }
    }
  }
})
