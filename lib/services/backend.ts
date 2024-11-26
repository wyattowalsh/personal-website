import { Feed } from 'feed';
import { LRUCache } from 'lru-cache';
import Fuse from 'fuse.js';
import { promises as fs } from 'fs';
import path from 'path';
import { promisify } from 'util';
import { glob as globCallback } from 'glob';
import matter from 'gray-matter';
// Fix imports with correct paths without .js extension
import { getGitFileData } from '@/lib/utils/git';  // Remove .js extension
import { getConfig } from '@/lib/config';
import { logger } from '@/lib/utils/logger';
import type { PostMetadata, PreprocessStats } from '@/lib/types';

const glob = promisify(globCallback);

// Constants
const CACHE_DIR = '.cache';
const INDICES = {
  SEARCH: path.join(CACHE_DIR, 'search.json'),
  METADATA: path.join(CACHE_DIR, 'metadata.json'),
  TAGS: path.join(CACHE_DIR, 'tags.json'),
  RSS: path.join(CACHE_DIR, 'rss.xml'),
} as const;

interface SearchIndex {
  posts: PostMetadata[];
  fuse: Fuse<PostMetadata>;
}

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
      const content = await fs.readFile(file, 'utf-8');
      const { data, content: postContent } = matter(content);
      
      // Validate required fields
      if (!data.title) {
        logger.warning(`Post ${slug} missing title, using slug`);
        data.title = slug;
      }

      // Set defaults for missing fields
      const defaults = {
        title: data.title || path.basename(file, '.mdx'),
        created: gitData.firstModified || new Date().toISOString(),
        tags: [],
        updated: gitData.lastModified,
        content: postContent || '',
        slug: slug,
        summary: data.summary || ''
      };

      // Merge with defaults and ensure data types
      const metadata = {
        ...defaults,
        ...data,
        // Ensure required fields are present and valid
        title: String(data.title || defaults.title),
        slug: String(slug),
        tags: Array.isArray(data.tags) ? data.tags.map(String) : defaults.tags,
        created: data.created?.toISOString?.() || defaults.created,
        updated: data.updated?.toISOString?.() || defaults.updated,
        content: String(postContent || defaults.content),
        summary: String(data.summary || defaults.summary)
      };

      return metadata as PostMetadata;
    } catch (error) {
      logger.error(`Error processing post ${slug}:`, error as Error);
      // Return basic valid metadata
      return {
        title: slug,
        slug: slug,
        created: new Date().toISOString(),
        tags: ['uncategorized'],
        content: '',
        summary: 'No summary available'
      };
    }
  }

  private async processAllPosts(): Promise<PostMetadata[]> {
    try {
      const files = await glob('app/blog/posts/**/*.mdx');
      
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

    await fs.writeFile(INDICES.RSS, feed.rss2());
  }

  public async search(query: string): Promise<PostMetadata[]> {
    if (!this.searchIndex) {
      const data = await fs.readFile(INDICES.SEARCH, 'utf-8');
      this.searchIndex = JSON.parse(data);
    }
    return this.searchIndex.fuse.search(query).map(result => result.item);
  }

  public async getPostsByTag(tag: string): Promise<PostMetadata[]> {
    const cached = this.tagCache.get(tag);
    if (cached) return cached;

    const tagIndex = JSON.parse(await fs.readFile(INDICES.TAGS, 'utf-8'));
    const slugs = tagIndex[tag] || [];
    const posts = await Promise.all(slugs.map(slug => this.getPost(slug)));

    this.tagCache.set(tag, posts);
    return posts;
  }

  public async getPost(slug: string): Promise<PostMetadata | null> {
    try {
      console.log('Getting post for slug:', slug);

      // Check cache first
      const cached = this.postCache.get(slug);
      if (cached) {
        console.log('Found cached post:', cached);
        return cached;
      }

      // Check if metadata file exists
      const metadataPath = INDICES.METADATA;
      try {
        await fs.access(metadataPath);
      } catch (error) {
        console.error('Metadata file not found:', metadataPath);
        // Try to rebuild the cache
        await this.preprocess(true);
      }

      // Read and parse metadata
      const rawMetadata = await fs.readFile(metadataPath, 'utf-8');
      console.log('Raw metadata file size:', rawMetadata.length);

      const metadata = JSON.parse(rawMetadata);
      console.log('Total posts in metadata:', metadata.length);
      
      const post = metadata.find((p: PostMetadata) => {
        console.log('Comparing slugs:', p.slug, slug);
        return p.slug === slug;
      });
      
      if (!post) {
        console.warn('No post found for slug:', slug);
        // Check if the MDX file exists directly
        const possiblePaths = [
          path.join(process.cwd(), 'app/blog/posts', `${slug}.mdx`),
          path.join(process.cwd(), 'app/blog/posts', slug, 'index.mdx')
        ];
        
        for (const filepath of possiblePaths) {
          try {
            await fs.access(filepath);
            console.log('Found MDX file at:', filepath);
            // Process the post directly
            const gitData = await getGitFileData(filepath);
            const newPost = await this.processPost(filepath, slug, gitData);
            // Update cache
            this.postCache.set(slug, newPost);
            return newPost;
          } catch {}
        }
        return null;
      }

      // Validate and cache the post
      const validated = {
        ...post,
        title: post.title || slug,
        slug: post.slug || slug,
        tags: Array.isArray(post.tags) ? post.tags : ['uncategorized'],
        created: post.created || new Date().toISOString(),
        content: post.content || '',
        summary: post.summary || ''
      };

      this.postCache.set(slug, validated);
      console.log('Returning validated post:', validated);
      return validated;
    } catch (error) {
      console.error('Error in getPost:', {
        error,
        stack: error instanceof Error ? error.stack : undefined,
        slug,
        cacheDir: CACHE_DIR,
        metadataPath: INDICES.METADATA
      });
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
      const metadata = JSON.parse(await fs.readFile(INDICES.METADATA, 'utf-8'));
      return metadata;
    } catch (error) {
      logger.error('Error fetching all posts:', error);
      return [];
    }
  }

  public async getAllTags(): Promise<string[]> {
    try {
      const tagIndex = JSON.parse(await fs.readFile(INDICES.TAGS, 'utf-8'));
      return Object.keys(tagIndex);
    } catch (error) {
      logger.error('Error fetching all tags:', error);
      return [];
    }
  }

  public async cleanup(): Promise<void> {
    try {
      await fs.rm(CACHE_DIR, { recursive: true, force: true });
      this.postCache.clear();
      this.tagCache.clear();
      this.searchIndex = null;
      logger.success('Cache directories cleaned');
    } catch (error) {
      logger.error('Failed to clean cache directories:', error as Error);
      throw error;
    }
  }
}

// Export singleton instance
export const backend = BackendService.getInstance();

// Helper functions - remove cache wrapper
export const getPost = async (slug: string) => {
  return await backend.getPost(slug);
};

export const searchPosts = async (query: string) => {
  return await backend.search(query);
};

export const getPostsByTag = async (tag: string) => {
  return await backend.getPostsByTag(tag);
};

// Preprocessing scripts remain the same
export const predevBackend = async (): Promise<PreprocessStats> => {
  return await backend.preprocess(true);
};

export const prebuildBackend = async () => {
  await backend.preprocess(false);
};
