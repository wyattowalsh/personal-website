import { ApiError } from '@/lib/core'
import { idempotencyKeySchema } from '@/lib/studio/schemas'
import { IDEMPOTENCY_KEY_HEADER } from '@/lib/studio/db/reliability-store'
import {
  completeIdempotencyKey,
  createIdempotencyRequestHash,
  releasePendingIdempotencyKey,
  reserveIdempotencyKey,
  type IdempotencyResponseBody,
} from '@/lib/studio/db/idempotency'

const NO_BODY_RESPONSE_STATUSES = new Set([204, 205, 304])

type IdempotentMutationResult = {
  status: number
  body?: IdempotencyResponseBody | null
}

type IdempotentMutationOptions = {
  request: Request
  userId: string
  scope: string
  requestFingerprint: string
  run: () => Promise<IdempotentMutationResult>
}

function toJsonResponse(result: IdempotentMutationResult): Response {
  if (NO_BODY_RESPONSE_STATUSES.has(result.status)) {
    return new Response(null, { status: result.status })
  }
  return Response.json(result.body ?? null, { status: result.status })
}

export async function runIdempotentStudioMutation(
  options: IdempotentMutationOptions
): Promise<Response> {
  const rawKey = options.request.headers.get(IDEMPOTENCY_KEY_HEADER)
  if (!rawKey) {
    const result = await options.run()
    return toJsonResponse(result)
  }

  const parsedKey = idempotencyKeySchema.safeParse(rawKey)
  if (!parsedKey.success) {
    throw new ApiError(400, 'Invalid idempotency key', { errors: parsedKey.error.issues })
  }

  const identity = {
    userId: options.userId,
    scope: options.scope,
    key: parsedKey.data,
  }

  const reservation = await reserveIdempotencyKey({
    ...identity,
    requestHash: createIdempotencyRequestHash(options.requestFingerprint),
  })

  if (reservation.kind === 'conflict') {
    throw new ApiError(409, 'Idempotency key cannot be reused with a different request payload')
  }
  if (reservation.kind === 'in_progress') {
    throw new ApiError(409, 'Request with this idempotency key is already in progress')
  }
  if (reservation.kind === 'replay') {
    return toJsonResponse({
      status: reservation.response.status,
      body: reservation.response.body,
    })
  }

  try {
    const result = await options.run()
    await completeIdempotencyKey(identity, {
      status: result.status,
      body: result.body,
    })
    return toJsonResponse(result)
  } catch (error) {
    await releasePendingIdempotencyKey(identity)
    throw error
  }
}
