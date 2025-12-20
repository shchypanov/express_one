import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Глобальні змінні (describe, it, expect) без імпорту
    globals: true,

    // Середовище виконання
    environment: 'node',

    // Патерн для тестових файлів
    include: ['src/**/*.test.ts'],

    // Таймаут для тестів (мс)
    testTimeout: 10000,

    // Coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules', 'dist', 'generated'],
    },
  },
});
