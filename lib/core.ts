import chalk from "chalk";
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';

// Core interfaces and types
export interface Config {
  site: {
    title: string;
    description: string;
    url: string;
    author: {
      name: string;
      email: string;
      twitter?: string;
      github?: string;
      linkedin?: string;
    }
  };
  blog: {
    postsPerPage: number;
    featuredLimit: number;
  };
  cache: {
    ttl: number;
    maxSize: number;
  };
}

export interface Post {
  slug: string;
  title: string;
  summary?: string;
  content: string;
  created: string;
  updated?: string;
  tags: string[];
  image?: string;
  caption?: string;
  readingTime?: string;
  wordCount: number;
  adjacent?: {
    prev: AdjacentPost | null;
    next: AdjacentPost | null;
  };
}

export interface AdjacentPost {
  slug: string;
  title: string;
}

export interface PostMetadata extends Omit<Post, 'wordCount' | 'adjacent'> {
  caption?: string;
}

export interface SearchResult<T> {
  item: T;
  score: number;
  matches: Array<{
    key: string;
    value: string;
    indices: number[][];
  }>;
}

export interface PreprocessStats {
  duration: number;
  postsProcessed: number;
  searchIndexSize: number;
  cacheSize: number;
  errors: number;
  memory: string;
  particleConfigPath?: string;
}

// Schema definitions removed - ConfigSchema was unused

// Export common validation schemas
export const schemas = {
  slug: z.object({ slug: z.string().min(1).max(200).regex(/^[a-zA-Z0-9_-]+$/, 'Invalid slug format') }),
  search: z.object({ query: z.string().min(1).max(100) }),
  tag: z.object({ tag: z.string().min(1).max(50) }),
};

// API validation schemas
export const apiSchemas = {
  post: z.object({
    slug: z.string().min(1),
  }),
  search: z.object({
    query: z.string().min(1),
  }),
  pagination: z.object({
    page: z.number().optional().default(1),
    limit: z.number().optional().default(10),
  }),
} as const;

// Log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  SUCCESS = 2,
  WARNING = 3,
  ERROR = 4
}

// Log formatting utilities
export const formatters = {
  // Format duration in a human readable way
  duration: (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(2)}ms`;
    const seconds = ms / 1000;
    if (seconds < 60) return `${seconds.toFixed(2)}s`;
    const minutes = seconds / 60;
    return `${minutes.toFixed(2)}m`;
  },

  // Format file size
  fileSize: (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(2)}${units[unitIndex]}`;
  },

  // Format path relative to project root
  path: (fullPath: string): string => {
    return fullPath.replace(process.cwd(), '').replace(/^\//, '');
  }
};

// Enhanced logger implementation
export const logger = {
  info: (msg: string, data?: unknown) => {
    console.log(
      chalk.blue('ℹ'),
      chalk.blue.dim('[INFO]'),
      chalk.gray('→'),
      msg,
      data ? '\n' + chalk.dim(JSON.stringify(data, null, 2)) : ''
    );
  },
  
  success: (msg: string, data?: unknown) => {
    console.log(
      chalk.green('✓'),
      chalk.green.dim('[SUCCESS]'),
      chalk.gray('→'),
      msg,
      data ? '\n' + chalk.dim(JSON.stringify(data, null, 2)) : ''
    );
  },
  
  warning: (msg: string, data?: unknown) => {
    console.log(
      chalk.yellow('⚠'),
      chalk.yellow.dim('[WARN]'),
      chalk.gray('→'),
      msg,
      data ? '\n' + chalk.dim(JSON.stringify(data, null, 2)) : ''
    );
  },
  
  error: (msg: string, error?: Error) => {
    console.error(
      chalk.red('✖'),
      chalk.red.dim('[ERROR]'),
      chalk.gray('→'),
      msg
    );
    if (error?.stack) {
      console.error(chalk.dim(
        error.stack.split('\n')
          .map(line => '  ' + line)
          .join('\n')
      ));
    }
  },
  
  debug: (msg: string, data?: unknown) => {
    if (logger.level <= LogLevel.DEBUG) {
      console.log(
        chalk.magenta('🔍'),
        chalk.magenta.dim('[DEBUG]'),
        chalk.gray('→'),
        msg,
        data ? '\n' + chalk.dim(JSON.stringify(data, null, 2)) : ''
      );
    }
  },
  
  step: (msg: string, current?: number, total?: number) => {
    const progress = current && total ? ` (${current}/${total})` : '';
    console.log(
      chalk.cyan('→'),
      chalk.cyan.dim('[STEP]'),
      chalk.gray('→'),
      `${msg}${progress}`
    );
  },
  
  timing: (label: string, duration: number) => {
    console.log(
      chalk.magenta('⏱'),
      chalk.magenta.dim('[TIME]'),
      chalk.gray('→'),
      `${label}: ${duration.toFixed(2)}ms`
    );
  },

  group: (label: string) => {
    console.group(
      chalk.blue('◆'),
      chalk.blue.dim('[GROUP]'),
      chalk.gray('→'),
      label
    );
  },

  groupEnd: () => console.groupEnd(),

  table: (data: unknown[], columns?: string[]) => {
    console.log(chalk.blue('▤'), chalk.blue.dim('[TABLE]'));
    console.table(data, columns);
  },

  level: LogLevel.INFO, // Default level

  setLevel(level: LogLevel) {
    this.level = level;
  },

  progress: (current: number, total: number, msg: string) => {
    const percentage = (current / total * 100).toFixed(1);
    const bar = '█'.repeat(Math.floor(current / total * 20)).padEnd(20, '░');
    console.log(
      chalk.blue('↳'),
      chalk.blue.dim('[PROGRESS]'),
      chalk.gray('→'),
      `${bar} ${percentage}% | ${msg}`
    );
  },

  memory: () => {
    const used = process.memoryUsage();
    console.log(
      chalk.cyan('📊'),
      chalk.cyan.dim('[MEMORY]'),
      chalk.gray('→'),
      Object.entries(used).map(([key, value]) => 
        `${key}: ${formatters.fileSize(value)}`
      ).join(', ')
    );
  },

  file: (action: string, filePath: string, details?: unknown) => {
    console.log(
      chalk.yellow('📄'),
      chalk.yellow.dim('[FILE]'),
      chalk.gray('→'),
      `${action}: ${formatters.path(filePath)}`,
      details ? chalk.dim(`(${JSON.stringify(details)})`) : ''
    );
  },

  formatters
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


// Cache control utilities
export const cacheControl = {
  public: (maxAge: number = 3600) => 
    `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`,
  private: (maxAge: number = 60) => 
    `private, must-revalidate, max-age=${maxAge}`,
  dynamic: (maxAge: number = 3600) =>
    `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}, stale-if-error=${maxAge * 4}`,
} as const;

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
    withErrorHandler: (handler: Function) => async (...args: any[]) => {
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
    }
  }
};
