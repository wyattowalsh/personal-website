import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { createRateLimitKey, createRateLimiter } from './rate-limit';
import type { RateLimitSnapshot } from './types';

const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24h
const ADMIN_RATE_LIMIT_MAX = 5;
const ADMIN_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const ADMIN_AUTH_RATE_LIMIT_SCOPE = 'admin-auth';
export const ADMIN_SESSION_COOKIE_NAME = 'admin_session';
export const ADMIN_SESSION_COOKIE_MAX_AGE_SECONDS = TOKEN_EXPIRY_MS / 1000;
export const ADMIN_SESSION_COOKIE_PATH = '/';
export const ADMIN_SESSION_LEGACY_PATH = '/admin';

interface AdminSessionCookieOptions {
  maxAge: number;
  path?: string;
}

export function serializeAdminSessionCookie(
  value: string,
  { maxAge, path = ADMIN_SESSION_COOKIE_PATH }: AdminSessionCookieOptions
): string {
  return `${ADMIN_SESSION_COOKIE_NAME}=${value}; HttpOnly; ${process.env.NODE_ENV === 'production' ? 'Secure; ' : ''}SameSite=Strict; Max-Age=${maxAge}; Path=${path}`;
}

function getSiteHost() {
  return new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://w4w.dev').host;
}

/**
 * Validate that a request originates from the same site.
 * Used by admin auth routes and analytics beacon endpoint.
 * Checks Origin header, Referer header, then Sec-Fetch-Site as fallback.
 */
export function validateRequestOrigin(request: Request): boolean {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[security] Origin validation DISABLED (NODE_ENV !== "production")');
    return true;
  }

  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const siteHost = getSiteHost();

  if (origin) {
    try {
      return new URL(origin).host === siteHost;
    } catch {
      return false;
    }
  }

  if (referer) {
    try {
      return new URL(referer).host === siteHost;
    } catch {
      return false;
    }
  }

  const secFetchSite = request.headers.get('sec-fetch-site');
  return secFetchSite === 'same-origin' || secFetchSite === 'none';
}

/**
 * Standard App Router Request objects do not expose a trusted client IP.
 * Ignore client-controlled proxy headers unless a trusted platform adapter is added.
 */
export function resolveClientIp(_request: Request): string | null {
  return null;
}

export function resolveAdminRateLimitKey(request: Request): string {
  const url = new URL(request.url);

  return createRateLimitKey({
    scope: ADMIN_AUTH_RATE_LIMIT_SCOPE,
    host: getSiteHost(),
    method: request.method.toUpperCase(),
    path: url.pathname,
  });
}

const rateLimiter = createRateLimiter({
  max: ADMIN_RATE_LIMIT_MAX,
  windowMs: ADMIN_RATE_LIMIT_WINDOW_MS,
  evictAt: 1000,
});

/** Lazy signing key — defers check to runtime so `next build` can import this module. */
function getSigningKey(): string {
  const key = process.env.SESSION_SIGNING_KEY;
  if (!key && process.env.NODE_ENV === 'production')
    throw new Error('SESSION_SIGNING_KEY environment variable is required in production');
  return key ?? 'w4w-session-signing-key-dev';
}

const deriveKey = (password: string) =>
  createHmac('sha256', getSigningKey()).update(password).digest();

/** HR-4: in-memory rate limiting keyed by trusted request metadata */
export function checkRateLimit(key: string): boolean {
  return rateLimiter.check(key);
}

export function clearRateLimit(key: string): void {
  rateLimiter.clear(key);
}

export function getAdminRateLimitSnapshot(limit = 10): RateLimitSnapshot[] {
  return rateLimiter.snapshot(limit);
}

export function getAdminRateLimitSummary() {
  const snapshot = rateLimiter.snapshot(Number.MAX_SAFE_INTEGER);
  return {
    trackedKeys: snapshot.length,
    limitedKeys: snapshot.filter((entry) => entry.isLimited).length,
    totalBlockedAttempts: snapshot.reduce((total, entry) => total + entry.blockedCount, 0),
    maxAttempts: ADMIN_RATE_LIMIT_MAX,
    windowMs: ADMIN_RATE_LIMIT_WINDOW_MS,
  };
}

/** HR-3: constant-time password comparison via SHA-256 — fixed-length, no empty-string bypass */
export function validatePassword(input: string, password: string): boolean {
  if (!input || !password) return false;
  const h = (s: string) => createHash('sha256').update(s).digest();
  return timingSafeEqual(h(input), h(password));
}

/** HR-5: HMAC-signed session token — stateless, survives cold starts */
export function createSessionToken(adminPassword: string): string {
  const nonce = randomBytes(16).toString('hex');
  const issuedAt = Date.now().toString(36);
  const payload = `${issuedAt}.${nonce}`;
  const sig = createHmac('sha256', deriveKey(adminPassword)).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

/** HR-5: verify token signature and expiry */
export function validateSessionToken(
  token: string | undefined,
  adminPassword: string
): boolean {
  if (!token || !adminPassword) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [issuedAtStr, nonce, sig] = parts;
  const payload = `${issuedAtStr}.${nonce}`;
  const expected = createHmac('sha256', deriveKey(adminPassword)).update(payload).digest('hex');
  try {
    const sigBuf = Buffer.from(sig, 'hex');
    const expBuf = Buffer.from(expected, 'hex');
    if (sigBuf.length !== expBuf.length) return false;
    if (!timingSafeEqual(sigBuf, expBuf)) return false;
  } catch {
    return false;
  }
  const issuedAt = parseInt(issuedAtStr, 36);
  return Number.isFinite(issuedAt) && Date.now() - issuedAt < TOKEN_EXPIRY_MS;
}
