import { NextRequest } from 'next/server';
import { ApiError } from '@/lib/api';
import { backend } from '@/lib/services/backend';
import { z } from 'zod';

export const createRouteHandler = (options: {
  schema?: z.ZodSchema;
  handler: (params: any) => Promise<any>;
  cache?: boolean;
  revalidate?: number;
}) => {
  return async (req: NextRequest) => {
    try {
      const { searchParams } = new URL(req.url);
      const params = Object.fromEntries(searchParams);

      // Validate params if schema provided
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
  };
};
