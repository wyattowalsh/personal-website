import { and, eq, sql } from 'drizzle-orm'
import { studioRateLimitCounters } from '../schema'
import { getDb } from './connection'

// --- Rate limiting & moderation ---

type RateLimitAction =
  | 'create'
  | 'like'
  | 'report'
  | 'profile_update'
  | 'comment'
  | 'follow'
  | 'thumbnail_upload'
  | 'collection_create'
  | 'bookmark'

export async function checkRateLimit(
  userId: string,
  action: RateLimitAction,
  limit: number,
  windowHours: number
): Promise<boolean> {
  const db = getDb()
  const windowExpired = sql`${studioRateLimitCounters.windowStartedAt} <= NOW() - ${windowHours} * INTERVAL '1 hour'`

  const [consumed] = await db
    .insert(studioRateLimitCounters)
    .values({
      userId,
      action,
      windowHours,
      windowStartedAt: sql`NOW()`,
      count: 1,
      updatedAt: sql`NOW()`,
    })
    .onConflictDoUpdate({
      target: [
        studioRateLimitCounters.userId,
        studioRateLimitCounters.action,
        studioRateLimitCounters.windowHours,
      ],
      set: {
        count: sql`CASE WHEN ${windowExpired} THEN 1 ELSE ${studioRateLimitCounters.count} + 1 END`,
        windowStartedAt: sql`CASE WHEN ${windowExpired} THEN NOW() ELSE ${studioRateLimitCounters.windowStartedAt} END`,
        updatedAt: sql`NOW()`,
      },
      where: sql`${windowExpired} OR ${studioRateLimitCounters.count} < ${limit}`,
    })
    .returning({
      count: studioRateLimitCounters.count,
      windowStartedAt: studioRateLimitCounters.windowStartedAt,
    })

  if (consumed) {
    return true
  }

  const [counter] = await db
    .select({
      count: studioRateLimitCounters.count,
      windowStartedAt: studioRateLimitCounters.windowStartedAt,
    })
    .from(studioRateLimitCounters)
    .where(
      and(
        eq(studioRateLimitCounters.userId, userId),
        eq(studioRateLimitCounters.action, action),
        eq(studioRateLimitCounters.windowHours, windowHours)
      )
    )
    .limit(1)

  console.warn(JSON.stringify({
    event: 'rate_limit_exceeded',
    userId,
    action,
    limit,
    windowHours,
    count: counter?.count ?? limit,
    windowStartedAt: counter?.windowStartedAt?.toISOString(),
    timestamp: new Date().toISOString(),
  }))

  return false
}
