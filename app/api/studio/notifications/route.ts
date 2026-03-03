import { api as coreApi, ApiError } from '@/lib/core'
import { auth } from '@/lib/studio/auth'
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationsRead,
  deleteNotifications,
} from '@/lib/studio/db'
import {
  listNotificationsSchema,
  markNotificationsReadSchema,
} from '@/lib/studio/schemas'

export const GET = coreApi.middleware.withErrorHandler(
  async (request: Request) => {
    const session = await auth()
    if (!session?.user?.id) throw new ApiError(401, 'Authentication required')

    const { limit, offset, unreadOnly, countOnly } = await coreApi.middleware.validateRequest(
      request,
      listNotificationsSchema
    )

    if (countOnly && unreadOnly) {
      const total = await getUnreadNotificationCount(session.user.id)
      return Response.json({ notifications: [], total })
    }

    const result = await getNotifications(session.user.id, limit, offset, unreadOnly)
    return Response.json(result)
  }
)

export const PATCH = coreApi.middleware.withErrorHandler(
  async (request: Request) => {
    const session = await auth()
    if (!session?.user?.id) throw new ApiError(401, 'Authentication required')

    const { ids, all } = await coreApi.middleware.validateRequest(
      request,
      markNotificationsReadSchema
    )

    if (!ids && !all) {
      throw new ApiError(400, 'Must provide either "ids" or "all: true"')
    }

    if (all) {
      await markNotificationsRead(session.user.id)
    } else if (ids) {
      await markNotificationsRead(session.user.id, ids)
    }

    return Response.json({ success: true })
  }
)

export const DELETE = coreApi.middleware.withErrorHandler(
  async (request: Request) => {
    const session = await auth()
    if (!session?.user?.id) throw new ApiError(401, 'Authentication required')

    const { ids, all } = await coreApi.middleware.validateRequest(
      request,
      markNotificationsReadSchema
    )

    if (!ids && !all) {
      throw new ApiError(400, 'Must provide either "ids" or "all: true"')
    }

    if (all) {
      await deleteNotifications(session.user.id)
    } else if (ids) {
      await deleteNotifications(session.user.id, ids)
    }

    return new Response(null, { status: 204 })
  }
)
