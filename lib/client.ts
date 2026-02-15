import { Post, PostMetadata, SearchResult, logger } from './core';

// Add type definitions
interface ApiResponse<T> {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// Simple cache implementation type
interface CacheStore {
  [key: string]: {
    value: unknown;
    timestamp: number;
    ttl: number;
  };
}

// Cache implementation
const cache: {
  store: CacheStore;
  get: (key: string) => unknown | null;
  set: (key: string, value: unknown, ttl: number) => void;
} = {
  store: {},
  get(key: string) {
    const item = this.store[key];
    if (!item) return null;
    
    if (Date.now() > item.timestamp + item.ttl * 1000) {
      delete this.store[key];
      return null;
    }
    
    return item.value;
  },
  set(key: string, value: unknown, ttl: number) {
    this.store[key] = {
      value,
      ttl,
      timestamp: Date.now(),
    };
  },
};

// Enhanced API fetch utility
async function apiFetch<T, P extends Record<string, unknown> = Record<string, unknown>>(
  endpoint: string,
  options?: {
    params?: P;
    init?: RequestInit;
    transform?: (data: T) => unknown;
  }
): Promise<ApiResponse<T> | null> {
  try {
    const url = new URL(endpoint, window.location.origin);
    
    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });
    }

    const res = await fetch(url, {
      ...options?.init,
      headers: {
        'Accept': 'application/json',
        ...options?.init?.headers,
      }
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || 'API request failed');
    }

    const response = await res.json();
    return {
      data: options?.transform ? options.transform(response.data) : response.data,
      meta: response.meta
    };
  } catch (error) {
    logger.error(`API fetch error (${endpoint})`, error as Error);
    return null;
  }
}

// Unified API client with all functionality
export const api = {
  posts: {
    get: (slug: string) =>
      apiFetch<Post>(`/api/blog/posts/${slug}`),

    getAll: (params?: { page?: number; limit?: number; sort?: 'asc' | 'desc' }) =>
      apiFetch<Post[]>('/api/blog/posts', { params }),

    getByTag: (tag: string, params?: { page?: number; limit?: number }) =>
      apiFetch<Post[]>(`/api/blog/tags/${tag}`, { params }),

    search: (query: string) =>
      apiFetch<SearchResult<Post>[]>('/api/blog/search', { params: { query } })
  },

  // Add caching wrapper
  withCache: <T>(key: string, fn: () => Promise<T>, ttl = 3600) => {
    const cached = cache.get(key);
    if (cached) return Promise.resolve(cached as T);

    return fn().then(result => {
      cache.set(key, result, ttl);
      return result;
    });
  }
} as const;
