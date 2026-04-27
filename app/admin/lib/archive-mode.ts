import type { Post } from '@/lib/types';

export interface ArchiveSuggestion {
  slug: string;
  title: string;
  lastUpdated: string;
  ageDays: number;
  action: 'update' | 'merge' | 'redirect';
  reason: string;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function getDaysSince(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / MS_PER_DAY);
}

function getPostDate(post: Post): string {
  return post.updated ?? post.created;
}

/**
 * Returns posts older than 1 year (based on created date).
 */
export function getArchivedPosts(posts: Post[]): Post[] {
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 1);
  return posts.filter((post) => new Date(post.created) < cutoff);
}

/**
 * Returns posts not updated in the last 6 months.
 * Falls back to created date if updated is not set.
 */
export function getStalePosts(posts: Post[]): Post[] {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 6);
  return posts.filter((post) => {
    const date = new Date(getPostDate(post));
    return date < cutoff;
  });
}

/**
 * Generates archive suggestions for stale or old posts.
 */
export function generateArchiveSuggestions(posts: Post[]): ArchiveSuggestion[] {
  const stale = getStalePosts(posts);
  const archived = getArchivedPosts(posts);
  const archivedSlugs = new Set(archived.map((p) => p.slug));

  const suggestions: ArchiveSuggestion[] = [];

  for (const post of stale) {
    const ageDays = getDaysSince(getPostDate(post));
    const isArchived = archivedSlugs.has(post.slug);

    let action: ArchiveSuggestion['action'];
    let reason: string;

    if (isArchived && ageDays > 730) {
      action = 'redirect';
      reason = 'Post is over 2 years old with no recent updates';
    } else if (isArchived && ageDays > 365) {
      action = 'merge';
      reason = 'Post is over 1 year old; consider merging into a newer series or guide';
    } else {
      action = 'update';
      reason = `Post has not been updated in ${Math.floor(ageDays / 30)} months`;
    }

    suggestions.push({
      slug: post.slug,
      title: post.title,
      lastUpdated: getPostDate(post),
      ageDays,
      action,
      reason,
    });
  }

  return suggestions.sort((a, b) => b.ageDays - a.ageDays);
}
