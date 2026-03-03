import { api as coreApi, ApiError } from '@/lib/core'
import { auth } from '@/lib/studio/auth'
import { getUserProfile, updateUserProfile, checkRateLimit } from '@/lib/studio/db'
import { updateProfileSchema } from '@/lib/studio/schemas'

export const GET = coreApi.middleware.withErrorHandler(
  async () => {
    const session = await auth()
    if (!session?.user?.id) throw new ApiError(401, 'Authentication required')

    const user = await getUserProfile(session.user.id)
    if (!user) throw new ApiError(404, 'User not found')

    return Response.json(user)
  }
)

export const PATCH = coreApi.middleware.withErrorHandler(
  async (request: Request) => {
    const session = await auth()
    if (!session?.user?.id) throw new ApiError(401, 'Authentication required')

    const data = await coreApi.middleware.validateRequest(request, updateProfileSchema)

    const withinLimit = await checkRateLimit(session.user.id, 'profile_update', 1, 1)
    if (!withinLimit) throw new ApiError(429, 'Rate limit exceeded')

    const user = await updateUserProfile(session.user.id, data)
    if (!user) throw new ApiError(404, 'User not found')

    return Response.json(user)
  }
)
