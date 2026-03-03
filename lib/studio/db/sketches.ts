import { eq, and, desc, sql, ilike, or, type SQL } from 'drizzle-orm'
import { sketches, sketchViews, studioUsers } from '../schema'
import type { Sketch, SketchSummary, OwnedSketchSummary } from '../types'
import { getDb } from './connection'
import { toSketch, toSketchSummary, escapeLike } from './mappers'
import {
  buildCreatedAtIdCursor,
  buildLikeCountCursor,
  buildTrendingCursor,
  parseCreatedAtIdCursor,
  parseLikeCountCursor,
  parseTrendingCursor,
} from './cursor-pagination'

// --- Sketch operations ---

export async function getRecentSketches(options: {
  sort: 'recent' | 'popular' | 'trending'
  limit: number
  offset: number
  cursor?: string
  author?: string
  tag?: string
  engine?: string
  search?: string
}): Promise<{ sketches: SketchSummary[]; total: number; nextCursor: string | null }> {
  const conditions = [eq(sketches.isPublic, true)]

  if (options.author) conditions.push(eq(sketches.authorId, options.author))
  if (options.engine) conditions.push(eq(sketches.engine, options.engine))
  if (options.tag) conditions.push(sql`${options.tag} = ANY(${sketches.tags})`)
  if (options.search) {
    const escaped = escapeLike(options.search)
    conditions.push(
      or(
        ilike(sketches.title, `%${escaped}%`),
        ilike(sketches.description, `%${escaped}%`),
        ilike(studioUsers.name, `%${escaped}%`)
      )!
    )
  }

  const defaultAsOf = new Date()
  const recentCursor = options.sort === 'recent' && options.cursor
    ? parseCreatedAtIdCursor(options.cursor)
    : null
  const popularCursor = options.sort === 'popular' && options.cursor
    ? parseLikeCountCursor(options.cursor)
    : null
  const trendingCursor = options.sort === 'trending' && options.cursor
    ? parseTrendingCursor(options.cursor, defaultAsOf)
    : null
  const hasValidCursor = Boolean(recentCursor || popularCursor || trendingCursor)

  // Determine ordering (secondary sort by id DESC for stable cursor pagination)
  const trendingAsOf = trendingCursor?.asOf ?? defaultAsOf
  const trendingScoreExpr = sql<number>`(${sketches.likeCount} + 1)::float / POWER((GREATEST(0, EXTRACT(EPOCH FROM (${trendingAsOf}::timestamptz - ${sketches.createdAt}))) / 3600.0) + 2.0, 1.5)`
  let cursorWhere: SQL | undefined
  if (recentCursor) {
    cursorWhere = sql`(${sketches.createdAt}, ${sketches.id}) < (${recentCursor.createdAt.toISOString()}::timestamptz, ${recentCursor.id}::uuid)`
  } else if (popularCursor) {
    cursorWhere = sql`(${sketches.likeCount}, ${sketches.id}) < (${popularCursor.likeCount}, ${popularCursor.id}::uuid)`
  } else if (trendingCursor) {
    cursorWhere = sql`(${trendingScoreExpr}, ${sketches.id}) < (${trendingCursor.score}::double precision, ${trendingCursor.id}::uuid)`
  }
  if (cursorWhere) conditions.push(cursorWhere)
  const where = and(...conditions)

  let orderBy
  if (options.sort === 'popular') {
    orderBy = [desc(sketches.likeCount), desc(sketches.id)]
  } else if (options.sort === 'trending') {
    // Hacker News-style hot ranking: (likes + 1) / (hours_old + 2)^1.5
    orderBy = [sql`${trendingScoreExpr} DESC`, desc(sketches.id)]
  } else {
    orderBy = [desc(sketches.createdAt), desc(sketches.id)]
  }

  // When a cursor is provided, skip offset (cursor provides the position)
  const useOffset = !hasValidCursor

  const [rows, countResult] = await Promise.all([
    getDb()
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
        ...(options.sort === 'trending' ? {
          trendingScoreCursor: sql<string>`${trendingScoreExpr}::text`,
        } : {}),
      })
      .from(sketches)
      .innerJoin(studioUsers, eq(sketches.authorId, studioUsers.id))
      .where(where)
      .orderBy(...orderBy)
      .limit(options.limit)
      .offset(useOffset ? options.offset : 0),
    getDb()
      .select({ count: sql<number>`count(*)::int` })
      .from(sketches)
      .innerJoin(studioUsers, eq(sketches.authorId, studioUsers.id))
      .where(where),
  ])

  // Build nextCursor from last row for all sort modes
  let nextCursor: string | null = null
  if (rows.length === options.limit) {
    const last = rows[rows.length - 1]
    if (options.sort === 'recent') {
      nextCursor = buildCreatedAtIdCursor(last.createdAt, last.id)
    } else if (options.sort === 'popular') {
      nextCursor = buildLikeCountCursor(last.likeCount, last.id)
    } else if (options.sort === 'trending') {
      const score = (last as typeof last & { trendingScoreCursor: string }).trendingScoreCursor
      nextCursor = buildTrendingCursor(score, last.id, trendingAsOf)
    }
  }

  return {
    sketches: rows.map(toSketchSummary),
    total: countResult[0]?.count ?? 0,
    nextCursor,
  }
}

