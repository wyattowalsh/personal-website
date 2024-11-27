---
title: |
  lib and configs
---
<SwmSnippet path="/lib/api/index.ts" line="1">

---

&nbsp;

```typescript
import { LRUCache } from 'lru-cache';
import { z } from 'zod';
import { NextResponse, NextRequest } from 'next/server';
import { logger } from '@/lib/utils';
import { Config } from '../types';

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

    const ip = req.ip ?? 'anonymous';
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

```

---

</SwmSnippet>

<SwmSnippet path="/lib/config/index.ts" line="1">

---

&nbsp;

```typescript
import { Config, ConfigSchema } from '../types'

const defaultConfig: Config = {
  site: {
    title: "Wyatt Walsh's Blog",
    description: 'Articles about software engineering, data science, and technology',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://w4w.dev',
    author: {
      name: 'Wyatt Walsh',
      email: 'mail@w4w.dev',
      twitter: '@wyattowalsh'
    }
  },
  blog: {
    postsPerPage: 10,
    featuredLimit: 3
  },
  cache: {
    ttl: 3600000, // 1 hour
    maxSize: 500
  }
}

// Simple singleton pattern for config
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

  // Optional: Add method to update config if needed
  public updateConfig(newConfig: Partial<Config>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Export a simple getter function
export function getConfig(): Config {
  return ConfigManager.getInstance().getConfig();
}

// Export the default config for convenience
export const config = getConfig();

// Export types
export type { Config };

```

---

</SwmSnippet>

<SwmSnippet path="/lib/content/index.ts" line="1">

---

&nbsp;

```typescript
import { cache } from 'react';
import { Feed } from 'feed';
import matter from 'gray-matter';
import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { LRUCache } from 'lru-cache';
import { getConfig } from '../config';
import { logger } from '../utils';
import { Post, PostMetadata } from '../types';

const execAsync = promisify(exec);

// Caches
const postCache = new LRUCache<string, Post>({ max: 500, ttl: 3600000 });
const metadataCache = new LRUCache<string, PostMetadata>({ max: 500, ttl: 3600000 });

// Git integration
export async function getGitFileData(filePath: string) {
  try {
    const [created, updated] = await Promise.all([
      execAsync(`git log --follow --format=%aI --reverse "${filePath}" | head -1`),
      execAsync(`git log -1 --format=%aI "${filePath}"`)
    ]);

    return {
      created: created.stdout.trim() || null,
      updated: updated.stdout.trim() || null
    };
  } catch (error) {
    logger.error(`Git data error for ${filePath}:`, error);
    return { created: null, updated: null };
  }
}

// Enhanced post handling with caching
export const getAllPosts = cache(async (): Promise<Post[]> => {
  try {
    const response = await fetch('/api/blog/posts');
    if (!response.ok) throw new Error('Failed to fetch posts');
    const data = await response.json();
    return Object.values(data) as Post[];
  } catch (error) {
    logger.error('Error fetching all posts:', error);
    return [];
  }
});

export const getPostBySlug = cache(async (slug: string): Promise<Post | null> => {
  // Check cache first
  const cached = postCache.get(slug);
  if (cached) return cached;

  try {
    const response = await fetch(`/api/blog/posts/metadata/${slug}`);
    if (!response.ok) return null;
    
    const { metadata } = await response.json();
    postCache.set(slug, metadata);
    return metadata;
  } catch (error) {
    logger.error(`Error fetching post ${slug}:`, error);
    return null;
  }
});

// Additional content-related functions...

```

---

</SwmSnippet>

<SwmSnippet path="/lib/services/index.ts" line="3">

---

&nbsp;

