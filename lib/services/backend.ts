// lib/services/backend.ts

import { cache } from 'react'
import { Feed } from 'feed'
import { LRUCache } from 'lru-cache'
import Fuse from 'fuse.js'
import { promises as fs } from 'fs'
import path from 'path'
import { glob } from 'glob'
import { getGitFileData } from '../utils/git'

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
    const files = await glob('app/blog/posts/**/*.mdx')
    
    const posts = await Promise.all(files.map(async (file) => {
      const slug = path.basename(path.dirname(file))
      const gitData = await getGitFileData(file)
      
      // Use cached data if available
      const cached = this.postCache.get(slug)
      if (cached && cached.updated === gitData.lastModified) {
        return cached
      }

      // Process post and cache
      const post = await this.processPost(file, slug, gitData)
      this.postCache.set(slug, post)
      return post
    }))

    return posts.sort((a, b) => 
      new Date(b.created).getTime() - new Date(a.created).getTime()
    )
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
    const siteConfig = await import('../config').then(m => m.default)
    const feed = new Feed({
      title: siteConfig.title,
      description: siteConfig.description,
      id: siteConfig.url,
      link: siteConfig.url,
      language: "en",
      favicon: `${siteConfig.url}/favicon.ico`,
      copyright: `All rights reserved ${new Date().getFullYear()}, ${siteConfig.author.name}`,
      author: siteConfig.author,
    })

    posts.forEach(post => feed.addItem({
      title: post.title,
      id: `${siteConfig.url}/blog/${post.slug}`,
      link: `${siteConfig.url}/blog/${post.slug}`,
      description: post.summary,
      content: post.content,
      author: [siteConfig.author],
      date: new Date(post.created),
      image: post.image ? `${siteConfig.url}${post.image}` : undefined,
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
}

// Export singleton instance
export const backend = BackendService.getInstance()

// Helper functions
export const getPost = cache(async (slug: string) => {
  return await backend.getPost(slug)
})

export const searchPosts = cache(async (query: string) => {
  return await backend.search(query)
})

export const getPostsByTag = cache(async (tag: string) => {
  return await backend.getPostsByTag(tag)
})

// Preprocessing scripts
export const predevBackend = async (): Promise<PreprocessStats> => {
  return await backend.preprocess(true);
}

export const prebuildBackend = async () => {
  await backend.preprocess(false)
}