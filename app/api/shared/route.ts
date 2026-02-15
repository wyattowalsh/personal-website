import { api } from '@/lib/server';
import { api as coreApi } from '@/lib/core';
import { API_REVALIDATE_SECONDS } from '@/lib/constants';

export const GET = coreApi.middleware.withErrorHandler(
  async (request: Request) => {
    return api.utils.handleRequest({
      handler: async () => ({ message: "API endpoint working" }),
      cache: API_REVALIDATE_SECONDS
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
