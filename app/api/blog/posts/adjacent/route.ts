import { NextResponse } from 'next/server';
import { getAdjacentPosts } from '@/lib/posts';

export const revalidate = 3600; // Revalidate every hour

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return new NextResponse('Slug is required', { status: 400 });
    }

    const adjacentPosts = await getAdjacentPosts(slug);
    
    return new NextResponse(JSON.stringify(adjacentPosts), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    });
  } catch (error) {
    console.error('Error in adjacent posts route:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Internal Server Error' }), 
      { status: 500 }
    );
  }
}
