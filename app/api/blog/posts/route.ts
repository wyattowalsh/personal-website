import { api } from '@/lib/server';
import { api as coreApi } from '@/lib/core';

export const GET = coreApi.middleware.withErrorHandler(
  async (request: Request) => {
    return api.handlers.getPosts();
  }
);