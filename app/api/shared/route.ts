import { NextRequest } from 'next/server';
import { ApiError } from '@/lib/api';
import { z } from 'zod';

interface RouteHandlerOptions {
  schema?: z.ZodSchema;
  handler: (params: any) => Promise<any>;
  cache?: boolean;
  revalidate?: number;
}

async function handleRequest(
  req: NextRequest,
  options: RouteHandlerOptions
) {
  try {
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams);

    if (options.schema) {
      await options.schema.parseAsync(params);
    }

    const result = await options.handler(params);

    return Response.json(result, {
      headers: {
        'Cache-Control': options.cache 
          ? `public, s-maxage=${options.revalidate || 3600}, stale-while-revalidate=86400`
          : 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return error.toResponse();
    }
    return new ApiError(500, 'Internal Server Error', { error }).toResponse();
  }
}

// Export route handlers directly
export async function GET(req: NextRequest) {
  return handleRequest(req, {
    handler: async () => ({ message: "API endpoint working" }),
    cache: true,
    revalidate: 3600
  });
}

export async function POST(req: NextRequest) {
  return handleRequest(req, {
    handler: async () => ({ message: "POST endpoint working" })
  });
}
