import { BackendService, handleRequest } from '@/lib/server';
import { api as coreApi, schemas, ApiError } from '@/lib/core';
import { API_REVALIDATE_SECONDS } from '@/lib/constants';

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export const GET = coreApi.middleware.withErrorHandler(
  async (request: Request, props: Props) => {
    const { slug } = await props.params;

    // Validate slug
    const validation = schemas.slug.safeParse({ slug });
    if (!validation.success) {
      throw new ApiError(400, 'Invalid slug format', { errors: validation.error.issues });
    }

    await BackendService.ensurePreprocessed();

    return handleRequest({
      handler: async () => {
        return BackendService.getInstance().getAdjacentPosts(slug);
      },
      cache: API_REVALIDATE_SECONDS
    });
  }
);