import { describe, it, expect, vi, beforeEach } from 'vitest';

const { MockApiError } = vi.hoisted(() => {
  class MockApiError extends Error {
    statusCode: number;
    details?: unknown;
    constructor(statusCode: number, message: string, details?: unknown) {
      super(message);
      this.statusCode = statusCode;
      this.details = details;
    }
    toResponse() {
      return Response.json(
        { error: { message: this.message, code: `ERR_${this.statusCode}` } },
        { status: this.statusCode },
      );
    }
  }
  return { MockApiError };
});

vi.mock('@/lib/core', () => ({
  api: {
    middleware: {
      withErrorHandler: vi.fn((handler: Function) =>
        async (...args: unknown[]) => {
          try {
            return await handler(...args);
          } catch (err) {
            if (err instanceof MockApiError) return err.toResponse();
            return Response.json({ error: { message: 'Internal server error' } }, { status: 500 });
          }
        }
      ),
    },
  },
  ApiError: MockApiError,
}));

function makeRequest(body: unknown, headers?: Record<string, string>): Request {
  return new Request('http://localhost/api/analytics/beacon', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-real-ip': '1.2.3.4',
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

const VALID_PAYLOAD = {
  visitorId: 'test-id',
  sessionId: '550e8400-e29b-41d4-a716-446655440000',
  event: 'page_view',
  url: 'https://example.com/blog',
  referrer: 'https://google.com',
  title: 'Test Page',
  timestamp: Date.now(),
};

describe('POST /api/analytics/beacon', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  // Import lazily so the mock is in place
  async function getHandler() {
    const { POST } = await import('@/app/api/analytics/beacon/route');
    return POST;
  }

  it('returns 202 for a valid payload', async () => {
    const POST = await getHandler();
    const res = await POST(makeRequest(VALID_PAYLOAD));
    expect(res.status).toBe(202);
    expect(await res.json()).toEqual({ ok: true });
  });

  it('returns 400 for malformed JSON', async () => {
    const POST = await getHandler();
    const req = new Request('http://localhost/api/analytics/beacon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-real-ip': '1.2.3.4' },
      body: '{not valid json',
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when visitorId is missing', async () => {
    const POST = await getHandler();
    const { visitorId: _, ...noVisitor } = VALID_PAYLOAD;

    const res = await POST(makeRequest(noVisitor));
    expect(res.status).toBe(400);
  });

  it('returns 400 for an invalid event type', async () => {
    const POST = await getHandler();

    const res = await POST(makeRequest({ ...VALID_PAYLOAD, event: 'invalid_event' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when device.userAgent exceeds 512 chars (HR-S-002)', async () => {
    const POST = await getHandler();

    const payload = {
      ...VALID_PAYLOAD,
      device: {
        screenWidth: 1920,
        screenHeight: 1080,
        devicePixelRatio: 2,
        colorDepth: 24,
        touchPoints: 0,
        userAgent: 'x'.repeat(1000),
        platform: 'test',
        language: 'en',
        languages: ['en'],
        cookieEnabled: true,
        connectionType: null,
        connectionDownlink: null,
        hardwareConcurrency: 8,
        deviceMemory: null,
        viewportWidth: 1920,
        viewportHeight: 1080,
        orientation: 'landscape',
        timezone: 'UTC',
        timezoneOffset: 0,
        webglRenderer: null,
        webglVendor: null,
        pdfViewerEnabled: true,
      },
    };

    const res = await POST(makeRequest(payload));
    expect(res.status).toBe(400);
  });

  it('returns 400 when data has more than 20 keys (HR-S-003)', async () => {
    const POST = await getHandler();

    const data: Record<string, string> = {};
    for (let i = 0; i < 25; i++) {
      data[`key${i}`] = 'value';
    }

    const res = await POST(makeRequest({ ...VALID_PAYLOAD, data }));
    expect(res.status).toBe(400);
  });
});

describe('POST /api/analytics/beacon — rate limiting (HR-S-001)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('returns 429 after 100 requests from the same IP', async () => {
    // Fresh import to get a clean rateLimitMap — vi.resetModules() in beforeEach
    // clears the module cache so each test gets its own rate limiter instance
    const { POST } = await import('@/app/api/analytics/beacon/route');

    const ip = '10.0.0.1';
    let successCount = 0;

    for (let i = 0; i < 100; i++) {
      const res = await POST(makeRequest(VALID_PAYLOAD, { 'x-real-ip': ip }));
      expect(res.status).toBe(202);
      successCount++;
    }

    // Defensive: ensures loop completed all 100 iterations before checking 429
    expect(successCount).toBe(100);

    // 101st request should be rate-limited
    const res = await POST(makeRequest(VALID_PAYLOAD, { 'x-real-ip': ip }));
    expect(res.status).toBe(429);
  });
});
