import { LRUCache } from 'lru-cache';
import { Feed } from 'feed';
import Fuse from 'fuse.js';
import matter from 'gray-matter';
import path from 'path';
import fs from 'fs/promises';
import { glob } from 'glob';
import readingTime from 'reading-time';
import { logger, Post, formatters, PreprocessStats, ApiError, cacheControl } from './core';
import {
  CACHE_TTL_MS,
  LRU_MAX_ENTRIES,
  SEARCH_THRESHOLD,
  SEARCH_CACHE_TTL_SECONDS,
  API_REVALIDATE_SECONDS
} from './constants';

// Removed custom findFiles() - using glob package instead

// Git utilities - now using file stats instead of git commands
async function getFileData(filePath: string) {
  try {
    const stats = await fs.stat(filePath);
    return {
      firstModified: stats.birthtime.toISOString(),
      lastModified: stats.mtime.toISOString()
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error : new Error('Unknown error occurred');
    logger.error('Error getting file data:', errorMessage);
    return {
      firstModified: null,
      lastModified: null
    };
  }
}

// Constants
const CACHE_DIR = '.cache';
const INDICES = {
  SEARCH: path.join(CACHE_DIR, 'search.json'),
  METADATA: path.join(CACHE_DIR, 'metadata.json'),
  TAGS: path.join(CACHE_DIR, 'tags.json'),
  RSS: path.join(CACHE_DIR, 'rss.xml'),
} as const;

// ApiError is now imported from @/lib/core

// Backend service implementation
class BackendService {
  private static instance: BackendService;
  private preprocessPromise: Promise<any> | null = null;
  private cache: LRUCache<string, any>;
  private searchIndex: Fuse<Post>;
  private posts: Map<string, Post>;
  private tags: Set<string>;
  private preprocessed: boolean = false;
  private sortedPostsCache: Post[] | null = null;

  private constructor() {
    this.cache = new LRUCache({ max: LRU_MAX_ENTRIES, ttl: CACHE_TTL_MS });
    this.searchIndex = new Fuse([], {
      keys: ['title', 'summary', 'content', 'tags'],
      threshold: SEARCH_THRESHOLD,
      includeMatches: true
    });
    this.posts = new Map();
    this.tags = new Set();
  }

  public static getInstance(): BackendService {
    if (!BackendService.instance) {
      BackendService.instance = new BackendService();
    }
    return BackendService.instance;
  }

  public static async ensurePreprocessed() {
    const instance = BackendService.getInstance();
    // Return existing promise if preprocessing is in progress
    if (instance.preprocessPromise) return instance.preprocessPromise;

    // Return immediately if already preprocessed
    if (instance.preprocessed) return Promise.resolve();

    // Set promise BEFORE awaiting to prevent race condition
    const isDev = process.env.NODE_ENV === 'development';
    instance.preprocessPromise = instance.preprocess(isDev)
      .then(() => {
        instance.preprocessed = true;
        instance.preprocessPromise = null;
      })
      .catch((err) => {
        instance.preprocessPromise = null;
        throw err;
      });

    return instance.preprocessPromise;
  }

  async getPost(slug: string): Promise<Post | null> {
    try {
      const cached = this.cache.get(`post:${slug}`);
      if (cached) return cached;

      const post = this.posts.get(slug);
      if (!post) return null;

      this.cache.set(`post:${slug}`, post);
      return post;
    } catch (error) {
      logger.error(`Error getting post ${slug}:`, error as Error);
      return null;
    }
  }

  async getPostMetadata(slug: string) {
    const post = await this.getPost(slug);
    if (!post) return null;
    
    // Return only metadata fields
    const { content, ...metadata } = post;
    return metadata;
  }

  async search(query: string) {
    try {
      const cached = this.cache.get(`search:${query}`);
      if (cached) return cached;

      const results = this.searchIndex.search(query);
      this.cache.set(`search:${query}`, results);
      return results;
    } catch (error) {
      logger.error('Search error:', error as Error);
      return [];
    }
  }

  async getPostsByTag(tag: string): Promise<Post[]> {
    try {
      const cached = this.cache.get(`tag:${tag}`);
      if (cached) return cached;

      const posts = Array.from(this.posts.values())
        .filter(post => post.tags.includes(tag))
        .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

      this.cache.set(`tag:${tag}`, posts);
      return posts;
    } catch (error) {
      logger.error(`Error getting posts for tag ${tag}:`, error as Error);
      return [];
    }
  }

  async getAllPosts(): Promise<Post[]> {
    // Return cached sorted array if available
    if (this.sortedPostsCache) return this.sortedPostsCache;

    // Sort and cache the result
    this.sortedPostsCache = Array.from(this.posts.values())
      .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

    return this.sortedPostsCache;
  }

  async getAllTags(): Promise<string[]> {
    return Array.from(this.tags).sort();
  }

  async getAdjacentPosts(slug: string) {
    const posts = await this.getAllPosts();
    const index = posts.findIndex(p => p.slug === slug);

    return {
      previous: index > 0 ? posts[index - 1] : null,
      next: index < posts.length - 1 ? posts[index + 1] : null
    };
  }

  async preprocess(isDev: boolean): Promise<PreprocessStats> {
    const startTime = Date.now();
    const errors: Error[] = [];
    
    logger.group('Preprocessing started');
    logger.memory(); // Log initial memory usage
    logger.info(`Mode: ${isDev ? 'Development' : 'Production'}`);

    try {
      // Clear caches
      this.cache.clear();
      this.posts.clear();
      this.tags.clear();
      this.sortedPostsCache = null;
      logger.debug('Cleared all caches');

      // Update posts directory path and use glob
      const postsDir = path.join(process.cwd(), 'app/blog/posts');
      const files = await glob('**/page.mdx', { cwd: postsDir, absolute: true });

      logger.info(`Found ${files.length} posts to process`);
      
      for (const filePath of files) {
        try {
          const relativePath = path.relative(postsDir, filePath);
          logger.progress(files.indexOf(filePath) + 1, files.length, `Processing ${formatters.path(filePath)}`);
          
          const content = await fs.readFile(filePath, 'utf-8');
          const { data, content: markdown } = matter(content);
          const slug = path.basename(path.dirname(relativePath));
          
          const fileData = await getFileData(filePath);
          
          // Strip out JS/JSX that shouldn't appear in feeds:
          // - import statements
          // - metadata export block
          // - ArticleJsonLd component
          const cleanContent = markdown
            .replace(/^import\s+\{[^}]+\}\s+from\s+['"][^'"]+['"];\s*/gm, '')
            .replace(/^export const metadata = \{[\s\S]*?\};\s*/m, '')
            .replace(/<ArticleJsonLd[\s\S]*?\/>\s*/g, '')
            .trim();

          // Calculate word count and reading time from clean content
          const wordCount = cleanContent.trim().split(/\s+/).length;
          const readingTimeResult = readingTime(cleanContent);
          const readingTimeText = readingTimeResult.text;
          
          // Ensure title exists
          if (!data.title) {
            throw new Error(`Missing title in frontmatter for post: ${filePath}`);
          }

          const post: Post = {
            slug,
            ...data,
            title: data.title, // explicitly include title
            content: cleanContent,
            wordCount, // add word count
            readingTime: readingTimeText, // add reading time
            created: data.created || fileData.firstModified || new Date().toISOString(),
            updated: data.updated || fileData.lastModified || new Date().toISOString(),
            tags: data.tags || [],
          };

          this.posts.set(slug, post);
          post.tags.forEach(tag => this.tags.add(tag));
          
          logger.file('Processed', filePath, {
            size: formatters.fileSize(content.length),
            tags: post.tags.length
          });
        } catch (error) {
          errors.push(error as Error);
          logger.error(`Failed to process post: ${filePath}`, error as Error);
        }
      }

      // Rebuild search index
      this.searchIndex = new Fuse(Array.from(this.posts.values()), {
        keys: ['title', 'summary', 'content', 'tags'],
        threshold: SEARCH_THRESHOLD,
        includeMatches: true
      });

      // Log final stats
      const duration = Date.now() - startTime;
      const stats = {
        duration, // Return raw duration number instead of formatted string
        postsProcessed: this.posts.size,
        searchIndexSize: Array.from(this.posts.values()).length, // Fix: use posts length instead of searchIndex.size()
        cacheSize: this.cache.size,
        errors: errors.length,
        memory: formatters.fileSize(process.memoryUsage().heapUsed)
      };

      // Use formatters.duration() only for logging
      logger.table([{
        ...stats,
        duration: formatters.duration(duration)
      }]);

      logger.memory(); // Log final memory usage
      logger.timing('Total preprocessing time', duration);

      if (errors.length > 0) {
        logger.warning(`Completed with ${errors.length} errors`);
      } else {
        logger.success('Preprocessing completed successfully');
      }

      logger.groupEnd();
      return stats;
    } catch (error) {
      logger.error('Fatal preprocessing error:', error as Error);
      logger.memory(); // Log memory usage on error
      logger.groupEnd();
      throw error;
    }
  }

  async getPostsWithPagination(page: number = 1, limit: number = 10) {
    const posts = await this.getAllPosts();
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return {
      posts: posts.slice(start, end),
      pagination: {
        total: posts.length,
        page,
        limit,
        pages: Math.ceil(posts.length / limit)
      }
    };
  }
}

