import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  checkRateLimit,
  clearRateLimit,
  validatePassword,
  createSessionToken,
  validateSessionToken,
  validateRequestOrigin,
  resolveClientIp,
} from '@/lib/admin-auth';

describe('validatePassword', () => {
  it('returns true for matching passwords', () => {
    expect(validatePassword('correct', 'correct')).toBe(true);
  });
  it('returns false for wrong password', () => {
    expect(validatePassword('wrong', 'correct')).toBe(false);
  });
  it('returns false for different lengths', () => {
    expect(validatePassword('short', 'a-much-longer-password')).toBe(false);
  });
  it('returns false for empty password against non-empty', () => {
    expect(validatePassword('', 'secret')).toBe(false);
  });
  it('correctly compares long passwords near buffer boundary', () => {
    const base = 'a'.repeat(255);
    expect(validatePassword(base + 'x', base + 'y')).toBe(false);
    expect(validatePassword(base + 'x', base + 'x')).toBe(true);
  });
  it('handles passwords longer than 256 bytes', () => {
    const long1 = 'b'.repeat(500);
    const long2 = 'b'.repeat(499) + 'c';
    expect(validatePassword(long1, long1)).toBe(true);
    expect(validatePassword(long1, long2)).toBe(false);
  });
  it('returns false when both passwords are empty', () => {
    expect(validatePassword('', '')).toBe(false);
  });
  it('handles multi-byte UTF-8 passwords correctly', () => {
    const emoji = '\u{1F600}\u{1F601}';
    expect(validatePassword(emoji, emoji)).toBe(true);
    expect(validatePassword(emoji, emoji + 'x')).toBe(false);
  });
});

describe('createSessionToken / validateSessionToken', () => {
  const secret = 'test-secret-key';

  it('creates a token that validates', () => {
    const token = createSessionToken(secret);
    expect(validateSessionToken(token, secret)).toBe(true);
  });
  it('rejects tampered signature', () => {
    const token = createSessionToken(secret);
    const tampered = token.slice(0, -4) + 'aaaa';
    expect(validateSessionToken(tampered, secret)).toBe(false);
  });
  it('rejects token with wrong secret', () => {
    const token = createSessionToken(secret);
    expect(validateSessionToken(token, 'different-secret')).toBe(false);
  });
  it('rejects undefined', () => {
    expect(validateSessionToken(undefined, secret)).toBe(false);
  });
  it('rejects empty string', () => {
    expect(validateSessionToken('', secret)).toBe(false);
  });
  it('rejects malformed token (wrong segment count)', () => {
    expect(validateSessionToken('abc.def', secret)).toBe(false);
  });
  it('rejects expired token (issued 25h ago)', () => {
    const pastTime = Date.now() - 25 * 60 * 60 * 1000;
    vi.spyOn(Date, 'now').mockReturnValueOnce(pastTime);
    const token = createSessionToken(secret);
    vi.restoreAllMocks();
    expect(validateSessionToken(token, secret)).toBe(false);
  });
});

describe('checkRateLimit', () => {
  const ip = 'test-ip-addr';
  beforeEach(() => clearRateLimit(ip));
  afterEach(() => { vi.useRealTimers(); });

  it('allows first 5 attempts', () => {
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(ip)).toBe(true);
    }
  });
  it('blocks 6th attempt', () => {
    for (let i = 0; i < 5; i++) checkRateLimit(ip);
    expect(checkRateLimit(ip)).toBe(false);
  });
  it('different IPs are independent', () => {
    for (let i = 0; i < 6; i++) checkRateLimit(ip);
    expect(checkRateLimit('other-ip')).toBe(true);
    clearRateLimit('other-ip');
  });
  it('clearRateLimit resets counter', () => {
    for (let i = 0; i < 6; i++) checkRateLimit(ip);
    clearRateLimit(ip);
    expect(checkRateLimit(ip)).toBe(true);
  });
  it('resets after rate limit window expires', () => {
    vi.useFakeTimers();
    for (let i = 0; i < 6; i++) checkRateLimit(ip);
    expect(checkRateLimit(ip)).toBe(false);
    vi.advanceTimersByTime(15 * 60 * 1000 + 1);
    expect(checkRateLimit(ip)).toBe(true);
    clearRateLimit(ip);
  });
});

