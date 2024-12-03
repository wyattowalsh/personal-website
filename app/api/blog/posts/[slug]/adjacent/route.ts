import { BackendService, ApiError, handleRequest } from '@/lib/server';
import { schemas } from '@/lib/core';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  return handleRequest({
    schema: schemas.slug,
    handler: async () => {
      await BackendService.ensurePreprocessed();
      return BackendService.getInstance().getAdjacentPosts(params.slug);
    },
    cache: 3600, // Cache for 1 hour
  });
}
