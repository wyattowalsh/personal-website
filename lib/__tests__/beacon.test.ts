import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/core', () => ({
  api: {
    middleware: {
      withErrorHandler: vi.fn((handler) => handler),
    },
  },
  ApiError: class ApiError extends Error {
    statusCode: number;
    details?: unknown;
    constructor(statusCode: number, message: string, details?: unknown) {
      super(message);
      this.statusCode = statusCode;
      this.details = details;
    }
  },
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

  it('throws ApiError for malformed JSON', async () => {
    const POST = await getHandler();
    const req = new Request('http://localhost/api/analytics/beacon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-real-ip': '1.2.3.4' },
      body: '{not valid json',
    });

    await expect(POST(req)).rejects.toThrow('Malformed JSON');
  });

  it('throws 400 when visitorId is missing', async () => {
    const POST = await getHandler();
    const { visitorId: _, ...noVisitor } = VALID_PAYLOAD;

    try {
      await POST(makeRequest(noVisitor));
      expect.fail('Expected ApiError');
    } catch (err: any) {
      expect(err.statusCode).toBe(400);
      expect(err.message).toBe('Invalid beacon payload');
    }
  });

  it('throws 400 for an invalid event type', async () => {
    const POST = await getHandler();

    try {
      await POST(makeRequest({ ...VALID_PAYLOAD, event: 'invalid_event' }));
      expect.fail('Expected ApiError');
    } catch (err: any) {
      expect(err.statusCode).toBe(400);
    }
  });

  it('throws 400 when device.userAgent exceeds 512 chars (HR-S-002)', async () => {
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

    try {
      await POST(makeRequest(payload));
      expect.fail('Expected ApiError');
    } catch (err: any) {
      expect(err.statusCode).toBe(400);
    }
  });

  it('throws 400 when data has more than 20 keys (HR-S-003)', async () => {
    const POST = await getHandler();

    const data: Record<string, string> = {};
    for (let i = 0; i < 25; i++) {
      data[`key${i}`] = 'value';
    }

    try {
      await POST(makeRequest({ ...VALID_PAYLOAD, data }));
      expect.fail('Expected ApiError');
    } catch (err: any) {
      expect(err.statusCode).toBe(400);
    }
  });
});

describe('POST /api/analytics/beacon — rate limiting (HR-S-001)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('returns 429 after 100 requests from the same IP', async () => {
    // Fresh import to get a clean rateLimitMap
    const { POST } = await import('@/app/api/analytics/beacon/route');

    const ip = '10.0.0.1';

    for (let i = 0; i < 100; i++) {
      const res = await POST(makeRequest(VALID_PAYLOAD, { 'x-real-ip': ip }));
      expect(res.status).toBe(202);
    }

    // 101st request should be rate-limited
    const res = await POST(makeRequest(VALID_PAYLOAD, { 'x-real-ip': ip }));
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('60');
  });
});
