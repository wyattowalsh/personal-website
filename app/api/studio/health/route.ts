import { api as coreApi } from '@/lib/core'
import { getStudioHealthResponse } from '@/lib/studio/health'

export const GET = coreApi.middleware.withErrorHandler(
  async () => getStudioHealthResponse({ includeInternalDetails: true }),
)
