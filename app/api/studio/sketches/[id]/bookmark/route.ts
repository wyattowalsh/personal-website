import { api as coreApi, ApiError } from '@/lib/core'
import { auth } from '@/lib/studio/auth'
import { toggleBookmark, checkRateLimit, getSketchById } from '@/lib/studio/db'
import { sketchIdSchema } from '@/lib/studio/schemas'
import { runIdempotentStudioMutation } from '@/lib/studio/idempotency'

type Props = {
  params: Promise<{
    id: string
  }>
}

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
    if (sketch.authorId === session.user.id) throw new ApiError(400, 'Cannot bookmark your own sketch')

    return runIdempotentStudioMutation({
      request,
      userId: session.user.id,
      scope: 'studio:sketches:bookmarks:toggle',
      requestFingerprint: JSON.stringify({ sketchId: id }),
      run: async () => {
        const withinLimit = await checkRateLimit(session.user.id, 'bookmark', 100, 1)
        if (!withinLimit) throw new ApiError(429, 'Rate limit exceeded')

        const result = await toggleBookmark(id, session.user.id)
        return { status: 200, body: result }
      },
    })
  }
)
