import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/server', () => {
  throw new Error('GET /api/health must remain decoupled from BackendService');
});

vi.mock('@/lib/admin-auth', () => {
  throw new Error('GET /api/health must not expose admin telemetry');
});

vi.mock('@sentry/nextjs', () => ({
  withScope: vi.fn(),
  captureException: vi.fn(),
}));

import { GET } from '../health/route';

describe('GET /api/health', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the minimal public health payload', async () => {
    const request = new Request('http://localhost/api/health');
    const response = await GET(request);

    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toEqual({
      status: 'ok',
      timestamp: expect.any(String),
      uptimeSeconds: expect.any(Number),
    });

    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
    expect(body.uptimeSeconds).toBeGreaterThanOrEqual(0);
  });

  it('does not expose privileged telemetry fields', async () => {
    const request = new Request('http://localhost/api/health');
    const response = await GET(request);
    const body = await response.json();

    for (const field of ['security', 'memory', 'preprocess', 'content']) {
      expect(body).not.toHaveProperty(field);
    }
  });

  it('includes a correlation id header', async () => {
    const request = new Request('http://localhost/api/health');
    const response = await GET(request);

    expect(response.headers.get('x-correlation-id')).toBeTruthy();
  });

  it('echoes back a provided correlation id', async () => {
    const request = new Request('http://localhost/api/health', {
      headers: { 'x-correlation-id': 'test-corr-123' },
    });
    const response = await GET(request);

    expect(response.headers.get('x-correlation-id')).toBe('test-corr-123');
  });
});
