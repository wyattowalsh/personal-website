import { and, eq, sql } from 'drizzle-orm'
import { createHash } from 'node:crypto'
import { studioIdempotencyKeys } from '../schema'
import { getDb } from './connection'

export type IdempotencyResponseBody = unknown

type IdempotencyIdentity = {
  userId: string
  scope: string
  key: string
}

type IdempotencyReservationBase = {
  kind: 'reserved' | 'in_progress' | 'conflict'
}

type IdempotencyReplayReservation = {
  kind: 'replay'
  response: {
    status: number
    body: IdempotencyResponseBody | null
  }
}

export type IdempotencyReservation = IdempotencyReservationBase | IdempotencyReplayReservation

export function createIdempotencyRequestHash(input: string): string {
  return createHash('sha256').update(input).digest('hex')
}

export async function reserveIdempotencyKey(
  identity: IdempotencyIdentity & { requestHash: string }
): Promise<IdempotencyReservation> {
  const db = getDb()

  const [reserved] = await db
    .insert(studioIdempotencyKeys)
    .values({
      userId: identity.userId,
      scope: identity.scope,
      key: identity.key,
      requestHash: identity.requestHash,
      state: 'pending',
      updatedAt: sql`NOW()`,
    })
    .onConflictDoNothing({
      target: [
        studioIdempotencyKeys.userId,
        studioIdempotencyKeys.scope,
        studioIdempotencyKeys.key,
      ],
    })
    .returning({ state: studioIdempotencyKeys.state })

  if (reserved) {
    return { kind: 'reserved' }
  }

  const [existing] = await db
    .select({
      requestHash: studioIdempotencyKeys.requestHash,
      state: studioIdempotencyKeys.state,
      responseStatus: studioIdempotencyKeys.responseStatus,
      responseBody: studioIdempotencyKeys.responseBody,
    })
    .from(studioIdempotencyKeys)
    .where(
      and(
        eq(studioIdempotencyKeys.userId, identity.userId),
        eq(studioIdempotencyKeys.scope, identity.scope),
        eq(studioIdempotencyKeys.key, identity.key)
      )
    )
    .limit(1)

  if (!existing) {
    return { kind: 'in_progress' }
  }

  if (existing.requestHash !== identity.requestHash) {
    return { kind: 'conflict' }
  }

  if (existing.state === 'completed' && existing.responseStatus !== null) {
    return {
      kind: 'replay',
      response: {
        status: existing.responseStatus,
        body: (existing.responseBody ?? null) as IdempotencyResponseBody | null,
      },
    }
  }

  return { kind: 'in_progress' }
}

export async function completeIdempotencyKey(
  identity: IdempotencyIdentity,
  response: { status: number; body?: IdempotencyResponseBody | null }
): Promise<void> {
  await getDb()
    .update(studioIdempotencyKeys)
    .set({
      state: 'completed',
      responseStatus: response.status,
      responseBody: response.body ?? null,
      completedAt: sql`NOW()`,
      updatedAt: sql`NOW()`,
    })
    .where(
      and(
        eq(studioIdempotencyKeys.userId, identity.userId),
        eq(studioIdempotencyKeys.scope, identity.scope),
        eq(studioIdempotencyKeys.key, identity.key),
      )
    )
}

export async function releasePendingIdempotencyKey(identity: IdempotencyIdentity): Promise<void> {
  await getDb()
    .delete(studioIdempotencyKeys)
    .where(
      and(
        eq(studioIdempotencyKeys.userId, identity.userId),
        eq(studioIdempotencyKeys.scope, identity.scope),
        eq(studioIdempotencyKeys.key, identity.key),
        eq(studioIdempotencyKeys.state, 'pending')
      )
    )
}
