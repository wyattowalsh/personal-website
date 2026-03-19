import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@sentry/nextjs', () => ({
  withScope: vi.fn(),
  captureException: vi.fn(),
}));

import { GET } from '../health/route';

describe('GET /api/health', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with status ok', async () => {
    const request = new Request('http://localhost/api/health');
    const response = await GET(request);

    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.status).toBe('ok');
  });

  it('includes a timestamp in ISO format', async () => {
    const request = new Request('http://localhost/api/health');
    const response = await GET(request);
    const body = await response.json();

    expect(body.timestamp).toBeDefined();
    // Verify it's a valid ISO date string
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
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
