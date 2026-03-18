import Fuse from 'fuse.js';
import matter from 'gray-matter';
import path from 'path';
import fs from 'fs/promises';
import { glob } from 'glob';
import readingTime from 'reading-time';
import { logger, formatters, ApiError } from './core';
import type { Post, PreprocessStats } from './types';
import { stripMdxSyntax } from './utils';
import {
  SEARCH_THRESHOLD,
  API_REVALIDATE_SECONDS
} from './constants';

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

// Backend service implementation
class BackendService {
  private static instance: BackendService;
  private preprocessPromise: Promise<void> | null = null;
  private searchIndex: Fuse<Post>;
  private posts: Map<string, Post>;
  private tags: Set<string>;
  private preprocessed: boolean = false;
  private sortedPostsCache: Post[] | null = null;

  private constructor() {
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

  public static ensurePreprocessed() {
    const instance = BackendService.getInstance();

    // Return immediately if already preprocessed
    if (instance.preprocessed) return Promise.resolve();

    // Return existing promise if preprocessing is in progress (prevents race condition)
    if (instance.preprocessPromise) return instance.preprocessPromise;

    // Atomically assign the promise before any async work begins
    const isDev = process.env.NODE_ENV === 'development';
    const promise = instance.preprocess(isDev)
      .then(() => {
        instance.preprocessed = true;
      })
      .catch((err) => {
        // Reset so next call retries
        instance.preprocessPromise = null;
        throw err;
      });

    instance.preprocessPromise = promise;
    return promise;
  }

  async getPost(slug: string): Promise<Post | null> {
    return this.posts.get(slug) || null;
  }

  async getPostMetadata(slug: string) {
    const post = await this.getPost(slug);
    if (!post) return null;
    
    // Return only metadata fields
    const { content: _content, ...metadata } = post;
    return metadata;
  }

  async search(query: string) {
    return this.searchIndex.search(query);
  }

  async getPostsByTag(tag: string): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.tags.includes(tag))
      .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
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

  async getRelatedPosts(slug: string, limit = 3): Promise<Post[]> {
    const post = await this.getPost(slug);
    if (!post) return [];

    const allPosts = await this.getAllPosts();
    const currentPostDate = new Date(post.created).getTime();

    return allPosts
      .filter(p => p.slug !== slug)
      .map(p => {
        const sharedTags = p.tags.filter(t => post.tags.includes(t)).length;
        const totalTags = new Set([...p.tags, ...post.tags]).size;
        const tagScore = totalTags > 0 ? sharedTags / totalTags : 0;

        const postDate = new Date(p.created).getTime();
        const daysDiff = Math.abs(postDate - currentPostDate) / (1000 * 60 * 60 * 24);
        const recencyScore = Math.exp(-daysDiff / 365);

        const score = tagScore * 0.7 + recencyScore * 0.3;
        return { post: p, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(r => r.post);
  }

  async getSeriesPosts(seriesName: string): Promise<Post[]> {
    const allPosts = await this.getAllPosts();
    return allPosts
      .filter(p => p.series?.name === seriesName)
      .sort((a, b) => (a.series?.order ?? 0) - (b.series?.order ?? 0));
  }

  async preprocess(isDev: boolean): Promise<PreprocessStats> {
    const startTime = Date.now();
    const errors: Error[] = [];
    
    logger.group('Preprocessing started');
    logger.memory(); // Log initial memory usage
    logger.info(`Mode: ${isDev ? 'Development' : 'Production'}`);

    try {
      // Clear caches
      this.posts.clear();
      this.tags.clear();
      this.sortedPostsCache = null;
      logger.debug('Cleared all caches');

      // Update posts directory path and use glob
      const postsDir = path.join(process.cwd(), 'content/posts');
      const files = await glob('**/index.mdx', { cwd: postsDir, absolute: true });

      logger.info(`Found ${files.length} posts to process`);
      
      for (const filePath of files) {
        try {
          const relativePath = path.relative(postsDir, filePath);
          logger.progress(files.indexOf(filePath) + 1, files.length, `Processing ${formatters.path(filePath)}`);
          
          const content = await fs.readFile(filePath, 'utf-8');
          const { data, content: markdown } = matter(content);
          const slug = path.basename(path.dirname(relativePath));
          
          const fileData = await getFileData(filePath);
          
          const cleanContent = stripMdxSyntax(markdown);

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
            series: data.series || undefined,
          };

          // Validate hero image exists
          if (post.image) {
            const imagePath = path.join(process.cwd(), 'public', post.image);
            try {
              await fs.access(imagePath);
            } catch {
              logger.warning(`Post "${post.slug}" references missing image: ${post.image}`);
            }
          }

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
      const stats: PreprocessStats = {
        duration, // Return raw duration number instead of formatted string
        postsProcessed: this.posts.size,
        searchIndexSize: Array.from(this.posts.values()).length,
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

}

// Enhanced request handler with better type safety and error handling
async function handleRequest<T>(
  options: {
    handler: () => Promise<T>;
    cache?: boolean | number;
  }
) {
  const startTime = performance.now();

  try {
    const data = await options.handler();
    const duration = performance.now() - startTime;

    // Determine cache control header
    const maxAge = typeof options.cache === 'number' ? options.cache : API_REVALIDATE_SECONDS;
    const cacheHeader = typeof options.cache === 'number'
      ? `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}, stale-if-error=${maxAge * 4}`
      : options.cache
        ? `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`
        : `private, must-revalidate, max-age=60`;

    // Return response
    return Response.json({
      data,
      meta: {
        timestamp: new Date().toISOString(),
        duration: Math.round(duration * 100) / 100,
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

// API route handlers (internal — consumed via api.handlers, not exported individually)
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
    cache: API_REVALIDATE_SECONDS
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

// Single consolidated export statement
export {
  BackendService,
  handleRequest,
  api,
};
