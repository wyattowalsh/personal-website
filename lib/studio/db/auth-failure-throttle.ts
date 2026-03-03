import { eq, sql } from 'drizzle-orm'
import { authFailureThrottle } from '../schema'
import { getDb } from './connection'

export const AUTH_FAILURE_THRESHOLD = 5
export const AUTH_FAILURE_WINDOW_MINUTES = 10
export const AUTH_FAILURE_COOLDOWN_MINUTES = 15

const THROTTLE_KEY_MAX_LENGTH = 320
const UNKNOWN_PROVIDER = 'unknown'
const UNKNOWN_ACCOUNT_ID = 'unknown'

export interface AuthFailureThrottleState {
  throttled: boolean
  failureCount: number
  retryAfterSeconds: number
}

export function createAuthFailureThrottleKey(
  provider: string | null | undefined,
  providerAccountId: string | null | undefined
): string {
  const normalizedProvider = provider?.trim().toLowerCase() || UNKNOWN_PROVIDER
  const normalizedProviderAccountId = providerAccountId?.trim() || UNKNOWN_ACCOUNT_ID
  return `${normalizedProvider}:${normalizedProviderAccountId}`.slice(0, THROTTLE_KEY_MAX_LENGTH)
}

function getRetryAfterSeconds(cooldownUntil: Date | null): number {
  if (!cooldownUntil) return 0
  return Math.max(0, Math.ceil((cooldownUntil.getTime() - Date.now()) / 1000))
}

export async function getAuthFailureThrottleState(
  throttleKey: string
): Promise<AuthFailureThrottleState> {
  const [row] = await getDb()
    .select({
      failureCount: authFailureThrottle.failureCount,
      cooldownUntil: authFailureThrottle.cooldownUntil,
    })
    .from(authFailureThrottle)
    .where(eq(authFailureThrottle.throttleKey, throttleKey))
    .limit(1)

  const retryAfterSeconds = getRetryAfterSeconds(row?.cooldownUntil ?? null)

  return {
    throttled: retryAfterSeconds > 0,
    failureCount: row?.failureCount ?? 0,
    retryAfterSeconds,
  }
}

export async function recordAuthFailure(
  throttleKey: string
): Promise<AuthFailureThrottleState> {
  const [row] = await getDb()
    .insert(authFailureThrottle)
    .values({
      throttleKey,
      failureCount: 1,
    })
    .onConflictDoUpdate({
      target: authFailureThrottle.throttleKey,
      set: {
        failureCount: sql<number>`
          CASE
            WHEN ${authFailureThrottle.lastFailureAt} < NOW() - ${AUTH_FAILURE_WINDOW_MINUTES} * INTERVAL '1 minute' THEN 1
            ELSE ${authFailureThrottle.failureCount} + 1
          END
        `,
        firstFailureAt: sql`
          CASE
            WHEN ${authFailureThrottle.lastFailureAt} < NOW() - ${AUTH_FAILURE_WINDOW_MINUTES} * INTERVAL '1 minute' THEN NOW()
            ELSE ${authFailureThrottle.firstFailureAt}
          END
        `,
        lastFailureAt: sql`NOW()`,
        cooldownUntil: sql`
          CASE
            WHEN (
              CASE
                WHEN ${authFailureThrottle.lastFailureAt} < NOW() - ${AUTH_FAILURE_WINDOW_MINUTES} * INTERVAL '1 minute' THEN 1
                ELSE ${authFailureThrottle.failureCount} + 1
              END
            ) >= ${AUTH_FAILURE_THRESHOLD}
              THEN NOW() + ${AUTH_FAILURE_COOLDOWN_MINUTES} * INTERVAL '1 minute'
            ELSE NULL
          END
        `,
        updatedAt: sql`NOW()`,
      },
    })
    .returning({
      failureCount: authFailureThrottle.failureCount,
      cooldownUntil: authFailureThrottle.cooldownUntil,
    })

  const retryAfterSeconds = getRetryAfterSeconds(row?.cooldownUntil ?? null)

  return {
    throttled: retryAfterSeconds > 0,
    failureCount: row?.failureCount ?? 0,
    retryAfterSeconds,
  }
}

export async function clearAuthFailureThrottle(throttleKey: string): Promise<boolean> {
  const deletedRows = await getDb()
    .delete(authFailureThrottle)
    .where(eq(authFailureThrottle.throttleKey, throttleKey))
    .returning({ throttleKey: authFailureThrottle.throttleKey })

  return deletedRows.length > 0
}
