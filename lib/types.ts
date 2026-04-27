import type { Metadata } from 'next';

// Core interfaces and types

export interface Config {
  site: {
    name: string;
    title: string;
    description: string;
    url: string;
    locale: string;
    brand: {
      name: string;
      shortName: string;
      domain: string;
      aliases: string[];
      ogImagePath: string;
      logoPath: string;
    };
    author: {
      name: string;
      email: string;
      jobTitle: string;
      twitter?: string;
      github?: string;
      linkedin?: string;
      reddit?: string;
      kaggle?: string;
      codepen?: string;
    }
  };
  blog: {
    postsPerPage: number;
    featuredLimit: number;
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
  /** Cached numeric timestamp of `created`, set during preprocessing to avoid repeated Date parsing. */
  createdTimestamp?: number;
}

export interface AdjacentPost {
  slug: string;
  title: string;
}

export interface AdjacentPosts {
  previous: AdjacentPost | null;
  next: AdjacentPost | null;
}

export type PublicPost = Omit<Post, 'createdTimestamp' | 'adjacent'>;

export type PostMetadata = Omit<PublicPost, 'content' | 'wordCount'>;

export interface PublicSearchMatch {
  key: string;
  indices: Array<[number, number]>;
}

export interface PublicPostSearchResult {
  post: PostMetadata;
  score: number | null;
  matches: PublicSearchMatch[];
}

export interface PreprocessStats {
  duration: number;
  postsProcessed: number;
  searchIndexSize: number;
  errors: number;
  memory: string;
  particleConfigPath?: string;
}

export type TelemetryLogLevel =
  | 'debug'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'timing';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: TelemetryLogLevel;
  message: string;
  source?: string;
  data?: string;
}

export interface RateLimitSnapshot {
  key: string;
  count: number;
  remaining: number;
  resetAt: string;
  lastSeenAt: string;
  blockedCount: number;
  isLimited: boolean;
}

export interface SiteIdentity {
  name: string;
  title: string;
  description: string;
  url: string;
  locale: string;
  metadataBase: URL;
  brandName: string;
  brandShortName: string;
  brandDomain: string;
  brandAliases: string[];
  ogImagePath: string;
  ogImageUrl: string;
  logoPath: string;
  logoUrl: string;
  author: Config['site']['author'];
  twitterHandle?: string;
  socialLinks: string[];
  feedAlternates: NonNullable<Metadata['alternates']>['types'];
}
