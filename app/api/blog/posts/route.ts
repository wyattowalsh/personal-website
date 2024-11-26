// app/api/blog/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api/error';
import { validateRequest } from '@/lib/api/validate';
import { rateLimit } from '@/lib/api/rate-limit';
import { backend } from '@/lib/services/backend';

const rateLimiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500
});

export const GET = withErrorHandler(async (request: NextRequest) => {
  // Validate request and rate limit
  const valid = await validateRequest(request);
  if (!valid.success) {
    return NextResponse.json(valid.error, { status: 400 });
  }
  await rateLimiter.check(request, 30);

  try {
    const posts = await backend.getAllPosts();
    
    return new NextResponse(JSON.stringify(posts), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
});