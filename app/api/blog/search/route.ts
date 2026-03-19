import { BackendService, jsonResponse } from '@/lib/server';
import { api as coreApi, schemas } from '@/lib/core';
import { API_REVALIDATE_SECONDS } from '@/lib/constants';

export const revalidate = false;

export const GET = coreApi.middleware.withErrorHandler(
  async (request: Request) => {
    const { query } = await coreApi.middleware.validateRequest(request, schemas.search);
    await BackendService.ensurePreprocessed();
    const results = await BackendService.getInstance().search(query);
    return jsonResponse(results, { cache: API_REVALIDATE_SECONDS });
  }
);
