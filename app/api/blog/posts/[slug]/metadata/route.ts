import { BackendService, handleRequest } from '@/lib/server';
import { schemas, ApiError } from '@/lib/core';
import { API_REVALIDATE_SECONDS } from '@/lib/constants';

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(
  request: Request,
  props: Props
) {
  const { slug } = await props.params;

  // Validate slug
  const validation = schemas.slug.safeParse({ slug });
  if (!validation.success) {
    throw new ApiError(400, 'Invalid slug format', { errors: validation.error.issues });
  }

  await BackendService.ensurePreprocessed();

  return handleRequest({
    handler: async () => {
      const post = await BackendService.getInstance().getPost(slug);
      if (!post) {
        throw new ApiError(404, 'Post not found');
      }
      return post;
    },
    cache: API_REVALIDATE_SECONDS
  });
}
