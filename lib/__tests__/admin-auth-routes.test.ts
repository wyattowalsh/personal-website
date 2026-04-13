import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ADMIN_SESSION_COOKIE_MAX_AGE_SECONDS,
  ADMIN_SESSION_LEGACY_PATH,
} from '@/lib/admin-auth';

vi.mock('@/lib/core', () => ({
  api: {
    middleware: {
      withErrorHandler: vi.fn((handler) => handler),
    },
  },
  ApiError: class ApiError extends Error {
    statusCode: number;
    details?: unknown;
    code?: string;

    constructor(statusCode: number, message: string, details?: unknown, code?: string) {
      super(message);
      this.statusCode = statusCode;
      this.details = details;
      this.code = code;
    }
  },
}));

function makeLoginRequest(password: string, headers: HeadersInit = {}): Request {
  return new Request('http://localhost/api/admin/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({ password }),
  });
}

describe('admin auth session cookies', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('ADMIN_PASSWORD', 'correct horse battery staple');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('sets a root-scoped session cookie and clears the legacy admin-scoped cookie on login', async () => {
    const { POST } = await import('@/app/api/admin/auth/route');

    const response = await POST(makeLoginRequest(process.env.ADMIN_PASSWORD!));
    const setCookies = response.headers.getSetCookie();

    expect(response.status).toBe(200);
    expect(setCookies).toHaveLength(2);
    expect(
      setCookies.some(cookie =>
        cookie.includes(`Max-Age=${ADMIN_SESSION_COOKIE_MAX_AGE_SECONDS}; Path=/`)
        && cookie.includes('HttpOnly')
        && cookie.includes('SameSite=Strict')
      )
    ).toBe(true);
    expect(
      setCookies.some(cookie => cookie.includes(`Max-Age=0; Path=${ADMIN_SESSION_LEGACY_PATH}`))
    ).toBe(true);
  });

  it('clears both the root-scoped and legacy admin-scoped cookies on logout', async () => {
    const { POST } = await import('@/app/api/admin/auth/logout/route');

    const response = await POST(new Request('http://localhost/api/admin/auth/logout', {
      method: 'POST',
    }));
    const setCookies = response.headers.getSetCookie();

    expect(response.status).toBe(200);
    expect(setCookies).toHaveLength(2);
    expect(
      setCookies.some(cookie => cookie.includes('Max-Age=0; Path=/') && !cookie.includes('/admin'))
    ).toBe(true);
    expect(
      setCookies.some(cookie => cookie.includes(`Max-Age=0; Path=${ADMIN_SESSION_LEGACY_PATH}`))
    ).toBe(true);
  });

  it('rejects cross-origin login requests in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://w4w.dev');
    const { POST } = await import('@/app/api/admin/auth/route');

    await expect(
      POST(new Request('http://localhost/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          origin: 'https://evil.example',
        },
        body: JSON.stringify({ password: process.env.ADMIN_PASSWORD! }),
      }))
    ).rejects.toMatchObject({ statusCode: 403, code: 'FORBIDDEN_ORIGIN' });
  });

  it('rate limits login attempts even when proxy headers change between requests', async () => {
    const { POST } = await import('@/app/api/admin/auth/route');

    for (let attempt = 0; attempt < 5; attempt++) {
      await expect(
        POST(
          makeLoginRequest('wrong-password', {
            'x-real-ip': `127.0.0.${attempt + 1}`,
            'x-forwarded-for': `198.51.100.${attempt + 1}, 203.0.113.${attempt + 1}`,
          })
        )
      ).rejects.toMatchObject({ statusCode: 401 });
    }

    await expect(
      POST(
        makeLoginRequest('wrong-password', {
          'x-real-ip': '127.0.0.99',
          'x-forwarded-for': '198.51.100.99, 203.0.113.99',
        })
      )
    ).rejects.toMatchObject({ statusCode: 429, code: 'RATE_LIMITED' });
  });

  it('rejects cross-origin logout requests in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://w4w.dev');
    const { POST } = await import('@/app/api/admin/auth/logout/route');

    await expect(
      POST(new Request('http://localhost/api/admin/auth/logout', {
        method: 'POST',
        headers: {
          origin: 'https://evil.example',
        },
      }))
    ).rejects.toMatchObject({ statusCode: 403, code: 'FORBIDDEN_ORIGIN' });
  });
});
