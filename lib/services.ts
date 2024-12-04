import { BackendService } from './server';
import { Post, SearchResult } from './core';
import type { AdjacentPost } from '@/lib/types';

// Create services object using BackendService directly
export const services = {
  posts: {
    get: async (slug: string): Promise<Post | null> => {
      await BackendService.ensurePreprocessed();
      return BackendService.getInstance().getPost(slug);
    },

    getAll: async (): Promise<Post[]> => {
      await BackendService.ensurePreprocessed();
      return BackendService.getInstance().getAllPosts();
    },

    search: async (query: string): Promise<SearchResult<Post>[]> => {
      await BackendService.ensurePreprocessed();
      return BackendService.getInstance().search(query);
    },

    getByTag: async (tag: string): Promise<Post[]> => {
      await BackendService.ensurePreprocessed();
      return BackendService.getInstance().getPostsByTag(tag);
    },

    getAdjacent: async (slug: string) => {
      await BackendService.ensurePreprocessed();
      return BackendService.getInstance().getAdjacentPosts(slug);
    }
  },

  tags: {
    getAll: async (): Promise<string[]> => {
      await BackendService.ensurePreprocessed();
      return BackendService.getInstance().getAllTags();
    }
  }
};

// Keep the getAdjacentPosts function as is
export async function getAdjacentPosts(currentSlug: string): Promise<{ 
    previous: AdjacentPost | null; 
    next: AdjacentPost | null; 
}> {
    try {
        const response = await fetch(`/api/blog/posts/${currentSlug}/adjacent`);
        if (!response.ok) {
            throw new Error('Failed to fetch adjacent posts');
        }
        const data = await response.json();
        return {
            previous: data.previous || null,
            next: data.next || null
        };
    } catch (error) {
        console.error('Error fetching adjacent posts:', error);
        return {
            previous: null,
            next: null
        };
    }
}
