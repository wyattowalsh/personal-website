import { cache } from 'react';

export interface AdjacentPost {
  slug: string;
  title: string;
}

export interface PostMetadata {
  slug: string;
  title: string;
  summary: string;
  created: string;
  updated?: string;
  tags: string[];
  image?: string;
  caption?: string;
  readingTime: string;
  wordCount: number;
  adjacent?: {
    prev: AdjacentPost | null;
    next: AdjacentPost | null;
  };
}

export interface Post extends PostMetadata {
  content: string;
}

// Ensure getAllPosts handles errors gracefully
export const getAllPosts = cache(async (): Promise<Post[]> => {
  try {
    const response = await fetch('/api/blog/posts');
    if (!response.ok) throw new Error('Failed to fetch posts');
    const data = await response.json();
    return Object.values(data) as Post[];
  } catch (error) {
    console.error('Error fetching all posts:', error);
    return [];
  }
});

// Cache individual post retrieval
export const getPostBySlug = cache(async (slug: string): Promise<PostMetadata | null> => {
  const response = await fetch(`/api/blog/posts/metadata/${slug}`);
  if (!response.ok) return null;
  const { metadata } = await response.json();
  return metadata;
});

export const getAllTags = cache(async (): Promise<string[]> => {
  const response = await fetch('/api/blog/posts');
  if (!response.ok) throw new Error('Failed to fetch posts');
  const data = await response.json();
  
  const tags = new Set<string>();
  (Object.values(data) as Post[]).forEach(post => {
    post.tags.forEach(tag => tags.add(tag));
  });
  
  return Array.from(tags).sort();
});

export const getPostsByTag = cache(async (tag: string): Promise<Post[]> => {
  const posts = await getAllPosts();
  return posts.filter(post => post.tags.includes(tag));
});

export async function getAdjacentPosts(currentSlug: string | string[]): Promise<{
  prevPost?: AdjacentPost;
  nextPost?: AdjacentPost;
}> {
  try {
    const posts = await getAllPosts();
    const normalizedSlug = Array.isArray(currentSlug) ? currentSlug.join('/') : currentSlug;
    const currentIndex = posts.findIndex((post: Post) => post.slug === normalizedSlug);
    
    if (currentIndex === -1) {
      return { prevPost: undefined, nextPost: undefined };
    }

    return {
      prevPost: currentIndex < posts.length - 1 
        ? { slug: posts[currentIndex + 1].slug, title: posts[currentIndex + 1].title }
        : undefined,
      nextPost: currentIndex > 0
        ? { slug: posts[currentIndex - 1].slug, title: posts[currentIndex - 1].title }
        : undefined
    };
  } catch (error) {
    console.error("Error getting adjacent posts:", error);
    return { prevPost: undefined, nextPost: undefined };
  }
}