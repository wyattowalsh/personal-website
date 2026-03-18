import { cookies } from 'next/headers';
import { z } from 'zod';
import { api as coreApi, ApiError } from '@/lib/core';
import {
  checkRateLimit,
  validatePassword,
  createSessionToken,
  validateSessionToken,
} from '@/lib/admin-auth';

const loginSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

export const POST = coreApi.middleware.withErrorHandler(
  async (request: Request) => {
    // HR-4: rate limit by IP
    const ip =
      request.headers.get('x-real-ip')
      || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || 'unknown';
    if (!checkRateLimit(ip)) {
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
    response.headers.set(
      'Set-Cookie',
      `admin_session=${token}; HttpOnly; ${process.env.NODE_ENV === 'production' ? 'Secure; ' : ''}SameSite=Strict; Max-Age=${60 * 60 * 24}; Path=/admin`
    );
    return response;
  }
);

export const GET = coreApi.middleware.withErrorHandler(
  async () => {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    const adminPassword = process.env.ADMIN_PASSWORD ?? '';
    if (validateSessionToken(session?.value, adminPassword)) {
      return Response.json({ authenticated: true });
    }
    throw new ApiError(401, 'Not authenticated');
  }
);
