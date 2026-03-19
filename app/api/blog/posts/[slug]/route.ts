// app/api/blog/posts/[slug]/route.ts
import { BackendService, jsonResponse } from '@/lib/server';
import { api as coreApi, schemas, ApiError } from '@/lib/core';
import { API_REVALIDATE_SECONDS } from '@/lib/constants';

export const GET = coreApi.middleware.withErrorHandler(
  async (request: Request, { params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params;

    // Validate slug
    const validation = schemas.slug.safeParse({ slug });
    if (!validation.success) {
      throw new ApiError(400, 'Invalid slug format', { errors: validation.error.issues });
    }

    await BackendService.ensurePreprocessed();
    const post = await BackendService.getInstance().getPost(slug);
    if (!post) throw new ApiError(404, 'Post not found');
    return jsonResponse(post, { cache: API_REVALIDATE_SECONDS });
  }
);
