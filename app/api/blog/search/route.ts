import { NextRequest } from 'next/server';
import { schemas } from '@/lib/api/middleware';
import { backend } from '@/lib/services/backend';
import { ApiError } from '@/lib/api';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { query } = Object.fromEntries(searchParams);
    
    await schemas.search.parseAsync({ query });
    
    return Response.json({
      results: await backend.search(query),
      metadata: {
        query,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return error.toResponse();
    }
    return new ApiError(500, 'Internal Server Error', { error }).toResponse();
  }
}
