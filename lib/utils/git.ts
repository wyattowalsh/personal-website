'use server';

import { exec } from 'child_process';
import { promisify } from 'util';
import { LRUCache } from 'lru-cache';

const execAsync = promisify(exec);

// Create a cache instance for git data
const gitCache = new LRUCache<string, {
  created: string | null;
  lastModified: string | null;
}>({ 
  max: 500, // Maximum 500 entries
  ttl: 1000 * 60 * 60, // Cache for 1 hour
});

export async function getGitFileData(filePath: string) {
  try {
    // Check cache first
    const cached = gitCache.get(filePath);
    if (cached) {
      return cached;
    }

    // If not in cache, get from git
    const [created, updated] = await Promise.all([
      execAsync(`git log --follow --format=%aI --reverse "${filePath}" | head -1`),
      execAsync(`git log -1 --format=%aI "${filePath}"`)
    ]);

    const result = {
      created: created.stdout.trim() || null,
      lastModified: updated.stdout.trim() || null
    };

    // Cache the result
    gitCache.set(filePath, result);

    return result;
  } catch (error) {
    console.error(`Git data error for ${filePath}:`, error);
    return { created: null, lastModified: null };
  }
}
