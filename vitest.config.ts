import { defineConfig } from 'vitest/config';

// Headless unit tests only — no Pixi/DOM. Run in plain Node.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
