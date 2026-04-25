import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 180_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  reporter: process.env.CI ? [['dot'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:3458',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'pnpm dev',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    url: 'http://localhost:3458/lab/subtitles',
  },
});
