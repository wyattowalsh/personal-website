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
