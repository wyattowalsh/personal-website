import { test, expect } from '@playwright/test'

test.setTimeout(120_000)

test('home page smoke gate', async ({ page }) => {
  const response = await page.goto('/')
  expect(response?.ok()).toBeTruthy()
  await expect(page).toHaveTitle(/Wyatt Walsh/i)
})
