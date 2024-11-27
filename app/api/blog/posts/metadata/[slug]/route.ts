// app/api/blog/posts/metadata/[slug]/route.ts
import { NextRequest } from 'next/server';
import { getPostMetadata } from '@/lib/metadata';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const metadata = await getPostMetadata(slug);
    if (!metadata) {
      return new Response(null, { status: 404 });
    }
    
    return Response.json(metadata, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    });
  } catch (error) {
    return new Response(null, { status: 500 });
  }
}