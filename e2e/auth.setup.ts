import { test as setup, expect } from '@playwright/test'
import { createAuthCookie, TEST_USER } from './helpers/auth-helper'
import { assertRequiredEnvVars } from './helpers/env'
import { seedTestUser } from './helpers/seed'

setup('authenticate', async ({ page }) => {
  assertRequiredEnvVars(['POSTGRES_URL', 'AUTH_SECRET'])

  // Ensure the test user exists in the database
  await seedTestUser(TEST_USER.userId, TEST_USER.name, TEST_USER.email)

  const cookie = await createAuthCookie()

  await page.context().addCookies([
    {
      ...cookie,
      sameSite: 'Lax',
      httpOnly: true,
      secure: false,
    },
  ])

  // Verify the session works by visiting a page
  await page.goto('/studio')
  await page.waitForLoadState('networkidle')

  // Verify the session cookie was accepted (HR-16: fail early if auth broken)
  await expect(page.getByRole('button', { name: /Sign out/i })).toBeVisible({ timeout: 10_000 })

  // Save storage state
  await page.context().storageState({ path: 'e2e/.auth/user.json' })
})
