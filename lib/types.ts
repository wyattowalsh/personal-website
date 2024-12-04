export interface PostMetadata {
    title: string;
    slug: string;
    date?: string;
    description?: string;
    summary?: string;
    tags?: string[];
    draft?: boolean;
    author?: string;
    image?: string;
    caption?: string;
    created?: string;
    updated?: string;
    readingTime?: string;
}
export interface Post extends PostMetadata {
    content?: string;
}
export interface AdjacentPost {
    title: string;
    slug: string;
    description?: string;
    image?: string;
}

export interface PreprocessStats {
  duration: number;  // Changed from string to number
  postsProcessed: number;
  searchIndexSize: number;
  cacheSize: number;
  errors: number;
  memory: string;
  particleConfigPath?: string; // Add this optional property
}

