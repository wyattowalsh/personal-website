import { api as coreApi, ApiError } from '@/lib/core'
import { auth } from '@/lib/studio/auth'
import { getSketchById, getRelatedSketches, updateSketch, deleteSketch } from '@/lib/studio/db'
import { updateSketchSchema, sketchIdSchema } from '@/lib/studio/schemas'

type Props = {
  params: Promise<{
    id: string
  }>
}

export const GET = coreApi.middleware.withErrorHandler(
  async (_request: Request, props: Props) => {
    const { id } = await props.params
    const validation = sketchIdSchema.safeParse({ id })
    if (!validation.success) {
      throw new ApiError(400, 'Invalid sketch ID', { errors: validation.error.issues })
    }

    const session = await auth()
    const sketch = await getSketchById(id, session?.user?.id)
    if (!sketch) throw new ApiError(404, 'Sketch not found')

    const related = sketch.tags.length > 0
      ? await getRelatedSketches(id, sketch.tags as string[], 6)
      : []

    return Response.json({ ...sketch, related })
  }
)

export const PATCH = coreApi.middleware.withErrorHandler(
  async (request: Request, props: Props) => {
    const session = await auth()
    if (!session?.user?.id) throw new ApiError(401, 'Authentication required')

    const { id } = await props.params
    const validation = sketchIdSchema.safeParse({ id })
    if (!validation.success) {
      throw new ApiError(400, 'Invalid sketch ID', { errors: validation.error.issues })
    }

    const data = await coreApi.middleware.validateRequest(request, updateSketchSchema)
    const sketch = await updateSketch(id, data, session.user.id)
    if (!sketch) throw new ApiError(404, 'Sketch not found or not owned by you')

    return Response.json(sketch)
  }
)

export const DELETE = coreApi.middleware.withErrorHandler(
  async (_request: Request, props: Props) => {
    const session = await auth()
    if (!session?.user?.id) throw new ApiError(401, 'Authentication required')

    const { id } = await props.params
    const validation = sketchIdSchema.safeParse({ id })
    if (!validation.success) {
      throw new ApiError(400, 'Invalid sketch ID', { errors: validation.error.issues })
    }

    const deleted = await deleteSketch(id, session.user.id)
    if (!deleted) throw new ApiError(404, 'Sketch not found or not owned by you')

    return new Response(null, { status: 204 })
  }
)
