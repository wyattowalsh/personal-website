import { api as coreApi } from '@/lib/core';

export const GET = coreApi.middleware.withErrorHandler(
  async () => {
    return Response.json({ status: 'ok', timestamp: new Date().toISOString() });
  }
);
