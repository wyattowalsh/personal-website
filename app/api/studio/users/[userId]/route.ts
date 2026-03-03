import { api as coreApi, ApiError } from '@/lib/core'
import { getUserProfile } from '@/lib/studio/db'
import { userIdParamSchema } from '@/lib/studio/schemas'

type Props = {
  params: Promise<{
    userId: string
  }>
}

export const GET = coreApi.middleware.withErrorHandler(
  async (_request: Request, props: Props) => {
    const { userId } = await props.params
    const validation = userIdParamSchema.safeParse({ userId })
    if (!validation.success) {
      throw new ApiError(400, 'Invalid user ID', { errors: validation.error.issues })
    }

    const user = await getUserProfile(userId)
    if (!user) throw new ApiError(404, 'User not found')

    // Return public fields only — exclude email, provider, providerId, role
    return Response.json({
      id: user.id,
      name: user.name,
      displayName: user.displayName,
      image: user.image,
      bio: user.bio,
      website: user.website,
      socialLinks: user.socialLinks,
      createdAt: user.createdAt,
    })
  }
)
