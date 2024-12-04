// app/api/blog/posts/[slug]/route.ts
import { api } from '@/lib/server';
import { api as coreApi } from '@/lib/core';

export const GET = coreApi.middleware.withErrorHandler(
  async (request: Request, { params }: { params: { slug: string } }) => {
    return api.handlers.getPost(params.slug);
  }
);