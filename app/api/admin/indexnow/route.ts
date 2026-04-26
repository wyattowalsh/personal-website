import { cookies } from 'next/headers';
import { z } from 'zod';
import { api as coreApi, ApiError } from '@/lib/core';
import {
  ADMIN_SESSION_COOKIE_NAME,
  validateRequestOrigin,
  validateSessionToken,
} from '@/lib/admin-auth';

const indexNowSchema = z.object({
  urls: z.array(z.string().url()).min(1).max(100),
});

function getSiteUrl(): URL {
  return new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.w4w.dev');
}

export const POST = coreApi.middleware.withErrorHandler(
  async (request: Request) => {
    if (!validateRequestOrigin(request)) {
      throw new ApiError(403, 'Forbidden', undefined, 'FORBIDDEN_ORIGIN');
    }

    const cookieStore = await cookies();
    const session = cookieStore.get(ADMIN_SESSION_COOKIE_NAME);
    const adminPassword = process.env.ADMIN_PASSWORD ?? '';
    if (!validateSessionToken(session?.value, adminPassword)) {
      throw new ApiError(401, 'Not authenticated');
    }

    const key = process.env.INDEXNOW_KEY?.trim();
    if (!key) {
      throw new ApiError(400, 'INDEXNOW_KEY is not configured', undefined, 'INDEXNOW_NOT_CONFIGURED');
    }

    const body = await coreApi.middleware.validateRequest(request, indexNowSchema);
    const siteUrl = getSiteUrl();
    const invalidUrl = body.urls.find((url) => new URL(url).hostname !== siteUrl.hostname);
    if (invalidUrl) {
      throw new ApiError(400, 'IndexNow URLs must belong to the configured site host', { invalidUrl });
    }

    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: siteUrl.hostname,
        key,
        keyLocation: `${siteUrl.origin}/indexnow-key.txt`,
        urlList: body.urls,
      }),
    });

    return Response.json({
      success: response.ok,
      status: response.status,
      accepted: response.status === 200 || response.status === 202,
    }, { status: response.ok ? 200 : response.status });
  }
);
