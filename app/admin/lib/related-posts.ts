import type { Post } from '@/lib/types';

export interface RelatedPost {
  slug: string;
  title: string;
  similarityScore: number;
  sharedTags: string[];
}

/**
 * Computes Jaccard similarity index between two sets of tags.
 * Returns a value between 0 (no overlap) and 1 (identical tags).
 */
export function getPostSimilarityScore(postA: Post, postB: Post): number {
  const setA = new Set(postA.tags);
  const setB = new Set(postB.tags);

  if (setA.size === 0 && setB.size === 0) return 0;

  const intersection = new Set([...setA].filter((tag) => setB.has(tag)));
  const union = new Set([...setA, ...setB]);

  return intersection.size / union.size;
}

/**
 * Finds related posts for a given post slug based on tag overlap.
 * Returns posts sorted by similarity score (descending).
 */
export function findRelatedPosts(
  postSlug: string,
  posts: Post[],
  limit = 5
): RelatedPost[] {
  const target = posts.find((p) => p.slug === postSlug);
  if (!target) return [];

  const related = posts
    .filter((p) => p.slug !== postSlug)
    .map((p) => {
      const score = getPostSimilarityScore(target, p);
      const sharedTags = target.tags.filter((tag) => p.tags.includes(tag));
      return {
        slug: p.slug,
        title: p.title,
        similarityScore: score,
        sharedTags,
      };
    })
    .filter((r) => r.similarityScore > 0)
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, limit);

  return related;
}
