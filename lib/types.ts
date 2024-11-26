export interface PostMetadata {
  title: string;
  slug: string;
  created: string;
  updated?: string;
  tags: string[];
  summary?: string;
  image?: string;
  caption?: string;
  readingTime?: string;
  content?: string;
}

export interface Config {
  site: {
    title: string;
    description: string;
    url: string;
    author: {
      name: string;
      email: string;
    }
  }
}

// Add any other types you need...
