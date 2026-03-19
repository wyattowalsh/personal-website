import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 15_000,
    include: ['**/*.test.{ts,tsx}'],
    environmentMatchGlobs: [
      ['components/**/*.test.tsx', 'jsdom'],
      ['lib/__tests__/device.test.ts', 'jsdom'],
      ['lib/__tests__/analytics.test.ts', 'jsdom'],
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
      'server-only': path.resolve(__dirname, 'vitest-server-only-stub.ts'),
    },
  },
});
