import { LRUCache } from 'lru-cache';

const metadataCache = new LRUCache<string, any>({
  max: 500,
  ttl: 1000 * 60 * 60, // 1 hour
});

// Add utility function for sorting tags
function sortTags(tags: string[]): string[] {
  return [...tags].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
}

export async function getPostMetadata(slug: string) {
  const cacheKey = `metadata:${slug}`;
  const cached = metadataCache.get(cacheKey);
  if (cached) return cached;

  const response = await fetch(`/api/blog/posts/metadata/${slug}`);
  if (!response.ok) {
    throw new Error('Failed to fetch metadata');
  }
  
  const result = await response.json();
  
  // Ensure tags are sorted
  if (result.metadata?.tags) {
    result.metadata.tags = sortTags(result.metadata.tags);
  }
  
  metadataCache.set(cacheKey, result);
  return result;
}

export async function getAdjacentPosts(slug: string) {
  try {
    const response = await fetch(`/api/blog/posts/metadata/${slug}`);
    if (!response.ok) throw new Error('Failed to fetch metadata');
    
    const { metadata } = await response.json();
    if (!metadata?.adjacent) return { prevPost: null, nextPost: null };

    return {
      prevPost: metadata.adjacent.prev,
      nextPost: metadata.adjacent.next
    };
  } catch (error) {
    console.error('Error in getAdjacentPosts:', error);
    return { prevPost: null, nextPost: null };
  }
}
