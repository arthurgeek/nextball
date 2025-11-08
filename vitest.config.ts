import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.spec.ts', 'tests/unit/**/*.spec.tsx'],
    exclude: ['tests/e2e/**/*', 'node_modules/**/*'],
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['domain/**', 'application/**', 'components/**', 'di/**', 'app/**'],
      exclude: ['node_modules/', 'tests/', '**/*.spec.ts', '**/*.spec.tsx', '**/*.test.ts', 'app/layout.tsx', 'app/globals.css'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
