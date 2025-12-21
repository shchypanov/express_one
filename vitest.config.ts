import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Глобальні змінні (describe, it, expect) без імпорту
    globals: true,

    // Середовище виконання
    environment: 'node',

    // Патерн для тестових файлів
    include: ['src/**/*.test.ts'],

    // Setup file для integration тестів
    setupFiles: ['src/tests/setup.ts'],

    // Таймаут для тестів (мс)
    testTimeout: 10000,

    // Запускати тести послідовно (важливо для БД)
    sequence: {
      concurrent: false,
    },

    // Coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules', 'dist', 'generated', 'src/tests'],
    },
  },
});
