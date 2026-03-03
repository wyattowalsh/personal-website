import { eq, sql } from 'drizzle-orm'
import { sketches, studioUsers } from '../schema'
import type { StudioUser } from '../types'
import { getDb } from './connection'
import { toStudioUser } from './mappers'

// --- User operations ---

export async function getOrCreateUser(
  provider: string,
  providerId: string,
  profile: { name: string | null; email: string | null; image: string | null }
): Promise<StudioUser> {
  // Upsert: insert or update profile on conflict with (provider, providerId)
  const [user] = await getDb()
    .insert(studioUsers)
    .values({ provider, providerId, name: profile.name ?? undefined, email: profile.email ?? undefined, image: profile.image ?? undefined })
    .onConflictDoUpdate({
      target: [studioUsers.provider, studioUsers.providerId],
      set: { name: profile.name ?? undefined, email: profile.email ?? undefined, image: profile.image ?? undefined },
    })
    .returning()

  return toStudioUser(user)
}

export async function getUserProfile(userId: string): Promise<StudioUser | null> {
  const rows = await getDb().select().from(studioUsers).where(eq(studioUsers.id, userId)).limit(1)
  if (rows.length === 0) return null
  return toStudioUser(rows[0])
}

// --- Profile operations ---

export async function updateUserProfile(
  userId: string,
  data: { displayName?: string; bio?: string; website?: string; socialLinks?: Record<string, string> }
): Promise<StudioUser | null> {
  const db = getDb()
  const [user] = await db.update(studioUsers)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(studioUsers.id, userId))
    .returning()
  return user ? toStudioUser(user) : null
}

export async function getUserStats(userId: string): Promise<{ totalSketches: number; totalLikes: number; totalViews: number }> {
  const db = getDb()
  const [result] = await db
    .select({
      totalSketches: sql<number>`count(*)::int`,
      totalLikes: sql<number>`coalesce(sum(${sketches.likeCount}), 0)::int`,
      totalViews: sql<number>`coalesce(sum(${sketches.viewCount}), 0)::int`,
    })
    .from(sketches)
    .where(eq(sketches.authorId, userId))

  return {
    totalSketches: result?.totalSketches ?? 0,
    totalLikes: result?.totalLikes ?? 0,
    totalViews: result?.totalViews ?? 0,
  }
}
