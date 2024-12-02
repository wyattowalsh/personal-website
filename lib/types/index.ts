import { z } from 'zod'

// Post types
export interface Post {
  slug: string
  title: string
  summary?: string  // Make optional since not all posts may have summaries
  content: string  // Keep required here
  created: string
  updated?: string
  tags: string[]
  image?: string
  caption?: string
  readingTime?: string
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

export interface PostMetadata extends Omit<Post, 'wordCount' | 'adjacent'> {
  // Should inherit optional summary from Post now
  caption?: string; // Make sure caption is included
}

// Configuration types
export interface Config {
  site: {
    title: string;
    description: string;
    url: string;
    author: {
      name: string;
      email: string;
      twitter?: string;
      github?: string;
      linkedin?: string;
    }
  };
  blog: {
    postsPerPage: number;
    featuredLimit: number;
  };
  cache: {
    ttl: number;
    maxSize: number;
  };
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

// Configuration schema
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

// Utility types
export type CoreContent<T> = Omit<T, '_id' | '_raw' | 'body'>
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}
