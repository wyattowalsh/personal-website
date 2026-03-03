import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { eq } from 'drizzle-orm'
import { sketches, studioUsers } from '../../lib/studio/schema'

function getDb() {
  const client = neon(process.env.POSTGRES_URL!)
  return drizzle(client)
}

export async function seedTestUser(
  id: string,
  name: string,
  email: string,
): Promise<void> {
  const db = getDb()

  const existing = await db
    .select()
    .from(studioUsers)
    .where(eq(studioUsers.id, id))
    .limit(1)

  if (existing.length > 0) return

  await db.insert(studioUsers).values({
    id,
    name,
    email,
    image: null,
    provider: 'test',
    providerId: 'test-provider-id',
  })
}

export async function seedSketches(
  authorId: string,
  count: number = 3,
  options: {
    titlePrefix?: string
    createdAt?: Date
  } = {},
): Promise<string[]> {
  const db = getDb()
  const ids: string[] = []
  const titlePrefix = options.titlePrefix ?? 'Test Sketch'

  for (let i = 0; i < count; i++) {
    const [sketch] = await db
      .insert(sketches)
      .values({
        title: `${titlePrefix} ${i + 1}`,
        description: `A test sketch for E2E tests (${i + 1})`,
        code: `function setup() { createCanvas(400, 400); }\nfunction draw() { background(${i * 50}); }`,
        engine: 'p5js',
        tags: ['test', `tag-${i}`],
        authorId,
        isPublic: true,
        ...(options.createdAt
          ? {
              createdAt: options.createdAt,
              updatedAt: options.createdAt,
            }
          : {}),
      })
      .returning()
    ids.push(sketch.id)
  }

  return ids
}

export async function cleanupSketches(authorId: string): Promise<void> {
  const db = getDb()
  await db.delete(sketches).where(eq(sketches.authorId, authorId))
}

export async function seedPrivateSketch(
  authorId: string,
): Promise<string> {
  const db = getDb()
  const [sketch] = await db
    .insert(sketches)
    .values({
      title: 'Private Sketch',
      description: 'A private test sketch',
      code: 'function setup() { createCanvas(100, 100); }',
      engine: 'p5js',
      tags: ['test'],
      authorId,
      isPublic: false,
    })
    .returning()
  return sketch.id
}

export async function cleanupTestData(authorId: string): Promise<void> {
  const db = getDb()
  await db.delete(sketches).where(eq(sketches.authorId, authorId))
  await db.delete(studioUsers).where(eq(studioUsers.id, authorId))
}
