/**
 * In-memory rate limiter factory.
 * Each call returns an independent limiter with its own Map.
 * Resets on serverless cold start — acceptable for edge/serverless.
 * For persistent rate limiting, use Upstash Redis.
 */
import type { RateLimitSnapshot } from './types';

type RateLimitKeyPart = string | number | boolean | null | undefined;

export function createRateLimitKey(
  parts: Record<string, RateLimitKeyPart>
): string {
  return Object.entries(parts)
    .flatMap(([name, value]) => {
      if (value === null || value === undefined) return [];

      const normalized = String(value).trim();
      if (!normalized) return [];

      return [`${name}=${normalized}`];
    })
    .join('|');
}

export function createRateLimiter(opts: {
  max: number;
  windowMs: number;
  evictAt?: number;
}) {
  type RateLimitEntry = {
    count: number;
    resetAt: number;
    lastSeenAt: number;
    blockedCount: number;
  };

  const map = new Map<string, RateLimitEntry>();
  const evictAt = opts.evictAt ?? 500;

  function isExpired(entry: RateLimitEntry, now: number) {
    return now >= entry.resetAt;
  }

  function evictExpired(now: number) {
    if (map.size <= evictAt) return;

    for (const [key, entry] of map) {
      if (isExpired(entry, now)) {
        map.delete(key);
      }
    }
  }

  function getActiveEntry(key: string, now: number): RateLimitEntry | null {
    const entry = map.get(key);
    if (!entry) return null;

    if (isExpired(entry, now)) {
      map.delete(key);
      return null;
    }

    return entry;
  }

  function getActiveEntries(now: number): Array<[string, RateLimitEntry]> {
    const entries: Array<[string, RateLimitEntry]> = [];

    for (const [key, entry] of map.entries()) {
      if (isExpired(entry, now)) {
        map.delete(key);
        continue;
      }

      entries.push([key, entry]);
    }

    return entries;
  }

  function toSnapshot(key: string, entry: RateLimitEntry): RateLimitSnapshot {
    return {
      key,
      count: entry.count,
      remaining: Math.max(0, opts.max - entry.count),
      resetAt: new Date(entry.resetAt).toISOString(),
      lastSeenAt: new Date(entry.lastSeenAt).toISOString(),
      blockedCount: entry.blockedCount,
      isLimited: entry.count > opts.max,
    };
  }

  return {
    check(key: string): boolean {
      const now = Date.now();
      evictExpired(now);

      const entry = map.get(key);
      if (!entry || isExpired(entry, now)) {
        map.set(key, {
          count: 1,
          resetAt: now + opts.windowMs,
          lastSeenAt: now,
          blockedCount: 0,
        });
        return true;
      }

      entry.count++;
      entry.lastSeenAt = now;

      if (entry.count > opts.max) {
        entry.blockedCount++;
        return false;
      }

      return true;
    },

    clear(key: string): void {
      map.delete(key);
    },

    snapshot(limit = 10): RateLimitSnapshot[] {
      const now = Date.now();

      return getActiveEntries(now)
        .sort((a, b) => b[1].lastSeenAt - a[1].lastSeenAt)
        .slice(0, limit)
        .map(([key, entry]) => toSnapshot(key, entry));
    },

    getState(key: string): RateLimitSnapshot | null {
      const now = Date.now();
      evictExpired(now);
      const entry = getActiveEntry(key, now);
      if (!entry) return null;
      return toSnapshot(key, entry);
    },
  };
}
