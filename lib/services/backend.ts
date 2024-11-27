import { Feed } from 'feed';
import { LRUCache } from 'lru-cache';
import Fuse from 'fuse.js';
import { promisify } from 'util';
import { glob } from '@/lib/utils/glob';
import matter from 'gray-matter';
import path from 'path';
import { getGitFileData } from '../utils/git';
import { getConfig } from '../config';
import { logger } from '../utils/logger';

// Type definitions
export interface Post {
  slug: string;
  title: string;
  date: string;
  content: string;
  tags: string[];
  summary?: string;
  image?: string;
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
    ensureNodeEnv();
    const startTime = Date.now();
    const errors: Error[] = [];
    logger.info(`Starting ${isDev ? 'development' : 'production'} preprocessing...`);

    try {
      const fs = await ensureFs();
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
    } catch (maybeError: unknown) {
      const error = toError(maybeError);
      logger.error('Preprocessing failed:', error);
      errors.push(error);
      return {
        duration: Date.now() - startTime,
        postsProcessed: 0,
        searchIndexSize: 0,
        cacheSize: this.postCache.size,
        errors,
      };
    }
  }

  private async processPost(file: string, slug: string, gitData: any): Promise<PostMetadata> {
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

      const metadata: PostMetadata = {
        title: String(data.title || slug),
        slug: String(slug),
        summary: String(data.summary || ''),
        content: String(postContent || ''),
        created, // Frontmatter date takes precedence
        updated, // Frontmatter date takes precedence
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        image: data.image
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
      const files = await glob('app/blog/posts/**/page.mdx', {
        absolute: true,
        cwd: process.cwd(),
      });

      if (!Array.isArray(files)) {
        throw new Error('Failed to get post files');
      }

      const processedPosts = await Promise.all(
        files.map(async (file) => {
          try {
            // Get the directory name containing page.mdx as the slug
            const slug = path
              .dirname(file)           // Get full directory path
              .split('/posts/')[1]     // Split on posts/ and take everything after
              .split('/page')[0];      // Remove /page from the end if it exists
            
            const gitData = await getGitFileData(file);
            return await this.processPost(file, slug, gitData);
          } catch (error) {
            logger.error(`Failed to process file ${file}:`, error as Error);
            return null;
          }
        })
      );

      return processedPosts
        .filter((post): post is PostMetadata => post !== null)
        .sort((a, b) => 
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
      summary: post.summary || '', // Ensure summary has a default value
      image: post.image,
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

  public async cleanup(): Promise<void> {
    try {
      ensureNodeEnv();
      // Reset caches first
      this.postCache.clear();
      this.tagCache.clear();
      this.searchIndex = null;

      // Then try to remove the cache directory
      try {
        const fs = await ensureFs();
        await fs.rm(CACHE_DIR, { recursive: true, force: true });
      } catch (maybeError: unknown) {
        const error = toError(maybeError);
        logger.warning('Cache directory removal failed, may not exist');
      }

      logger.success('Cache cleared');
    } catch (maybeError: unknown) {
      const error = toError(maybeError);
      logger.error('Failed to clean cache:', error);
      throw error;
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
