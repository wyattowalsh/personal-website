import { api as coreApi, ApiError } from '@/lib/core'
import { auth } from '@/lib/studio/auth'
import { toggleLike, checkRateLimit, getSketchById, isLiked } from '@/lib/studio/db'
import { sketchIdSchema } from '@/lib/studio/schemas'
import { studioAnalytics } from '@/lib/studio/analytics'
import { runIdempotentStudioMutation } from '@/lib/studio/idempotency'

type Props = {
  params: Promise<{
    id: string
  }>
}

export const GET = coreApi.middleware.withErrorHandler(
  async (_request: Request, props: Props) => {
    const session = await auth()

    const { id } = await props.params
    const validation = sketchIdSchema.safeParse({ id })
    if (!validation.success) throw new ApiError(400, 'Invalid sketch ID')

    const sketch = await getSketchById(id, session?.user?.id)
    if (!sketch) throw new ApiError(404, 'Sketch not found')

    if (!session?.user?.id) return Response.json({ liked: false })

    const liked = await isLiked(id, session.user.id)
    return Response.json({ liked })
  }
)

export const POST = coreApi.middleware.withErrorHandler(
  async (request: Request, props: Props) => {
    const session = await auth()
    if (!session?.user?.id) throw new ApiError(401, 'Authentication required')

    const { id } = await props.params
    const validation = sketchIdSchema.safeParse({ id })
    if (!validation.success) {
      throw new ApiError(400, 'Invalid sketch ID', { errors: validation.error.issues })
    }

    const sketch = await getSketchById(id, session.user.id)
    if (!sketch) throw new ApiError(404, 'Sketch not found')
    if (sketch.authorId === session.user.id) throw new ApiError(400, 'Cannot like your own sketch')

    return runIdempotentStudioMutation({
      request,
      userId: session.user.id,
      scope: 'studio:sketches:likes:toggle',
      requestFingerprint: JSON.stringify({ sketchId: id }),
      run: async () => {
        const withinLimit = await checkRateLimit(session.user.id, 'like', 50, 1)
        if (!withinLimit) throw new ApiError(429, 'Rate limit exceeded. Max 50 likes per hour.')

        const result = await toggleLike(id, session.user.id)

        // Fire-and-forget analytics (only log when liked, not unliked)
        if (result.liked) {
          studioAnalytics.sketchLiked({ sketchId: id })
        }

        return { status: 200, body: result }
      },
    })
  }
)
