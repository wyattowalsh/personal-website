/**
 * Canonical backend decision for mutation safety primitives in Studio APIs.
 *
 * We standardize on Postgres (via Drizzle + POSTGRES_URL) for both:
 * - atomic rate-limit accounting
 * - idempotency key storage
 *
 * This repo does not currently provision Redis runtime/dependencies, so
 * downstream work should build against the Postgres model.
 */
export const RATE_LIMIT_IDEMPOTENCY_STORE = 'postgres' as const
export type RateLimitIdempotencyStore = typeof RATE_LIMIT_IDEMPOTENCY_STORE

export const IDEMPOTENCY_KEY_HEADER = 'idempotency-key' as const
export const IDEMPOTENCY_KEY_MAX_LENGTH = 128