export async function getSketchById(
  id: string,
  viewerId?: string | null
): Promise<(Sketch & { authorName: string; authorImage: string | null }) | null> {
  const rows = await getDb()
    .select({
      id: sketches.id,
      title: sketches.title,
      description: sketches.description,
      code: sketches.code,
      engine: sketches.engine,
      tags: sketches.tags,
      thumbnailUrl: sketches.thumbnailUrl,
      authorId: sketches.authorId,
      authorName: studioUsers.name,
      authorImage: studioUsers.image,
      forkedFrom: sketches.forkedFrom,
      likeCount: sketches.likeCount,
      viewCount: sketches.viewCount,
      isPublic: sketches.isPublic,
      config: sketches.config,
      slug: sketches.slug,
      createdAt: sketches.createdAt,
      updatedAt: sketches.updatedAt,
    })
    .from(sketches)
    .innerJoin(studioUsers, eq(sketches.authorId, studioUsers.id))
    .where(eq(sketches.id, id))
    .limit(1)

  if (rows.length === 0) return null

  const r = rows[0]
  // Enforce privacy: non-public sketches are only visible to the author
  if (!r.isPublic && r.authorId !== viewerId) return null

  return {
    id: r.id,
    title: r.title,
    description: r.description ?? '',
    code: r.code,
    engine: r.engine as Sketch['engine'],
    tags: (r.tags ?? []) as string[],
    thumbnailUrl: r.thumbnailUrl,
    authorId: r.authorId,
    authorName: r.authorName ?? 'Anonymous',
    authorImage: r.authorImage,
    forkedFrom: r.forkedFrom,
    likeCount: r.likeCount,
    viewCount: r.viewCount,
    isPublic: r.isPublic,
    config: r.config as Sketch['config'],
    slug: r.slug,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }
}

export async function createSketch(
  data: {
    title: string
    description: string
    code: string
    engine: string
    tags: string[]
    forkedFrom?: string
    config?: Sketch['config']
  },
  authorId: string
): Promise<Sketch> {
  const [row] = await getDb()
    .insert(sketches)
    .values({
      title: data.title,
      description: data.description,
      code: data.code,
      engine: data.engine,
      tags: data.tags,
      forkedFrom: data.forkedFrom ?? null,
      config: data.config ?? null,
      authorId,
    })
    .returning()

  return toSketch(row)
}

