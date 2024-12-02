import { Feed } from 'feed';
import { LRUCache } from 'lru-cache';
import Fuse from 'fuse.js';
import { promisify } from 'util';
import { globAsync } from '@/lib/utils/glob';
import matter from 'gray-matter';
import path from 'path';
import { getGitFileData } from '../utils/git';
import { getConfig } from '../config';
import { logger } from '../utils/logger';
import fs from 'fs/promises';

// Type definitions
export interface Post {
  slug: string;
  title: string;
  date: string;
  content: string;
  tags: string[];
  summary?: string;
  image?: string;
  caption?: string;  // Add this
  created: string;
  updated: string;
}

interface PostMetadata {
  title: string;
  slug: string;
  summary: string;
  content: string;
  created: string;
  updated?: string;
  tags: string[];
  image?: string;
}

interface SearchIndex {
  fuse: Fuse<PostMetadata>;
}

interface PreprocessStats {
  duration: number;
  postsProcessed: number;
  searchIndexSize: number;
  cacheSize: number;
  errors: Error[];
}

// Replace the error handling utilities with this improved version
const isError = (error: unknown): error is Error => {
  return error instanceof Error;
};

const toError = (maybeError: unknown): Error => {
  if (isError(maybeError)) return maybeError;

  try {
    return new Error(
      typeof maybeError === 'object' 
        ? JSON.stringify(maybeError) 
        : String(maybeError)
    );
  } catch {
    // If JSON.stringify fails, fallback to String()
    return new Error(String(maybeError));
  }
};

// Use dynamic imports for fs only since it's not available in browser
const isNode = typeof window === 'undefined';
const getFs = async () => isNode ? (await import('fs')).promises : null;

const ensureFs = async () => {
  const fs = await getFs();
  if (!fs) {
    throw new Error('File system is not available');
  }
  return fs;
};

// Constants - path is available in both Node.js and browser environments
const CACHE_DIR = '.cache';
const INDICES = {
  SEARCH: path.join(CACHE_DIR, 'search.json'),
  METADATA: path.join(CACHE_DIR, 'metadata.json'),
  TAGS: path.join(CACHE_DIR, 'tags.json'),
  RSS: path.join(CACHE_DIR, 'rss.xml'),
} as const;

const ensureNodeEnv = () => {
  if (!isNode) {
    throw new Error('This operation is only available in Node.js environment');
  }
};

class BackendService {
  private static instance: BackendService;
  private searchIndex: SearchIndex | null = null;
  private readonly postCache: LRUCache<string, PostMetadata>;
  // Fix: Update tagCache type to store PostMetadata[] instead of string[]
  private readonly tagCache: LRUCache<string, PostMetadata[]>;

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
    ensureNodeEnv(); // Add this line to ensure we're in Node environment
    const startTime = Date.now();
    const errors: Error[] = [];
    
