'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { GitBranch, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { RelatedPost } from '../lib/related-posts';

interface RelatedPostsPanelProps {
  relatedPosts: RelatedPost[];
  currentSlug: string;
}

export function RelatedPostsPanel({ relatedPosts, currentSlug }: RelatedPostsPanelProps) {
  const sorted = useMemo(
    () => [...relatedPosts].sort((a, b) => b.similarityScore - a.similarityScore),
    [relatedPosts]
  );

  if (sorted.length === 0) {
    return (
      <Card className="border-border/60 bg-card/80">
        <CardHeader className="border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="rounded-md border border-[hsl(var(--chart-1)/0.25)] bg-[hsl(var(--chart-1)/0.1)] p-2 text-[hsl(var(--chart-1))]">
              <GitBranch className="size-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold tracking-wide">Related Posts</CardTitle>
              <p className="text-xs text-muted-foreground">No related posts found</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
            No posts share tags with the current selection.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader className="border-b border-border/60 bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="rounded-md border border-[hsl(var(--chart-1)/0.25)] bg-[hsl(var(--chart-1)/0.1)] p-2 text-[hsl(var(--chart-1))]">
            <GitBranch className="size-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold tracking-wide">Related Posts</CardTitle>
            <p className="text-xs text-muted-foreground">
              {sorted.length} related post{sorted.length === 1 ? '' : 's'} for{' '}
              <span className="font-mono text-[0.65rem]">{currentSlug}</span>
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/30">
          {sorted.map((post) => (
            <div
              key={post.slug}
              className="group flex flex-col gap-2 p-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 space-y-1">
                <Link
                  href={`/blog/posts/${post.slug}`}
                  className="text-sm font-medium text-foreground no-underline transition-colors hover:text-primary"
                >
                  {post.title}
                </Link>
                <div className="flex flex-wrap items-center gap-1.5">
                  {post.sharedTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="gap-1 text-[0.6rem] px-1.5 py-0"
                    >
                      <Tag className="size-2.5" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
                <span className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                  {Math.round(post.similarityScore * 100)}% match
                </span>
                <div className="w-24 rounded-full bg-muted h-1.5 overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      post.similarityScore >= 0.5 && 'bg-emerald-500',
                      post.similarityScore >= 0.25 && post.similarityScore < 0.5 && 'bg-amber-500',
                      post.similarityScore < 0.25 && 'bg-muted-foreground/50'
                    )}
                    style={{ width: `${Math.round(post.similarityScore * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
