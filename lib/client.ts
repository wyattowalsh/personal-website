import { formatDate } from './utils/shared';
import { Post, PostMetadata, SearchResult } from './core';

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
    console.error(`API fetch error (${endpoint}):`, error);
    return null;
  }
}

// Enhanced API utilities with pagination support
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
  }
} as const;

// Client-side API utilities
export async function fetchPost(slug: string): Promise<Post | null> {
  try {
    const res = await fetch(`/api/blog/posts/${slug}`);
    if (!res.ok) return null;
    const { post } = await res.json();
    return post;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

export async function searchPosts(query: string): Promise<SearchResult<Post>[]> {
  try {
    const res = await fetch(`/api/blog/search?query=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const { results } = await res.json();
    return results;
  } catch (error) {
    console.error('Error searching posts:', error);
    return [];
  }
}

export async function fetchPosts(): Promise<Post[]> {
  try {
    const res = await fetch('/api/blog/posts');
    if (!res.ok) return [];
    const { posts } = await res.json();
    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export async function fetchPostsByTag(tag: string): Promise<Post[]> {
  try {
    const res = await fetch(`/api/blog/tags/${encodeURIComponent(tag)}`);
    if (!res.ok) return [];
    const { posts } = await res.json();
    return posts;
  } catch (error) {
    console.error('Error fetching posts by tag:', error);
    return [];
  }
}

export async function fetchPostMetadata(slug: string): Promise<PostMetadata | null> {
  try {
    const res = await fetch(`/api/blog/posts/${slug}/metadata`);
    if (!res.ok) return null;
    const { metadata } = await res.json();
    return metadata;
  } catch (error) {
    console.error('Error fetching post metadata:', error);
    return null;
  }
}

export async function getAdjacentPosts(slug: string) {
  try {
    const res = await fetch(`/api/blog/posts/${slug}/adjacent`);
    if (!res.ok) return { prev: null, next: null };
    return res.json();
  } catch (error) {
    console.error('Error fetching adjacent posts:', error);
    return { prev: null, next: null };
  }
}

export async function getPostMetadata(slug: string) {
  try {
    const res = await fetch(`/api/blog/posts/${slug}/metadata`);
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('Error fetching post metadata:', error);
    return null;
  }
}

export { formatDate };
