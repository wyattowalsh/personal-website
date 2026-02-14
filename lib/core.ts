import { ClassValue, clsx } from "clsx";
import chalk from "chalk";
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
  errors: Error[];
}

// Schema definitions
export const ConfigSchema = z.object({
  // ... existing ConfigSchema
});

// Export common validation schemas
export const schemas = {
  slug: z.object({ slug: z.string().min(1).max(200) }),
  search: z.object({ query: z.string().min(1).max(100) }),
  tag: z.object({ tag: z.string().min(1).max(50) }),
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    sort: z.enum(['asc', 'desc']).default('desc'),
    orderBy: z.string().default('created')
  }),
  filter: z.object({
    tags: z.array(z.string()).optional(),
    before: z.string().datetime().optional(),
    after: z.string().datetime().optional(),
  })
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
  info: (msg: string, data?: any) => {
    console.log(
      chalk.blue('ℹ'),
      chalk.blue.dim('[INFO]'),
      chalk.gray('→'),
      msg,
      data ? '\n' + chalk.dim(JSON.stringify(data, null, 2)) : ''
    );
  },
  
  success: (msg: string, data?: any) => {
    console.log(
      chalk.green('✓'),
      chalk.green.dim('[SUCCESS]'),
      chalk.gray('→'),
      msg,
      data ? '\n' + chalk.dim(JSON.stringify(data, null, 2)) : ''
    );
  },
  
  warning: (msg: string, data?: any) => {
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
  
  debug: (msg: string, data?: any) => {
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

  table: (data: any[], columns?: string[]) => {
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

  file: (action: string, filePath: string, details?: any) => {
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

// Add middleware types
export interface ApiMiddleware {
  validateRequest: <T>(req: Request, schema: z.Schema<T>) => Promise<T>;
  withErrorHandler: (handler: Function) => Function;
}

// Enhanced API response types
export interface ApiResponseMeta {
  timestamp: string;
  duration?: number;
  cache?: {
    hit: boolean;
    ttl: number;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  meta: ApiResponseMeta;
}

// Enhanced error handling
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }

  toResponse() {
    return Response.json({
      error: {
        message: this.message,
        code: this.code || `ERR_${this.statusCode}`,
        details: this.details
      }
    }, { 
      status: this.statusCode,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

// Enhanced error types
export interface ApiErrorDetails {
  code: string;
  message: string;
  details?: unknown;
  stack?: string;
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
  return {
    title: "Wyatt Walsh",
    description: "Articles about software engineering, data science, and technology",
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://w4w.dev',
    author: {
      name: 'Wyatt Walsh',
      email: 'mail@w4w.dev',
      twitter: 'wyattowalsh',
      github: 'wyattowalsh',
      linkedin: 'wyattowalsh',
    },
    other: {
      // Add any other metadata fields here
    }
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

// API middleware exports
export const api = {
  middleware: {
    validateRequest: async <T>(req: Request, schema: z.Schema<T>): Promise<T> => {
      try {
        const data = req.method === 'GET' 
          ? Object.fromEntries(new URL(req.url).searchParams)
          : await req.json();
        return schema.parse(data);
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new ApiError(400, 'Invalid request data', { errors: error.issues });
        }
        throw error;
      }
    },
    
    withErrorHandler: (handler: Function) => async (...args: any[]) => {
      try {
        return await handler(...args);
      } catch (error) {
        if (error instanceof ApiError) {
          return error.toResponse();
        }
        console.error('Unhandled error:', error);
        return new ApiError(500, 'Internal server error').toResponse();
      }
    }
  }
};
