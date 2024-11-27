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

      // Ensure consistent ISO string format for dates
      const normalizeDate = (date: string | Date | undefined) => {
        if (!date) return undefined;
        try {
          return new Date(date).toISOString();
        } catch {
          return undefined;
        }
      };

      // Normalize dates with fallbacks
      const created = normalizeDate(data.created) || 
                     normalizeDate(gitData.firstModified) || 
                     new Date().toISOString();
      
      const updated = normalizeDate(data.updated) || 
                     normalizeDate(gitData.lastModified) || 
                     created;

      const metadata: PostMetadata = {
        title: String(data.title || slug),
        slug: String(slug),
        summary: String(data.summary || ''),
        content: String(postContent || ''),
        created,
        updated,
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        image: data.image
      };

      logger.info(`Processed post ${slug} with created: ${created}, updated: ${updated}`);
      return metadata;
    } catch (error) {
      logger.error(`Error processing post ${slug}:`, error as Error);
      throw error;
    }
  }

  private async processAllPosts(): Promise<PostMetadata[]> {
    try {
      const files = await globAsync('app/blog/posts/**/page.mdx');

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
      if (!fs) {
        logger.warning('File system not available');
        return;
      }
      
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
        const fs = await getFs();
        if (!fs) {
          logger.warning('File system not available');
          return null;
        }
        const rawMetadata = await fs.readFile(metadataPath, 'utf-8');
        metadata = JSON.parse(rawMetadata);
      } catch (readError) {
        logger.warning(`Metadata file read failed, attempting rebuild: ${readError}`);
        await this.rebuildCache();
        const fs = await getFs();
        if (!fs) return null;
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
