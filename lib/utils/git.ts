'use server';

import { exec } from 'child_process';
import { promisify } from 'util';
import { LRUCache } from 'lru-cache';

const execAsync = promisify(exec);

// Create a cache instance for git data
const gitCache = new LRUCache<string, {
  firstModified: string | null;
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

    // Get the first commit date (when file was added) using --diff-filter=A
    // and the last modification date
    const [firstCommit, lastCommit] = await Promise.all([
      execAsync(`git log --diff-filter=A --format=%aI "${filePath}"`),
      execAsync(`git log -1 --format=%aI "${filePath}"`)
    ]);

    const result = {
      firstModified: firstCommit.stdout.trim() || null,
      lastModified: lastCommit.stdout.trim() || null
    };

    // Cache the result
    gitCache.set(filePath, result);

    return result;
  } catch (error) {
    console.error(`Git data error for ${filePath}:`, error);
    return { firstModified: null, lastModified: null };
  }
}
