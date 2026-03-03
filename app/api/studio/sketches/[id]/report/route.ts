import { api as coreApi, ApiError } from '@/lib/core'
import { auth } from '@/lib/studio/auth'
import { reportSketch, checkRateLimit, getSketchById } from '@/lib/studio/db'
import { reportSketchSchema, sketchIdSchema } from '@/lib/studio/schemas'

type Props = { params: Promise<{ id: string }> }

export const POST = coreApi.middleware.withErrorHandler(
  async (request: Request, props: Props) => {
    const session = await auth()
    if (!session?.user?.id) throw new ApiError(401, 'Authentication required')

    const { id } = await props.params
    const validation = sketchIdSchema.safeParse({ id })
    if (!validation.success) throw new ApiError(400, 'Invalid sketch ID')

    const sketch = await getSketchById(id, session.user.id)
    if (!sketch) throw new ApiError(404, 'Sketch not found')

    const { reason } = await coreApi.middleware.validateRequest(request, reportSketchSchema)

    const withinLimit = await checkRateLimit(session.user.id, 'report', 10, 1)
    if (!withinLimit) throw new ApiError(429, 'Rate limit exceeded')

    const created = await reportSketch(id, session.user.id, reason)

    return new Response(null, { status: created ? 201 : 204 })
  }
)
