import { BackendService, jsonResponse } from '@/lib/server';
import { api as coreApi } from '@/lib/core';
import { API_REVALIDATE_SECONDS } from '@/lib/constants';

export const revalidate = false;

export const GET = coreApi.middleware.withErrorHandler(
  async (_request: Request) => {
    await BackendService.ensurePreprocessed();
    const posts = await BackendService.getInstance().getPostSummaries();
    return jsonResponse(posts, { cache: API_REVALIDATE_SECONDS });
  }
);
