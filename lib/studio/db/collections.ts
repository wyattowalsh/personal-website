import { eq, and, desc, sql } from 'drizzle-orm'
import { sketches, studioUsers, studioCollections, studioCollectionItems } from '../schema'
import type { SketchSummary, Collection } from '../types'
import { getDb } from './connection'
import { toSketchSummary } from './mappers'

// --- Collection operations ---

export async function createCollection(
  ownerId: string,
  data: { name: string; description: string; isPublic: boolean }
): Promise<Collection> {
  const [row] = await getDb()
    .insert(studioCollections)
    .values({ ownerId, ...data })
    .returning()

  return {
    id: row.id,
    ownerId: row.ownerId,
    name: row.name,
    description: row.description ?? '',
    isPublic: row.isPublic,
    sketchCount: 0,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function getUserCollections(
  userId: string,
  limit = 50,
  offset = 0
): Promise<Collection[]> {
  const db = getDb()

  const rows = await db
    .select({
      id: studioCollections.id,
      ownerId: studioCollections.ownerId,
      name: studioCollections.name,
      description: studioCollections.description,
      isPublic: studioCollections.isPublic,
      createdAt: studioCollections.createdAt,
      updatedAt: studioCollections.updatedAt,
      sketchCount: sql<number>`count(${studioCollectionItems.sketchId})::int`,
    })
    .from(studioCollections)
    .leftJoin(studioCollectionItems, eq(studioCollectionItems.collectionId, studioCollections.id))
    .where(eq(studioCollections.ownerId, userId))
    .groupBy(studioCollections.id)
    .orderBy(desc(studioCollections.updatedAt))
    .limit(limit)
    .offset(offset)

  return rows.map(r => ({
    id: r.id,
    ownerId: r.ownerId,
    name: r.name,
    description: r.description ?? '',
    isPublic: r.isPublic,
    sketchCount: r.sketchCount,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }))
}

export async function getCollectionById(
  collectionId: string,
  viewerId?: string | null,
  options?: { limit?: number; offset?: number }
): Promise<(Collection & { sketches: SketchSummary[]; total: number }) | null> {
  const db = getDb()

  const rows = await db
    .select()
    .from(studioCollections)
    .where(eq(studioCollections.id, collectionId))
    .limit(1)

  if (rows.length === 0) return null
  const col = rows[0]
  const isOwnerViewer = col.ownerId === viewerId

  // Private collections only visible to owner
  if (!col.isPublic && !isOwnerViewer) return null

  const itemWhere = isOwnerViewer
    ? eq(studioCollectionItems.collectionId, collectionId)
    : and(eq(studioCollectionItems.collectionId, collectionId), eq(sketches.isPublic, true))

  const [items, [{ total }]] = await Promise.all([
    db
      .select({
        id: sketches.id,
        title: sketches.title,
        engine: sketches.engine,
        tags: sketches.tags,
        thumbnailUrl: sketches.thumbnailUrl,
        authorId: sketches.authorId,
        authorName: studioUsers.name,
        authorImage: studioUsers.image,
        likeCount: sketches.likeCount,
        viewCount: sketches.viewCount,
        createdAt: sketches.createdAt,
      })
      .from(studioCollectionItems)
      .innerJoin(sketches, eq(studioCollectionItems.sketchId, sketches.id))
      .innerJoin(studioUsers, eq(sketches.authorId, studioUsers.id))
      .where(itemWhere)
      .orderBy(desc(studioCollectionItems.addedAt))
      .limit(options?.limit ?? 50)
      .offset(options?.offset ?? 0),
    db
      .select({ total: sql<number>`count(*)::int` })
      .from(studioCollectionItems)
      .innerJoin(sketches, eq(studioCollectionItems.sketchId, sketches.id))
      .where(itemWhere),
  ])

  return {
    id: col.id,
    ownerId: col.ownerId,
    name: col.name,
    description: col.description ?? '',
    isPublic: col.isPublic,
    sketchCount: total,
    createdAt: col.createdAt.toISOString(),
    updatedAt: col.updatedAt.toISOString(),
    sketches: items.map(toSketchSummary),
    total,
  }
}

export async function addToCollection(
  collectionId: string,
  sketchId: string,
  ownerId: string
): Promise<boolean> {
  const db = getDb()

  // Verify ownership
  const col = await db
    .select({ ownerId: studioCollections.ownerId })
    .from(studioCollections)
    .where(eq(studioCollections.id, collectionId))
    .limit(1)

  if (col.length === 0 || col[0].ownerId !== ownerId) return false

  // Verify sketch exists and is accessible (public or owned by collection owner)
  const sketch = await db
    .select({ authorId: sketches.authorId, isPublic: sketches.isPublic })
    .from(sketches)
    .where(eq(sketches.id, sketchId))
    .limit(1)

  if (sketch.length === 0) return false
  if (!sketch[0].isPublic && sketch[0].authorId !== ownerId) return false

  await db
    .insert(studioCollectionItems)
    .values({ collectionId, sketchId })
    .onConflictDoNothing({ target: [studioCollectionItems.collectionId, studioCollectionItems.sketchId] })

  // Update collection's updatedAt
  await db
    .update(studioCollections)
    .set({ updatedAt: new Date() })
    .where(eq(studioCollections.id, collectionId))

  return true
}

export async function removeFromCollection(
  collectionId: string,
  sketchId: string,
  ownerId: string
): Promise<boolean> {
  const db = getDb()

  const col = await db
    .select({ ownerId: studioCollections.ownerId })
    .from(studioCollections)
    .where(eq(studioCollections.id, collectionId))
    .limit(1)

  if (col.length === 0 || col[0].ownerId !== ownerId) return false

  const deleted = await db
    .delete(studioCollectionItems)
    .where(
      and(
        eq(studioCollectionItems.collectionId, collectionId),
        eq(studioCollectionItems.sketchId, sketchId)
      )
    )
    .returning()

  return deleted.length > 0
}

export async function deleteCollection(
  collectionId: string,
  ownerId: string
): Promise<boolean> {
  const deleted = await getDb()
    .delete(studioCollections)
    .where(and(eq(studioCollections.id, collectionId), eq(studioCollections.ownerId, ownerId)))
    .returning({ id: studioCollections.id })
  return deleted.length > 0
}
