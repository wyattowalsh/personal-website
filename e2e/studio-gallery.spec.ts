import { test, expect, type Page } from '@playwright/test'
import { seedTestUser, seedSketches, cleanupTestData } from './helpers/seed'
import { waitForEditorReady, getEditorVisibleText } from './helpers/editor'

const TEST_AUTHOR_ID = '00000000-0000-4000-a000-000000000003'
const CURSOR_AUTHOR_ID = '00000000-0000-4000-a000-000000000004'

async function gotoGallery(page: Page) {
  await page.goto('/studio')
  await expect(page.getByRole('link', { name: /Create New/ })).toBeVisible({
    timeout: 30_000,
  })
}

test.describe('Studio Gallery', () => {
  test.describe('without seeded data', () => {
    test('empty gallery shows no sketches message when search has no results', async ({
      page,
    }) => {
      await gotoGallery(page)

      const searchInput = page.getByLabel('Search sketches')
      await searchInput.fill('zzz_nonexistent_xyz')

      await expect(page.getByText('No sketches found.')).toBeVisible()
    })

    test('gallery page preserves key accessibility semantics', async ({ page }) => {
      await gotoGallery(page)

      const skipToContent = page.getByRole('link', { name: 'Skip to content' })
      await page.keyboard.press('Tab')
      await expect(skipToContent).toBeFocused()
      await expect(page.getByRole('navigation', { name: 'Studio navigation' })).toBeVisible()
      await expect(page.getByLabel('Search sketches')).toBeVisible()
    })

    test('Create New link is always visible', async ({ page }) => {
      await gotoGallery(page)

      const createNewLink = page.getByRole('link', { name: /Create New/ })
      await expect(createNewLink).toBeVisible()
      await expect(createNewLink).toHaveAttribute('href', '/studio/new')
    })

    test('auth providers endpoint returns configured providers', async ({
      page,
    }) => {
      const response = await page.request.get('/api/auth/providers')
      expect(response.ok()).toBe(true)

      const providers = await response.json()
      const hasGoogleEnv = Boolean(
        process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_ID
      )
      const hasGithubEnv = Boolean(
        process.env.AUTH_GITHUB_ID || process.env.GITHUB_CLIENT_ID || process.env.GITHUB_ID
      )

      if (hasGoogleEnv) {
        expect(providers).toHaveProperty('google')
      } else {
        expect(providers).not.toHaveProperty('google')
      }

      if (hasGithubEnv) {
        expect(providers).toHaveProperty('github')
      } else {
        expect(providers).not.toHaveProperty('github')
      }
    })

    test('sort buttons are visible', async ({ page }) => {
      await gotoGallery(page)

      await expect(
        page.getByRole('button', { name: 'Recent' })
      ).toBeVisible()
      await expect(
        page.getByRole('button', { name: 'Popular' })
      ).toBeVisible()
    })

    test('studio health endpoint enforces auth or exposes latency SLI', async ({ page }) => {
      const response = await page.request.get('/api/studio/health')
      expect([200, 401, 503]).toContain(response.status())

      const body = await response.json() as {
        sli?: { availability?: number; latencyMs?: number }
        dependencies?: { database?: { status?: string } }
      }
      if (response.status() === 401) {
        return
      }
      expect(typeof body.sli?.availability).toBe('number')
      expect(typeof body.sli?.latencyMs).toBe('number')
      expect((body.sli?.latencyMs ?? -1)).toBeGreaterThanOrEqual(0)
      expect(typeof body.dependencies?.database?.status).toBe('string')
    })
  })

  test.describe('with seeded data', () => {
    let sketchIds: string[] = []

    test.beforeAll(async () => {
      await seedTestUser(TEST_AUTHOR_ID, 'Gallery Tester', 'gallery@test.com')
      sketchIds = await seedSketches(TEST_AUTHOR_ID, 3)
    })

    test.afterAll(async () => {
      await cleanupTestData(TEST_AUTHOR_ID)
    })

    test('gallery shows seeded sketch cards', async ({ page }) => {
      await gotoGallery(page)

      await expect(page.getByText('Test Sketch 1', { exact: true })).toBeVisible()
      await expect(page.getByText('Test Sketch 2', { exact: true })).toBeVisible()
      await expect(page.getByText('Test Sketch 3', { exact: true })).toBeVisible()
    })

    test('search input filters sketches', async ({ page }) => {
      await gotoGallery(page)

      const searchInput = page.getByLabel('Search sketches')
      await searchInput.fill('Sketch 1')

      // Wait for client-side filter to take effect
      await expect(page.getByText('Test Sketch 1', { exact: true })).toBeVisible()
      await expect(page.getByText('Test Sketch 2', { exact: true })).not.toBeVisible()
      await expect(page.getByText('Test Sketch 3', { exact: true })).not.toBeVisible()
    })

    test('sketch detail page shows title and Remix button', async ({
      page,
    }) => {
      const sketchId = sketchIds[0]
      await page.goto(`/studio/${sketchId}`)

      await expect(
        page.getByRole('heading', { name: 'Test Sketch 1' })
      ).toBeVisible()
      await expect(
        page.getByRole('link', { name: /Remix/ })
      ).toBeVisible()
    })

    test('Remix button navigates to editor with fork param', async ({
      page,
    }) => {
      const sketchId = sketchIds[0]
      await page.goto(`/studio/${sketchId}`)

      const remixLink = page.getByRole('link', { name: /Remix/ })
      await expect(remixLink).toHaveAttribute(
        'href',
        `/studio/new?fork=${sketchId}`
      )

      await remixLink.click()

      // Verify we're on the new sketch page with the fork query param
      expect(page.url()).toContain(`/studio/new?fork=${sketchId}`)

      // The editor should be loaded with the forked sketch code
      await waitForEditorReady(page)
      const editorContent = await getEditorVisibleText(page)
      // Seeded sketch code contains createCanvas(400, 400)
      expect(editorContent).toContain('createCanvas(400, 400)')
    })

    test('Like button is disabled when not authenticated', async ({
      page,
    }) => {
      const sketchId = sketchIds[0]
      await page.goto(`/studio/${sketchId}`)

      const likeButton = page.getByRole('button', { name: /Like/ })
      await expect(likeButton).toBeVisible()
      await expect(likeButton).toBeDisabled()
    })

    test('API list endpoint returns sketches with expected shape', async ({
      page,
    }) => {
      const response = await page.request.get('/api/studio/sketches')
      expect(response.ok()).toBe(true)

      const data = await response.json()

      // Verify the response shape: { sketches: [...], total: number }
      expect(data).toHaveProperty('sketches')
      expect(data).toHaveProperty('total')
      expect(Array.isArray(data.sketches)).toBe(true)
      expect(typeof data.total).toBe('number')
      expect(data.total).toBeGreaterThanOrEqual(3)

      // Verify sketch objects have expected fields
      const sketch = data.sketches[0]
      expect(sketch).toHaveProperty('id')
      expect(sketch).toHaveProperty('title')
      expect(sketch).toHaveProperty('engine')
      expect(sketch).toHaveProperty('tags')
      expect(sketch).toHaveProperty('likeCount')
      expect(sketch).toHaveProperty('viewCount')
    })
  })

  test.describe('cursor pagination stability', () => {
    test.beforeAll(async () => {
      await seedTestUser(CURSOR_AUTHOR_ID, 'Cursor Tester', 'cursor@test.com')
      await seedSketches(CURSOR_AUTHOR_ID, 4, {
        titlePrefix: 'Cursor Stable Sketch',
        createdAt: new Date('2026-02-15T12:00:00.000Z'),
      })
    })

    test.afterAll(async () => {
      await cleanupTestData(CURSOR_AUTHOR_ID)
    })

    test('recent cursor pagination avoids duplicates with identical timestamps', async ({
      page,
    }) => {
      const page1Response = await page.request.get(
        `/api/studio/sketches?sort=recent&limit=2&author=${CURSOR_AUTHOR_ID}`
      )
      expect(page1Response.ok()).toBe(true)
      const page1 = await page1Response.json() as {
        sketches: Array<{ id: string }>
        nextCursor: string | null
      }

      expect(page1.sketches).toHaveLength(2)
      expect(page1.nextCursor).toBeTruthy()

      const page2Response = await page.request.get(
        `/api/studio/sketches?sort=recent&limit=2&author=${CURSOR_AUTHOR_ID}&cursor=${encodeURIComponent(page1.nextCursor!)}`
      )
      expect(page2Response.ok()).toBe(true)
      const page2 = await page2Response.json() as {
        sketches: Array<{ id: string }>
      }

      expect(page2.sketches).toHaveLength(2)

      const allIds = [...page1.sketches, ...page2.sketches].map((sketch) => sketch.id)
      expect(new Set(allIds).size).toBe(allIds.length)
    })

    test('popular cursor pagination avoids duplicates when like counts tie', async ({
      page,
    }) => {
      const page1Response = await page.request.get(
        `/api/studio/sketches?sort=popular&limit=2&author=${CURSOR_AUTHOR_ID}`
      )
      expect(page1Response.ok()).toBe(true)
      const page1 = await page1Response.json() as {
        sketches: Array<{ id: string }>
        nextCursor: string | null
      }

      expect(page1.sketches).toHaveLength(2)
      expect(page1.nextCursor).toBeTruthy()

      const page2Response = await page.request.get(
        `/api/studio/sketches?sort=popular&limit=2&author=${CURSOR_AUTHOR_ID}&cursor=${encodeURIComponent(page1.nextCursor!)}`
      )
      expect(page2Response.ok()).toBe(true)
      const page2 = await page2Response.json() as {
        sketches: Array<{ id: string }>
      }

      expect(page2.sketches).toHaveLength(2)

      const allIds = [...page1.sketches, ...page2.sketches].map((sketch) => sketch.id)
      expect(new Set(allIds).size).toBe(allIds.length)
    })

    test('trending cursor includes asOf anchor and paginates stably', async ({ page }) => {
      const page1Response = await page.request.get(
        `/api/studio/sketches?sort=trending&limit=2&author=${CURSOR_AUTHOR_ID}`
      )
      expect(page1Response.ok()).toBe(true)
      const page1 = await page1Response.json() as {
        sketches: Array<{ id: string }>
        nextCursor: string | null
      }

      expect(page1.sketches).toHaveLength(2)
      expect(page1.nextCursor).toBeTruthy()

      const cursorParts = page1.nextCursor!.split('|')
      expect(cursorParts).toHaveLength(3)
      expect(Number.isNaN(new Date(cursorParts[2]).getTime())).toBe(false)

      const page2Response = await page.request.get(
        `/api/studio/sketches?sort=trending&limit=2&author=${CURSOR_AUTHOR_ID}&cursor=${encodeURIComponent(page1.nextCursor!)}`
      )
      expect(page2Response.ok()).toBe(true)
      const page2 = await page2Response.json() as {
        sketches: Array<{ id: string }>
      }

      expect(page2.sketches).toHaveLength(2)

      const allIds = [...page1.sketches, ...page2.sketches].map((sketch) => sketch.id)
      expect(new Set(allIds).size).toBe(allIds.length)
    })
  })
})
