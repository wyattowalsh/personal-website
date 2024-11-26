import { createRouteHandler } from '../../shared/route';
import { backend } from '@/lib/services/backend';
import { ApiError } from '@/lib/api';

export const GET = createRouteHandler({
  handler: async () => {
    const posts = await backend.getAllPosts();
    if (!posts.length) {
      throw new ApiError(404, 'No posts found');
    }
    return { posts };
  },
  cache: true,
  revalidate: 3600
});