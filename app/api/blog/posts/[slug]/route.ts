import { createRouteHandler } from '../../../shared/route';
import { backend } from '@/lib/services/backend';
import { ApiError } from '@/lib/api';
import { schemas } from '@/lib/api';

export const GET = createRouteHandler({
  schema: schemas.slug,
  handler: async ({ slug }) => {
    const post = await backend.getPost(slug);
    if (!post) {
      throw new ApiError(404, `Post ${slug} not found`);
    }
    return { post };
  },
  cache: true,
  revalidate: 3600
});