    try {
      logger.info(`Starting ${isDev ? 'development' : 'production'} preprocessing...`);
      
      // Use fs with await
      await fs.mkdir(CACHE_DIR, { recursive: true })
        .catch(() => logger.warning('Cache directory already exists'));

      // Clear existing cache
      await this.cleanup();

      // Process posts with progress logging
      logger.step('Processing posts...');
      const posts = await this.processAllPosts();
      logger.info(`Processed ${posts.length} posts`);

      // Generate indices with progress logging
      logger.step('Generating search index...');
      const searchIndex = await this.generateSearchIndex(posts);
      
      logger.step('Generating tag index...');
      const tagIndex = await this.generateTagIndex(posts);

      // Save to disk with progress logging
      logger.step('Saving cache files...');
      
      await Promise.all([
        fs.writeFile(INDICES.METADATA, JSON.stringify(posts))
          .then(() => logger.info('Saved metadata')),
        fs.writeFile(INDICES.SEARCH, JSON.stringify(searchIndex))
          .then(() => logger.info('Saved search index')),
        fs.writeFile(INDICES.TAGS, JSON.stringify(tagIndex))
          .then(() => logger.info('Saved tag index')),
        !isDev ? this.generateRSSFeed(posts)
          .then(() => logger.info('Generated RSS feed')) : Promise.resolve()
      ]);

      const duration = Date.now() - startTime;
      logger.success(`Preprocessing complete in ${duration}ms!`);

      return {
        duration,
        postsProcessed: posts.length,
        searchIndexSize: JSON.stringify(searchIndex).length,
        cacheSize: this.postCache.size,
        errors,
      };

    } catch (error) {
      logger.error('Preprocessing failed:', error as Error);
      errors.push(error as Error);
      throw error;
    }
  }

  public async cleanup(): Promise<void> {
    try {
      ensureNodeEnv();
      // Clear memory caches
      this.postCache.clear();
      this.tagCache.clear();
      this.searchIndex = null;

      // Remove cache directory
      await fs.rm(CACHE_DIR, { recursive: true, force: true })
        .catch(() => logger.warning('No cache directory to remove'));
      
      // Recreate empty cache directory
      await fs.mkdir(CACHE_DIR, { recursive: true });
      
      logger.success('Cache cleared successfully');
    } catch (error) {
      logger.error('Failed to clean cache:', error as Error);
      throw error;
    }
  }

  private async processPost(file: string, gitData: any): Promise<PostMetadata> {
    try {
      const fs = await ensureFs();
      const content = await fs.readFile(file, 'utf-8');
      const { data, content: postContent } = matter(content);

      // Ensure consistent ISO string format for dates
      const normalizeDate = (date: string | Date | undefined) => {
        if (!date) return undefined;
        try {
          return new Date(date).toISOString();
        } catch {
          return undefined;
        }
      };

      // Use frontmatter dates first, fall back to git metadata only if not provided
      const created = normalizeDate(data.created) ?? 
                     normalizeDate(gitData.firstModified) ?? 
                     new Date().toISOString();
      
      const updated = normalizeDate(data.updated) ?? 
                     normalizeDate(gitData.lastModified) ?? 
                     created;

      // Compute the slug as the relative path from 'app/blog/posts', without extension
      const relativePath = path.relative(path.join(process.cwd(), 'app/blog'), file);
      const slug = relativePath
        .replace(/^posts[/\\]/, '') // Remove leading "posts/" or "posts\"
        .replace(/\\/g, '/')        // Normalize path separators
        .replace(/\/page\.mdx$/, '') // Remove "/page.mdx" suffix
        .replace(/\.mdx$/, '');     // Remove extension

      const metadata: PostMetadata = {
        title: String(data.title || slug),
        slug: String(slug),
        summary: String(data.summary || ''),
        content: String(postContent || ''),
        created, // Frontmatter date takes precedence
        updated, // Frontmatter date takes precedence
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        image: data.image,
        caption: data.caption, // Add this line to include caption from frontmatter
        readingTime: data.readingTime // Optional: Include readingTime if you have it
      };

      logger.info(`Processed post ${slug} with created: ${created}, updated: ${updated}`);
      return metadata;
    } catch (maybeError: unknown) {
      const error = toError(maybeError);
      logger.error(`Error processing post ${slug}:`, error);
      throw error;
    }
  }

  private async processAllPosts(): Promise<PostMetadata[]> {
    try {
      logger.info('Starting post processing...');
      
      // Use globAsync instead of glob
      const files = await globAsync('app/blog/posts/**/*.mdx', {
        absolute: true,
        cwd: process.cwd(),
      });

      if (!Array.isArray(files)) {
        throw new Error('Failed to get post files');
      }

      logger.info(`Found ${files.length} posts to process`);
  
      // Add timeout to post processing
      const processWithTimeout = async (file: string) => {
        return Promise.race([
          (async () => {
            try {
              const gitData = await getGitFileData(file);
              return await this.processPost(file, gitData);
            } catch (error) {
              logger.error(`Failed to process file ${file}:`, error as Error);
              return null;
            }
          })(),
          new Promise<null>((_, reject) => 
            setTimeout(() => reject(new Error(`Timeout processing ${file}`)), 10000)
          )
        ]).catch(error => {
          logger.error(`Timed out processing ${file}:`, error as Error);
          return null;
        });
      };
  
      const processedPosts = await Promise.all(
        files.map(processWithTimeout)
      );
  
      const validPosts = processedPosts.filter((post): post is PostMetadata => post !== null);
      
      logger.info(`Successfully processed ${validPosts.length} of ${files.length} posts`);
  
      return validPosts.sort((a, b) => 
        new Date(b.created).getTime() - new Date(a.created).getTime()
      );
    } catch (maybeError: unknown) {
      const error = toError(maybeError);
      logger.error('Failed to process posts:', error);
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
    ensureNodeEnv();
    
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

    try {
      const fs = await ensureFs();
      await fs.writeFile(INDICES.RSS, feed.rss2());
    } catch (maybeError: unknown) {
      const error = toError(maybeError);
      logger.error('Failed to generate RSS feed:', error);
      throw error;
    }
  }

  public async ensurePreprocessed() {
    if (!isNode) {
      logger.warning('Cache operations skipped in browser');
      return;
    }
    
    try {
      const fs = await ensureFs();
      await fs.mkdir(CACHE_DIR, { recursive: true });
      
      try {
        await Promise.all([
          fs.access(INDICES.METADATA),
          fs.access(INDICES.TAGS)
        ]);
      } catch (maybeError: unknown) {
        const error = toError(maybeError);
        // If files don't exist, run preprocessing
        logger.info('Cache files not found, running preprocessing...');
        await this.preprocess(true);
      }
    } catch (maybeError: unknown) {
      const error = toError(maybeError);
      logger.error('Failed to ensure cache:', error);
      throw error;
    }
  }

  public async search(query: string): Promise<PostMetadata[]> {
    try {
      if (!this.searchIndex) {
        const fs = await ensureFs();
        const data = await fs.readFile(INDICES.SEARCH, 'utf-8');
        const parsed = JSON.parse(data) as SearchIndex;
        if (!parsed || !parsed.fuse) {
          throw new Error('Invalid search index format');
        }
        this.searchIndex = parsed;
      }

      if (!this.searchIndex.fuse) {
        throw new Error('Search index is corrupted');
      }

      return this.searchIndex.fuse.search(query).map(result => result.item);
    } catch (maybeError: unknown) {
      const error = toError(maybeError);
      logger.error('Search failed:', error);
      return [];
    }
  }

  public async getPostsByTag(tag: string): Promise<Post[]> {
    const posts = await this.getPostMetadataByTag(tag);
    return posts.map(post => ({
      slug: post.slug,
      title: post.title,
      date: post.created, // Use created date for backwards compatibility
      content: post.content,
      tags: post.tags,
      summary: post.summary || '',
      image: post.image,
      created: post.created,
      updated: post.updated || post.created // Fallback to created date if updated is not available
    }));
  }

  private async getPostMetadataByTag(tag: string): Promise<PostMetadata[]> {
    await this.ensurePreprocessed();
    
    const cached = this.tagCache.get(tag);
    // Add type guard to ensure cached is PostMetadata[]
    if (cached && Array.isArray(cached) && cached.every(post => 
      post && 
      typeof post === 'object' && 
      'slug' in post && 
      'title' in post
    )) {
      return cached;
    }

    const fs = await ensureFs();
    const tagIndex = JSON.parse(await fs.readFile(INDICES.TAGS, 'utf-8')) as Record<string, string[]>;
    const slugs = tagIndex[tag] || [];
    
    // Filter out null values from the result
    const posts = (await Promise.all(
      slugs.map(slug => this.getPostMetadata(slug))
    )).filter((post): post is PostMetadata => post !== null);

    this.tagCache.set(tag, posts);
    return posts;
  }

  public async getPost(slug: string): Promise<Post | null> {
    const post = await this.getPostMetadata(slug);
    if (!post) return null;
    
    return {
      slug: post.slug,
      title: post.title,
      date: post.created,
      content: post.content,
      tags: post.tags,
      summary: post.summary || '',
      image: post.image,
      caption: post.caption, // Add this
      created: post.created,
      updated: post.updated || post.created // Use created date as fallback for updated
    };
  }

  private async getPostMetadata(slug: string): Promise<PostMetadata | null> {
    try {
      // Skip cache operations in browser
      if (!isNode) {
        logger.warning('Cache operations skipped in browser');
        return null;
      }

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
        const fs = await ensureFs();
        const rawMetadata = await fs.readFile(metadataPath, 'utf-8');
        metadata = JSON.parse(rawMetadata);
      } catch (readError) {
        logger.warning(`Metadata file read failed, attempting rebuild: ${readError}`);
        await this.rebuildCache();
        const fs = await ensureFs();
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
      
    } catch (maybeError: unknown) {
      const error = toError(maybeError);
      logger.error('Error in getPost:', error);
      return null;
    }
  }

  // Add this method to force rebuild cache
  public async rebuildCache(): Promise<void> {
    await this.cleanup();
    await this.preprocess(true);
  }

  public async getAllPosts(): Promise<Post[]> {
    const posts = await this.getAllPostMetadata();
    return posts.map(post => ({
      slug: post.slug,
      title: post.title,
      date: post.created, // Use created date for backwards compatibility
      content: post.content,
      tags: post.tags,
      summary: post.summary || '', // Provide default for optional summary
      image: post.image,
      created: post.created,
      updated: post.updated || post.created // Use created date as fallback for updated
    }));
  }

  private async getAllPostMetadata(): Promise<PostMetadata[]> {
    try {
      await this.ensurePreprocessed(); // This must complete before continuing
      const fs = await ensureFs();
      
      try {
        const rawMetadata = await fs.readFile(INDICES.METADATA, 'utf-8');
        return JSON.parse(rawMetadata);
      } catch (readError) {
        // If reading fails, try rebuilding cache once
        logger.warning('Metadata file read failed, rebuilding cache...');
        await this.rebuildCache();
        const fs = await ensureFs();
        const rawMetadata = await fs.readFile(INDICES.METADATA, 'utf-8');
        return JSON.parse(rawMetadata);
      }
    } catch (maybeError: unknown) {
      const error = toError(maybeError);
      logger.error('Error fetching all posts:', error);
      return [];
    }
  }

  public async getAllTags(): Promise<string[]> {
    try {
      await this.ensurePreprocessed(); // This must complete before continuing
      const fs = await ensureFs();
      
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
    } catch (maybeError: unknown) {
      const error = toError(maybeError);
      logger.error('Error fetching all tags:', error);
      return [];
    }
  }

  public async getAdjacentPosts(slug: string): Promise<{
    prevPost: Post | null;
    nextPost: Post | null;
  }> {
    const { prevPost, nextPost } = await this.getAdjacentPostMetadata(slug);
    return {
      prevPost: prevPost ? {
        slug: prevPost.slug,
        title: prevPost.title,
        date: prevPost.created,
        content: prevPost.content,
        tags: prevPost.tags,
        summary: prevPost.summary || '', // Provide default for optional summary
        image: prevPost.image,
        created: prevPost.created,
        updated: prevPost.updated || prevPost.created // Use created date as fallback for updated
      } : null,
      nextPost: nextPost ? {
        slug: nextPost.slug,
        title: nextPost.title,
        date: nextPost.created,
        content: nextPost.content,
        tags: nextPost.tags,
        summary: nextPost.summary || '', // Provide default for optional summary
        image: nextPost.image,
        created: nextPost.created,
        updated: nextPost.updated || nextPost.created // Use created date as fallback for updated
      } : null
    };
  }

  private async getAdjacentPostMetadata(slug: string): Promise<{
    prevPost: PostMetadata | null;
    nextPost: PostMetadata | null;
  }> {
    try {
      const posts = await this.getAllPostMetadata();
      // Sort by frontmatter created date in reverse chronological order
      const sortedPosts = [...posts].sort((a, b) => 
        new Date(b.created).getTime() - new Date(a.created).getTime()
      );

      const currentIndex = sortedPosts.findIndex(post => post.slug === slug);
      if (currentIndex === -1) {
        return { prevPost: null, nextPost: null };
      }

      // Previous = post with more recent created date (newer post)
      // Next = post with older created date (earlier post)
      return {
        prevPost: currentIndex > 0 ? sortedPosts[currentIndex - 1] : null,
        nextPost: currentIndex < sortedPosts.length - 1 ? sortedPosts[currentIndex + 1] : null
      };
    } catch (maybeError: unknown) {
      const error = toError(maybeError);
      logger.error(`Error fetching adjacent posts for ${slug}:`, error);
      return { prevPost: null, nextPost: null };
    }
  }
}

// Exports
export const backend = BackendService.getInstance();

export const getPost = async (slug: string) => {
  try {
    return await BackendService.getInstance().getPost(slug);
  } catch (maybeError: unknown) {
    const error = toError(maybeError);
    logger.error('Error in getPost:', error);
    return null;
  }
};

export const searchPosts = async (query: string) => BackendService.getInstance().search(query);
export const getPostsByTag = async (tag: string) => BackendService.getInstance().getPostsByTag(tag);
export const predevBackend = async () => BackendService.getInstance().preprocess(true);
export const prebuildBackend = async () => BackendService.getInstance().preprocess(false);
export const getAllPosts = async () => backend.getAllPosts();
export const getAllTags = async () => backend.getAllTags();
export const getAdjacentPosts = async (slug: string) => backend.getAdjacentPosts(slug);
