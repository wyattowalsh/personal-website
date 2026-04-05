import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  checkRateLimit,
  clearRateLimit,
  getAdminRateLimitSnapshot,
  getAdminRateLimitSummary,
  validatePassword,
  createSessionToken,
  validateSessionToken,
  validateRequestOrigin,
  resolveAdminRateLimitKey,
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

describe('admin rate limit helpers', () => {
  const windowMs = 15 * 60 * 1000;
  const trackedIps = [
    'admin-snapshot-expired-ip',
    'admin-snapshot-older-ip',
    'admin-snapshot-newer-ip',
    'admin-summary-expired-ip',
    'admin-summary-limited-ip',
    'admin-summary-active-ip',
  ];

  beforeEach(() => {
    trackedIps.forEach(clearRateLimit);
  });

  afterEach(() => {
    trackedIps.forEach(clearRateLimit);
    vi.useRealTimers();
  });

  it('getAdminRateLimitSnapshot returns recent active entries only', () => {
    vi.useFakeTimers();

    checkRateLimit('admin-snapshot-expired-ip');
    vi.advanceTimersByTime(windowMs + 1);
    checkRateLimit('admin-snapshot-older-ip');
    vi.advanceTimersByTime(1_000);
    checkRateLimit('admin-snapshot-newer-ip');

    const snapshot = getAdminRateLimitSnapshot(5);

    expect(snapshot).toHaveLength(2);
    expect(snapshot.map((entry) => entry.key)).toEqual([
      'admin-snapshot-newer-ip',
      'admin-snapshot-older-ip',
    ]);
    expect(snapshot.find((entry) => entry.key === 'admin-snapshot-expired-ip')).toBeUndefined();
    expect(snapshot[0]).toMatchObject({
      key: 'admin-snapshot-newer-ip',
      count: 1,
      remaining: 4,
      blockedCount: 0,
      isLimited: false,
    });
  });

  it('getAdminRateLimitSummary aggregates active limited entries and blocked attempts', () => {
    vi.useFakeTimers();

    checkRateLimit('admin-summary-expired-ip');
    vi.advanceTimersByTime(windowMs + 1);

    for (let i = 0; i < 7; i++) {
      checkRateLimit('admin-summary-limited-ip');
    }

    checkRateLimit('admin-summary-active-ip');

    expect(getAdminRateLimitSummary()).toEqual({
      trackedKeys: 2,
      limitedKeys: 1,
      totalBlockedAttempts: 2,
      maxAttempts: 5,
      windowMs,
    });
  });

  it('getAdminRateLimitSummary includes all entries even when there are more than 100', () => {
    vi.useFakeTimers();
    
    // Add 150 different IPs
    for (let i = 0; i < 150; i++) {
      checkRateLimit(`ip-${i}`);
    }
    
    const summary = getAdminRateLimitSummary();
    expect(summary.trackedKeys).toBe(150);
  });
});

describe('validateRequestOrigin', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://w4w.dev');
  });

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
  it('ignores x-real-ip because it is client-controlled', () => {
    const req = new Request('http://localhost:3000/api/test', {
      headers: { 'x-real-ip': '192.168.1.1' },
    });
    expect(resolveClientIp(req)).toBeNull();
  });

  it('ignores x-forwarded-for because it is client-controlled', () => {
    const req = new Request('http://localhost:3000/api/test', {
      headers: { 'x-forwarded-for': '10.0.0.1, 10.0.0.2, 10.0.0.3' },
    });
    expect(resolveClientIp(req)).toBeNull();
  });

  it('returns null when both proxy IP headers are present', () => {
    const req = new Request('http://localhost:3000/api/test', {
      headers: {
        'x-real-ip': '192.168.1.1',
        'x-forwarded-for': '10.0.0.1, 10.0.0.2',
      },
    });
    expect(resolveClientIp(req)).toBeNull();
  });

  it('returns null when no trusted client IP metadata is available', () => {
    const req = new Request('http://localhost:3000/api/test');
    expect(resolveClientIp(req)).toBeNull();
  });
});

describe('resolveAdminRateLimitKey', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://w4w.dev');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses trusted route metadata instead of proxy headers', () => {
    const reqWithProxyHeaders = new Request('http://localhost:3000/api/admin/auth', {
      method: 'POST',
      headers: {
        'x-real-ip': '192.168.1.1',
        'x-forwarded-for': '10.0.0.1, 10.0.0.2',
      },
    });
    const reqWithoutProxyHeaders = new Request('http://localhost:3000/api/admin/auth', {
      method: 'POST',
    });

    expect(resolveAdminRateLimitKey(reqWithProxyHeaders)).toBe(
      resolveAdminRateLimitKey(reqWithoutProxyHeaders)
    );
    expect(resolveAdminRateLimitKey(reqWithProxyHeaders)).toBe(
      'scope=admin-auth|host=w4w.dev|method=POST|path=/api/admin/auth'
    );
  });

  it('changes when trusted route metadata changes', () => {
    const loginRequest = new Request('http://localhost:3000/api/admin/auth', {
      method: 'POST',
    });
    const statusRequest = new Request('http://localhost:3000/api/admin/auth', {
      method: 'GET',
    });

    expect(resolveAdminRateLimitKey(loginRequest)).not.toBe(
      resolveAdminRateLimitKey(statusRequest)
    );
  });
});
