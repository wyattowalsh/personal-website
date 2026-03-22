import { z } from 'zod';
import { api as coreApi, ApiError } from '@/lib/core';
import { createRateLimiter } from '@/lib/rate-limit';
import { resolveClientIp, validateRequestOrigin } from '@/lib/admin-auth';

const rateLimiter = createRateLimiter({ max: 100, windowMs: 60_000, evictAt: 500 });

const beaconSchema = z.object({
  visitorId: z.string().min(1).max(64),
  // Zod v4 enforces RFC 4122 strictly; crypto.randomUUID() produces compliant v4 UUIDs
  sessionId: z.string().uuid(),
  event: z.enum([
    'page_view',
    'page_exit',
    'scroll_depth',
    'link_click',
  ]),
  url: z.string().url().max(2048),
  referrer: z.string().max(2048).optional().default(''),
  title: z.string().max(512).optional().default(''),
  timestamp: z.number(),

  // Visitor info
  isReturning: z.boolean().optional(),
  visitCount: z.number().int().min(1).optional(),
  daysSinceFirstVisit: z.number().int().min(0).optional(),

  // Event-specific data
  data: z
    .record(z.string().max(64), z.union([z.string().max(256), z.number(), z.boolean(), z.null()]))
    .refine((r) => Object.keys(r).length <= 20, 'data exceeds 20 keys')
    .optional(),

  // Device context (full)
  device: z
    .object({
      screenWidth: z.number(),
      screenHeight: z.number(),
      devicePixelRatio: z.number(),
      colorDepth: z.number(),
      touchPoints: z.number(),
      userAgent: z.string().max(512),
      platform: z.string().max(64),
      language: z.string().max(16),
      languages: z.array(z.string()),
      cookieEnabled: z.boolean(),
      connectionType: z.string().nullable(),
      connectionDownlink: z.number().nullable(),
      hardwareConcurrency: z.number(),
      deviceMemory: z.number().nullable(),
      viewportWidth: z.number(),
      viewportHeight: z.number(),
      orientation: z.string().max(16),
      timezone: z.string().max(64),
      timezoneOffset: z.number(),
      webglRenderer: z.string().max(256).nullable(),
      webglVendor: z.string().max(256).nullable(),
      pdfViewerEnabled: z.boolean(),
    })
    .optional(),
});

export type BeaconPayload = z.infer<typeof beaconSchema>;

export const POST = coreApi.middleware.withErrorHandler(
  async (request: Request) => {
    const ip = resolveClientIp(request)
      ?? (process.env.NODE_ENV !== 'production' ? '127.0.0.1' : null);
    if (!ip) {
      throw new ApiError(403, 'Forbidden');
    }

    if (!validateRequestOrigin(request)) {
      throw new ApiError(403, 'Forbidden');
    }

    if (!rateLimiter.check(ip)) {
      throw new ApiError(429, 'Too many requests');
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ApiError(400, 'Malformed JSON');
    }

    const validation = beaconSchema.safeParse(body);
    if (!validation.success) {
      throw new ApiError(400, 'Invalid beacon payload', {
        errors: validation.error.issues,
      });
    }

    const payload = validation.data;

    // Structured log — stripped of PII (no IP, device fingerprint, or visitorId).
    // Full payload is validated but only non-PII fields are logged.
    const { device: _d, visitorId: _vid, ...logPayload } = payload;
    console.log(JSON.stringify({
      _type: 'analytics_beacon',
      ...logPayload,
      server: {
        country: request.headers.get('x-vercel-ip-country') || null,
        receivedAt: Date.now(),
      },
    }));

    return Response.json({ ok: true }, { status: 202 });
  }
);
