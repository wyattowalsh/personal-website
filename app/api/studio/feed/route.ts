import { api as coreApi, ApiError, cacheControl } from '@/lib/core'
import { auth } from '@/lib/studio/auth'
import { getUserFeed } from '@/lib/studio/db'
import { feedQuerySchema } from '@/lib/studio/schemas'

export const GET = coreApi.middleware.withErrorHandler(
  async (request: Request) => {
    const session = await auth()
    if (!session?.user?.id) throw new ApiError(401, 'Authentication required')

    const { limit, offset, cursor } = await coreApi.middleware.validateRequest(
      request,
      feedQuerySchema
    )

    const result = await getUserFeed(session.user.id, limit, offset, cursor)
    return Response.json(result, {
      headers: {
        'Cache-Control': cacheControl.private(15),
        Vary: 'Cookie',
      },
    })
  }
)
