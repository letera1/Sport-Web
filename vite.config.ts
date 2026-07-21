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
      '/api-images': {
        target: 'https://r2.thesportsdb.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-images/, '')
      },
    },
  },
  optimizeDeps: {
    include: ['lucide-react'],
  },
});
