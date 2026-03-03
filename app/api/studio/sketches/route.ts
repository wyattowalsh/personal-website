import { api as coreApi, ApiError } from '@/lib/core'
import { auth } from '@/lib/studio/auth'
import { getRecentSketches, createSketch, checkRateLimit } from '@/lib/studio/db'
import { listSketchesSchema, createSketchSchema } from '@/lib/studio/schemas'
import { studioAnalytics } from '@/lib/studio/analytics'
import { runIdempotentStudioMutation } from '@/lib/studio/idempotency'

export const GET = coreApi.middleware.withErrorHandler(
  async (request: Request) => {
    const params = await coreApi.middleware.validateRequest(request, listSketchesSchema)
    const result = await getRecentSketches(params)

    return Response.json(result)
  }
)

export const POST = coreApi.middleware.withErrorHandler(
  async (request: Request) => {
    const session = await auth()
    if (!session?.user?.id) throw new ApiError(401, 'Authentication required')

    const data = await coreApi.middleware.validateRequest(request, createSketchSchema)

    return runIdempotentStudioMutation({
      request,
      userId: session.user.id,
      scope: 'studio:sketches:create',
      requestFingerprint: JSON.stringify(data),
      run: async () => {
        const withinLimit = await checkRateLimit(session.user.id, 'create', 10, 1)
        if (!withinLimit) throw new ApiError(429, 'Rate limit exceeded. Max 10 sketches per hour.')

        const sketch = await createSketch(data, session.user.id)

        // Fire-and-forget analytics
        studioAnalytics.sketchCreated({
          engine: data.engine,
          forkedFrom: data.forkedFrom,
        })

        return { status: 201, body: sketch }
      },
    })
  }
)
