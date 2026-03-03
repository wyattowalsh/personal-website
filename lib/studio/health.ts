import { sql } from 'drizzle-orm'
import { getDb, getDbConnectionHealth } from '@/lib/studio/db'

export async function getStudioHealthResponse(
  { includeInternalDetails = true }: { includeInternalDetails?: boolean } = {},
): Promise<Response> {
  const startedAt = Date.now()
  let databaseStatus: 'up' | 'degraded' | 'down' = 'up'
  let databaseError: string | null = null
  let databaseCircuit: Record<string, unknown> = {}
  let databaseTimeoutMs: number | null = null

  try {
    const preflight = getDbConnectionHealth()
    databaseCircuit = preflight.circuitBreaker
    databaseTimeoutMs = preflight.timeoutMs

    if (preflight.circuitBreaker.open) {
      databaseStatus = 'degraded'
      databaseError = 'Database circuit breaker is open'
    } else {
      const db = getDb()
      await db.execute(sql`SELECT 1`)
    }

    const postflight = getDbConnectionHealth()
    databaseCircuit = postflight.circuitBreaker
    databaseTimeoutMs = postflight.timeoutMs
    if (databaseStatus === 'up' && postflight.status === 'degraded') {
      databaseStatus = 'degraded'
    }
  } catch (error) {
    databaseStatus = 'down'
    databaseError = error instanceof Error ? error.message : String(error)
  }

  const status = databaseStatus === 'up'
    ? 'healthy'
    : databaseStatus === 'degraded'
      ? 'degraded'
      : 'unhealthy'

  return Response.json({
    status,
    timestamp: new Date().toISOString(),
    sli: {
      availability: databaseStatus === 'up' ? 1 : 0,
      latencyMs: Date.now() - startedAt,
    },
    dependencies: {
      database: {
        status: databaseStatus,
        timeoutMs: databaseTimeoutMs,
        ...(includeInternalDetails ? { circuitBreaker: databaseCircuit } : {}),
        ...(includeInternalDetails && databaseError ? { error: databaseError } : {}),
      },
    },
  }, {
    status: databaseStatus === 'up' ? 200 : 503,
  })
}
