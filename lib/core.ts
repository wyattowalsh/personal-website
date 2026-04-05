import 'server-only';
import * as Sentry from '@sentry/nextjs';
import type { ZodType } from 'zod';

export { getConfig, getDefaultMetadata, schemas } from './config';


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
  const inbound = req?.headers.get(CORRELATION_ID_HEADER)
    ?.trim()
    .replace(/[^\x20-\x7E]/g, '');
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
    validateRequest: async <T>(req: Request, schema: ZodType<T>): Promise<T> => {
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

    withErrorHandler: <T extends (...args: never[]) => Promise<Response>>(handler: T): T =>
      (async (...args: Parameters<T>) => {
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