```typescript
// lib/services/backend.ts

import { Feed } from 'feed'
import { LRUCache } from 'lru-cache'
import Fuse from 'fuse.js'
import { promises as fs } from 'fs'
import path from 'path'
import { promisify } from 'util';
import { glob as globCallback } from 'glob';
import matter from 'gray-matter'; // Import gray-matter
import { getGitFileData } from '@/lib/utils/git' // Fix import path with extension
import { getConfig } from '@/lib/config' // Use absolute import

const glob = promisify(globCallback);

// Constants
const CACHE_DIR = '.cache'
const INDICES = {
  SEARCH: path.join(CACHE_DIR, 'search.json'),
  METADATA: path.join(CACHE_DIR, 'metadata.json'),
  TAGS: path.join(CACHE_DIR, 'tags.json'),
  RSS: path.join(CACHE_DIR, 'rss.xml'),
} as const

interface SearchIndex {
  posts: PostMetadata[]
  fuse: Fuse<PostMetadata>
}

interface PreprocessStats {
  duration: number
  postsProcessed: number
  searchIndexSize: number
  cacheSize: number
  errors: Error[]
}

class BackendService {
  private static instance: BackendService
  private searchIndex: SearchIndex | null = null
  private readonly postCache: LRUCache<string, PostMetadata>
  private readonly tagCache: LRUCache<string, string[]>
  
  private constructor() {
    this.postCache = new LRUCache({ 
      max: 500,
      ttl: 1000 * 60 * 60, // 1 hour 
    })
    
    this.tagCache = new LRUCache({
      max: 100,
      ttl: 1000 * 60 * 5 // 5 minutes
    })
  }

  public static getInstance(): BackendService {
    if (!BackendService.instance) {
      BackendService.instance = new BackendService()
    }
    return BackendService.instance
  }

  // Pre-processing for both dev and build
  public async preprocess(isDev = false): Promise<PreprocessStats> {
    const startTime = Date.now();
    const errors: Error[] = [];
    console.log(`Starting ${isDev ? 'development' : 'production'} preprocessing...`)
    
    await fs.mkdir(CACHE_DIR, { recursive: true })

    // 1. Process all posts and generate metadata
    const posts = await this.processAllPosts()
    
    // 2. Generate search index
    const searchIndex = await this.generateSearchIndex(posts)
    
    // 3. Generate tag index
    const tagIndex = await this.generateTagIndex(posts)
    
    // 4. Pre-compute RSS feed (only in production)
    if (!isDev) {
      await this.generateRSSFeed(posts)
    }

    // 5. Save indices to disk for quick startup
    await Promise.all([
      fs.writeFile(INDICES.METADATA, JSON.stringify(posts)),
      fs.writeFile(INDICES.SEARCH, JSON.stringify(searchIndex)),
      fs.writeFile(INDICES.TAGS, JSON.stringify(tagIndex)),
    ])

    console.log('Preprocessing complete!')

    // Collect processing statistics
    const duration = Date.now() - startTime;
    const postsProcessed = posts.length;
    const searchIndexSize = JSON.stringify(searchIndex).length;
    const cacheSize = this.postCache.size;

    return {
      duration,
      postsProcessed,
      searchIndexSize,
      cacheSize,
      errors,
    };
  }

  private async processAllPosts(): Promise<PostMetadata[]> {
    const files = await glob('app/blog/posts/**/*.mdx');
    
    if (!Array.isArray(files)) {
      throw new Error('Failed to get post files');
    }
    
    const posts = await Promise.all(files.map(async (file) => {
      const slug = path.basename(file, '.mdx');
      const gitData = await getGitFileData(file);
      
      // Use cached data if available
      const cached = this.postCache.get(slug);
      if (cached && cached.updated === gitData.lastModified) {
        return cached;
      }

      // Process post and cache
      const post = await this.processPost(file, slug, gitData);
      this.postCache.set(slug, post);
      return post;
    }));

    return posts.sort((a, b) => 
      new Date(b.created).getTime() - new Date(a.created).getTime()
    );
  }

  private async processPost(file: string, slug: string, gitData: any): Promise<PostMetadata> {
    // Implement the logic to process the post file and return the metadata
    const content = await fs.readFile(file, 'utf-8');
    const { data, content: postContent } = matter(content); // Assuming you use gray-matter for frontmatter parsing

    return {
      ...data,
      slug,
      content: postContent,
      updated: gitData.lastModified,
    } as PostMetadata;
  }

  private async generateSearchIndex(posts: PostMetadata[]): Promise<Fuse<PostMetadata>> {
    return new Fuse(posts, {
      keys: ['title', 'summary', 'content', 'tags'],
      threshold: 0.3,
      includeMatches: true,
      useExtendedSearch: true,
    })
  }

  private async generateTagIndex(posts: PostMetadata[]): Promise<Record<string, string[]>> {
    const tagIndex: Record<string, string[]> = {}
    
    posts.forEach(post => {
      post.tags.forEach(tag => {
        if (!tagIndex[tag]) tagIndex[tag] = []
        tagIndex[tag].push(post.slug)
      })
    })

    return tagIndex
  }

  private async generateRSSFeed(posts: PostMetadata[]): Promise<void> {
    const config = getConfig()
    const feed = new Feed({
      title: config.site.title,
      description: config.site.description,
      id: config.site.url,
      link: config.site.url,
      language: "en",
      favicon: `${config.site.url}/favicon.ico`,
      copyright: `All rights reserved ${new Date().getFullYear()}, ${config.site.author.name}`,
      author: {
        name: config.site.author.name,
        email: config.site.author.email,
        link: config.site.url
      },
    })

    posts.forEach(post => feed.addItem({
      title: post.title,
      id: `${config.site.url}/blog/${post.slug}`,
      link: `${config.site.url}/blog/${post.slug}`,
      description: post.summary,
      content: post.content,
      author: [{
        name: config.site.author.name,
        email: config.site.author.email,
        link: config.site.url
      }],
      date: new Date(post.created),
      image: post.image ? `${config.site.url}${post.image}` : undefined,
      category: post.tags.map(tag => ({ name: tag })),
    }))

    await fs.writeFile(INDICES.RSS, feed.rss2())
  }

  // Runtime methods
  public async search(query: string): Promise<PostMetadata[]> {
    if (!this.searchIndex) {
      const data = await fs.readFile(INDICES.SEARCH, 'utf-8')
      this.searchIndex = JSON.parse(data)
    }
    return this.searchIndex.fuse.search(query).map(result => result.item)
  }

  public async getPostsByTag(tag: string): Promise<PostMetadata[]> {
    const cached = this.tagCache.get(tag)
    if (cached) return cached

    const tagIndex = JSON.parse(await fs.readFile(INDICES.TAGS, 'utf-8'))
    const slugs = tagIndex[tag] || []
    const posts = await Promise.all(slugs.map(slug => this.getPost(slug)))
    
    this.tagCache.set(tag, posts)
    return posts
  }

  public async getPost(slug: string): Promise<PostMetadata | null> {
    const cached = this.postCache.get(slug)
    if (cached) return cached

    try {
      const metadata = JSON.parse(await fs.readFile(INDICES.METADATA, 'utf-8'))
      const post = metadata.find((p: PostMetadata) => p.slug === slug)
      
      if (post) {
        this.postCache.set(slug, post)
        return post
      }
      
      return null
    } catch (error) {
      console.error(`Error fetching post ${slug}:`, error)
      return null
    }
  }

  public async getAllPosts(): Promise<PostMetadata[]> {
    try {
      const metadata = JSON.parse(await fs.readFile(INDICES.METADATA, 'utf-8'))
      return metadata
    } catch (error) {
      console.error('Error fetching all posts:', error)
      return []
    }
  }

  public async getAllTags(): Promise<string[]> {
    try {
      const tagIndex = JSON.parse(await fs.readFile(INDICES.TAGS, 'utf-8'))
      return Object.keys(tagIndex)
    } catch (error) {
      console.error('Error fetching all tags:', error)
      return []
    }
  }

  public async getAdjacentPosts(slug: string): Promise<{
    prevPost: PostMetadata | null;
    nextPost: PostMetadata | null;
  }> {
    try {
      const posts = await this.getAllPosts();
      const currentIndex = posts.findIndex(post => post.slug === slug);
      
      if (currentIndex === -1) {
        return { prevPost: null, nextPost: null };
      }

      return {
        prevPost: currentIndex > 0 ? posts[currentIndex - 1] : null,
        nextPost: currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null,
      };
    } catch (error) {
      console.error(`Error fetching adjacent posts for ${slug}:`, error);
      return { prevPost: null, nextPost: null };
    }
  }
}

// Private backend instance
const backend = (() => {
  return BackendService.getInstance();
})();

// Only export async functions
export async function getPost(slug: string) {
  try {
    return await backend.getPost(slug);
  } catch (error) {
    console.error(`Error fetching post ${slug}:`, error);
    return null;
  }
}

export async function searchPosts(query: string) {
  return await backend.search(query);
}

export async function getPostsByTag(tag: string) {
  return await backend.getPostsByTag(tag);
}

export async function predevBackend(): Promise<PreprocessStats> {
  return await backend.preprocess(true);
}

export async function prebuildBackend() {
  return await backend.preprocess(false);
}
```

