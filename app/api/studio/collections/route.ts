import { api as coreApi, ApiError } from '@/lib/core'
import { auth } from '@/lib/studio/auth'
import { getUserCollections, createCollection, checkRateLimit } from '@/lib/studio/db'
import { createCollectionSchema } from '@/lib/studio/schemas'
import { runIdempotentStudioMutation } from '@/lib/studio/idempotency'

export const GET = coreApi.middleware.withErrorHandler(
  async () => {
    const session = await auth()
    if (!session?.user?.id) throw new ApiError(401, 'Authentication required')

    const collections = await getUserCollections(session.user.id)
    return Response.json({ collections })
  }
)

export const POST = coreApi.middleware.withErrorHandler(
  async (request: Request) => {
    const session = await auth()
    if (!session?.user?.id) throw new ApiError(401, 'Authentication required')

    const data = await coreApi.middleware.validateRequest(request, createCollectionSchema)

    return runIdempotentStudioMutation({
      request,
      userId: session.user.id,
      scope: 'studio:collections:create',
      requestFingerprint: JSON.stringify(data),
      run: async () => {
        const withinLimit = await checkRateLimit(session.user.id, 'collection_create', 10, 1)
        if (!withinLimit) throw new ApiError(429, 'Rate limit exceeded.')

        const collection = await createCollection(session.user.id, data)

        return { status: 201, body: collection }
      },
    })
  }
)
