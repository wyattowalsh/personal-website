import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { createRateLimiter } from './rate-limit';

const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24h
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

const SITE_HOST = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://w4w.dev').host;

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

  if (origin) {
    try {
      return new URL(origin).host === SITE_HOST;
    } catch {
      return false;
    }
  }

  if (referer) {
    try {
      return new URL(referer).host === SITE_HOST;
    } catch {
      return false;
    }
  }

  const secFetchSite = request.headers.get('sec-fetch-site');
  return secFetchSite === 'same-origin' || secFetchSite === 'none';
}

/** @deprecated Use {@link validateRequestOrigin} instead. */
export const validateAdminRequestOrigin = validateRequestOrigin;

/** Extract client IP from proxy headers. Returns null if no IP found. */
export function resolveClientIp(request: Request): string | null {
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (forwarded) return forwarded;
  return null;
}

export function resolveAdminRateLimitKey(request: Request): string {
  return resolveClientIp(request) ?? 'unknown';
}

const rateLimiter = createRateLimiter({ max: 5, windowMs: 15 * 60 * 1000, evictAt: 1000 });

/** Lazy signing key — defers check to runtime so `next build` can import this module. */
function getSigningKey(): string {
  const key = process.env.SESSION_SIGNING_KEY;
  if (!key && process.env.NODE_ENV === 'production')
    throw new Error('SESSION_SIGNING_KEY environment variable is required in production');
  return key ?? 'w4w-session-signing-key-dev';
}

const deriveKey = (password: string) =>
  createHmac('sha256', getSigningKey()).update(password).digest();

/** HR-4: in-memory rate limiting keyed by IP */
export function checkRateLimit(ip: string): boolean {
  return rateLimiter.check(ip);
}

export function clearRateLimit(ip: string): void {
  rateLimiter.clear(ip);
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
