import 'server-only';
import Fuse from 'fuse.js';
import type { FuseResult, FuseResultMatch } from 'fuse.js';
import matter from 'gray-matter';
import { dump, load } from 'js-yaml';
import path from 'path';
import fs from 'fs/promises';
import { glob } from 'glob';
import readingTime from 'reading-time';
import { z } from 'zod';
import { logger, formatters } from './logger';
import type {
  AdjacentPost,
  AdjacentPosts,
  Post,
  PostMetadata,
  PreprocessStats,
  PublicPost,
  PublicPostSearchResult,
} from './types';
import { stripMdxSyntax } from './utils';
import {
  SEARCH_THRESHOLD,
  API_REVALIDATE_SECONDS
} from './constants';

const FRONTMATTER_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const YAML_ENGINE = {
  parse: load,
  stringify: dump,
};

function isValidFrontmatterDate(value: string): boolean {
  if (!FRONTMATTER_DATE_PATTERN.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function parseFrontmatterDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

const frontmatterDateSchema = z.string().trim().min(1).refine(
  isValidFrontmatterDate,
  'Expected a valid YYYY-MM-DD date',
);

const frontmatterSchema = z.object({
  title: z.string().min(1),
  created: frontmatterDateSchema,
  updated: frontmatterDateSchema.optional(),
  image: z.string().optional(),
  caption: z.string().optional(),
  summary: z.string().optional(),
  tags: z.array(z.string()).default([]),
  series: z.object({
    name: z.string(),
    order: z.number(),
  }).optional(),
}).superRefine((data, ctx) => {
  if (data.updated && data.updated < data.created) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Updated date must be on or after created date',
      path: ['updated'],
    });
  }
});

function toPublicPost(post: Post): PublicPost {
  const { adjacent: _adjacent, createdTimestamp: _createdTimestamp, ...publicPost } = post;
  return publicPost;
}

function toPostMetadata(post: Post): PostMetadata {
  const { content: _content, wordCount: _wordCount, ...metadata } = toPublicPost(post);
  return metadata;
}

function toAdjacentPost(post: Post | null): AdjacentPost | null {
  if (!post) {
    return null;
  }

  return {
    slug: post.slug,
    title: post.title,
  };
}

