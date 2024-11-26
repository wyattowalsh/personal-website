// app/api/blog/posts/metadata/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api/error';
import { validateRequest } from '@/lib/api/validate';
import { rateLimit } from '@/lib/api/rate-limit';
import { backend } from '@/lib/services/backend';

const rateLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500
});

export const GET = withErrorHandler(async (request: NextRequest) => {
  const url = new URL(request.url);
  const slug = url.pathname.split('/').pop();

  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
  }

  // Validate request and rate limit
  const valid = await validateRequest(request);
  if (!valid.success) {
    return NextResponse.json(valid.error, { status: 400 });
  }
  await rateLimiter.check(request, 60);

  try {
    const post = await backend.getPost(slug);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(
      { metadata: post },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
          'X-Cache': 'HIT'
        },
      }
    );
  } catch (error) {
    console.error('Error retrieving post metadata:', error);
    throw error;
  }
});