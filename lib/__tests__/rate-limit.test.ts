import { describe, it, expect, vi, afterEach } from 'vitest';
import { createRateLimiter } from '@/lib/rate-limit';

describe('createRateLimiter', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows requests within the limit', () => {
    const limiter = createRateLimiter({ max: 3, windowMs: 60_000 });
    expect(limiter.check('127.0.0.1')).toBe(true);
    expect(limiter.check('127.0.0.1')).toBe(true);
    expect(limiter.check('127.0.0.1')).toBe(true);
  });

  it('returns false when limit is exceeded', () => {
    const limiter = createRateLimiter({ max: 2, windowMs: 60_000 });
    expect(limiter.check('ip1')).toBe(true);
    expect(limiter.check('ip1')).toBe(true);
    expect(limiter.check('ip1')).toBe(false);
  });

  it('tracks different IPs independently', () => {
    const limiter = createRateLimiter({ max: 1, windowMs: 60_000 });
    expect(limiter.check('ip-a')).toBe(true);
    expect(limiter.check('ip-a')).toBe(false);
    // Different IP should still be allowed
    expect(limiter.check('ip-b')).toBe(true);
  });

  it('resets counter after window expires', () => {
    vi.useFakeTimers();
    const windowMs = 10_000;
    const limiter = createRateLimiter({ max: 1, windowMs });

    expect(limiter.check('ip')).toBe(true);
    expect(limiter.check('ip')).toBe(false);

    // Advance past the window
    vi.advanceTimersByTime(windowMs + 1);

    expect(limiter.check('ip')).toBe(true);
  });

  it('clear() removes an entry so it can be used again', () => {
    const limiter = createRateLimiter({ max: 1, windowMs: 60_000 });
    expect(limiter.check('ip')).toBe(true);
    expect(limiter.check('ip')).toBe(false);

    limiter.clear('ip');

    expect(limiter.check('ip')).toBe(true);
  });

  it('eviction triggers when map exceeds evictAt threshold', () => {
    vi.useFakeTimers();
    const limiter = createRateLimiter({
      max: 10,
      windowMs: 1_000,
      evictAt: 3,
    });

    // Add 4 entries (exceeds evictAt of 3)
    limiter.check('ip-1');
    limiter.check('ip-2');
    limiter.check('ip-3');
    limiter.check('ip-4');

    // Advance time so all entries are expired
    vi.advanceTimersByTime(2_000);

    // Next check triggers eviction of expired entries
    // and this new IP should be allowed
    expect(limiter.check('ip-5')).toBe(true);

    // The expired IPs should have been evicted, so they reset
    expect(limiter.check('ip-1')).toBe(true);
  });

  it('eviction only removes expired entries', () => {
    vi.useFakeTimers();
    const limiter = createRateLimiter({
      max: 1,
      windowMs: 10_000,
      evictAt: 2,
    });

    // Add entries
    limiter.check('old-ip');

    // Advance partially - old-ip is still active
    vi.advanceTimersByTime(5_000);

    limiter.check('new-ip-1');
    limiter.check('new-ip-2');

    // Now exceed evictAt. old-ip is NOT expired yet (5000 < 10000)
    // Advance past old-ip's window
    vi.advanceTimersByTime(6_000);

    // old-ip is now expired (11000 > 10000), new ones still valid (6000 < 10000)
    // Trigger eviction by exceeding evictAt
    limiter.check('trigger-ip');

    // old-ip was evicted (expired), so it resets
    expect(limiter.check('old-ip')).toBe(true);

    // new-ip-1 was NOT evicted (still in window), already at limit
    expect(limiter.check('new-ip-1')).toBe(false);
  });

  it('allows exactly max requests', () => {
    const limiter = createRateLimiter({ max: 5, windowMs: 60_000 });
    for (let i = 0; i < 5; i++) {
      expect(limiter.check('ip')).toBe(true);
    }
    expect(limiter.check('ip')).toBe(false);
  });
});
