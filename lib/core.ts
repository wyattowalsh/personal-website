import 'server-only';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';
import type { Config } from './types';

// Re-export logger utilities for backward compatibility
export { LogLevel, formatters, logger } from './logger';

// Export common validation schemas
export const schemas = {
  slug: z.object({ slug: z.string().min(1).max(200).regex(/^[a-zA-Z0-9_-]+$/, 'Invalid slug format') }),
  search: z.object({ query: z.string().min(1).max(100) }),
  tag: z.object({ tag: z.string().min(1).max(50) }),
};


// Enhanced error handling
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: Record<string, unknown>,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }

  toResponse(correlationId?: string) {
    const isProduction = process.env.NODE_ENV === 'production';
    const details = this.details && isProduction && 'stack' in this.details
      ? Object.fromEntries(Object.entries(this.details).filter(([key]) => key !== 'stack'))
      : this.details;

    return Response.json({
      error: {
        message: this.message,
        code: this.code || `ERR_${this.statusCode}`,
        details,
        ...(correlationId ? { correlationId } : {})
      }
    }, {
      status: this.statusCode,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}


// Configuration management
const defaultConfig: Config = {
  site: {
    title: "Wyatt Walsh",
    description: 'Articles about software engineering, data science, and technology',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://w4w.dev',
    author: {
      name: 'Wyatt Walsh',
      email: 'mail@w4w.dev',
      twitter: 'wyattowalsh',
      github: 'wyattowalsh',
      linkedin: 'wyattowalsh',
    }
  },
  blog: {
    postsPerPage: 10,
    featuredLimit: 3
  },
  cache: {
    ttl: 3600000,
    maxSize: 500
  }
};

export function getDefaultMetadata() {
  const config = getConfig();
  return {
    title: config.site.title,
    description: config.site.description,
    url: config.site.url,
    author: config.site.author,
  };
}

class ConfigManager {
  private static instance: ConfigManager;
  private config: Config;

  private constructor() {
    this.config = defaultConfig;
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  public getConfig(): Config {
    return this.config;
  }
}

export const getConfig = () => ConfigManager.getInstance().getConfig();
export const config = getConfig();

const CORRELATION_ID_HEADER = 'x-correlation-id';
const CORRELATION_ID_MAX_LENGTH = 128;

function getRequestFromHandlerArgs(args: unknown[]): Request | null {
  for (const arg of args) {
    if (arg instanceof Request) {
      return arg;
    }
  }
  return null;
}

function resolveCorrelationId(req: Request | null): string {
  const inbound = req?.headers.get(CORRELATION_ID_HEADER)?.trim();
  if (inbound && inbound.length <= CORRELATION_ID_MAX_LENGTH) {
    return inbound;
  }
  return crypto.randomUUID();
}

function withCorrelationId(response: Response, correlationId: string): Response {
  response.headers.set(CORRELATION_ID_HEADER, correlationId);
  return response;
}

// API middleware exports
export const api = {
  middleware: {
    validateRequest: async <T>(req: Request, schema: z.Schema<T>): Promise<T> => {
      let data: unknown;

      if (req.method === 'GET') {
        data = Object.fromEntries(new URL(req.url).searchParams);
      } else {
        try {
          data = await req.json();
        } catch (error) {
          if (error instanceof SyntaxError) {
            throw new ApiError(400, 'Malformed JSON request body');
          }
          throw error;
        }
      }

      const validation = schema.safeParse(data);
      if (!validation.success) {
        throw new ApiError(400, 'Invalid request data', { errors: validation.error.issues });
      }

      return validation.data;
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    withErrorHandler: <T extends (...args: any[]) => Promise<Response>>(handler: T): T =>
      (async (...args: any[]) => {
        const request = getRequestFromHandlerArgs(args);
        const correlationId = resolveCorrelationId(request);
        try {
          const response = await handler(...args);
          if (response instanceof Response) {
            return withCorrelationId(response, correlationId);
          }
          return response;
        } catch (error) {
          if (error instanceof ApiError) {
            if (error.statusCode >= 500) {
              Sentry.withScope(scope => {
                scope.setTag('correlation_id', correlationId);
                Sentry.captureException(error);
              });
            }
            return withCorrelationId(error.toResponse(correlationId), correlationId);
          }
          console.error(`Unhandled error [${correlationId}]:`, error);
          Sentry.withScope(scope => {
            scope.setTag('correlation_id', correlationId);
            Sentry.captureException(error);
          });
          return withCorrelationId(
            new ApiError(500, 'Internal server error').toResponse(correlationId),
            correlationId
          );
        }
      }) as unknown as T
  }
};
