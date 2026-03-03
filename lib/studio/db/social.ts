import { eq, and, desc, sql, inArray, or } from 'drizzle-orm'
import { sketches, sketchLikes, sketchReports, studioUsers, sketchComments, studioFollows, studioNotifications, sketchBookmarks } from '../schema'
import type { SketchSummary, Comment, Notification } from '../types'
import { getDb } from './connection'
import { toSketchSummary, toComment, toNotification } from './mappers'
import { buildCreatedAtIdCursor, parseCreatedAtIdCursor } from './cursor-pagination'

// --- Social operations ---

type SketchAccessRow = {
  authorId: string
  isPublic: boolean
}

async function getSketchAccess(sketchId: string): Promise<SketchAccessRow | null> {
  const [row] = await getDb()
    .select({
      authorId: sketches.authorId,
      isPublic: sketches.isPublic,
    })
    .from(sketches)
    .where(eq(sketches.id, sketchId))
    .limit(1)

  return row ?? null
}

function canAccessSketch(sketch: SketchAccessRow | null, viewerId?: string | null): boolean {
  if (!sketch) return false
  return sketch.isPublic || sketch.authorId === viewerId
}

export async function toggleLike(
  sketchId: string,
  userId: string
): Promise<{ liked: boolean; count: number }> {
  const db = getDb()
  const sketch = await getSketchAccess(sketchId)
  if (!canAccessSketch(sketch, userId)) {
    return { liked: false, count: 0 }
  }

  // Atomic insert attempt — ON CONFLICT DO NOTHING returns 0 rows if like already exists
  const inserted = await db
    .insert(sketchLikes)
    .values({ sketchId, userId })
    .onConflictDoNothing({ target: [sketchLikes.sketchId, sketchLikes.userId] })
    .returning()

  const liked = inserted.length > 0

  if (!liked) {
    // Like already existed — remove it
    await db
      .delete(sketchLikes)
      .where(and(eq(sketchLikes.sketchId, sketchId), eq(sketchLikes.userId, userId)))
  }

  // Atomically increment/decrement likeCount to avoid a separate COUNT(*) query
  const [updated] = await db
    .update(sketches)
    .set({
      likeCount: liked
        ? sql`GREATEST(0, ${sketches.likeCount} + 1)`
        : sql`GREATEST(0, ${sketches.likeCount} - 1)`,
    })
    .where(eq(sketches.id, sketchId))
    .returning({ likeCount: sketches.likeCount })

  return { liked, count: updated?.likeCount ?? 0 }
}

export async function isLiked(sketchId: string, userId: string): Promise<boolean> {
  const sketch = await getSketchAccess(sketchId)
  if (!canAccessSketch(sketch, userId)) return false

  const rows = await getDb()
    .select({ sketchId: sketchLikes.sketchId })
    .from(sketchLikes)
    .where(and(eq(sketchLikes.sketchId, sketchId), eq(sketchLikes.userId, userId)))
    .limit(1)

  return rows.length > 0
}

// --- Report operations ---

export async function reportSketch(sketchId: string, reporterId: string, reason: string): Promise<boolean> {
  const sketch = await getSketchAccess(sketchId)
  if (!canAccessSketch(sketch, reporterId)) return false

  const db = getDb()
  const inserted = await db
    .insert(sketchReports)
    .values({
      sketchId,
      reporterId,
      reason,
    })
    .onConflictDoNothing({ target: [sketchReports.sketchId, sketchReports.reporterId] })
    .returning({ id: sketchReports.id })

  return inserted.length > 0
}

// --- Comment operations ---

