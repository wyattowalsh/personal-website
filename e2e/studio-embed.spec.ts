import { test, expect } from '@playwright/test'
import { seedTestUser, seedSketches, cleanupTestData } from './helpers/seed'

const TEST_AUTHOR_ID = '00000000-0000-4000-a000-000000000002'

test.describe('Studio Embed', () => {
  let sketchId: string

  test.beforeAll(async () => {
    await seedTestUser(TEST_AUTHOR_ID, 'Embed Tester', 'embed@test.com')
    const ids = await seedSketches(TEST_AUTHOR_ID, 1)
    sketchId = ids[0]
  })

  test.afterAll(async () => {
    await cleanupTestData(TEST_AUTHOR_ID)
  })

  // ── 1. Embed page loads ────────────────────────────────────────────────
  test('embed page loads with dark background', async ({ page }) => {
    // Register error listener BEFORE navigation to catch load-time errors
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))

    await page.goto(`/studio/embed/${sketchId}`)

    // The embed page wraps content in a full-screen dark container
    const container = page.locator('div.bg-black')
    await expect(container).toBeVisible()

    // Allow time for any async errors after initial render
    await page.waitForTimeout(500)
    expect(errors).toHaveLength(0)
  })

  // ── 2. Embed watermark ─────────────────────────────────────────────────
  test('embed page shows watermark link', async ({ page }) => {
    await page.goto(`/studio/embed/${sketchId}`)

    await expect(page.locator('text=w4w.dev/studio')).toBeVisible()
  })

  // ── 3. X-Frame-Options embed → SAMEORIGIN ─────────────────────────────
  test('embed route has X-Frame-Options SAMEORIGIN', async ({ page }) => {
    const response = await page.request.get(`/studio/embed/${sketchId}`)
    const xfo = response.headers()['x-frame-options']
    expect(xfo).toBe('SAMEORIGIN')
  })

  // ── 4. X-Frame-Options studio → DENY ──────────────────────────────────
  // next.config.mjs: /studio/(.*) overrides catch-all DENY with SAMEORIGIN
  test('studio detail route has X-Frame-Options SAMEORIGIN', async ({ page }) => {
    const response = await page.request.get(`/studio/${sketchId}`)
    const xfo = response.headers()['x-frame-options']
    expect(xfo).toBe('SAMEORIGIN')
  })

  // ── 5. Lazy loading via IntersectionObserver ───────────────────────────
  test('SketchEmbed lazy-loads iframe when visible', async ({ page }) => {
    await page.goto(`/studio/${sketchId}`)

    // The sketch detail page includes a SketchEmbed component.
    // When the component scrolls into view (IntersectionObserver with
    // rootMargin: '200px'), it renders an iframe with title "Sketch embed".
    const iframe = page.locator('iframe[title="Sketch embed"]')

    // Scroll the embed container into view to trigger IntersectionObserver
    const embedContainer = page.locator('[class*="not-prose"]').filter({
      has: iframe,
    })

    // If the container isn't immediately in view, scroll to it
    await embedContainer.or(page.locator('iframe[title="Sketch embed"]')).first().scrollIntoViewIfNeeded()

    // The iframe should appear once IntersectionObserver fires
    await expect(iframe).toBeAttached({ timeout: 10_000 })
  })

  // ── 6. Embed play/pause toggle ─────────────────────────────────────────
  test('play button toggles to pause when clicked', async ({ page }) => {
    await page.goto(`/studio/embed/${sketchId}`)

    // The SketchEmbed component renders a Play/Pause button
    const playButton = page.getByRole('button', { name: 'Play' })
    await expect(playButton).toBeVisible({ timeout: 10_000 })

    // Click Play
    await playButton.click()

    // Button should now show "Pause"
    const pauseButton = page.getByRole('button', { name: 'Pause' })
    await expect(pauseButton).toBeVisible()

    // Click Pause to toggle back
    await pauseButton.click()

    // Button should revert to "Play"
    await expect(page.getByRole('button', { name: 'Play' })).toBeVisible()
  })
})
