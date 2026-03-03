import { test, expect } from '@playwright/test'
import { setEditorCode, waitForEditorReady } from './helpers/editor'

test.describe('Studio Security', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/studio/new')
    await waitForEditorReady(page)
  })

  // 1. iframe sandbox attribute must be exactly "allow-scripts" (no allow-same-origin)
  test('iframe has strict sandbox attribute', async ({ page }) => {
    const iframe = page.locator('iframe[title="Sketch preview"]')
    await expect(iframe).toHaveAttribute('sandbox', 'allow-scripts')
  })

  // 2. sandbox.html contains a CSP meta tag with restrictive policy
  test('sandbox has CSP meta tag', async ({ page }) => {
    // Supplementary check: validates CSP string exists in sandbox.html.
    // Behavioral enforcement is verified by the fetch/parent/cookie tests below.
    const response = await page.request.get('/studio/sandbox.html')
    const html = await response.text()
    expect(html).toContain("default-src 'none'")
    expect(html).toContain(
      "script-src 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net"
    )
  })

  // 3. fetch/XHR is blocked by CSP — sketch that calls fetch() produces an error
  test('fetch is blocked by CSP', async ({ page }) => {
    const code = [
      'function setup() {',
      '  createCanvas(400, 400);',
      '  fetch("https://example.com")',
      '    .catch(function(e) { console.error("BLOCKED:" + e.message); });',
      '}',
      'function draw() { background(0); }',
    ].join('\n')

    await setEditorCode(page, code)
    await page.getByRole('button', { name: /Run/ }).click()

    // The sandbox flushes console entries via postMessage on a 2 s heartbeat.
    // The ConsoleOutput component renders each entry's args as text content.
    await expect(
      page.getByRole('log').getByText(/BLOCKED:/)
    ).toBeVisible({ timeout: 10_000 })
  })

  // 4. Parent DOM access is blocked — parent.document throws SecurityError
  test('parent DOM access is blocked', async ({ page }) => {
    const code = [
      'function setup() {',
      '  createCanvas(400, 400);',
      '  try {',
      '    var t = parent.document.title;',
      '    console.log("ACCESS:" + t);',
      '  } catch(e) {',
      '    console.error("SECURITY:" + e.name);',
      '  }',
      '}',
      'function draw() { background(0); }',
    ].join('\n')

    await setEditorCode(page, code)
    await page.getByRole('button', { name: /Run/ }).click()

    await expect(
      page.getByRole('log').getByText('SECURITY:SecurityError')
    ).toBeVisible({ timeout: 10_000 })
  })

  // 5. Cookie access is restricted — document.cookie is empty in sandboxed iframe
  test('cookie access is restricted', async ({ page }) => {
    const code = [
      'function setup() {',
      '  createCanvas(400, 400);',
      '  console.log("COOKIE:" + (document.cookie || "EMPTY"));',
      '}',
      'function draw() { background(0); }',
    ].join('\n')

    await setEditorCode(page, code)
    await page.getByRole('button', { name: /Run/ }).click()

    await expect(async () => {
      const consolePanel = page.getByRole('log')
      const hasEmptyCookie = await consolePanel.getByText('COOKIE:EMPTY').isVisible()
        .catch(() => false)
      const hasSecurityError = await page.getByText(/Failed to read the 'cookie' property/i)
        .isVisible()
        .catch(() => false)

      expect(hasEmptyCookie || hasSecurityError).toBe(true)
    }).toPass({ timeout: 10_000 })
  })
})
