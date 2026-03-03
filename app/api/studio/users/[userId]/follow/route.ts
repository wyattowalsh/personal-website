import { api as coreApi, ApiError } from '@/lib/core'
import { auth } from '@/lib/studio/auth'
import {
  followUser,
  unfollowUser,
  isFollowing,
  getFollowCounts,
  createNotification,
  checkRateLimit,
} from '@/lib/studio/db'
import { followActionSchema, userIdParamSchema } from '@/lib/studio/schemas'
import { runIdempotentStudioMutation } from '@/lib/studio/idempotency'

type Props = {
  params: Promise<{
    userId: string
  }>
}

export const POST = coreApi.middleware.withErrorHandler(
  async (request: Request, props: Props) => {
    const session = await auth()
    if (!session?.user?.id) throw new ApiError(401, 'Authentication required')

    const { userId } = await props.params
    const paramValidation = userIdParamSchema.safeParse({ userId })
    if (!paramValidation.success) {
      throw new ApiError(400, 'Invalid user ID', { errors: paramValidation.error.issues })
    }

    if (session.user.id === userId) {
      throw new ApiError(400, 'Cannot follow yourself')
    }

    const { action } = await coreApi.middleware.validateRequest(
      request,
      followActionSchema
    )

    return runIdempotentStudioMutation({
      request,
      userId: session.user.id,
      scope: 'studio:users:follow',
      requestFingerprint: JSON.stringify({ userId, action }),
      run: async () => {
        const withinLimit = await checkRateLimit(session.user.id, 'follow', 100, 1)
        if (!withinLimit) {
          throw new ApiError(429, 'Rate limit exceeded. Max 100 follow actions per hour.')
        }

        if (action === 'follow') {
          await followUser(session.user.id, userId)

          // Fire-and-forget notification
          createNotification({
            userId,
            type: 'follow',
            actorId: session.user.id,
          }).catch(() => {})
        } else {
          await unfollowUser(session.user.id, userId)
        }

        return { status: 200, body: { success: true } }
      },
    })
  }
)

export const GET = coreApi.middleware.withErrorHandler(
  async (_request: Request, props: Props) => {
    const session = await auth()
    if (!session?.user?.id) throw new ApiError(401, 'Authentication required')

    const { userId } = await props.params
    const paramValidation = userIdParamSchema.safeParse({ userId })
    if (!paramValidation.success) {
      throw new ApiError(400, 'Invalid user ID', { errors: paramValidation.error.issues })
    }

    const [following, counts] = await Promise.all([
      isFollowing(session.user.id, userId),
      getFollowCounts(userId),
    ])

    return Response.json({
      following,
      followers: counts.followers,
      followingCount: counts.following,
    })
  }
)
