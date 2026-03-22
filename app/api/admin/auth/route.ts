import { cookies } from 'next/headers';
import { z } from 'zod';
import { api as coreApi, ApiError } from '@/lib/core';
import {
  ADMIN_SESSION_COOKIE_MAX_AGE_SECONDS,
  ADMIN_SESSION_COOKIE_NAME,
  ADMIN_SESSION_LEGACY_PATH,
  checkRateLimit,
  validatePassword,
  createSessionToken,
  resolveAdminRateLimitKey,
  serializeAdminSessionCookie,
  validateAdminRequestOrigin,
  validateSessionToken,
} from '@/lib/admin-auth';

const loginSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

export const POST = coreApi.middleware.withErrorHandler(
  async (request: Request) => {
    if (!validateAdminRequestOrigin(request)) {
      throw new ApiError(403, 'Forbidden', undefined, 'FORBIDDEN_ORIGIN');
    }

    const rateLimitKey = resolveAdminRateLimitKey(request);
    if (!checkRateLimit(rateLimitKey)) {
      throw new ApiError(429, 'Too many attempts', undefined, 'RATE_LIMITED');
    }

    // Validate body with Zod
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ApiError(400, 'Malformed JSON request body');
    }

    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      throw new ApiError(400, 'Invalid request data', { errors: validation.error.issues });
    }

    const { password } = validation.data;
    const adminPassword = process.env.ADMIN_PASSWORD ?? '';

    // HR-3 + HR-5: padded timing-safe compare + HMAC session token
    if (!adminPassword || !validatePassword(password, adminPassword)) {
      throw new ApiError(401, 'Invalid password');
    }

    const token = createSessionToken(adminPassword);
    const response = Response.json({ success: true });
    response.headers.append(
      'Set-Cookie',
      serializeAdminSessionCookie(token, { maxAge: ADMIN_SESSION_COOKIE_MAX_AGE_SECONDS })
    );
    response.headers.append(
      'Set-Cookie',
      serializeAdminSessionCookie('', { maxAge: 0, path: ADMIN_SESSION_LEGACY_PATH })
    );
    return response;
  }
);

export const GET = coreApi.middleware.withErrorHandler(
  async () => {
    const cookieStore = await cookies();
    const session = cookieStore.get(ADMIN_SESSION_COOKIE_NAME);
    const adminPassword = process.env.ADMIN_PASSWORD ?? '';
    if (validateSessionToken(session?.value, adminPassword)) {
      return Response.json({ authenticated: true });
    }
    throw new ApiError(401, 'Not authenticated');
  }
);
