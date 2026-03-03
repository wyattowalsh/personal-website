import { api as coreApi, ApiError } from '@/lib/core'
import { auth } from '@/lib/studio/auth'
import { getCollectionById, addToCollection, removeFromCollection, deleteCollection } from '@/lib/studio/db'
import { addToCollectionSchema, collectionIdSchema } from '@/lib/studio/schemas'

type Props = {
  params: Promise<{ id: string }>
}

export const GET = coreApi.middleware.withErrorHandler(
  async (_request: Request, props: Props) => {
    const { id } = await props.params
    const paramValidation = collectionIdSchema.safeParse({ id })
    if (!paramValidation.success) {
      throw new ApiError(400, 'Invalid collection ID', { errors: paramValidation.error.issues })
    }

    const session = await auth()
    const viewerId = session?.user?.id ?? null
    const collection = await getCollectionById(id, viewerId)
    if (!collection) throw new ApiError(404, 'Collection not found')

    return Response.json(collection)
  }
)

export const POST = coreApi.middleware.withErrorHandler(
  async (request: Request, props: Props) => {
    const session = await auth()
    if (!session?.user?.id) throw new ApiError(401, 'Authentication required')

    const { id } = await props.params
    const paramValidation = collectionIdSchema.safeParse({ id })
    if (!paramValidation.success) {
      throw new ApiError(400, 'Invalid collection ID', { errors: paramValidation.error.issues })
    }

    const { sketchId } = await coreApi.middleware.validateRequest(request, addToCollectionSchema)
    const success = await addToCollection(id, sketchId, session.user.id)
    if (!success) throw new ApiError(403, 'Collection not found or not owned by you')

    return Response.json({ success: true }, { status: 201 })
  }
)

export const DELETE = coreApi.middleware.withErrorHandler(
  async (request: Request, props: Props) => {
    const session = await auth()
    if (!session?.user?.id) throw new ApiError(401, 'Authentication required')

    const { id } = await props.params
    const paramValidation = collectionIdSchema.safeParse({ id })
    if (!paramValidation.success) {
      throw new ApiError(400, 'Invalid collection ID', { errors: paramValidation.error.issues })
    }

    // Body present: remove item from collection. No body: delete collection.
    if (request.body) {
      const { sketchId } = await coreApi.middleware.validateRequest(request, addToCollectionSchema)
      const removed = await removeFromCollection(id, sketchId, session.user.id)
      if (!removed) throw new ApiError(404, 'Item not found in collection')
      return new Response(null, { status: 204 })
    }

    // No body = delete the collection itself
    const deleted = await deleteCollection(id, session.user.id)
    if (!deleted) throw new ApiError(404, 'Collection not found or not owned by you')
    return new Response(null, { status: 204 })
  }
)