---

</SwmSnippet>

<SwmSnippet path="/lib/services/backend.ts" line="2">

---

&nbsp;

```typescript
const { Feed } = require('feed');
const { LRUCache } = require('lru-cache');
const Fuse = require('fuse.js');
const { promisify } = require('util');
const glob = require('glob');
const matter = require('gray-matter');
const path = require('path'); // Add direct import for path
const { getGitFileData } = require('../utils/git');
const { getConfig } = require('../config');
const { logger } = require('../utils/logger');

// Use dynamic imports for fs only since it's not available in browser
const isNode = typeof window === 'undefined';
const getFs = async () => isNode ? require('fs').promises : null;

const globAsync = promisify(glob);

// Constants - path is available in both Node.js and browser environments
const CACHE_DIR = '.cache';
const INDICES = {
  SEARCH: path.join(CACHE_DIR, 'search.json'),
  METADATA: path.join(CACHE_DIR, 'metadata.json'),
  TAGS: path.join(CACHE_DIR, 'tags.json'),
  RSS: path.join(CACHE_DIR, 'rss.xml'),
} as const;

class BackendService {
  private static instance: BackendService;
  private searchIndex: SearchIndex | null = null;
  private readonly postCache: LRUCache<string, PostMetadata>;
  private readonly tagCache: LRUCache<string, string[]>;

  private constructor() {
    this.postCache = new LRUCache({ max: 500, ttl: 1000 * 60 * 60 }); // 1 hour
    this.tagCache = new LRUCache({ max: 100, ttl: 1000 * 60 * 5 }); // 5 minutes
  }

  public static getInstance(): BackendService {
    if (!BackendService.instance) {
      BackendService.instance = new BackendService();
    }
    return BackendService.instance;
  }

  public async preprocess(isDev = false): Promise<PreprocessStats> {
    const startTime = Date.now();
    const errors: Error[] = [];
    logger.info(`Starting ${isDev ? 'development' : 'production'} preprocessing...`);

    const fs = await getFs();
    await fs.mkdir(CACHE_DIR, { recursive: true });

    // 1. Process all posts and generate metadata
    const posts = await this.processAllPosts();

    // 2. Generate search index
    const searchIndex = await this.generateSearchIndex(posts);

    // 3. Generate tag index
    const tagIndex = await this.generateTagIndex(posts);

    // 4. Pre-compute RSS feed (only in production)
    if (!isDev) {
      await this.generateRSSFeed(posts);
    }

    // 5. Save indices to disk for quick startup
    await Promise.all([
      fs.writeFile(INDICES.METADATA, JSON.stringify(posts)),
      fs.writeFile(INDICES.SEARCH, JSON.stringify(searchIndex)),
      fs.writeFile(INDICES.TAGS, JSON.stringify(tagIndex)),
    ]);

    const duration = Date.now() - startTime;
    return {
      duration,
      postsProcessed: posts.length,
      searchIndexSize: JSON.stringify(searchIndex).length,
      cacheSize: this.postCache.size,
      errors,
    };
  }

  private async processPost(file: string, slug: string, gitData: any): Promise<PostMetadata> {
    try {
      const fs = await getFs();
      const content = await fs.readFile(file, 'utf-8');
      const { data, content: postContent } = matter(content);

      // Ensure valid dates by prioritizing frontmatter but always having a fallback
      const created = data.created 
        ? new Date(data.created).toISOString() 
        : gitData.firstModified || new Date().toISOString();

      const updated = data.updated 
        ? new Date(data.updated).toISOString() 
        : gitData.lastModified || new Date().toISOString();

      const metadata: PostMetadata = {
        title: String(data.title || slug),
        slug: String(slug),
        summary: String(data.summary || ''),
        content: String(postContent || ''),
        created, // Always has a valid date
        updated, // Always has a valid date
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        image: data.image
      };

      logger.info(`Processed post ${slug} with created date: ${created} (from ${data.created ? 'frontmatter' : 'git'})`);
      return metadata;
    } catch (error) {
      logger.error(`Error processing post ${slug}:`, error as Error);
      throw error; // Let the caller handle the error
    }
  }

  private async processAllPosts(): Promise<PostMetadata[]> {
    try {
      const files = await globAsync('app/blog/posts/**/*.mdx');
      
      if (!Array.isArray(files)) {
        throw new Error('Failed to get post files');
      }
      
      const processedPosts = await Promise.all(
        files.map(async (file) => {
          try {
            const slug = path.basename(file, '.mdx');
            const gitData = await getGitFileData(file);
            
            // Use cached data if available and not stale
            const cached = this.postCache.get(slug);
            if (cached && cached.updated === gitData.lastModified) {
              return cached;
            }

            const post = await this.processPost(file, slug, gitData);
            this.postCache.set(slug, post);
            return post;
          } catch (error) {
            logger.error(`Failed to process file ${file}:`, error as Error);
            return null;
          }
        })
      );

      // Filter out failed posts and sort by date
      return processedPosts
        .filter((post): post is PostMetadata => post !== null)
        .sort((a, b) => 
          new Date(b.created).getTime() - new Date(a.created).getTime()
        );
    } catch (error) {
      logger.error('Failed to process posts:', error as Error);
      return [];
    }
  }

  private async generateSearchIndex(posts: PostMetadata[]): Promise<Fuse<PostMetadata>> {
    return new Fuse(posts, {
      keys: ['title', 'summary', 'content', 'tags'],
      threshold: 0.3,
      includeMatches: true,
      useExtendedSearch: true,
    });
  }

  private async generateTagIndex(posts: PostMetadata[]): Promise<Record<string, string[]>> {
    const tagIndex: Record<string, string[]> = {};
    posts.forEach(post => {
      post.tags.forEach(tag => {
        if (!tagIndex[tag]) tagIndex[tag] = [];
        tagIndex[tag].push(post.slug);
      });
    });
    return tagIndex;
  }

  private async generateRSSFeed(posts: PostMetadata[]): Promise<void> {
    const config = getConfig();
    const feed = new Feed({
      title: config.site.title,
      description: config.site.description,
      id: config.site.url,
      link: config.site.url,
      language: 'en',
      image: `${config.site.url}/logo.png`,
      favicon: `${config.site.url}/favicon.ico`,
      copyright: `All rights reserved ${new Date().getFullYear()}, ${config.site.author.name}`,
      feedLinks: {
        rss2: `${config.site.url}/rss.xml`,
      },
      author: {
        name: config.site.author.name,
        email: config.site.author.email,
        link: config.site.url,
      },
    });

    posts.forEach(post => {
      feed.addItem({
        title: post.title,
        id: `${config.site.url}/blog/${post.slug}`,
        link: `${config.site.url}/blog/${post.slug}`,
        description: post.summary,
        content: post.content,
        author: [{ name: config.site.author.name, email: config.site.author.email }],
        date: new Date(post.created),
        category: post.tags.map(tag => ({ name: tag })),
      });
    });

    const fs = await getFs();
    await fs.writeFile(INDICES.RSS, feed.rss2());
  }

  private async ensurePreprocessed() {
    if (!isNode) {
      logger.warning('Cache operations skipped in browser');
      return;
    }
    
    try {
      const fs = await getFs();
      await fs.mkdir(CACHE_DIR, { recursive: true });
      
      // Try to access cache files
      try {
        await Promise.all([
          fs.access(INDICES.METADATA),
          fs.access(INDICES.TAGS)
        ]);
      } catch {
        // If files don't exist, run preprocessing
        logger.info('Cache files not found, running preprocessing...');
        await this.preprocess(true);
      }
    } catch (error) {
      logger.error('Failed to ensure cache:', error);
      throw error;
    }
  }

  public async search(query: string): Promise<PostMetadata[]> {
    if (!this.searchIndex) {
      const fs = await getFs();
      const data = await fs.readFile(INDICES.SEARCH, 'utf-8');
      this.searchIndex = JSON.parse(data);
    }
    return this.searchIndex.fuse.search(query).map(result => result.item);
  }

  public async getPostsByTag(tag: string): Promise<PostMetadata[]> {
    await this.ensurePreprocessed();
    const cached = this.tagCache.get(tag);
    if (cached) return cached;

    const fs = await getFs();
    const tagIndex = JSON.parse(await fs.readFile(INDICES.TAGS, 'utf-8'));
    const slugs = tagIndex[tag] || [];
    const posts = await Promise.all(slugs.map(slug => this.getPost(slug)));

    this.tagCache.set(tag, posts);
    return posts;
  }

  public async getPost(slug: string): Promise<PostMetadata | null> {
    try {
      await this.ensurePreprocessed();
      
      console.log('Getting post for slug:', slug);
      
      // Check cache first
      const cached = this.postCache.get(slug);
      if (cached) {
        console.log('Found cached post:', cached);
        return cached;
      }

      // Try to read from metadata file
      const metadataPath = INDICES.METADATA;
      let metadata: PostMetadata[] = [];
      
      try {
        const fs = await getFs();
        const rawMetadata = await fs.readFile(metadataPath, 'utf-8');
        metadata = JSON.parse(rawMetadata);
      } catch (readError) {
        logger.warning(`Metadata file read failed, attempting rebuild: ${readError}`);
        await this.rebuildCache();
        const fs = await getFs();
        const rawMetadata = await fs.readFile(metadataPath, 'utf-8');
        metadata = JSON.parse(rawMetadata);
      }

      // Find the post
      const post = metadata.find(p => p.slug === slug);
      if (!post) {
        return null;
      }

      // Cache and return
      this.postCache.set(slug, post);
      return post;
      
    } catch (error) {
      logger.error('Error in getPost:', error as Error);
      return null;
    }
  }

  // Add this method to force rebuild cache
  public async rebuildCache(): Promise<void> {
    await this.cleanup();
    await this.preprocess(true);
  }

  public async getAllPosts(): Promise<PostMetadata[]> {
    try {
      await this.ensurePreprocessed(); // This must complete before continuing
      const fs = await getFs();
      
      try {
        const metadata = JSON.parse(await fs.readFile(INDICES.METADATA, 'utf-8'));
        return metadata;
      } catch (readError) {
        // If reading fails, try rebuilding cache once
        logger.warning('Metadata file read failed, rebuilding cache...');
        await this.rebuildCache();
        const metadata = JSON.parse(await fs.readFile(INDICES.METADATA, 'utf-8'));
        return metadata;
      }
    } catch (error) {
      logger.error('Error fetching all posts:', error);
      return [];
    }
  }

  public async getAllTags(): Promise<string[]> {
    try {
      await this.ensurePreprocessed(); // This must complete before continuing
      const fs = await getFs();
      
      try {
        const tagIndex = JSON.parse(await fs.readFile(INDICES.TAGS, 'utf-8'));
        return Object.keys(tagIndex);
      } catch (readError) {
        // If reading fails, try rebuilding cache once
        logger.warning('Tags file read failed, rebuilding cache...');
        await this.rebuildCache();
        const tagIndex = JSON.parse(await fs.readFile(INDICES.TAGS, 'utf-8'));
        return Object.keys(tagIndex);
      }
    } catch (error) {
      logger.error('Error fetching all tags:', error);
      return [];
    }
  }

  public async cleanup(): Promise<void> {
    try {
      // Reset caches first
      this.postCache.clear();
      this.tagCache.clear();
      this.searchIndex = null;

      // Then try to remove the cache directory
      try {
        const fs = await getFs();
        await fs.rm(CACHE_DIR, { recursive: true, force: true });
      } catch (rmError) {
        logger.warning('Cache directory removal failed, may not exist');
      }

      logger.success('Cache cleared');
    } catch (error) {
      logger.error('Failed to clean cache:', error as Error);
      throw error;
    }
  }
}

// Exports
module.exports = {
  backend: BackendService.getInstance(),
  getPost: async (slug: string) => {
    try {
      return await BackendService.getInstance().getPost(slug);
    } catch (error) {
      logger.error('Error in getPost:', error as Error);
      return null;
    }
  },
  searchPosts: async (query) => BackendService.getInstance().search(query),
  getPostsByTag: async (tag) => BackendService.getInstance().getPostsByTag(tag),
  predevBackend: async () => BackendService.getInstance().preprocess(true),
  prebuildBackend: async () => BackendService.getInstance().preprocess(false)
};

```

