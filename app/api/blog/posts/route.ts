import { NextRequest } from 'next/server';
import { backend } from '@/lib/services/backend';
import { ApiError } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const posts = await backend.getAllPosts();
    if (!posts.length) {
      throw new ApiError(404, 'No posts found');
    }
    
    return Response.json(
      { posts },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
        }
      }
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return error.toResponse();
    }
    return new ApiError(500, 'Internal Server Error', { error }).toResponse();
  }
}