export async function createComment(
  sketchId: string,
  authorId: string,
  body: string,
  parentId?: string
): Promise<Comment> {
  const db = getDb()
  const sketch = await getSketchAccess(sketchId)
  if (!canAccessSketch(sketch, authorId)) {
    throw new Error('Sketch not found')
  }

  if (parentId) {
    const [parent] = await db
      .select({ sketchId: sketchComments.sketchId })
      .from(sketchComments)
      .where(eq(sketchComments.id, parentId))
      .limit(1)
    if (!parent || parent.sketchId !== sketchId) {
      throw new Error('Invalid parentId: comment does not belong to this sketch')
    }
  }

  const [row] = await db
    .insert(sketchComments)
    .values({
      sketchId,
      authorId,
      body,
      parentId: parentId ?? null,
    })
    .returning()

  // Fetch the author directly rather than re-querying the comment with a JOIN
  const [author] = await db
    .select({
      name: studioUsers.name,
      image: studioUsers.image,
    })
    .from(studioUsers)
    .where(eq(studioUsers.id, authorId))
    .limit(1)

  return toComment({
    id: row.id,
    sketchId: row.sketchId,
    authorId: row.authorId,
    authorName: author?.name ?? null,
    authorImage: author?.image ?? null,
    parentId: row.parentId,
    body: row.body,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  })
}

export async function getComments(
  sketchId: string,
  limit: number = 50,
  offset: number = 0,
  viewerId?: string | null
): Promise<{ comments: Comment[]; total: number }> {
  const db = getDb()
  const sketch = await getSketchAccess(sketchId)
  if (!canAccessSketch(sketch, viewerId)) {
    return { comments: [], total: 0 }
  }

  const [rows, countResult] = await Promise.all([
    db
      .select({
        id: sketchComments.id,
        sketchId: sketchComments.sketchId,
        authorId: sketchComments.authorId,
        authorName: studioUsers.name,
        authorImage: studioUsers.image,
        parentId: sketchComments.parentId,
        body: sketchComments.body,
        createdAt: sketchComments.createdAt,
        updatedAt: sketchComments.updatedAt,
      })
      .from(sketchComments)
      .innerJoin(studioUsers, eq(sketchComments.authorId, studioUsers.id))
      .where(eq(sketchComments.sketchId, sketchId))
      .orderBy(sketchComments.createdAt)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(sketchComments)
      .where(eq(sketchComments.sketchId, sketchId)),
  ])

  // Thread comments: nest replies under parents
  const flat = rows.map(toComment)
  const topLevel: Comment[] = []
  const byId = new Map<string, Comment>()

  for (const c of flat) {
    byId.set(c.id, { ...c, replies: [] })
  }
  for (const c of flat) {
    const comment = byId.get(c.id)!
    if (c.parentId && byId.has(c.parentId)) {
      byId.get(c.parentId)!.replies!.push(comment)
    } else {
      topLevel.push(comment)
    }
  }

  return {
    comments: topLevel,
    total: countResult[0]?.count ?? 0,
  }
}

export async function deleteComment(
  sketchId: string,
  commentId: string,
  userId: string
): Promise<boolean> {
  const sketch = await getSketchAccess(sketchId)
  if (!canAccessSketch(sketch, userId)) return false

  const deleted = await getDb()
    .delete(sketchComments)
    .where(
      and(
        eq(sketchComments.id, commentId),
        eq(sketchComments.sketchId, sketchId),
        eq(sketchComments.authorId, userId)
      )
    )
    .returning({ id: sketchComments.id })
  return deleted.length > 0
}

// --- Follow operations ---

export async function followUser(
  followerId: string,
  followingId: string
): Promise<boolean> {
  if (followerId === followingId) return false // prevent self-follow

  const inserted = await getDb()
    .insert(studioFollows)
    .values({ followerId, followingId })
    .onConflictDoNothing({ target: [studioFollows.followerId, studioFollows.followingId] })
    .returning()

  return inserted.length > 0
}

export async function unfollowUser(
  followerId: string,
  followingId: string
): Promise<boolean> {
  const deleted = await getDb()
    .delete(studioFollows)
    .where(
      and(
        eq(studioFollows.followerId, followerId),
        eq(studioFollows.followingId, followingId)
      )
    )
    .returning()
  return deleted.length > 0
}

export async function isFollowing(
  followerId: string,
  followingId: string
): Promise<boolean> {
  const rows = await getDb()
    .select({ followerId: studioFollows.followerId })
    .from(studioFollows)
    .where(
      and(
        eq(studioFollows.followerId, followerId),
        eq(studioFollows.followingId, followingId)
      )
    )
    .limit(1)
  return rows.length > 0
}

