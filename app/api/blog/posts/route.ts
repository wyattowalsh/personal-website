import { api } from '@/lib/server';
import { api as coreApi } from '@/lib/core';

export const GET = coreApi.middleware.withErrorHandler(
  async (_request: Request) => {
    return api.handlers.getPosts();
  }
);