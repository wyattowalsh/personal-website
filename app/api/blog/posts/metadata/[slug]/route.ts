// app/api/blog/posts/metadata/[slug]/route.ts
import { NextRequest } from 'next/server';
import { BackendService } from '@/lib/server';
import { ApiError } from '@/lib/errors';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
): Promise<Response> {
  const { slug } = params;
  
  try {
    const post = await backend.getPost(slug);
    if (!post) {
      return new Response(null, { status: 404 });
    }
    
    return Response.json(post, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    });
  } catch (error) {
    console.error('Error fetching post metadata:', error);
    return new Response(null, { status: 500 });
  }
}