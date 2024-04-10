import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    name: 'happy-dom',
    environment: 'happy-dom',
    include: ['**/*.spec.ts'],
    globals: true,
    restoreMocks: true,
  },
});
