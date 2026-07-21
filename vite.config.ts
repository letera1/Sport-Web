import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://www.thesportsdb.com',
        changeOrigin: true,
        secure: false,
      },
      '/images-r2': {
        target: 'https://r2.thesportsdb.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/images-r2/, '')
      },
      '/images-www': {
        target: 'https://www.thesportsdb.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/images-www/, '')
      },
      '/images-proxy': {
        target: 'https://r2.thesportsdb.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/images-proxy/, '')
      },
    },
  },
  optimizeDeps: {
    include: ['lucide-react'],
  },
});
