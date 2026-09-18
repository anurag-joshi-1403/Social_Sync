import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    // describe/it/expect as globals, so test files stay CommonJS like the app.
    globals: true,
    // The in-memory MongoDB is shared per file, and publisher tests assert on
    // global collection state, so files run one at a time.
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 60_000,
    env: {
      NODE_ENV: 'test',
      JWT_SECRET: 'test-secret-not-used-outside-tests',
    },
  },
});
