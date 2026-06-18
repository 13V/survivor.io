import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so the build can be opened from any static path / host.
  base: './',
  build: { target: 'es2022' },
});
