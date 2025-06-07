import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // React 관련 라이브러리들을 별도 청크로 분리
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // UI 라이브러리들을 별도 청크로 분리
          'ui-vendor': [
            'styled-components',
            'react-icons',
            'lucide-react',
            'react-toastify'
          ],
          
          // 차트 관련 라이브러리들을 별도 청크로 분리
          'chart-vendor': [
            'chart.js',
            'react-chartjs-2',
            'recharts'
          ],
          
          // 슬라이드/캐러셀 관련 라이브러리들을 별도 청크로 분리
          'carousel-vendor': [
            'react-slick',
            'slick-carousel',
            'swiper'
          ],
          
          // 유틸리티 라이브러리들을 별도 청크로 분리
          'utils-vendor': [
            'axios',
            'crypto-js',
            'tailwind-merge',
            'class-variance-authority'
          ]
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
          ? chunkInfo.facadeModuleId.split('/').pop().replace(/\.\w+$/, '')
          : 'chunk';
          return `assets/[name]-[hash].js`;
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  define: {
    global: 'globalThis'
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js'
  }
}) 