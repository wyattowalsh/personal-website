import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { createRateLimiter } from './rate-limit';

const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24h

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