---

</SwmSnippet>

<SwmSnippet path="/lib/types/index.ts" line="1">

---

&nbsp;

```typescript
import { z } from 'zod'

// Post types
export interface Post {
  slug: string
  title: string
  summary: string
  content: string
  created: string
  updated?: string
  tags: string[]
  image?: string
  readingTime: string
  wordCount: number
  adjacent?: {
    prev: AdjacentPost | null
    next: AdjacentPost | null
  }
}

export interface AdjacentPost {
  slug: string
  title: string
}

export interface PostMetadata {
  slug: string;
  title: string;
  summary?: string;
  content: string;
  created: string;
  updated?: string;
  tags: string[];
  image?: string;
  readingTime?: string;
}

// Service types
export interface PreprocessStats {
  duration: number
  postsProcessed: number
  searchIndexSize: number
  cacheSize: number
  errors: Error[]
}

export interface SearchResult<T> {
  item: T
  score: number
  matches: Array<{
    key: string
    value: string
    indices: number[][]
  }>
}

// Configuration schemas
export const ConfigSchema = z.object({
  site: z.object({
    title: z.string(),
    description: z.string(),
    url: z.string().url(),
    author: z.object({
      name: z.string(),
      email: z.string().email(),
      twitter: z.string().optional()
    })
  }),
  blog: z.object({
    postsPerPage: z.number(),
    featuredLimit: z.number()
  }),
  cache: z.object({
    ttl: z.number(),
    maxSize: z.number()
  })
})

export type Config = z.infer<typeof ConfigSchema>

// Export utility types
export type CoreContent<T> = Omit<T, '_id' | '_raw' | 'body'>
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}
```

