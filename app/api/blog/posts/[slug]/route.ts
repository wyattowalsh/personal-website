import { NextResponse } from 'next/server';
import { getPostBySlug } from '@/lib/posts';
import { revalidatePath } from 'next/cache';

export const revalidate = 3600; // Revalidate every hour

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    if (!params.slug) {
      return new NextResponse('Slug is required', { status: 400 });
    }

    const post = await getPostBySlug(params.slug);
    
    if (!post) {
      return new NextResponse('Post not found', { 
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Cache the response for 1 hour
    return new NextResponse(JSON.stringify(post), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    });
  } catch (error) {
    console.error('Error in post route:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Internal Server Error' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
