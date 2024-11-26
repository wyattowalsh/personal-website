// app/api/blog/posts/metadata/[slug]/route.ts
import { NextRequest } from 'next/server';
import { commonMiddleware, schemas } from '@/lib/api/middleware';
import { getPostMetadata } from '@/lib/metadata';

export const GET = commonMiddleware.cached.withMiddleware(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');

  // Validate slug
  await schemas.slug.parseAsync({ slug });

  // Get post metadata
  const metadata = await getPostMetadata(slug);
  if (!metadata) {
    throw new Error('Post not found');
  }

  return Response.json({ metadata });
});