// Enhanced request handler with better type safety and error handling
async function handleRequest<T>(
  options: {
    handler: () => Promise<T>;
    cache?: boolean | number;
    transform?: (data: T) => unknown;
  }
) {
  const startTime = performance.now();

  try {
    // Execute handler without URL parsing since we're using route handlers
    const result = await options.handler();
    const data = options.transform ? options.transform(result) : result;
    const duration = performance.now() - startTime;

    // Determine cache control
    const cacheHeader = typeof options.cache === 'number'
      ? cacheControl.dynamic(options.cache)
      : options.cache
        ? cacheControl.public(API_REVALIDATE_SECONDS)
        : cacheControl.private();

    // Return response
    return Response.json({
      data,
      meta: {
        timestamp: new Date().toISOString(),
        duration: Math.round(duration * 100) / 100,
        cache: {
          hit: false,
          ttl: typeof options.cache === 'number' ? options.cache : API_REVALIDATE_SECONDS
        }
      }
    }, {
      headers: {
        'Cache-Control': cacheHeader,
        'Content-Type': 'application/json',
        'X-Response-Time': `${duration}ms`
      }
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error('Request handler error:', error);
    
    if (error instanceof ApiError) {
      return error.toResponse();
    }

    return new ApiError(500, 'Internal Server Error', {
      message: error.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }).toResponse();
  }
}

// API route handlers
async function getPostHandler(slug: string) {
  await BackendService.ensurePreprocessed();
  return handleRequest({
    handler: async () => {
      const post = await BackendService.getInstance().getPost(slug);
      if (!post) throw new ApiError(404, 'Post not found');
      return post;
    },
    cache: API_REVALIDATE_SECONDS
  });
}

async function getPostsHandler() {
  await BackendService.ensurePreprocessed();
  return handleRequest({
    handler: async () => {
      return BackendService.getInstance().getAllPosts();
    },
    cache: API_REVALIDATE_SECONDS
  });
}

async function searchPostsHandler(query: string) {
  await BackendService.ensurePreprocessed();
  return handleRequest({
    handler: async () => {
      return BackendService.getInstance().search(query);
    },
    cache: SEARCH_CACHE_TTL_SECONDS
  });
}

// API exports
const api = {
  handlers: {
    getPost: getPostHandler,
    getPosts: getPostsHandler,
    searchPosts: searchPostsHandler
  },
  utils: {
    handleRequest
  }
};

// Create the serverUtils const first
const serverUtils = {
  getPost: async (slug: string) => BackendService.getInstance().getPost(slug),
  searchPosts: async (query: string) => BackendService.getInstance().search(query),
  getPostsByTag: async (tag: string) => BackendService.getInstance().getPostsByTag(tag),
  getAllPosts: async () => BackendService.getInstance().getAllPosts(),
  getAllTags: async () => BackendService.getInstance().getAllTags(),
  getAdjacentPosts: async (slug: string) => BackendService.getInstance().getAdjacentPosts(slug),
  preprocess: async (isDev: boolean) => BackendService.getInstance().preprocess(isDev),
  handleRequest,
};

// Create backend object using serverUtils functionality
const backend = {
  ...serverUtils,
  api
};

// Single consolidated export statement at the end of the file
export {
  BackendService,
  handleRequest,
  getPostHandler,
  getPostsHandler,
  searchPostsHandler,
  api,
  serverUtils,
  backend // Add backend export
};
