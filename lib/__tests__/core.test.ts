import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @sentry/nextjs before importing core
vi.mock('@sentry/nextjs', () => ({
  withScope: vi.fn((cb) => cb({ setTag: vi.fn() })),
  captureException: vi.fn(),
}));

import { ApiError, api, getConfig, getDefaultMetadata, schemas } from '@/lib/core';

// ---------------------------------------------------------------------------
// ApiError
// ---------------------------------------------------------------------------
describe('ApiError', () => {
  it('sets message, statusCode, and details via constructor', () => {
    const err = new ApiError(422, 'Validation failed', { field: 'email' });
    expect(err.message).toBe('Validation failed');
    expect(err.statusCode).toBe(422);
    expect(err.details).toEqual({ field: 'email' });
    expect(err.name).toBe('ApiError');
  });

  it('sets optional code property', () => {
    const err = new ApiError(409, 'Conflict', undefined, 'ERR_DUPLICATE');
    expect(err.code).toBe('ERR_DUPLICATE');
  });

  it.each([400, 404, 500])('preserves status code %i in toResponse()', async (status) => {
    const err = new ApiError(status, 'msg');
    const res = err.toResponse();
    expect(res.status).toBe(status);
    const body = await res.json();
    expect(body.error.message).toBe('msg');
    expect(body.error.code).toBe(`ERR_${status}`);
  });

  it('toResponse() returns proper JSON error structure', async () => {
    const err = new ApiError(400, 'Bad request', { hint: 'missing field' }, 'INVALID');
    const res = err.toResponse();
    const body = await res.json();
    expect(body).toEqual({
      error: {
        message: 'Bad request',
        code: 'INVALID',
        details: { hint: 'missing field' },
      },
    });
  });

  it('toResponse() includes correlationId when provided', async () => {
    const err = new ApiError(404, 'Not found');
    const res = err.toResponse('corr-123');
    const body = await res.json();
    expect(body.error.correlationId).toBe('corr-123');
  });

  it('toResponse() omits correlationId when not provided', async () => {
    const err = new ApiError(400, 'Bad');
    const body = await err.toResponse().json();
    expect(body.error).not.toHaveProperty('correlationId');
  });
});

// ---------------------------------------------------------------------------
// resolveCorrelationId (tested indirectly through withErrorHandler)
// ---------------------------------------------------------------------------
describe('resolveCorrelationId (via withErrorHandler)', () => {
  it('returns provided header value as x-correlation-id', async () => {
    const handler = api.middleware.withErrorHandler(async (_req: Request) =>
      Response.json({ ok: true }),
    );
    const req = new Request('http://localhost/api/test', {
      headers: { 'x-correlation-id': 'my-id-123' },
    });
    const res = await handler(req);
    expect(res.headers.get('x-correlation-id')).toBe('my-id-123');
  });

  it('truncates long correlation ids (generates UUID instead)', async () => {
    const handler = api.middleware.withErrorHandler(async (_req: Request) =>
      Response.json({ ok: true }),
    );
    const longId = 'x'.repeat(200);
    const req = new Request('http://localhost/api/test', {
      headers: { 'x-correlation-id': longId },
    });
    const res = await handler(req);
    const id = res.headers.get('x-correlation-id')!;
    // Should be a UUID since the long value exceeds 128 chars
    expect(id).not.toBe(longId);
    expect(id.length).toBeLessThanOrEqual(128);
  });

  it('strips non-printable ASCII from correlation id', async () => {
    // The resolveCorrelationId function strips characters outside \x20-\x7E.
    // We test with a header value that is valid per the fetch spec but contains
    // characters outside the printable ASCII range that the sanitiser removes.
    // Characters like \x7F (DEL) are valid HTTP header bytes but are stripped.
    const handler = api.middleware.withErrorHandler(async (_req: Request) =>
      Response.json({ ok: true }),
    );
    const req = new Request('http://localhost/api/test', {
      headers: { 'x-correlation-id': 'abc\x7Fdef' },
    });
    const res = await handler(req);
    const id = res.headers.get('x-correlation-id')!;
    // \x7F is outside \x20-\x7E so it gets stripped → 'abcdef'
    expect(id).toBe('abcdef');
  });

  it('generates UUID when no header present', async () => {
    const handler = api.middleware.withErrorHandler(async (_req: Request) =>
      Response.json({ ok: true }),
    );
    const req = new Request('http://localhost/api/test');
    const res = await handler(req);
    const id = res.headers.get('x-correlation-id')!;
    // UUID v4 format
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });
});

