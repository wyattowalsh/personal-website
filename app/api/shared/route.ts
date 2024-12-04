import { api } from '@/lib/server';
import { api as coreApi } from '@/lib/core';

export const GET = coreApi.middleware.withErrorHandler(
  async (request: Request) => {
    return api.utils.handleRequest({
      handler: async () => ({ message: "API endpoint working" }),
      cache: 3600
    });
  }
);

export const POST = coreApi.middleware.withErrorHandler(
  async (request: Request) => {
    return api.utils.handleRequest({
      handler: async () => ({ message: "POST endpoint working" })
    });
  }
);
