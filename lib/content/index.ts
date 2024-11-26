import { cache } from 'react';
import { Feed } from 'feed';
import matter from 'gray-matter';
import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { LRUCache } from 'lru-cache';
import { getConfig } from '../config';
import { logger } from '../utils';
import { Post, PostMetadata } from '../types';

const execAsync = promisify(exec);

// Caches
const postCache = new LRUCache<string, Post>({ max: 500, ttl: 3600000 });
const metadataCache = new LRUCache<string, PostMetadata>({ max: 500, ttl: 3600000 });

// Git integration
export async function getGitFileData(filePath: string) {
  try {
    const [created, updated] = await Promise.all([
      execAsync(`git log --follow --format=%aI --reverse "${filePath}" | head -1`),
      execAsync(`git log -1 --format=%aI "${filePath}"`)
    ]);

    return {
      created: created.stdout.trim() || null,
      updated: updated.stdout.trim() || null
    };
  } catch (error) {
    logger.error(`Git data error for ${filePath}:`, error);
    return { created: null, updated: null };
  }
}

// Enhanced post handling with caching
export const getAllPosts = cache(async (): Promise<Post[]> => {
  try {
    const response = await fetch('/api/blog/posts');
    if (!response.ok) throw new Error('Failed to fetch posts');
    const data = await response.json();
    return Object.values(data) as Post[];
  } catch (error) {
    logger.error('Error fetching all posts:', error);
    return [];
  }
});

export const getPostBySlug = cache(async (slug: string): Promise<Post | null> => {
  // Check cache first
  const cached = postCache.get(slug);
  if (cached) return cached;

  try {
    const response = await fetch(`/api/blog/posts/metadata/${slug}`);
    if (!response.ok) return null;
    
    const { metadata } = await response.json();
    postCache.set(slug, metadata);
    return metadata;
  } catch (error) {
    logger.error(`Error fetching post ${slug}:`, error);
    return null;
  }
});

// Additional content-related functions...
