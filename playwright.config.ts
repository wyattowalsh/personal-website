import { defineConfig, devices } from '@playwright/test'

const PLAYWRIGHT_PORT = process.env.PLAYWRIGHT_PORT ?? '3101'
const PLAYWRIGHT_BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${PLAYWRIGHT_PORT}`
const PLAYWRIGHT_WEB_SERVER_URL =
  process.env.PLAYWRIGHT_WEB_SERVER_URL ?? `${PLAYWRIGHT_BASE_URL}/favicon.ico`
const PLAYWRIGHT_REUSE_EXISTING_SERVER =
  process.env.PLAYWRIGHT_REUSE_EXISTING_SERVER === '1'
const IS_CI = Boolean(process.env.CI)
const PLAYWRIGHT_SERVER_COMMAND = process.env.PLAYWRIGHT_WEB_SERVER_COMMAND ?? (
  IS_CI
    ? `pnpm preprocess && pnpm build && pnpm exec next start --port ${PLAYWRIGHT_PORT}`
    : `pnpm preprocess && pnpm exec next dev --port ${PLAYWRIGHT_PORT}`
)

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: IS_CI,
  retries: IS_CI ? 2 : 0,
  workers: IS_CI ? 1 : undefined,
  outputDir: 'test-results',
  reporter: [
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'test-results/playwright-junit.xml' }],
    ['json', { outputFile: 'test-results/playwright-results.json' }],
  ],
  use: {
    baseURL: PLAYWRIGHT_BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'en-US',
    timezoneId: 'UTC',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'authenticated',
      testMatch: /studio-auth/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'no-auth',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /studio-auth/,
    },
  ],
  webServer: {
    command: PLAYWRIGHT_SERVER_COMMAND,
    url: PLAYWRIGHT_WEB_SERVER_URL,
    timeout: IS_CI ? 600 * 1000 : 300 * 1000,
    reuseExistingServer: PLAYWRIGHT_REUSE_EXISTING_SERVER,
  },
})
