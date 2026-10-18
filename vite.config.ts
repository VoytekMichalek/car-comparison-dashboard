import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: { rollupOptions: { output: { manualChunks(id) {
    if (id.includes('node_modules/zod')) return 'validation';
    if (id.includes('node_modules/react')) return 'react';
    if (id.includes('/src/data/')) return 'research';
  } } } },
});
