import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

class TestApiError extends Error {
  statusCode: number;
  details?: unknown;
  code?: string;

  constructor(statusCode: number, message: string, details?: unknown, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.code = code;
  }
}

const validateAdminSessionMock = vi.fn();
const validateRequestOriginMock = vi.fn();
const validateSessionTokenMock = vi.fn();
const resolveClientIpMock = vi.fn();
const ensurePreprocessedMock = vi.fn();
const logAuditEventMock = vi.fn();

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://w4w.dev');

  vi.doMock('@/lib/core', () => ({
    ApiError: TestApiError,
    api: {
      middleware: {
        withErrorHandler: vi.fn((handler) => handler),
        validateRequest: vi.fn(async (request: Request, schema: { safeParse: (data: unknown) => { success: boolean; data?: unknown; error?: unknown } }) => {
          const validation = schema.safeParse(await request.json());
          if (!validation.success) {
            throw new TestApiError(400, 'Invalid request data', { errors: validation.error });
          }
          return validation.data;
        }),
      },
    },
  }));

  vi.doMock('@/app/admin/lib/auth', () => ({
    validateAdminSession: validateAdminSessionMock,
  }));

  vi.doMock('@/lib/admin-auth', () => ({
    ADMIN_SESSION_COOKIE_NAME: 'admin_session',
    resolveClientIp: resolveClientIpMock,
    validateRequestOrigin: validateRequestOriginMock,
    validateSessionToken: validateSessionTokenMock,
  }));

  vi.doMock('next/headers', () => ({
    cookies: vi.fn(async () => ({ get: vi.fn(() => ({ value: 'session' })) })),
  }));

  vi.doMock('@/lib/server', () => ({
    BackendService: {
      ensurePreprocessed: ensurePreprocessedMock,
      getInstance: vi.fn(() => ({ getAllPosts: vi.fn(async () => []) })),
    },
  }));

  vi.doMock('@/app/admin/lib/visitor-analytics', () => ({
    getVisitorAnalyticsSnapshot: vi.fn(async () => ({
      status: 'unavailable',
      windowDays: 30,
      generatedAt: '2026-05-07T00:00:00.000Z',
      overview: [],
      topPages: [],
      referrers: [],
      devices: [],
    })),
  }));

  vi.doMock('@/app/admin/lib/analytics-rollups', () => ({
    getRollupConfig: vi.fn(() => ({ config: null })),
  }));

  vi.doMock('@libsql/client/web', () => ({
    createClient: vi.fn(),
  }));

  vi.doMock('@/app/admin/lib/audit-log', () => ({
    getAuditLog: vi.fn(async () => []),
    logAuditEvent: logAuditEventMock,
  }));

  vi.doMock('@/lib/config', () => ({
    getConfig: vi.fn(() => ({ site: { url: 'https://w4w.dev' } })),
  }));
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('admin API security boundaries', () => {
  it('requires an admin session before exporting data', async () => {
    validateAdminSessionMock.mockResolvedValue(false);
    const { GET } = await import('@/app/api/admin/export/route');

    await expect(
      GET(new Request('http://localhost/api/admin/export?format=json&type=posts')),
    ).rejects.toMatchObject({ statusCode: 401 });
    expect(ensurePreprocessedMock).not.toHaveBeenCalled();
  });

  it('rejects cross-origin audit-log writes before validating the body', async () => {
    validateRequestOriginMock.mockReturnValue(false);
    validateAdminSessionMock.mockResolvedValue(true);
    const { POST } = await import('@/app/api/admin/audit-log/route');

    await expect(
      POST(new Request('http://localhost/api/admin/audit-log', {
        method: 'POST',
        headers: { origin: 'https://evil.example' },
        body: JSON.stringify({ action: 'EXPORT', actor: 'admin' }),
      })),
    ).rejects.toMatchObject({ statusCode: 403, code: 'FORBIDDEN_ORIGIN' });
    expect(validateAdminSessionMock).not.toHaveBeenCalled();
    expect(logAuditEventMock).not.toHaveBeenCalled();
  });

  it('derives audit-log actor and IP server-side', async () => {
    validateRequestOriginMock.mockReturnValue(true);
    validateAdminSessionMock.mockResolvedValue(true);
    resolveClientIpMock.mockReturnValue(null);
    const { POST } = await import('@/app/api/admin/audit-log/route');

    const response = await POST(new Request('http://localhost/api/admin/audit-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'EXPORT',
        actor: 'attacker-controlled',
        resource: '/admin/content',
        ip: '203.0.113.99',
      }),
    }));

    expect(response.status).toBe(200);
    expect(logAuditEventMock).toHaveBeenCalledWith({
      action: 'EXPORT',
      actor: 'admin',
      resource: '/admin/content',
      ip: undefined,
    });
  });

  it('rejects IndexNow URLs from a different origin on the same hostname', async () => {
    validateRequestOriginMock.mockReturnValue(true);
    validateSessionTokenMock.mockReturnValue(true);
    vi.stubEnv('INDEXNOW_KEY', 'indexnow-key');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const { POST } = await import('@/app/api/admin/indexnow/route');

    await expect(
      POST(new Request('http://localhost/api/admin/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: ['http://w4w.dev/blog'] }),
      })),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
