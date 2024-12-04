import { api } from '@/lib/server';
import { api as coreApi, apiSchemas } from '@/lib/core';

export const GET = coreApi.middleware.withErrorHandler(
  async (request: Request) => {
    const { query } = await coreApi.middleware.validateRequest(request, apiSchemas.search);
    return api.handlers.searchPosts(query);
  }
);