function toPublicSearchResult(result: FuseResult<Post>): PublicPostSearchResult {
  return {
    post: toPostMetadata(result.item),
    score: typeof result.score === 'number' ? result.score : null,
    matches: result.matches?.map((match: FuseResultMatch) => ({
      key: String(match.key),
      indices: match.indices.map(([start, end]): [number, number] => [start, end]),
    })) ?? [],
  };
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
  private taggedPostsCache: Map<string, Post[]> = new Map();
  private latestPreprocessStats: PreprocessStats | null = null;
  private lastPreprocessedAt: string | null = null;
  private lastPreprocessStartedAt: string | null = null;

  private constructor() {
    this.searchIndex = new Fuse([], {
      keys: ['title', 'summary', 'content', 'tags'],
      threshold: SEARCH_THRESHOLD,
      includeMatches: true,
      includeScore: true
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

  /**
   * Ensures preprocessing has completed before any data access.
   *
   * Uses promise deduplication to prevent race conditions during concurrent
   * cold starts: the promise is assigned atomically (synchronously) before
   * any async work begins, so all concurrent callers receive the same
   * in-flight promise rather than spawning duplicate preprocessing runs.
   * On failure the promise is cleared so the next caller retries.
   */
  public static ensurePreprocessed() {
    const instance = BackendService.getInstance();

    // Return immediately if already preprocessed
    if (instance.preprocessed) return Promise.resolve();

    // Return existing promise if preprocessing is in progress (prevents race condition)
    if (instance.preprocessPromise) return instance.preprocessPromise;

    // Atomically assign the promise before any async work begins
    const isDev = process.env.NODE_ENV === 'development';
    instance.lastPreprocessStartedAt = new Date().toISOString();
    const promise = instance.preprocess(isDev)
      .then((stats) => {
        instance.latestPreprocessStats = stats;
        instance.lastPreprocessedAt = new Date().toISOString();
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

  async getPublicPost(slug: string): Promise<PublicPost | null> {
    const post = await this.getPost(slug);
    return post ? toPublicPost(post) : null;
  }

  async getPostMetadata(slug: string): Promise<PostMetadata | null> {
    const post = await this.getPost(slug);
    if (!post) return null;

    return toPostMetadata(post);
  }

  async getPostSummaries(): Promise<PostMetadata[]> {
    return (await this.getAllPosts()).map(toPostMetadata);
  }

  async search(query: string): Promise<FuseResult<Post>[]> {
    return this.searchIndex.search(query);
  }

  async searchPublic(query: string): Promise<PublicPostSearchResult[]> {
    return (await this.search(query)).map(toPublicSearchResult);
  }

  async getPostsByTag(tag: string): Promise<Post[]> {
    const cached = this.taggedPostsCache.get(tag);
    if (cached) return cached;
    const result = Array.from(this.posts.values())
      .filter(post => post.tags.includes(tag))
      .sort((a, b) => (b.createdTimestamp ?? 0) - (a.createdTimestamp ?? 0));
    this.taggedPostsCache.set(tag, result);
    return result;
  }

  async getAllPosts(): Promise<Post[]> {
    // Return cached sorted array if available
    if (this.sortedPostsCache) return this.sortedPostsCache;

    // Sort and cache the result (uses cached timestamps from preprocessing)
    this.sortedPostsCache = Array.from(this.posts.values())
      .sort((a, b) => (b.createdTimestamp ?? 0) - (a.createdTimestamp ?? 0));

    return this.sortedPostsCache;
  }

  async getAllTags(): Promise<string[]> {
    return Array.from(this.tags).sort();
  }

  getTelemetryState() {
    return {
      preprocessed: this.preprocessed,
      isPreprocessing: this.preprocessPromise !== null && !this.preprocessed,
      latestPreprocessStats: this.latestPreprocessStats,
      lastPreprocessedAt: this.lastPreprocessedAt,
      lastPreprocessStartedAt: this.lastPreprocessStartedAt,
      cache: {
        sortedPostsCached: this.sortedPostsCache !== null,
        taggedPostsCached: this.taggedPostsCache.size,
      },
      counts: {
        posts: this.posts.size,
        tags: this.tags.size,
        searchIndexSize: this.posts.size,
      },
    };
  }

  async getAdjacentPosts(slug: string): Promise<{ previous: Post | null; next: Post | null } | null> {
    const posts = await this.getAllPosts();
    const index = posts.findIndex(p => p.slug === slug);

    if (index === -1) {
      return null;
    }

    return {
      previous: index > 0 ? posts[index - 1] : null,
      next: index < posts.length - 1 ? posts[index + 1] : null
    };
  }

  async getAdjacentPostLinks(slug: string): Promise<AdjacentPosts | null> {
    const adjacent = await this.getAdjacentPosts(slug);
    if (!adjacent) {
      return null;
    }

    return {
      previous: toAdjacentPost(adjacent.previous),
      next: toAdjacentPost(adjacent.next),
    };
  }

  async getRelatedPosts(slug: string, limit = 3): Promise<Post[] | null> {
    const post = await this.getPost(slug);
    if (!post) return null;

    const allPosts = await this.getAllPosts();
    const currentPostDate = post.createdTimestamp ?? parseFrontmatterDate(post.created).getTime();

    return allPosts
      .filter(p => p.slug !== slug)
      .map(p => {
        const sharedTags = p.tags.filter(t => post.tags.includes(t)).length;
        const totalTags = new Set([...p.tags, ...post.tags]).size;
        const tagScore = totalTags > 0 ? sharedTags / totalTags : 0;

        const postDate = p.createdTimestamp ?? parseFrontmatterDate(p.created).getTime();
        const daysDiff = Math.abs(postDate - currentPostDate) / (1000 * 60 * 60 * 24);
        const recencyScore = Math.exp(-daysDiff / 365);

        const score = tagScore * 0.7 + recencyScore * 0.3;
        return { post: p, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(r => r.post);
  }

  async getRelatedPostSummaries(slug: string, limit = 3): Promise<PostMetadata[] | null> {
    const related = await this.getRelatedPosts(slug, limit);
    return related ? related.map(toPostMetadata) : null;
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
    const nextPosts = new Map<string, Post>();
    const nextTags = new Set<string>();

    logger.info('Preprocessing started');
    logger.info(`Mode: ${isDev ? 'Development' : 'Production'}`);

    try {
      const postsDir = path.join(process.cwd(), 'content/posts');
      const files = await glob('**/index.mdx', { cwd: postsDir, absolute: true });

      logger.info(`Found ${files.length} posts to process`);

      for (const filePath of files) {
        try {
          const relativePath = path.relative(postsDir, filePath);
          logger.info(`Processing ${formatters.path(filePath)}`);

          const content = await fs.readFile(filePath, 'utf-8');
          const { data, content: markdown } = matter(content, {
            engines: {
              yaml: YAML_ENGINE,
            },
          });
          const slug = path.basename(path.dirname(relativePath));

          const validated = frontmatterSchema.parse(data);
          const cleanContent = stripMdxSyntax(markdown);
          const normalizedContent = cleanContent.trim();
          const createdDate = parseFrontmatterDate(validated.created);

          if (nextPosts.has(slug)) {
            throw new Error(`Duplicate slug detected: ${slug}`);
          }

          // Calculate word count and reading time from clean content
          const wordCount = normalizedContent ? normalizedContent.split(/\s+/).length : 0;
          const readingTimeResult = readingTime(normalizedContent);
          const readingTimeText = readingTimeResult.text;

          const post: Post = {
            slug,
            ...validated,
            content: normalizedContent,
            wordCount,
            readingTime: readingTimeText,
            created: validated.created,
            updated: validated.updated || validated.created,
            tags: validated.tags,
            series: validated.series,
            createdTimestamp: createdDate.getTime(),
          };

          // Validate hero image exists
          if (post.image) {
            const imagePath = path.join(process.cwd(), 'public', post.image.replace(/^\/+/, ''));
            try {
              await fs.access(imagePath);
            } catch {
              logger.warning(`Post "${post.slug}" references missing image: ${post.image}`);
            }
          }

          nextPosts.set(slug, post);
          post.tags.forEach(tag => nextTags.add(tag));

          logger.debug(`Processed: ${formatters.path(filePath)}`, {
            size: formatters.fileSize(content.length),
            tags: post.tags.length
          });
        } catch (error) {
          errors.push(error instanceof Error ? error : new Error(String(error)));
          logger.error(`Failed to process post: ${filePath}`, error instanceof Error ? error : new Error(String(error)));
        }
      }

      if (nextPosts.size === 0) {
        errors.push(new Error('Preprocessing produced no valid posts'));
      }

      if (errors.length > 0 && (!isDev || nextPosts.size === 0)) {
        throw new AggregateError(
          errors,
          `Preprocessing failed for ${errors.length} content item${errors.length === 1 ? '' : 's'}`
        );
      }

      this.posts = nextPosts;
      this.tags = nextTags;
      this.sortedPostsCache = null;
      this.taggedPostsCache.clear();

      // Rebuild search index
      this.searchIndex = new Fuse(Array.from(this.posts.values()), {
        keys: ['title', 'summary', 'content', 'tags'],
        threshold: SEARCH_THRESHOLD,
        includeMatches: true,
        includeScore: true
      });

      // Log final stats
      const duration = Date.now() - startTime;
      const stats: PreprocessStats = {
        duration, // Return raw duration number instead of formatted string
        postsProcessed: this.posts.size,
        searchIndexSize: this.posts.size,
        errors: errors.length,
        memory: formatters.fileSize(process.memoryUsage().heapUsed)
      };

      logger.info('Stats', {
        ...stats,
        duration: formatters.duration(duration)
      });
      logger.timing('Total preprocessing time', duration);

      if (errors.length > 0) {
        logger.warning(
          `Continuing in development with ${this.posts.size} valid posts and ${errors.length} invalid content item${errors.length === 1 ? '' : 's'}`
        );
      } else {
        logger.success('Preprocessing completed successfully');
      }

      return stats;
    } catch (error) {
      logger.error('Fatal preprocessing error:', error as Error);
      throw error;
    }
  }

}

function jsonResponse<T>(data: T, options?: { cache?: boolean | number }) {
  const maxAge = typeof options?.cache === 'number' ? options.cache : API_REVALIDATE_SECONDS;
  const cacheHeader = typeof options?.cache === 'number'
    ? `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}, stale-if-error=${maxAge * 4}`
    : options?.cache
      ? `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`
      : `private, must-revalidate, max-age=60`;

  return Response.json({
    data,
    meta: {
      timestamp: new Date().toISOString(),
    }
  }, {
    headers: {
      'Cache-Control': cacheHeader,
      'Content-Type': 'application/json',
    }
  });
}

// Single consolidated export statement
export {
  BackendService,
  jsonResponse,
};