---

</SwmSnippet>

<SwmSnippet path="lib/utils/index.ts" line="1">

---

&nbsp;

```
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (
  date: string | undefined,
  locale = "en-US",
  options?: Intl.DateTimeFormatOptions
): string => {
  try {
    if (!date) return "Invalid Date";
    const cleanDate = date.endsWith('Z') ? date : date + 'Z';
    const utcDate = new Date(cleanDate);
    if (isNaN(utcDate.getTime())) return "Invalid Date";
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'
    };

    return new Intl.DateTimeFormat(
      locale, 
      options || defaultOptions
    ).format(utcDate);
  } catch {
    return "Invalid Date";
  }
};
```

---

</SwmSnippet>

<SwmSnippet path="/lib/schema.ts" line="1">

---

&nbsp;

```typescript
import { links } from '@/components/Links';
import { Post } from './posts';
import { cache } from 'react';
import { getConfig } from './config';

interface BreadcrumbItem {
  name: string;
  item: string;
}

export function generateArticleStructuredData(post: Post, siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary,
    image: post.image ? [`${siteUrl}${post.image}`] : [],
    datePublished: new Date(post.created).toISOString(),
    dateModified: new Date(post.updated || post.created).toISOString(),
    author: {
      '@type': 'Person',
      name: 'Wyatt Walsh',
      url: siteUrl,
    },
  };
}

// Cache the generation of the website schema
export const generateWebSiteSchema = cache((url = 'https://w4w.dev') => {
  const config = getConfig();
  const currentYear = new Date().getFullYear();

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: config.site.title,
    alternateName: ['w4w', 'wyattowalsh'],
    url: config.site.url,
    description: config.site.description,
    author: {
      '@type': 'Person',
      name: config.site.author.name,
      url: config.site.url,
      email: config.site.author.email,
      sameAs: [
        `https://github.com/${config.site.author.github}`,
        `https://twitter.com/${config.site.author.twitter}`,
        `https://linkedin.com/in/${config.site.author.linkedin}`
      ]
    },
    publisher: {
      '@type': 'Organization',
      name: config.site.author.name,
      logo: {
        '@type': 'ImageObject',
        url: `${config.site.url}/logo.webp`
      }
    },
    copyrightYear: currentYear,
    copyrightHolder: {
      '@type': 'Person',
      name: config.site.author.name
    },
    inLanguage: 'en-US',
    license: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
    keywords: [
      'Software Engineering',
      'Web Development', 
      'Technology',
      'Blog'
    ]
  };
});