export async function getFollowCounts(userId: string): Promise<{ followers: number; following: number }> {
  const db = getDb()
  const [followersResult, followingResult] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(studioFollows)
      .where(eq(studioFollows.followingId, userId)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(studioFollows)
      .where(eq(studioFollows.followerId, userId)),
  ])

  return {
    followers: followersResult[0]?.count ?? 0,
    following: followingResult[0]?.count ?? 0,
  }
}

// --- Notification operations ---

export async function createNotification(
  data: {
    userId: string
    type: 'like' | 'comment' | 'follow' | 'fork' | 'mention'
    actorId: string
    sketchId?: string
    commentId?: string
  }
): Promise<void> {
  // Don't notify yourself
  if (data.userId === data.actorId) return

  await getDb().insert(studioNotifications).values({
    userId: data.userId,
    type: data.type,
    actorId: data.actorId,
    sketchId: data.sketchId ?? null,
    commentId: data.commentId ?? null,
  })
}

export async function getNotifications(
  userId: string,
  limit: number = 20,
  offset: number = 0,
  unreadOnly: boolean = false
): Promise<{ notifications: Notification[]; total: number }> {
  const db = getDb()

  const conditions = [eq(studioNotifications.userId, userId)]
  if (unreadOnly) {
    conditions.push(eq(studioNotifications.read, false))
  }

  const where = and(...conditions)

  const [rows, countResult] = await Promise.all([
    db
      .select({
        id: studioNotifications.id,
        userId: studioNotifications.userId,
        type: studioNotifications.type,
        actorId: studioNotifications.actorId,
        actorName: studioUsers.name,
        actorImage: studioUsers.image,
        sketchId: studioNotifications.sketchId,
        sketchTitle: sketches.title,
        commentId: studioNotifications.commentId,
        read: studioNotifications.read,
        createdAt: studioNotifications.createdAt,
      })
      .from(studioNotifications)
      .innerJoin(studioUsers, eq(studioNotifications.actorId, studioUsers.id))
      .leftJoin(sketches, eq(studioNotifications.sketchId, sketches.id))
      .where(where)
      .orderBy(desc(studioNotifications.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(studioNotifications)
      .where(where),
  ])

  return {
    notifications: rows.map(toNotification),
    total: countResult[0]?.count ?? 0,
  }
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const [result] = await getDb()
    .select({ count: sql<number>`count(*)::int` })
    .from(studioNotifications)
    .where(
      and(
        eq(studioNotifications.userId, userId),
        eq(studioNotifications.read, false)
      )
    )
  return result?.count ?? 0
}

export async function markNotificationsRead(
  userId: string,
  ids?: string[]
): Promise<void> {
  const db = getDb()

  if (ids && ids.length > 0) {
    // Mark specific notifications as read — single UPDATE with inArray to avoid N+1
    await db
      .update(studioNotifications)
      .set({ read: true })
      .where(
        and(
          inArray(studioNotifications.id, ids),
          eq(studioNotifications.userId, userId)
        )
      )
  } else {
    // Mark all as read
    await db
      .update(studioNotifications)
      .set({ read: true })
      .where(eq(studioNotifications.userId, userId))
  }
}

export async function deleteNotifications(
  userId: string,
  ids?: string[]
): Promise<void> {
  const db = getDb()

  if (ids && ids.length > 0) {
    await db
      .delete(studioNotifications)
      .where(
        and(
          inArray(studioNotifications.id, ids),
          eq(studioNotifications.userId, userId)  // IDOR protection
        )
      )
  } else {
    await db
      .delete(studioNotifications)
      .where(eq(studioNotifications.userId, userId))
  }
}

// --- Feed operations ---

export async function getUserFeed(
  userId: string,
  limit: number = 20,
  offset: number = 0,
  cursor?: string
): Promise<{ sketches: SketchSummary[]; total: number; nextCursor: string | null }> {
  const db = getDb()
  const pageLimit = limit + 1

  const followedAuthorIds = db
    .select({ followingId: studioFollows.followingId })
    .from(studioFollows)
    .where(eq(studioFollows.followerId, userId))

  // Build WHERE conditions
  const baseConditions = [
    eq(sketches.isPublic, true),
    inArray(sketches.authorId, followedAuthorIds),
  ]
  const rowsConditions = [...baseConditions]

  // Cursor-based pagination: "createdAt|id" (feed is sorted by createdAt DESC)
  const parsedCursor = cursor ? parseCreatedAtIdCursor(cursor) : null
  const useCursor = Boolean(parsedCursor)
  if (parsedCursor) {
    rowsConditions.push(
      sql`(${sketches.createdAt}, ${sketches.id}) < (${parsedCursor.createdAt.toISOString()}::timestamptz, ${parsedCursor.id}::uuid)`
    )
  }

  // Get sketches from followed users
  const [rows, countResult] = await Promise.all([
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
      .from(sketches)
      .innerJoin(studioUsers, eq(sketches.authorId, studioUsers.id))
      .where(and(...rowsConditions))
      .orderBy(desc(sketches.createdAt), desc(sketches.id))
      .limit(pageLimit)
      .offset(useCursor ? 0 : offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(sketches)
      .where(and(...baseConditions)),
  ])

  const pageRows = rows.slice(0, limit)
  const hasMore = rows.length > limit

  // Build nextCursor from last row: "createdAt|id"
  let nextCursor: string | null = null
  if (hasMore && pageRows.length > 0) {
    const last = pageRows[pageRows.length - 1]
    nextCursor = buildCreatedAtIdCursor(last.createdAt, last.id)
  }

  return {
    sketches: pageRows.map(toSketchSummary),
    total: countResult[0]?.count ?? 0,
    nextCursor,
  }
}

// --- Bookmark operations ---

export async function toggleBookmark(
  sketchId: string,
  userId: string
): Promise<{ bookmarked: boolean }> {
  const db = getDb()
  const sketch = await getSketchAccess(sketchId)
  if (!canAccessSketch(sketch, userId)) {
    return { bookmarked: false }
  }

  const inserted = await db
    .insert(sketchBookmarks)
    .values({ sketchId, userId })
    .onConflictDoNothing({ target: [sketchBookmarks.sketchId, sketchBookmarks.userId] })
    .returning()

  if (inserted.length > 0) {
    return { bookmarked: true }
  }

  // Already existed — remove it (toggle)
  await db
    .delete(sketchBookmarks)
    .where(and(eq(sketchBookmarks.sketchId, sketchId), eq(sketchBookmarks.userId, userId)))

  return { bookmarked: false }
}

export async function isBookmarked(
  sketchId: string,
  userId: string
): Promise<boolean> {
  const sketch = await getSketchAccess(sketchId)
  if (!canAccessSketch(sketch, userId)) return false

  const rows = await getDb()
    .select({ sketchId: sketchBookmarks.sketchId })
    .from(sketchBookmarks)
    .where(and(eq(sketchBookmarks.sketchId, sketchId), eq(sketchBookmarks.userId, userId)))
    .limit(1)
  return rows.length > 0
}

export async function getUserBookmarks(
  userId: string,
  limit: number = 24,
  offset: number = 0
): Promise<{ sketches: SketchSummary[]; total: number }> {
  const db = getDb()
  const visibilityCondition = or(
    eq(sketches.isPublic, true),
    eq(sketches.authorId, userId)
  )

  const [rows, countResult] = await Promise.all([
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
      .from(sketchBookmarks)
      .innerJoin(sketches, eq(sketchBookmarks.sketchId, sketches.id))
      .innerJoin(studioUsers, eq(sketches.authorId, studioUsers.id))
      .where(and(eq(sketchBookmarks.userId, userId), visibilityCondition))
      .orderBy(desc(sketchBookmarks.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(sketchBookmarks)
      .innerJoin(sketches, eq(sketchBookmarks.sketchId, sketches.id))
      .where(and(eq(sketchBookmarks.userId, userId), visibilityCondition)),
  ])

  return {
    sketches: rows.map(toSketchSummary),
    total: countResult[0]?.count ?? 0,
  }
}
