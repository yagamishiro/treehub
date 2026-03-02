import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@components': path.resolve(__dirname, './components'),
      '@pages': path.resolve(__dirname, './pages'),
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    },
    hmr: process.env.DISABLE_HMR !== 'true',
  },
});