export function generateArticleSchema(post: any) {
  const config = getConfig();
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary,
    image: post.image ? [`${config.site.url}${post.image}`] : [],
    datePublished: post.created,
    dateModified: post.updated || post.created,
    author: {
      '@type': 'Person',
      name: config.site.author.name,
      url: config.site.url
    },
    publisher: {
      '@type': 'Organization',
      name: config.site.author.name,
      logo: {
        '@type': 'ImageObject',
        url: `${config.site.url}/logo.webp`
      }
```

---

</SwmSnippet>

<SwmSnippet path="/scripts/prebuild.ts" line="1">

---

&nbsp;

```typescript
import { scripts } from './index';

// Process is already available globally in Node.js
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});

// Add error handler for the scripts execution
scripts.prebuild().catch((error) => {
```

---

</SwmSnippet>

<SwmSnippet path="/scripts/index.ts" line="2">

---

&nbsp;

```typescript
#!/usr/bin/env node
import path from 'path';
import chalk from 'chalk';
import { backend } from '../lib/services/backend';
import { logger } from '../lib/utils/logger';
import { processFiles } from './index';
import { backend } from '../lib/services/backend';
import { fileURLToPath } from 'url';

// Enhanced error handling setup using global process
globalThis.process.on('unhandledRejection', (error) => {
  logger.error('Unhandled rejection:', error as Error);
  process.exit(1);
});

globalThis.process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error as Error);
  process.exit(1);
});

