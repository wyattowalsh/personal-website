import { createHash } from 'crypto'
import { api as coreApi, ApiError } from '@/lib/core'
import { auth } from '@/lib/studio/auth'
import { getSketchById, recordSketchView } from '@/lib/studio/db'
import { sketchIdSchema } from '@/lib/studio/schemas'
import { studioAnalytics } from '@/lib/studio/analytics'

type Props = {
  params: Promise<{
    id: string
  }>
}

function getViewerHash(request: Request, viewerId?: string): string {
  if (viewerId) {
    return createHash('sha256').update(`user:${viewerId}`).digest('hex')
  }

  const forwardedFor = request.headers.get('x-forwarded-for')
  const ip = forwardedFor?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')?.trim()
    ?? 'unknown'
  const userAgent = request.headers.get('user-agent')?.slice(0, 256) ?? 'unknown'

  return createHash('sha256').update(`anon:${ip}:${userAgent}`).digest('hex')
}

export const POST = coreApi.middleware.withErrorHandler(
  async (request: Request, props: Props) => {
    const { id } = await props.params
    const validation = sketchIdSchema.safeParse({ id })
    if (!validation.success) {
      throw new ApiError(400, 'Invalid sketch ID', { errors: validation.error.issues })
    }

    const session = await auth()
    const sketch = await getSketchById(id, session?.user?.id)
    if (!sketch) throw new ApiError(404, 'Sketch not found')

    const counted = await recordSketchView(id, getViewerHash(request, session?.user?.id))
    if (counted) {
      studioAnalytics.sketchViewed({ sketchId: id })
    }

    return new Response(null, { status: 204 })
  }
)
