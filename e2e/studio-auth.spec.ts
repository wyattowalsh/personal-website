import { test, expect } from '@playwright/test'
import { cleanupSketches, cleanupTestData, seedSketches, seedTestUser, seedPrivateSketch } from './helpers/seed'

const TEST_USER_ID = '00000000-0000-4000-a000-000000000001'
const IDEMPOTENCY_KEY_HEADER = 'idempotency-key'

function createIdempotencyKey(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`
}

test.describe('Studio Auth', () => {
  const createdSketchIds: string[] = []

  test.afterAll(async () => {
    await cleanupSketches(TEST_USER_ID)
  })

  // --- Tests 1 & 2: Unauthenticated (override storageState) ---

  test.describe('unauthenticated', () => {
    test.use({ storageState: { cookies: [], origins: [] } })

    test('Sign-in button is visible when not authenticated', async ({ page }) => {
      await page.goto('/studio')
      await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
    })

    test('Sign-in opens provider selection dialog', async ({ page }) => {
      await page.goto('/studio')

      const signInButton = page.getByRole('button', { name: 'Sign in' })
      await signInButton.click()

      // The AuthButton opens a dialog with OAuth provider buttons
      await expect(
        page.getByRole('button', { name: /Continue with GitHub/i })
      ).toBeVisible()
      await expect(
        page.getByRole('button', { name: /Continue with Google/i })
      ).toBeVisible()
    })

    test('POST /api/studio/sketches returns 401 when unauthenticated', async ({
      page,
    }) => {
      const response = await page.request.post('/api/studio/sketches', {
        headers: { 'Content-Type': 'application/json' },
        data: { title: 'Unauthorized test', code: 'test', engine: 'p5js' },
      })
      expect(response.status()).toBe(401)
    })

    test('DELETE /api/studio/sketches/:id returns 401 when unauthenticated', async ({
      page,
    }) => {
      const response = await page.request.delete(
        '/api/studio/sketches/00000000-0000-4000-a000-000000000000',
      )
      expect(response.status()).toBe(401)
    })

    test('PATCH /api/studio/sketches/:id returns 401 when unauthenticated', async ({
      page,
    }) => {
      const response = await page.request.patch(
        '/api/studio/sketches/00000000-0000-4000-a000-000000000000',
        {
          headers: { 'Content-Type': 'application/json' },
          data: { title: 'Unauthorized update' },
        },
      )
      expect(response.status()).toBe(401)
    })
  })

  // --- Tests 3-6: Authenticated (uses storageState from setup project) ---

  test('shows signed-in state with user info', async ({ page }) => {
    await page.goto('/studio')
    await page.waitForLoadState('networkidle')

    // "Sign in" button should NOT be visible when authenticated
    await expect(page.getByRole('button', { name: 'Sign in' })).not.toBeVisible()

    // Should show "Sign out" button and user name/avatar
    await expect(page.getByRole('button', { name: /Sign out/i })).toBeVisible()
  })

  test('GET /api/studio/health exposes latency SLI for authenticated sessions', async ({
    page,
  }) => {
    const response = await page.request.get('/api/studio/health')
    expect([200, 503]).toContain(response.status())

    const body = await response.json() as {
      sli?: { availability?: number; latencyMs?: number }
      dependencies?: { database?: { status?: string } }
    }
    expect(typeof body.sli?.availability).toBe('number')
    expect(typeof body.sli?.latencyMs).toBe('number')
    expect((body.sli?.latencyMs ?? -1)).toBeGreaterThanOrEqual(0)
    expect(typeof body.dependencies?.database?.status).toBe('string')
  })

  test('can save a sketch via API', async ({ page }) => {
    // Use the authenticated page context to make API requests
    const response = await page.request.post('/api/studio/sketches', {
      headers: { 'Content-Type': 'application/json' },
      data: {
        title: 'E2E Test Sketch',
        code: 'function setup() { createCanvas(400, 400); }\nfunction draw() { background(0); }',
        engine: 'p5js',
        tags: ['test'],
      },
    })

    expect(response.status()).toBe(201)

    const body = await response.json()
    expect(body).toHaveProperty('id')
    expect(body).toHaveProperty('title', 'E2E Test Sketch')
    expect(body).toHaveProperty('code')
    expect(body).toHaveProperty('engine', 'p5js')

    // Track for cleanup
    createdSketchIds.push(body.id)
  })

  test('POST /api/studio/sketches is idempotent for matching key and payload', async ({
    page,
  }) => {
    const idempotencyKey = createIdempotencyKey('studio-create')
    const title = `Idempotent sketch ${Date.now()}`
    const payload = {
      title,
      code: 'function setup() { createCanvas(320, 240); }\nfunction draw() { background(20); }',
      engine: 'p5js',
      tags: ['idempotency'],
    }

    const firstResponse = await page.request.post('/api/studio/sketches', {
      headers: {
        'Content-Type': 'application/json',
        [IDEMPOTENCY_KEY_HEADER]: idempotencyKey,
      },
      data: payload,
    })
    expect(firstResponse.status()).toBe(201)
    const firstBody = await firstResponse.json() as { id: string; title: string }
    createdSketchIds.push(firstBody.id)

    const replayResponse = await page.request.post('/api/studio/sketches', {
      headers: {
        'Content-Type': 'application/json',
        [IDEMPOTENCY_KEY_HEADER]: idempotencyKey,
      },
      data: payload,
    })
    expect(replayResponse.status()).toBe(201)
    const replayBody = await replayResponse.json() as { id: string; title: string }
    expect(replayBody.id).toBe(firstBody.id)
    expect(replayBody.title).toBe(title)

    const listResponse = await page.request.get(
      `/api/studio/sketches?author=${TEST_USER_ID}&search=${encodeURIComponent(title)}&limit=50`
    )
    expect(listResponse.ok()).toBe(true)
    const listBody = await listResponse.json() as {
      sketches: Array<{ id: string; title: string }>
    }
    const matchingIds = listBody.sketches
      .filter((sketch) => sketch.title === title)
      .map((sketch) => sketch.id)
    expect(matchingIds).toEqual([firstBody.id])
  })

  test('POST /api/studio/sketches rejects reused idempotency key for different payload', async ({
    page,
  }) => {
    const idempotencyKey = createIdempotencyKey('studio-conflict')
    const firstTitle = `Idempotent conflict A ${Date.now()}`
    const secondTitle = `Idempotent conflict B ${Date.now()}`

    const firstResponse = await page.request.post('/api/studio/sketches', {
      headers: {
        'Content-Type': 'application/json',
        [IDEMPOTENCY_KEY_HEADER]: idempotencyKey,
      },
      data: {
        title: firstTitle,
        code: 'function setup() { createCanvas(200, 200); }',
        engine: 'p5js',
      },
    })
    expect(firstResponse.status()).toBe(201)
    const firstBody = await firstResponse.json() as { id: string }
    createdSketchIds.push(firstBody.id)

    const conflictResponse = await page.request.post('/api/studio/sketches', {
      headers: {
        'Content-Type': 'application/json',
        [IDEMPOTENCY_KEY_HEADER]: idempotencyKey,
      },
      data: {
        title: secondTitle,
        code: 'function setup() { createCanvas(201, 201); }',
        engine: 'p5js',
      },
    })
    expect(conflictResponse.status()).toBe(409)
    const conflictBody = await conflictResponse.json() as {
      error?: { message?: string }
    }
    expect(conflictBody.error?.message).toContain('cannot be reused')
  })

  test('can load own sketch in edit view', async ({ page }) => {
    // Seed a sketch to edit
    const [sketchId] = await seedSketches(TEST_USER_ID, 1)
    createdSketchIds.push(sketchId)

    await page.goto(`/studio/${sketchId}/edit`)
    await page.waitForLoadState('networkidle')

    // The SketchEditor should be rendered with the code loaded.
    // Prefer the stable Studio editor test hook, but keep fallbacks while migrating.
    const editorArea = page.locator('[data-testid="code-editor"], .monaco-editor, textarea')
    await expect(editorArea.first()).toBeVisible({ timeout: 10_000 })
  })

  test('can delete own sketch via API', async ({ page }) => {
    // Seed a sketch to delete
    const [sketchId] = await seedSketches(TEST_USER_ID, 1)

    // Delete the sketch
    const deleteResponse = await page.request.delete(
      `/api/studio/sketches/${sketchId}`,
    )
    expect(deleteResponse.status()).toBe(204)

    // Verify the sketch is gone
    const getResponse = await page.request.get(
      `/api/studio/sketches/${sketchId}`,
    )
    expect(getResponse.status()).toBe(404)
  })

  test.describe('authorization (IDOR)', () => {
    const IDOR_USER_ID = '00000000-0000-4000-a000-000000000099'
    let privateSketchId: string
    let otherSketchId: string

    test.beforeAll(async () => {
      await seedTestUser(IDOR_USER_ID, 'Other User', 'other@test.com')
      privateSketchId = await seedPrivateSketch(IDOR_USER_ID)
      const [publicId] = await seedSketches(IDOR_USER_ID, 1)
      otherSketchId = publicId
    })

    test.afterAll(async () => {
      await cleanupTestData(IDOR_USER_ID)
    })

    test('cannot read another user private sketch', async ({ page }) => {
      const response = await page.request.get(
        `/api/studio/sketches/${privateSketchId}`,
      )
      expect(response.status()).toBe(404)
    })

    test('cannot delete another user sketch', async ({ page }) => {
      const response = await page.request.delete(
        `/api/studio/sketches/${otherSketchId}`,
      )
      // Should return 404 (not found for this user) rather than 204
      expect(response.status()).toBe(404)
    })

    test('cannot update another user sketch', async ({ page }) => {
      const response = await page.request.patch(
        `/api/studio/sketches/${otherSketchId}`,
        {
          headers: { 'Content-Type': 'application/json' },
          data: { title: 'should-not-update' },
        }
      )
      expect(response.status()).toBe(404)
    })
  })
})
