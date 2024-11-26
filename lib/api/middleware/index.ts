import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { LRUCache } from 'lru-cache';
import { logger } from '@/lib/utils';

// Unified middleware types
export interface MiddlewareConfig {
  rateLimit?: {
    interval: number;
    maxRequests: number;
    uniqueTokens?: number;
  };
  validate?: {
    schema: z.ZodSchema;
  };
  cache?: {
    ttl: number;
    maxSize: number;
  };
}

export class ApiMiddleware {
  private tokenCache: LRUCache<string, number[]>;
  private dataCache: LRUCache<string, any>;
  private validator?: z.ZodSchema;

  constructor(private config: MiddlewareConfig) {
    this.tokenCache = new LRUCache({
      max: config.rateLimit?.uniqueTokens || 500,
      ttl: config.rateLimit?.interval || 60000
    });

    this.dataCache = new LRUCache({
      max: config.cache?.maxSize || 500,
      ttl: config.cache?.ttl || 3600000
    });

    this.validator = config.validate?.schema;
  }

  private async checkRateLimit(req: NextRequest): Promise<void> {
    if (!this.config.rateLimit) return;

    const ip = req.ip ?? 'anonymous';
    const key = `${ip}:${req.url}`;
    const tokens = this.tokenCache.get(key) || [];

    if (tokens.length >= this.config.rateLimit.maxRequests) {
      throw new Error('Rate limit exceeded');
    }

    this.tokenCache.set(key, [...tokens, Date.now()]);
  }

  private async validate(req: NextRequest): Promise<void> {
    if (!this.validator) return;

    const result = this.validator.safeParse({
      url: req.url,
      method: req.method,
      headers: Object.fromEntries(req.headers)
    });

    if (!result.success) {
      throw new Error('Validation failed');
    }
  }

  withMiddleware = async (handler: Function) => {
    return async (req: NextRequest) => {
      try {
        await this.checkRateLimit(req);
        await this.validate(req);

        if (this.config.cache) {
          const cached = this.dataCache.get(req.url);
          if (cached) return cached;
        }

        const result = await handler(req);

        if (this.config.cache) {
          this.dataCache.set(req.url, result);
        }

        return result;
      } catch (error) {
        logger.error('API Error:', error as Error);
        
        if (error instanceof Error) {
          if (error.message === 'Rate limit exceeded') {
            return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
          }
          return NextResponse.json({ error: error.message }, { status: 400 });
        }
        
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      }
    };
  };
}

export const createMiddleware = (config: MiddlewareConfig) => new ApiMiddleware(config);

export const commonMiddleware = {
  basic: createMiddleware({
    rateLimit: { interval: 60000, maxRequests: 30 }
  }),
  cached: createMiddleware({
    rateLimit: { interval: 60000, maxRequests: 30 },
    cache: { ttl: 3600000, maxSize: 500 }
  })
};
