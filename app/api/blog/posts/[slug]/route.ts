// app/api/blog/posts/[slug]/route.ts
import { api } from '@/lib/server';
import { api as coreApi, schemas, ApiError } from '@/lib/core';

export const GET = coreApi.middleware.withErrorHandler(
  async (request: Request, { params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params;

    // Validate slug
    const validation = schemas.slug.safeParse({ slug });
    if (!validation.success) {
      throw new ApiError(400, 'Invalid slug format', { errors: validation.error.issues });
    }

    return api.handlers.getPost(slug);
  }
);