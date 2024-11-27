import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

export const schemas = {
  slug: z.object({
    slug: z.string().min(1)
  }),
  search: z.object({
    query: z.string().min(1)
  })
};

export function withErrorHandler(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  };
}

export const commonMiddleware = withErrorHandler;
