import { test, expect } from '@playwright/test'
import {
  getEditorVisibleText,
  setEditorCode,
  waitForEditorReady,
} from './helpers/editor'

test.describe('Studio Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/studio/new')
    await waitForEditorReady(page)
  })

  // ── 1. Editor page loads ───────────────────────────────────────────────
  test('editor page loads with code editor and iframe', async ({ page }) => {
    await expect(page.getByTestId('code-editor')).toBeVisible()
    await expect(page.locator('iframe[title="Sketch preview"]')).toBeAttached()
  })

  // ── 3. Template selector ───────────────────────────────────────────────
  test('template selector shows category tabs', async ({ page }) => {
    await page.getByRole('button', { name: 'Templates' }).click()
    // Category tabs inside the template dialog
    for (const label of ['Basic', 'Animation', 'Interactive', 'Generative']) {
      await expect(page.getByRole('tab', { name: label })).toBeVisible()
    }
  })

  // ── 4. Select template ─────────────────────────────────────────────────
  test('selecting a template changes editor content', async ({ page }) => {
    const before = await getEditorVisibleText(page)

    await page.getByRole('button', { name: 'Templates' }).click()
    // Wait for dialog and click the first template button inside it
    const dialog = page.getByRole('dialog')
    await dialog.waitFor({ state: 'visible' })
    await dialog.getByRole('button', { name: /Blank Canvas/i }).click()

    // Editor content should differ after template selection
    await expect(async () => {
      const after = await getEditorVisibleText(page)
      expect(after).not.toBe(before)
    }).toPass({ timeout: 5000 })
  })

  // ── 5. Run sketch ──────────────────────────────────────────────────────
  test('run sketch changes button to Stop', async ({ page }) => {
    await page.getByRole('button', { name: /Run/ }).click()
    await expect(page.getByRole('button', { name: /Stop/ })).toBeVisible()
  })

  // ── 6. Stop sketch ────────────────────────────────────────────────────
  test('stop sketch changes button back to Run', async ({ page }) => {
    await page.getByRole('button', { name: /Run/ }).click()
    await expect(page.getByRole('button', { name: /Stop/ })).toBeVisible()
    await page.getByRole('button', { name: /Stop/ }).click()
    await expect(page.getByRole('button', { name: /Run/ })).toBeVisible()
  })

  // ── 7. Loop protection ────────────────────────────────────────────────
  test('loop protection shows error bar for infinite loop', async ({ page }) => {
    await setEditorCode(page, 'while(true){}')

    await page.getByRole('button', { name: /Run/ }).click()

    // Error bar should appear inside preview panel with loop detection message
    const errorBar = page.locator('.text-destructive')
    await expect(errorBar.filter({ hasText: 'Infinite loop detected' })).toBeVisible({
      timeout: 5000,
    })

    // Crash overlay heading should NOT appear (loop protection is not a crash)
    await expect(
      page.getByRole('heading', { name: 'Sketch stopped responding' })
    ).not.toBeVisible()
  })

  // ── 8. Watchdog crash ─────────────────────────────────────────────────
  test('watchdog triggers crash overlay for blocking sketch code', async ({ page }) => {
    // Use eval() to inject an infinite loop that bypasses the static regex-based
    // loop protection (lib/studio/sandbox.ts transforms while/for/do loops).
    // Run a finite busy-loop from setup() instead of draw() because draw() depends
    // on rAF timing, which is less reliable in headless Chromium. The loop runs
    // long enough to starve heartbeats (>5s watchdog) without crashing the page.
    await setEditorCode(
      page,
      'function setup(){createCanvas(10,10);eval("const t=Date.now();wh"+"ile(Date.now()-t<8000){}")}'
    )

    await page.getByRole('button', { name: /Run/ }).click()

    // Crash overlay should appear after watchdog timeout (5s+)
    await expect(
      page.getByRole('heading', { name: 'Sketch stopped responding' })
    ).toBeVisible({ timeout: 15000 })
    await expect(page.getByRole('button', { name: 'Restart' })).toBeVisible()
  })

  // ── 9. Crash restart ──────────────────────────────────────────────────
  test('restart after crash recovers after editing code', async ({ page }) => {
    await setEditorCode(
      page,
      'function setup(){createCanvas(10,10);eval("const t=Date.now();wh"+"ile(Date.now()-t<8000){}")}'
    )

    await page.getByRole('button', { name: /Run/ }).click()

    await expect(
      page.getByRole('heading', { name: 'Sketch stopped responding' })
    ).toBeVisible({ timeout: 15000 })

    // Replace the blocking code before restarting so recovery is testable.
    await setEditorCode(
      page,
      'function setup(){createCanvas(10,10);background(0);fill(255);circle(5,5,4)}'
    )

    await page.getByRole('button', { name: 'Restart' }).click()

    // Crash overlay should disappear and the sketch should return to a running state.
    await expect(
      page.getByRole('heading', { name: 'Sketch stopped responding' })
    ).not.toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('button', { name: /Stop/ })).toBeVisible()
  })

  // ── 10. Console output ─────────────────────────────────────────────────
  test('console output shows log messages', async ({ page }) => {
    await setEditorCode(page, 'console.log("test123")')

    await page.getByRole('button', { name: /Run/ }).click()

    // Console panel should display the logged message
    await expect(page.locator('text=test123')).toBeVisible({ timeout: 5000 })
  })

  // ── 11. PNG export ─────────────────────────────────────────────────────
  test('PNG export triggers download', async ({ page }) => {
    await page.getByRole('button', { name: /Run/ }).click()
    await expect(page.getByRole('button', { name: /Stop/ })).toBeVisible()

    // Wait a moment for the sketch to render a frame
    await page.waitForTimeout(500)

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      (async () => {
        await page.getByRole('button', { name: 'Export' }).click()
        await page.getByRole('menuitem', { name: 'Export as PNG' }).click()
      })(),
    ])

    expect(download.suggestedFilename()).toBe('sketch.png')
  })

  // ── 12. SVG export ─────────────────────────────────────────────────────
  test('SVG export triggers download for p5.js', async ({ page }) => {
    // Ensure we are on p5.js engine (default)
    await expect(page.getByRole('tab', { name: 'p5.js' })).toHaveAttribute(
      'data-state',
      'active'
    )

    await page.getByRole('button', { name: /Run/ }).click()
    await expect(page.getByRole('button', { name: /Stop/ })).toBeVisible()
    await page.waitForTimeout(500)

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      (async () => {
        await page.getByRole('button', { name: 'Export' }).click()
        await page.getByRole('menuitem', { name: 'Export as SVG' }).click()
      })(),
    ])

    expect(download.suggestedFilename()).toBe('sketch.svg')
  })

  // ── 13. SVG disabled for GLSL ──────────────────────────────────────────
  test('SVG export is disabled for GLSL engine', async ({ page }) => {
    await page.getByRole('tab', { name: 'GLSL' }).click()
    await expect(page.getByRole('tab', { name: 'GLSL' })).toHaveAttribute(
      'data-state',
      'active'
    )

    // Ensure valid GLSL code so the sketch can compile and run
    await setEditorCode(
      page,
      '#version 300 es\nprecision mediump float;\nout vec4 fragColor;\nvoid main(){fragColor=vec4(1.0,0.0,0.0,1.0);}'
    )

    // Run sketch so the Export button is enabled. In headless environments
    // without WebGL2, the preview reports an error and Export remains disabled.
    await page.getByRole('button', { name: /Run/ }).click()
    const stopButton = page.getByRole('button', { name: /Stop/ })
    const exportButton = page.getByRole('button', { name: 'Export' })

    // Pre-check WebGL2 availability rather than using try/catch that could mask real failures
    const hasWebGL2 = await page.evaluate(() => {
      const c = document.createElement('canvas')
      return !!c.getContext('webgl2')
    })

    if (!hasWebGL2) {
      // Headless Chromium without WebGL2: export stays disabled, error shown
      await expect(exportButton).toBeDisabled()
      await expect(page.getByText(/WebGL2 not available/i)).toBeVisible()
      return
    }

    await expect(stopButton).toBeVisible({ timeout: 5000 })
    await page.waitForTimeout(300)
    await exportButton.click()

    const svgItem = page.getByRole('menuitem', { name: 'Export as SVG' })
    await expect(svgItem).toBeVisible()
    await expect(svgItem).toBeDisabled()
  })

  // ── 14. Settings popover ───────────────────────────────────────────────
  test('settings popover shows canvas size presets', async ({ page }) => {
    await page.getByRole('button', { name: /settings/i }).click()

    // "Canvas Size" heading inside popover
    await expect(page.locator('text=Canvas Size')).toBeVisible()

    // Preset buttons should be visible (e.g., 400x400, 800x600)
    await expect(page.getByRole('button', { name: '400\u00d7400' })).toBeVisible()
    await expect(page.getByRole('button', { name: '800\u00d7600' })).toBeVisible()
  })

  // ── 15. Change canvas size ─────────────────────────────────────────────
  test('changing canvas size updates iframe dimensions', async ({ page }) => {
    await page.getByRole('button', { name: /settings/i }).click()
    await page.getByRole('button', { name: '800\u00d7600' }).click()

    const iframe = page.locator('iframe[title="Sketch preview"]')
    await expect(iframe).toHaveAttribute('style', /width:\s*800px/i)
    await expect(iframe).toHaveAttribute('style', /height:\s*600px/i)
  })

  // ── 16. Engine selector ────────────────────────────────────────────────
  test('GLSL tab activates and reconfigures editor', async ({ page }) => {
    await page.getByRole('tab', { name: 'GLSL' }).click()

    await expect(page.getByRole('tab', { name: 'GLSL' })).toHaveAttribute(
      'data-state',
      'active'
    )
    // p5.js tab should no longer be active
    await expect(page.getByRole('tab', { name: 'p5.js' })).toHaveAttribute(
      'data-state',
      'inactive'
    )
  })

  // ── 17. WGSL tab ─────────────────────────────────────────────────────
  test('WGSL tab activates and reconfigures editor', async ({ page }) => {
    // Skip if WebGPU tab is not present (feature-flagged)
    const wgslTab = page.getByRole('tab', { name: 'WGSL' })
    if (!(await wgslTab.isVisible().catch(() => false))) {
      test.skip()
      return
    }

    await wgslTab.click()

    await expect(wgslTab).toHaveAttribute('data-state', 'active')
    await expect(page.getByRole('tab', { name: 'p5.js' })).toHaveAttribute(
      'data-state',
      'inactive'
    )
  })
})

test.describe('Studio Editor - Auto-save', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install()
    await page.goto('/studio/new')
    await waitForEditorReady(page)
  })

  // ── 17. Auto-save ──────────────────────────────────────────────────────
  test('auto-save writes draft to localStorage', async ({ page }) => {
    // Type some code into the editor
    await setEditorCode(page, '// autosave test code')

    // Fast-forward past the autosave interval (30s default + buffer)
    await page.clock.fastForward(35000)

    // Check localStorage for the draft entry
    const stored = await page.evaluate(() =>
      localStorage.getItem('studio:autosaves')
    )
    expect(stored).not.toBeNull()
    expect(stored).toContain('__draft__')
  })
})