// ---------------------------------------------------------------------------
// api.middleware.withErrorHandler
// ---------------------------------------------------------------------------
describe('api.middleware.withErrorHandler', () => {
  it('wraps a successful handler and returns its response', async () => {
    const handler = api.middleware.withErrorHandler(async (_req: Request) =>
      Response.json({ data: 'hello' }),
    );
    const req = new Request('http://localhost/api/test');
    const res = await handler(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toBe('hello');
  });

  it('adds x-correlation-id header to successful responses', async () => {
    const handler = api.middleware.withErrorHandler(async (_req: Request) =>
      Response.json({ ok: true }),
    );
    const req = new Request('http://localhost/api/test');
    const res = await handler(req);
    expect(res.headers.get('x-correlation-id')).toBeTruthy();
  });

  it('catches ApiError and returns structured error response', async () => {
    const handler = api.middleware.withErrorHandler(async (_req: Request): Promise<Response> => {
      throw new ApiError(422, 'Invalid input', { field: 'name' });
    });
    const req = new Request('http://localhost/api/test');
    const res = await handler(req);
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error.message).toBe('Invalid input');
    expect(body.error.details).toEqual({ field: 'name' });
    expect(res.headers.get('x-correlation-id')).toBeTruthy();
  });

  it('catches generic Error and returns 500', async () => {
    const handler = api.middleware.withErrorHandler(async (_req: Request): Promise<Response> => {
      throw new Error('unexpected');
    });
    const req = new Request('http://localhost/api/test');
    const res = await handler(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error.message).toBe('Internal server error');
    expect(res.headers.get('x-correlation-id')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// api.middleware.validateRequest
// ---------------------------------------------------------------------------
describe('api.middleware.validateRequest', () => {
  it('validates GET request query params against a schema', async () => {
    const req = new Request('http://localhost/api/test?slug=hello-world');
    const result = await api.middleware.validateRequest(req, schemas.slug);
    expect(result).toEqual({ slug: 'hello-world' });
  });

  it('validates POST request JSON body against a schema', async () => {
    const req = new Request('http://localhost/api/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'search term' }),
    });
    const result = await api.middleware.validateRequest(req, schemas.search);
    expect(result).toEqual({ query: 'search term' });
  });

  it('throws ApiError(400) for invalid GET input', async () => {
    const req = new Request('http://localhost/api/test?slug=');
    await expect(
      api.middleware.validateRequest(req, schemas.slug),
    ).rejects.toThrow(ApiError);
    try {
      await api.middleware.validateRequest(
        new Request('http://localhost/api/test?slug='),
        schemas.slug,
      );
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).statusCode).toBe(400);
    }
  });

  it('throws ApiError(400) for invalid POST body', async () => {
    const req = new Request('http://localhost/api/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '' }),
    });
    await expect(
      api.middleware.validateRequest(req, schemas.search),
    ).rejects.toThrow(ApiError);
  });

  it('throws ApiError(400) for malformed JSON body', async () => {
    const req = new Request('http://localhost/api/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json{{{',
    });
    await expect(
      api.middleware.validateRequest(req, schemas.search),
    ).rejects.toThrow(ApiError);
    try {
      await api.middleware.validateRequest(
        new Request('http://localhost/api/test', {
          method: 'POST',
          body: '{bad',
        }),
        schemas.search,
      );
    } catch (e) {
      expect((e as ApiError).statusCode).toBe(400);
      expect((e as ApiError).message).toBe('Malformed JSON request body');
    }
  });

  it('rejects slug with invalid characters', async () => {
    const req = new Request(
      'http://localhost/api/test?slug=bad%20slug%21',
    );
    await expect(
      api.middleware.validateRequest(req, schemas.slug),
    ).rejects.toThrow(ApiError);
  });
});

// ---------------------------------------------------------------------------
// getConfig / getDefaultMetadata
// ---------------------------------------------------------------------------
describe('getConfig', () => {
  it('returns a config with site and blog sections', () => {
    const config = getConfig();
    expect(config).toHaveProperty('site');
    expect(config).toHaveProperty('blog');
  });

  it('config.site has title, description, url, and author', () => {
    const { site } = getConfig();
    expect(site.title).toBeTruthy();
    expect(site.description).toBeTruthy();
    expect(site.url).toBeTruthy();
    expect(site.author).toHaveProperty('name');
    expect(site.author).toHaveProperty('email');
  });

  it('config.blog has postsPerPage and featuredLimit', () => {
    const { blog } = getConfig();
    expect(typeof blog.postsPerPage).toBe('number');
    expect(typeof blog.featuredLimit).toBe('number');
  });
});

describe('getDefaultMetadata', () => {
  it('returns title, description, url, and author from config', () => {
    const meta = getDefaultMetadata();
    const config = getConfig();
    expect(meta.title).toBe(config.site.title);
    expect(meta.description).toBe(config.site.description);
    expect(meta.url).toBe(config.site.url);
    expect(meta.author).toEqual(config.site.author);
  });
});

// ---------------------------------------------------------------------------
// schemas (Zod)
// ---------------------------------------------------------------------------
describe('schemas', () => {
  it('slug schema accepts valid slugs', () => {
    expect(schemas.slug.safeParse({ slug: 'my-post' }).success).toBe(true);
    expect(schemas.slug.safeParse({ slug: 'post_123' }).success).toBe(true);
  });

  it('slug schema rejects invalid slugs', () => {
    expect(schemas.slug.safeParse({ slug: '' }).success).toBe(false);
    expect(schemas.slug.safeParse({ slug: 'has spaces' }).success).toBe(false);
    expect(schemas.slug.safeParse({ slug: 'a'.repeat(201) }).success).toBe(false);
  });

  it('search schema validates query length', () => {
    expect(schemas.search.safeParse({ query: 'test' }).success).toBe(true);
    expect(schemas.search.safeParse({ query: '' }).success).toBe(false);
    expect(schemas.search.safeParse({ query: 'x'.repeat(101) }).success).toBe(false);
  });

  it('tag schema validates tag', () => {
    expect(schemas.tag.safeParse({ tag: 'JavaScript' }).success).toBe(true);
    expect(schemas.tag.safeParse({ tag: '' }).success).toBe(false);
  });
});