export async function updateSketch(
  id: string,
  data: {
    title?: string
    description?: string
    code?: string
    tags?: string[]
    isPublic?: boolean
    config?: Sketch['config']
  },
  authorId: string
): Promise<Sketch | null> {
  const updateData: Record<string, unknown> = { updatedAt: new Date() }
  if (data.title !== undefined) updateData.title = data.title
  if (data.description !== undefined) updateData.description = data.description
  if (data.code !== undefined) updateData.code = data.code
  if (data.tags !== undefined) updateData.tags = data.tags
  if (data.isPublic !== undefined) updateData.isPublic = data.isPublic
  if (data.config !== undefined) updateData.config = data.config

  const rows = await getDb()
    .update(sketches)
    .set(updateData)
    .where(and(eq(sketches.id, id), eq(sketches.authorId, authorId)))
    .returning()

  if (rows.length === 0) return null
  return toSketch(rows[0])
}

export async function deleteSketch(id: string, authorId: string): Promise<boolean> {
  const deleted = await getDb()
    .delete(sketches)
    .where(and(eq(sketches.id, id), eq(sketches.authorId, authorId)))
    .returning({ id: sketches.id })
  return deleted.length > 0
}

export async function recordSketchView(
  sketchId: string,
  viewerHash: string
): Promise<boolean> {
  const db = getDb()
  const inserted = await db
    .insert(sketchViews)
    .values({ sketchId, viewerHash })
    .onConflictDoNothing({ target: [sketchViews.sketchId, sketchViews.viewerHash] })
    .returning({ id: sketchViews.id })

  if (inserted.length === 0) return false

  const updated = await db
    .update(sketches)
    .set({ viewCount: sql`GREATEST(0, ${sketches.viewCount} + 1)` })
    .where(eq(sketches.id, sketchId))
    .returning({ id: sketches.id })

  return updated.length > 0
}

export async function updateThumbnailUrl(id: string, url: string, authorId: string): Promise<boolean> {
  const rows = await getDb()
    .update(sketches)
    .set({ thumbnailUrl: url, updatedAt: new Date() })
    .where(and(eq(sketches.id, id), eq(sketches.authorId, authorId)))
    .returning({ id: sketches.id })
  return rows.length > 0
}

export async function getRelatedSketches(
  sketchId: string,
  tags: string[],
  limit: number = 6
): Promise<SketchSummary[]> {
  if (tags.length === 0) return []

  const tagArray = sql`ARRAY[${sql.join(tags.map(t => sql`${t}`), sql`, `)}]::text[]`

  const rows = await getDb()
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
      overlapCount: sql<number>`coalesce(array_length(${sketches.tags} & ${tagArray}, 1), 0)`.as('overlap_count'),
    })
    .from(sketches)
    .innerJoin(studioUsers, eq(sketches.authorId, studioUsers.id))
    .where(
      and(
        eq(sketches.isPublic, true),
        sql`${sketches.id} != ${sketchId}::uuid`,
        sql`${sketches.tags} && ${tagArray}`
      )
    )
    .orderBy(
      sql`overlap_count DESC`,
      desc(sketches.createdAt)
    )
    .limit(limit)

  return rows.map(toSketchSummary)
}

export async function getUserSketches(
  userId: string,
  limit: number,
  offset: number,
  viewerId?: string | null
): Promise<SketchSummary[]> {
  // Show all sketches to the author, only public ones to other viewers
  const conditions = [eq(sketches.authorId, userId)]
  if (viewerId !== userId) {
    conditions.push(eq(sketches.isPublic, true))
  }

  const rows = await getDb()
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
    .from(sketches)
    .innerJoin(studioUsers, eq(sketches.authorId, studioUsers.id))
    .where(and(...conditions))
    .orderBy(desc(sketches.createdAt))
    .limit(limit)
    .offset(offset)

  return rows.map(toSketchSummary)
}

export async function getOwnedSketches(
  userId: string,
  limit: number,
  offset: number
): Promise<OwnedSketchSummary[]> {
  const rows = await getDb()
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
      isPublic: sketches.isPublic,
      createdAt: sketches.createdAt,
    })
    .from(sketches)
    .innerJoin(studioUsers, eq(sketches.authorId, studioUsers.id))
    .where(eq(sketches.authorId, userId))
    .orderBy(desc(sketches.createdAt))
    .limit(limit)
    .offset(offset)

  return rows.map((r) => ({
    ...toSketchSummary(r),
    isPublic: r.isPublic,
  }))
}
