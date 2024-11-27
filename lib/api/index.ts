import { LRUCache } from 'lru-cache';
import { z } from 'zod';
import { NextResponse, NextRequest } from 'next/server';
import { logger } from '@/lib/utils';
import { Config } from '@/lib/types';

// API Error handling
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }

  toResponse() {
    return NextResponse.json(
      { error: this.message, details: this.details },
      { status: this.statusCode }
    );
  }
}

// Validation schemas
export const schemas = {
  slug: z.object({ slug: z.string().min(1).max(200) }),
  search: z.object({ query: z.string().min(1).max(100) }),
  tag: z.object({ tag: z.string().min(1).max(50) })
};

// Route configs
export const routes = {
  posts: {
    list: '/api/blog/posts',
    metadata: '/api/blog/posts/metadata',
    search: '/api/blog/search'
  }
};

// Enhanced middleware configuration
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

// Unified API middleware class with enhanced features
export class ApiMiddleware {
  private tokenCache: LRUCache<string, number[]>;
  private dataCache: LRUCache<string, any>;
  private validator?: z.ZodSchema;

  constructor(private config: MiddlewareConfig) {
    this.tokenCache = new LRUCache({
      max: config.rateLimit?.uniqueTokens || 500,
      ttl: config.rateLimit?.interval || 60000,
      updateAgeOnGet: true
    });

    this.dataCache = new LRUCache({
      max: config.cache?.maxSize || 500,
      ttl: config.cache?.ttl || 3600000,
      updateAgeOnGet: true
    });

    this.validator = config.validate?.schema;
  }

  private async checkRateLimit(req: NextRequest): Promise<void> {
    if (!this.config.rateLimit) return;

    const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0];
    const realIp = req.headers.get('x-real-ip');
    const ip = forwarded || realIp || 'anonymous';
    
    const key = `${ip}:${req.url}`;
    const tokens = this.tokenCache.get(key) || [];
    const now = Date.now();
    const validTokens = tokens.filter(t => now - t < this.config.rateLimit!.interval);

    if (validTokens.length >= this.config.rateLimit.maxRequests) {
        throw new ApiError(429, 'Rate limit exceeded');
    }

    this.tokenCache.set(key, [...validTokens, now]);
  }

  withMiddleware = async (handler: Function) => {
    return async (req: NextRequest) => {
      try {
        await this.checkRateLimit(req);

        if (this.validator) {
          await this.validator.parseAsync({
            url: req.url,
            method: req.method,
            headers: Object.fromEntries(req.headers)
          });
        }

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
        
        if (error instanceof ApiError) {
          return error.toResponse();
        }
        
        return new ApiError(500, 'Internal Server Error').toResponse();
      }
    };
  };

  // Helper methods for common operations
  static validateRequest = async <T>(schema: z.Schema<T>, data: unknown): Promise<T> => {
    try {
      return await schema.parseAsync(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ApiError(400, 'Validation failed', {
          errors: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        });
      }
      throw error;
    }
  };
}

// Common middleware configurations
export const commonMiddleware = {
  basic: new ApiMiddleware({
    rateLimit: { interval: 60000, maxRequests: 30 }
  }),
  cached: new ApiMiddleware({
    rateLimit: { interval: 60000, maxRequests: 30 },
    cache: { ttl: 3600000, maxSize: 500 }
  })
};
