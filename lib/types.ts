// Core interfaces and types

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

export interface Post {
  slug: string;
  title: string;
  summary?: string;
  content: string;
  created: string;
  updated?: string;
  tags: string[];
  image?: string;
  caption?: string;
  readingTime?: string;
  wordCount: number;
  adjacent?: {
    prev: AdjacentPost | null;
    next: AdjacentPost | null;
  };
  series?: {
    name: string;
    order: number;
  };
}

export interface AdjacentPost {
  slug: string;
  title: string;
}

export interface PostMetadata extends Omit<Post, 'wordCount' | 'adjacent'> {
  caption?: string;
}

export interface PreprocessStats {
  duration: number;
  postsProcessed: number;
  searchIndexSize: number;
  errors: number;
  memory: string;
  particleConfigPath?: string;
}
