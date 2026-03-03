import { put } from '@vercel/blob'
import { api as coreApi, ApiError } from '@/lib/core'
import { auth } from '@/lib/studio/auth'
import { updateThumbnailUrl, checkRateLimit, getSketchById } from '@/lib/studio/db'
import { sketchIdSchema } from '@/lib/studio/schemas'
import { STUDIO_MAX_THUMBNAIL_SIZE } from '@/lib/constants'

const PNG_MAGIC = new Uint8Array([0x89, 0x50, 0x4e, 0x47])

type Props = {
  params: Promise<{
    id: string
  }>
}

export const PUT = coreApi.middleware.withErrorHandler(
  async (request: Request, props: Props) => {
    const session = await auth()
    if (!session?.user?.id) throw new ApiError(401, 'Authentication required')

    const { id } = await props.params
    const validation = sketchIdSchema.safeParse({ id })
    if (!validation.success) {
      throw new ApiError(400, 'Invalid sketch ID', { errors: validation.error.issues })
    }

    const body = await request.arrayBuffer()
    if (!body || body.byteLength === 0) {
      throw new ApiError(400, 'Request body is empty')
    }
    if (body.byteLength > STUDIO_MAX_THUMBNAIL_SIZE) {
      throw new ApiError(400, `Thumbnail exceeds ${STUDIO_MAX_THUMBNAIL_SIZE / 1_000_000}MB limit`)
    }

    // Validate PNG magic bytes
    const header = new Uint8Array(body.slice(0, 4))
    if (!PNG_MAGIC.every((b, i) => header[i] === b)) {
      throw new ApiError(400, 'Thumbnail must be a PNG image')
    }

    // Rate limit uploads
    const withinLimit = await checkRateLimit(session.user.id, 'thumbnail_upload', 20, 1)
    if (!withinLimit) {
      throw new ApiError(429, 'Upload rate limit exceeded')
    }

    const sketch = await getSketchById(id, session.user.id)
    if (!sketch || sketch.authorId !== session.user.id) {
      throw new ApiError(404, 'Sketch not found or not owned by you')
    }

    const blob = await put(`studio/thumbnails/${id}.png`, body, {
      access: 'public',
      contentType: 'image/png',
    })

    const updated = await updateThumbnailUrl(id, blob.url, session.user.id)
    if (!updated) throw new ApiError(404, 'Sketch not found or not owned by you')

    return Response.json({ url: blob.url })
  }
)
