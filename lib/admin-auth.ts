import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';

const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24h
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 min

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const SIGNING_KEY = process.env.SESSION_SIGNING_KEY || 'w4w-session-signing-key-dev';

const deriveKey = (password: string) =>
  createHmac('sha256', SIGNING_KEY).update(password).digest();

/** HR-4: in-memory rate limiting keyed by IP */
export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  if (rateLimitMap.size > 1000) {
    for (const [key, entry] of rateLimitMap) {
      if (now > entry.resetAt) rateLimitMap.delete(key);
    }
  }
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT_MAX;
}

export function clearRateLimit(ip: string): void {
  rateLimitMap.delete(ip);
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