describe('validateRequestOrigin', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns true in dev mode regardless of headers', () => {
    vi.stubEnv('NODE_ENV', 'test'); // Not 'production'
    const req = new Request('http://localhost:3000/api/test', {
      headers: { origin: 'https://evil.com' },
    });
    expect(validateRequestOrigin(req)).toBe(true);
  });

  it('returns true for valid Origin header in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const req = new Request('https://w4w.dev/api/test', {
      headers: { origin: 'https://w4w.dev' },
    });
    expect(validateRequestOrigin(req)).toBe(true);
  });

  it('returns false for invalid Origin header in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const req = new Request('https://w4w.dev/api/test', {
      headers: { origin: 'https://evil.com' },
    });
    expect(validateRequestOrigin(req)).toBe(false);
  });

  it('returns true for valid Referer header (no Origin) in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const req = new Request('https://w4w.dev/api/test', {
      headers: { referer: 'https://w4w.dev/admin/dashboard' },
    });
    expect(validateRequestOrigin(req)).toBe(true);
  });

  it('returns false for invalid Referer header in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const req = new Request('https://w4w.dev/api/test', {
      headers: { referer: 'https://evil.com/phishing' },
    });
    expect(validateRequestOrigin(req)).toBe(false);
  });

  it('returns true for sec-fetch-site: same-origin in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const req = new Request('https://w4w.dev/api/test', {
      headers: { 'sec-fetch-site': 'same-origin' },
    });
    expect(validateRequestOrigin(req)).toBe(true);
  });

  it('returns false for sec-fetch-site: cross-site in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const req = new Request('https://w4w.dev/api/test', {
      headers: { 'sec-fetch-site': 'cross-site' },
    });
    expect(validateRequestOrigin(req)).toBe(false);
  });

  it('returns false when no Origin/Referer/sec-fetch-site in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const req = new Request('https://w4w.dev/api/test');
    expect(validateRequestOrigin(req)).toBe(false);
  });
});

describe('resolveClientIp', () => {
  it('returns x-real-ip when present', () => {
    const req = new Request('http://localhost:3000/api/test', {
      headers: { 'x-real-ip': '192.168.1.1' },
    });
    expect(resolveClientIp(req)).toBe('192.168.1.1');
  });

  it('returns first IP from x-forwarded-for', () => {
    const req = new Request('http://localhost:3000/api/test', {
      headers: { 'x-forwarded-for': '10.0.0.1, 10.0.0.2, 10.0.0.3' },
    });
    expect(resolveClientIp(req)).toBe('10.0.0.1');
  });

  it('prefers x-real-ip over x-forwarded-for', () => {
    const req = new Request('http://localhost:3000/api/test', {
      headers: {
        'x-real-ip': '192.168.1.1',
        'x-forwarded-for': '10.0.0.1, 10.0.0.2',
      },
    });
    expect(resolveClientIp(req)).toBe('192.168.1.1');
  });

  it('returns null when no IP headers present', () => {
    const req = new Request('http://localhost:3000/api/test');
    expect(resolveClientIp(req)).toBeNull();
  });

  it('trims whitespace from x-real-ip', () => {
    const req = new Request('http://localhost:3000/api/test', {
      headers: { 'x-real-ip': '  192.168.1.1  ' },
    });
    expect(resolveClientIp(req)).toBe('192.168.1.1');
  });

  it('trims whitespace from x-forwarded-for entries', () => {
    const req = new Request('http://localhost:3000/api/test', {
      headers: { 'x-forwarded-for': '  10.0.0.1 , 10.0.0.2' },
    });
    expect(resolveClientIp(req)).toBe('10.0.0.1');
  });
});
