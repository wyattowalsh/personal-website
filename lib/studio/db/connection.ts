import { neon, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import {
  sketches,
  sketchLikes,
  sketchReports,
  studioUsers,
  sketchComments,
  studioFollows,
  studioNotifications,
  sketchBookmarks,
  studioCollections,
  studioCollectionItems,
  studioRateLimitCounters,
  studioIdempotencyKeys,
  authFailureThrottle,
} from '../schema'

const DEFAULT_DB_QUERY_TIMEOUT_MS = 5_000
const DEFAULT_DB_CIRCUIT_FAILURE_THRESHOLD = 3
const DEFAULT_DB_CIRCUIT_COOLDOWN_MS = 30_000

const DB_QUERY_TIMEOUT_MS = parsePositiveInt(
  process.env.STUDIO_DB_QUERY_TIMEOUT_MS,
  DEFAULT_DB_QUERY_TIMEOUT_MS
)
const DB_CIRCUIT_FAILURE_THRESHOLD = parsePositiveInt(
  process.env.STUDIO_DB_CIRCUIT_FAILURE_THRESHOLD,
  DEFAULT_DB_CIRCUIT_FAILURE_THRESHOLD
)
const DB_CIRCUIT_COOLDOWN_MS = parsePositiveInt(
  process.env.STUDIO_DB_CIRCUIT_COOLDOWN_MS,
  DEFAULT_DB_CIRCUIT_COOLDOWN_MS
)

type DbCircuitState = {
  consecutiveFailures: number
  openedAt: number | null
  openUntil: number | null
  lastFailureAt: number | null
  lastFailureMessage: string | null
  lastSuccessAt: number | null
}

const dbCircuitState: DbCircuitState = {
  consecutiveFailures: 0,
  openedAt: null,
  openUntil: null,
  lastFailureAt: null,
  lastFailureMessage: null,
  lastSuccessAt: null,
}

// Lazy-init singleton — avoids crash at module load if POSTGRES_URL is unset
let _db: ReturnType<typeof drizzle> | null = null
let warnedMissingPostgresUrl = false
let resilientFetchConfigured = false

export function getDb() {
  if (!_db) {
    if (!process.env.POSTGRES_URL) {
      if (!warnedMissingPostgresUrl) {
        warnedMissingPostgresUrl = true
        console.error(JSON.stringify({
          event: 'studio_db_missing_configuration',
          message: 'POSTGRES_URL environment variable is required',
          timestamp: new Date().toISOString(),
        }))
      }
      throw new Error('POSTGRES_URL environment variable is required')
    }

    ensureResilientFetchConfigured()
    const client = neon(process.env.POSTGRES_URL)
    _db = drizzle(client, {
      schema: {
        sketches,
        sketchLikes,
        sketchReports,
        studioUsers,
        sketchComments,
        studioFollows,
        studioNotifications,
        sketchBookmarks,
        studioCollections,
        studioCollectionItems,
        studioRateLimitCounters,
        studioIdempotencyKeys,
        authFailureThrottle,
      },
    })
  }
  return _db
}

export function getDbConnectionHealth() {
  const now = Date.now()
  const circuitOpen = isCircuitOpen(now)

  return {
    status: circuitOpen || dbCircuitState.consecutiveFailures > 0 ? 'degraded' as const : 'up' as const,
    timeoutMs: DB_QUERY_TIMEOUT_MS,
    circuitBreaker: {
      open: circuitOpen,
      consecutiveFailures: dbCircuitState.consecutiveFailures,
      failureThreshold: DB_CIRCUIT_FAILURE_THRESHOLD,
      cooldownMs: DB_CIRCUIT_COOLDOWN_MS,
      openedAt: toIsoTimestamp(dbCircuitState.openedAt),
      openUntil: toIsoTimestamp(dbCircuitState.openUntil),
      lastFailureAt: toIsoTimestamp(dbCircuitState.lastFailureAt),
      lastFailureMessage: dbCircuitState.lastFailureMessage,
      lastSuccessAt: toIsoTimestamp(dbCircuitState.lastSuccessAt),
    },
  }
}

function ensureResilientFetchConfigured() {
  if (resilientFetchConfigured) return

  const baseFetch: typeof fetch = (...args) => fetch(...args)
  neonConfig.fetchFunction = async (input: RequestInfo | URL, init?: RequestInit) => {
    const now = Date.now()
    if (isCircuitOpen(now)) {
      const openUntilIso = toIsoTimestamp(dbCircuitState.openUntil)
      console.warn(JSON.stringify({
        event: 'studio_db_circuit_breaker_reject',
        consecutiveFailures: dbCircuitState.consecutiveFailures,
        openUntil: openUntilIso,
        timestamp: new Date(now).toISOString(),
      }))
      throw new Error(`Database circuit breaker open until ${openUntilIso ?? 'unknown time'}`)
    }

    const timeoutController = new AbortController()
    const timeout = setTimeout(() => timeoutController.abort(), DB_QUERY_TIMEOUT_MS)
    const signal = init?.signal
      ? AbortSignal.any([init.signal, timeoutController.signal])
      : timeoutController.signal

    try {
      const response = await baseFetch(input, {
        ...init,
        signal,
      })
      markDbSuccess()
      return response
    } catch (error) {
      markDbFailure(error)
      throw error
    } finally {
      clearTimeout(timeout)
    }
  }

  resilientFetchConfigured = true
}

function markDbSuccess() {
  const hadFailures = dbCircuitState.consecutiveFailures > 0 || (dbCircuitState.openUntil ?? 0) > Date.now()
  dbCircuitState.consecutiveFailures = 0
  dbCircuitState.openedAt = null
  dbCircuitState.openUntil = null
  dbCircuitState.lastSuccessAt = Date.now()

  if (hadFailures) {
    console.info(JSON.stringify({
      event: 'studio_db_recovered',
      timestamp: new Date().toISOString(),
    }))
  }
}

function markDbFailure(error: unknown) {
  const now = Date.now()
  const message = error instanceof Error ? error.message : String(error)
  dbCircuitState.consecutiveFailures += 1
  dbCircuitState.lastFailureAt = now
  dbCircuitState.lastFailureMessage = message

  const shouldOpenCircuit =
    dbCircuitState.consecutiveFailures >= DB_CIRCUIT_FAILURE_THRESHOLD &&
    !isCircuitOpen(now)

  if (shouldOpenCircuit) {
    dbCircuitState.openedAt = now
    dbCircuitState.openUntil = now + DB_CIRCUIT_COOLDOWN_MS
    console.warn(JSON.stringify({
      event: 'studio_db_circuit_breaker_opened',
      consecutiveFailures: dbCircuitState.consecutiveFailures,
      failureThreshold: DB_CIRCUIT_FAILURE_THRESHOLD,
      cooldownMs: DB_CIRCUIT_COOLDOWN_MS,
      openUntil: toIsoTimestamp(dbCircuitState.openUntil),
      error: message,
      timestamp: new Date(now).toISOString(),
    }))
    return
  }

  console.warn(JSON.stringify({
    event: 'studio_db_query_failure',
    consecutiveFailures: dbCircuitState.consecutiveFailures,
    failureThreshold: DB_CIRCUIT_FAILURE_THRESHOLD,
    error: message,
    timestamp: new Date(now).toISOString(),
  }))
}

function isCircuitOpen(now = Date.now()) {
  return dbCircuitState.openUntil !== null && dbCircuitState.openUntil > now
}

function toIsoTimestamp(timestamp: number | null): string | null {
  return timestamp ? new Date(timestamp).toISOString() : null
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}
