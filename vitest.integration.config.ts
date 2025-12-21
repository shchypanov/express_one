import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Глобальні змінні (describe, it, expect) без імпорту
    globals: true,

    // Середовище виконання
    environment: 'node',

    // Тільки integration тести
    include: ['src/tests/**/*.test.ts'],

    // Setup file для очищення БД
    setupFiles: ['src/tests/setup.ts'],

    // Таймаут для тестів (мс)
    testTimeout: 15000,

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
