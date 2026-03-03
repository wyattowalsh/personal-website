import { api as coreApi, ApiError } from '@/lib/core'
import { auth } from '@/lib/studio/auth'
import {
  createComment,
  deleteComment,
  getComments,
  getSketchById,
  createNotification,
  checkRateLimit,
} from '@/lib/studio/db'
import {
  sketchIdSchema,
  createCommentSchema,
  listCommentsSchema,
  deleteCommentSchema,
} from '@/lib/studio/schemas'
import { runIdempotentStudioMutation } from '@/lib/studio/idempotency'

type Props = {
  params: Promise<{
    id: string
  }>
}

export const GET = coreApi.middleware.withErrorHandler(
  async (request: Request, props: Props) => {
    const { id } = await props.params
    const validation = sketchIdSchema.safeParse({ id })
    if (!validation.success) {
      throw new ApiError(400, 'Invalid sketch ID', { errors: validation.error.issues })
    }

    const session = await auth()
    const sketch = await getSketchById(id, session?.user?.id)
    if (!sketch) throw new ApiError(404, 'Sketch not found')

    const { limit, offset } = await coreApi.middleware.validateRequest(
      request,
      listCommentsSchema
    )

    const result = await getComments(id, limit, offset, session?.user?.id)
    return Response.json(result)
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

    const { body, parentId } = await coreApi.middleware.validateRequest(
      request,
      createCommentSchema
    )

    return runIdempotentStudioMutation({
      request,
      userId: session.user.id,
      scope: 'studio:sketches:comments:create',
      requestFingerprint: JSON.stringify({ sketchId: id, body, parentId }),
      run: async () => {
        const withinLimit = await checkRateLimit(session.user.id, 'comment', 30, 1)
        if (!withinLimit) {
          throw new ApiError(429, 'Rate limit exceeded. Max 30 comments per hour.')
        }

        const comment = await createComment(id, session.user.id, body, parentId)

        // Fire-and-forget notification to sketch owner
        if (sketch.authorId !== session.user.id) {
          createNotification({
            userId: sketch.authorId,
            type: 'comment',
            actorId: session.user.id,
            sketchId: id,
            commentId: comment.id,
          }).catch(() => {})
        }

        return { status: 201, body: comment }
      },
    })
  }
)

export const DELETE = coreApi.middleware.withErrorHandler(
  async (request: Request, props: Props) => {
    const session = await auth()
    if (!session?.user?.id) throw new ApiError(401, 'Authentication required')

    const { id } = await props.params
    const validation = sketchIdSchema.safeParse({ id })
    if (!validation.success) throw new ApiError(400, 'Invalid sketch ID')

    const { commentId } = await coreApi.middleware.validateRequest(
      request,
      deleteCommentSchema,
    )

    const sketch = await getSketchById(id, session.user.id)
    if (!sketch) throw new ApiError(404, 'Sketch not found')

    const deleted = await deleteComment(id, commentId, session.user.id)
    if (!deleted) throw new ApiError(404, 'Comment not found')

    return new Response(null, { status: 204 })
  }
)
