import 'server-only';

import { BackendService } from '@/lib/server';
import type { Post } from '@/lib/types';

export type SEOOpportunityType =
  | 'missing_meta_description'
  | 'short_content'
  | 'no_image'
  | 'old_post'
  | 'orphan_page';

export interface SEOOpportunity {
  type: SEOOpportunityType;
  slug: string;
  title: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion: string;
}

function ageInDays(post: Post): number {
  const basis = post.updated || post.created;
  const timestamp = new Date(basis).getTime();
  if (Number.isNaN(timestamp)) return 0;
  return Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
}

function hasInternalLinks(post: Post, allPosts: Post[]): boolean {
  if (!post.content) return false;

  const slugPattern = new RegExp(`\\[([^\\]]+)\\]\\(\\/?(?:blog\\/posts\\/)?(${post.slug})\\)`, 'i');
  if (slugPattern.test(post.content)) return true;

  for (const other of allPosts) {
    if (other.slug === post.slug) continue;
    const linkPattern = new RegExp(`\\[([^\\]]+)\\]\\(\\/?(?:blog\\/posts\\/)?${other.slug}\\)`, 'i');
    if (linkPattern.test(post.content)) return true;
  }

  const hasAdjacent = post.adjacent && (post.adjacent.prev || post.adjacent.next);
  if (hasAdjacent) return true;

  return false;
}

export async function findSEOpportunities(): Promise<SEOOpportunity[]> {
  await BackendService.ensurePreprocessed();
  const posts = await BackendService.getInstance().getAllPosts();
  const opportunities: SEOOpportunity[] = [];

  for (const post of posts) {
    if (!post.summary) {
      opportunities.push({
        type: 'missing_meta_description',
        slug: post.slug,
        title: post.title,
        severity: 'high',
        message: 'Missing meta description (summary)',
        suggestion: 'Add a summary field to the frontmatter for better search snippets and social sharing.',
      });
    }

    if (post.wordCount < 500) {
      opportunities.push({
        type: 'short_content',
        slug: post.slug,
        title: post.title,
        severity: 'medium',
        message: `Short content (${post.wordCount} words)`,
        suggestion: 'Consider expanding the post to at least 500 words for better topical coverage.',
      });
    }

    if (!post.image) {
      opportunities.push({
        type: 'no_image',
        slug: post.slug,
        title: post.title,
        severity: 'medium',
        message: 'No hero image set',
        suggestion: 'Add an image to the frontmatter for richer social previews and engagement.',
      });
    }

    const age = ageInDays(post);
    if (age > 365) {
      opportunities.push({
        type: 'old_post',
        slug: post.slug,
        title: post.title,
        severity: 'low',
        message: `Not updated in ${age} days`,
        suggestion: 'Review for accuracy and refresh with current information if the topic is evergreen.',
      });
    }

    if (!hasInternalLinks(post, posts)) {
      opportunities.push({
        type: 'orphan_page',
        slug: post.slug,
        title: post.title,
        severity: 'medium',
        message: 'No internal links detected',
        suggestion: 'Link to related posts to improve site structure and distribute link equity.',
      });
    }
  }

  return opportunities.sort((a, b) => {
    const severityRank = { high: 3, medium: 2, low: 1 };
    return severityRank[b.severity] - severityRank[a.severity];
  });
}
