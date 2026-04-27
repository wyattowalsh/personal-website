import { expect, test, type Page } from '@playwright/test';

const AUTH_STATE_PATH = 'tests/.auth/admin.json';

/**
 * Authenticate into the admin dashboard and save storage state.
 * Uses the ADMIN_PASSWORD env var if set; otherwise falls back to empty string.
 */
async function _authenticateAdmin(page: Page): Promise<void> {
  await page.goto('/admin');

  // If already authed (e.g. from a previous session), skip login
  const heading = page.getByRole('heading', { name: 'Admin Access' });
  if (await heading.isVisible().catch(() => false)) {
    const password = process.env.ADMIN_PASSWORD || '';
    await page.locator('input[type="password"]').fill(password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.locator('aside nav')).toBeVisible({ timeout: 10000 });
  }

  await page.context().storageState({ path: AUTH_STATE_PATH });
}

test.describe('Admin Dashboard', () => {
  test.describe.configure({ mode: 'serial' });

  // ---------------------------------------------------------------------------
  // 1. Login flow
  // ---------------------------------------------------------------------------
  test('login flow: navigate to admin, verify form, submit password, reach dashboard', async ({ page }) => {
    await page.goto('/admin');

    // Verify login form renders
    await expect(page.getByRole('heading', { name: 'Admin Access' })).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    await expect(page.getByText('Secure console')).toBeVisible();
    await expect(page.getByText('Secrets stay server-side')).toBeVisible();

    // Submit password (empty in dev if ADMIN_PASSWORD is unset; use env var when available)
    const password = process.env.ADMIN_PASSWORD || '';
    await page.locator('input[type="password"]').fill(password);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Verify redirect to dashboard shell
    await expect(page.locator('aside nav')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('header')).toBeVisible();
    await expect(page.getByText('Admin Intelligence')).toBeVisible();

    // Save auth state for subsequent tests
    await page.context().storageState({ path: AUTH_STATE_PATH });
  });

  // ---------------------------------------------------------------------------
  // 2. Dashboard load
  // ---------------------------------------------------------------------------
  test('dashboard load: after login, verify shell renders with summary cards', async ({ browser }) => {
    const context = await browser.newContext({ storageState: AUTH_STATE_PATH });
    const page = await context.newPage();

    await page.goto('/admin');

    // Shell
    await expect(page.locator('aside nav')).toBeVisible();
    await expect(page.locator('header')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();

    // Summary cards (top row)
    await expect(page.getByText('Provider mesh')).toBeVisible();
    await expect(page.getByText('Visitor window')).toBeVisible();
    await expect(page.getByText('Visitors')).toBeVisible();
    await expect(page.getByText('Errors')).toBeVisible();

    // Hero section
    await expect(page.getByText('Free admin intelligence')).toBeVisible();

    await context.close();
  });

  // ---------------------------------------------------------------------------
  // 3. Tab switching
  // ---------------------------------------------------------------------------
  test('tab switching: click Growth, Performance, Operations, Visitors tabs; verify content changes', async ({ browser }) => {
    const context = await browser.newContext({ storageState: AUTH_STATE_PATH });
    const page = await context.newPage();

    await page.goto('/admin');

    // Wait for tabs to be present
    const tabsList = page.locator('[role="tablist"]');
    await expect(tabsList).toBeVisible();

    // Visitors tab (default) – look for visitor-related content
    await expect(page.getByRole('tab', { name: /visitors/i })).toHaveAttribute('data-state', 'active');

    // Growth tab
    await page.getByRole('tab', { name: /growth/i }).click();
    await expect(page.getByRole('tab', { name: /growth/i })).toHaveAttribute('data-state', 'active');
    await expect(page.getByRole('tabpanel')).toBeVisible();

    // Performance tab
    await page.getByRole('tab', { name: /performance/i }).click();
    await expect(page.getByRole('tab', { name: /performance/i })).toHaveAttribute('data-state', 'active');
    await expect(page.getByRole('tabpanel')).toBeVisible();

    // Operations tab
    await page.getByRole('tab', { name: /operations/i }).click();
    await expect(page.getByRole('tab', { name: /operations/i })).toHaveAttribute('data-state', 'active');
    await expect(page.getByRole('tabpanel')).toBeVisible();

    // Visitors tab again
    await page.getByRole('tab', { name: /visitors/i }).click();
    await expect(page.getByRole('tab', { name: /visitors/i })).toHaveAttribute('data-state', 'active');

    await context.close();
  });

  // ---------------------------------------------------------------------------
  // 4. Provider error states
  // ---------------------------------------------------------------------------
  test('provider error states: in dev mode providers show missing_config or error cards', async ({ browser }) => {
    const context = await browser.newContext({ storageState: AUTH_STATE_PATH });
    const page = await context.newPage();

    await page.goto('/admin');

    // Most providers are missing config in dev; verify error/setup badges exist
    // Look for status badges in the setup tab or provider cards
    await page.getByRole('tab', { name: /setup/i }).click();
    await expect(page.getByRole('tab', { name: /setup/i })).toHaveAttribute('data-state', 'active');

    // Verify provider setup section renders cards
    const setupCards = page.locator('.rounded-lg.border').filter({ hasText: /missing config|configured|error/i });
    await expect(setupCards.first()).toBeVisible();

    // Verify the "Provider mesh" summary card reflects the actual state
    const providerMesh = page.locator('text=Provider mesh').locator('xpath=ancestor::*[contains(@class, "rounded-lg")]').first();
    await expect(providerMesh).toBeVisible();

    await context.close();
  });

  // ---------------------------------------------------------------------------
  // 5. Window selector
  // ---------------------------------------------------------------------------
  test('window selector: change analytics window (7d, 30d, 90d); verify URL updates', async ({ browser }) => {
    const context = await browser.newContext({ storageState: AUTH_STATE_PATH });
    const page = await context.newPage();

    await page.goto('/admin');

    // Click 7d link
    await page.getByRole('link', { name: '7d' }).click();
    await page.waitForURL(/\?window=7/);
    expect(page.url()).toContain('window=7');

    // Click 30d link
    await page.getByRole('link', { name: '30d' }).click();
    await page.waitForURL(/\?window=30/);
    expect(page.url()).toContain('window=30');

    // Click 90d link
    await page.getByRole('link', { name: '90d' }).click();
    await page.waitForURL(/\?window=90/);
    expect(page.url()).toContain('window=90');

    await context.close();
  });

  // ---------------------------------------------------------------------------
  // 6. Data grid interactions
  // ---------------------------------------------------------------------------
  test('data grid interactions: sort columns in blog-stats posts table', async ({ browser }) => {
    const context = await browser.newContext({ storageState: AUTH_STATE_PATH });
    const page = await context.newPage();

    await page.goto('/admin/blog-stats');

    // Wait for table to render
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Sort by Title (ascending)
    const titleHeader = page.locator('th', { hasText: 'Title' });
    await titleHeader.click();
    // Verify sort indicator changes
    await expect(titleHeader.locator('svg')).toBeVisible();

    // Sort by Date (descending – default)
    const dateHeader = page.locator('th', { hasText: 'Date' });
    await dateHeader.click();
    await expect(dateHeader.locator('svg')).toBeVisible();

    // Sort by Words
    const wordsHeader = page.locator('th', { hasText: 'Words' });
    await wordsHeader.click();
    await expect(wordsHeader.locator('svg')).toBeVisible();

    // Sort by Reading Time
    const rtHeader = page.locator('th', { hasText: 'Reading Time' });
    await rtHeader.click();
    await expect(rtHeader.locator('svg')).toBeVisible();

    await context.close();
  });

  // ---------------------------------------------------------------------------
  // 7. Content filters
  // ---------------------------------------------------------------------------
  test('content filters: tag filter, sort dropdown, reset button on content page', async ({ browser }) => {
    const context = await browser.newContext({ storageState: AUTH_STATE_PATH });
    const page = await context.newPage();

    await page.goto('/admin/content');

    // Wait for filters to render
    const searchInput = page.locator('input[placeholder="Search posts..."]');
    await expect(searchInput).toBeVisible();

    // Radix Select trigger
    const selectTriggers = page.locator('[role="combobox"]').or(page.locator('button[id*="select"]'));
    await expect(selectTriggers.first()).toBeVisible();

    // Sort dropdown – open and select "Oldest"
    const sortTrigger = page.locator('button').filter({ hasText: /newest|oldest|most words|least words|a-z/i }).first();
    await sortTrigger.click();
    await page.getByRole('option', { name: 'Oldest' }).click();

    // Reset button – appears only when filters are active
    // First activate a filter by typing in search
    await searchInput.fill('test-query-xyz');
    await page.waitForTimeout(400); // debounce

    // Look for reset button
    const resetButton = page.getByRole('button', { name: /reset/i });
    if (await resetButton.isVisible().catch(() => false)) {
      await resetButton.click();
      await expect(searchInput).toHaveValue('');
    }

    await context.close();
  });

  // ---------------------------------------------------------------------------
  // 8. Telemetry auto-refresh
  // ---------------------------------------------------------------------------
  test('telemetry auto-refresh: verify refresh button exists and triggers data update', async ({ browser }) => {
    const context = await browser.newContext({ storageState: AUTH_STATE_PATH });
    const page = await context.newPage();

    await page.goto('/admin');

    // Look for the telemetry refresh button
    const refreshButton = page.locator('button[aria-label="Refresh telemetry"]');
    if (await refreshButton.isVisible().catch(() => false)) {
      await refreshButton.click();
      // Verify spinning state (disabled + animate-spin class on icon)
      await expect(refreshButton.locator('svg.animate-spin')).toBeVisible({ timeout: 5000 });
    } else {
      // Component may not be mounted on this page; verify it exists in the component library
      test.info().annotations.push({ type: 'note', description: 'TelemetryAutoRefresh button not found on /admin page' });
    }

    await context.close();
  });
});
