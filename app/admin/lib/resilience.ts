import 'server-only';

/**
 * Resilience Utilities
 *
 * Higher-order functions for timeout, retry, and circuit breaker patterns.
 * Used by admin dashboard providers to handle flaky external APIs gracefully.
 */

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  retryable?: (error: Error) => boolean;
}

export interface TimeoutOptions {
  timeoutMs: number;
  label?: string;
}

export interface CircuitBreakerOptions {
  failureThreshold?: number;
  recoveryTimeoutMs?: number;
  halfOpenMaxCalls?: number;
}

type CircuitState = 'closed' | 'open' | 'half-open';

class CircuitBreaker {
  private state: CircuitState = 'closed';
  private failures = 0;
  private lastFailureTime = 0;
  private halfOpenCalls = 0;
  private readonly failureThreshold: number;
  private readonly recoveryTimeoutMs: number;
  private readonly halfOpenMaxCalls: number;

  constructor(options: CircuitBreakerOptions = {}) {
    this.failureThreshold = options.failureThreshold ?? 5;
    this.recoveryTimeoutMs = options.recoveryTimeoutMs ?? 30_000;
    this.halfOpenMaxCalls = options.halfOpenMaxCalls ?? 2;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime >= this.recoveryTimeoutMs) {
        this.state = 'half-open';
        this.halfOpenCalls = 0;
      } else {
        throw new Error(`Circuit breaker is OPEN for ${this.recoveryTimeoutMs}ms`);
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    if (this.state === 'half-open') {
      this.halfOpenCalls++;
      if (this.halfOpenCalls >= this.halfOpenMaxCalls) {
        this.state = 'closed';
        this.halfOpenCalls = 0;
      }
    } else {
      this.state = 'closed';
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    if (this.state === 'half-open') {
      this.state = 'open';
    } else if (this.failures >= this.failureThreshold) {
      this.state = 'open';
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}

// In-memory circuit breaker registry (per-process, no external deps)
const circuitRegistry = new Map<string, CircuitBreaker>();

export function getCircuitBreaker(
  name: string,
  options?: CircuitBreakerOptions
): CircuitBreaker {
  if (!circuitRegistry.has(name)) {
    circuitRegistry.set(name, new CircuitBreaker(options));
  }
  return circuitRegistry.get(name)!;
}

export async function withTimeout<T>(
  fn: () => Promise<T>,
  options: TimeoutOptions
): Promise<T> {
  const { timeoutMs, label = 'Operation' } = options;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    fn()
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 500,
    backoffMultiplier = 2,
    retryable = () => true,
  } = options;

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt === maxAttempts || !retryable(lastError)) {
        throw lastError;
      }
      const wait = delayMs * Math.pow(backoffMultiplier, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, wait));
    }
  }

  throw lastError ?? new Error('Retry exhausted');
}

export function isRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase();
  return (
    message.includes('timeout') ||
    message.includes('etimedout') ||
    message.includes('econnreset') ||
    message.includes('econnrefused') ||
    message.includes('network') ||
    message.includes('aborted') ||
    message.includes('fetch failed') ||
    /^5\d{2}$/.test(message) ||
    message.includes('rate limit') ||
    message.includes('too many requests')
  );
}

export async function withResilience<T>(
  fn: () => Promise<T>,
  options: {
    timeoutMs?: number;
    retry?: RetryOptions;
    circuitBreaker?: CircuitBreakerOptions & { name: string };
    label?: string;
  } = {}
): Promise<T> {
  const { timeoutMs = 10_000, retry, circuitBreaker, label = 'Provider' } = options;

  let operation = fn;

  if (retry) {
    const wrapped = operation;
    operation = () => withRetry(wrapped, { retryable: isRetryableError, ...retry });
  }

  if (circuitBreaker) {
    const breaker = getCircuitBreaker(circuitBreaker.name, circuitBreaker);
    const wrapped = operation;
    operation = () => breaker.execute(wrapped);
  }

  return withTimeout(operation, { timeoutMs, label });
}

export async function withTimeoutRace<T>(
  promises: Array<{ name: string; fn: () => Promise<T> }>,
  timeoutMs: number
): Promise<Array<{ name: string; status: 'fulfilled'; value: T } | { name: string; status: 'rejected'; reason: string }>> {
  const settled = await Promise.allSettled(
    promises.map(async ({ name, fn }) => {
      try {
        const value = await withTimeout(fn, { timeoutMs, label: name });
        return { name, status: 'fulfilled' as const, value };
      } catch (error) {
        return { name, status: 'rejected' as const, reason: error instanceof Error ? error.message : String(error) };
      }
    })
  );

  return settled.map((result) =>
    result.status === 'fulfilled'
      ? result.value
      : { name: 'unknown', status: 'rejected' as const, reason: result.reason instanceof Error ? result.reason.message : String(result.reason) }
  );
}
