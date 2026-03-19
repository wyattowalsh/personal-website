/**
 * In-memory rate limiter factory.
 * Each call returns an independent limiter with its own Map.
 * Resets on serverless cold start — acceptable for edge/serverless.
 * For persistent rate limiting, use Upstash Redis.
 */
export function createRateLimiter(opts: {
  max: number;
  windowMs: number;
  evictAt?: number;
}) {
  const map = new Map<string, { count: number; resetAt: number }>();
  const evictAt = opts.evictAt ?? 500;

  return {
    check(ip: string): boolean {
      const now = Date.now();
      if (map.size > evictAt) {
        for (const [k, e] of map) {
          if (now > e.resetAt) map.delete(k);
        }
      }
      const entry = map.get(ip);
      if (!entry || now >= entry.resetAt) {
        map.set(ip, { count: 1, resetAt: now + opts.windowMs });
        return true;
      }
      entry.count++;
      return entry.count <= opts.max;
    },
    clear(ip: string): void {
      map.delete(ip);
    },
  };
}
