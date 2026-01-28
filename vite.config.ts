import { defineConfig } from 'vite';

export default defineConfig({
  base: '/Days-Since-for-Pharmacists/',
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    reporters: ['default']
  }
});
