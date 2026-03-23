import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/Days-Since-for-Pharmacists/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        option1: resolve(__dirname, '1/index.html'),
        option2: resolve(__dirname, '2/index.html'),
        option3: resolve(__dirname, '3/index.html'),
      },
    },
  },
});