// Main processing function with enhanced error handling and logging
export async function processFiles(isDev = false): Promise<PreprocessStats> {
  const startTime = Date.now();
  
  try {
    logger.info('Starting preprocessing...');
    logger.info(`Mode: ${isDev ? 'development' : 'production'}`);

    // Clean up existing cache
    logger.step('Cleaning cache directories...');
    await backend.cleanup();

    // Run preprocessing
    logger.step('Running preprocessing pipeline...');
    const stats = await backend.preprocess(isDev);

    // Log completion stats
    const duration = Date.now() - startTime;
    logger.success(`Preprocessing complete in ${duration}ms!`);
    logger.info(`Processed ${stats.postsProcessed} posts`);
    logger.info(`Search index size: ${(stats.searchIndexSize / 1024).toFixed(2)}KB`);
    logger.info(`Cache entries: ${stats.cacheSize}`);

    if (stats.errors.length > 0) {
      logger.warning(`Completed with ${stats.errors.length} errors`);
      stats.errors.forEach(error => logger.error('Processing error:', error));
    }

    return stats;
  } catch (error) {
    logger.error(`Failed to preprocess for ${isDev ? 'development' : 'production'}`, error as Error);
    throw error;
  }
}

// Simplified script runners
const scripts = {
  predev: async () => {
    try {
      await processFiles(true);
      logger.success('Development preprocessing complete!');
    } catch (error) {
      logger.error('Development preprocessing failed!', error);
      process.exit(1);
    }
  },

  prebuild: async () => {
    try {
      await processFiles(false);
      logger.success('Production preprocessing complete!');
    } catch (error) {
      logger.error('Production preprocessing failed!', error);
      process.exit(1);
    }
  }
};

// Remove ESM-specific code
if (require.main === module) {
  const isDev = process.argv.includes('--dev');
  (isDev ? scripts.predev() : scripts.prebuild())
    .catch(() => process.exit(1));
}

// Update exports
module.exports = {
  scripts: {
    predev: async () => {
      // ...existing code...
    },
    prebuild: async () => {
      // ...existing code...
    }
  }
};

```

---

</SwmSnippet>

<SwmSnippet path="/scripts/predev.ts" line="1">

---

&nbsp;

```typescript
import { scripts } from './index';

// Process is already available globally in Node.js
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});

// Add error handler for the scripts execution
scripts.predev().catch((error) => {
```

---

</SwmSnippet>

<SwmMeta version="3.0.0" repo-id="Z2l0aHViJTNBJTNBcGVyc29uYWwtd2Vic2l0ZSUzQSUzQXd5YXR0b3dhbHNo" repo-name="personal-website"><sup>Powered by [Swimm](https://app.swimm.io/)</sup></SwmMeta>
