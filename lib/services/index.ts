'use server';

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

export interface PostMetadata {
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
  // Update tagCache type to store PostMetadata array
  private readonly tagCache: LRUCache<string, PostMetadata[]>
  
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
    const files = await glob('app/blog/posts/**/*.mdx', {
      absolute: true,
      cwd: process.cwd()
    });
    
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
    try {
      if (!this.searchIndex) {
        const data = await fs.readFile(INDICES.SEARCH, 'utf-8')
        const parsed = JSON.parse(data) as SearchIndex;
        if (!parsed || !parsed.fuse) {
          throw new Error('Invalid search index format');
        }
        this.searchIndex = parsed;
      }

      if (!this.searchIndex || !this.searchIndex.fuse) {
        throw new Error('Search index is corrupted');
      }

      return this.searchIndex.fuse.search(query).map(result => result.item);
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  }

  public async getPostsByTag(tag: string): Promise<PostMetadata[]> {
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

    const tagIndex = JSON.parse(await fs.readFile(INDICES.TAGS, 'utf-8')) as Record<string, string[]>;
    const slugs = tagIndex[tag] || [];
    const posts = await Promise.all(slugs.map(slug => this.getPost(slug)));
    const validPosts = posts.filter((post): post is PostMetadata => post !== null);
    
    this.tagCache.set(tag, validPosts);
    return validPosts;
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

export async function getAllTags() {
  return await backend.getAllTags();
}

export async function getAllPosts() {
  return await backend.getAllPosts();
}

export async function getAdjacentPosts(slug: string) {
  return await backend.getAdjacentPosts(slug);
}