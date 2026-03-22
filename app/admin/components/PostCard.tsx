'use client';

import Link from 'next/link';
import { cn, formatDate, isDifferentDate } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TagPill } from '@/components/ui/tag-pill';
import { AlertTriangle, FileText, Calendar, BookOpen } from 'lucide-react';

export interface PostCardProps {
  slug: string;
  title: string;
  created: string;
  updated?: string;
  wordCount: number;
  readingTime?: string;
  tags: string[];
  image?: string;
  summary?: string;
  series?: { name: string; order: number };
}

export function PostCard({
  slug,
  title,
  created,
  updated,
  wordCount,
  readingTime,
  tags,
  image,
  summary,
  series,
}: PostCardProps) {
  const hasUpdate = isDifferentDate(created, updated);
  const warnings: Array<{ icon: typeof AlertTriangle; label: string }> = [];

  if (!image) {
    warnings.push({ icon: AlertTriangle, label: 'No hero image' });
  }
  if (!summary) {
    warnings.push({ icon: FileText, label: 'No summary' });
  }
  if (wordCount < 200) {
    warnings.push({ icon: FileText, label: 'Short post' });
  }

  return (
    <Card
      className={cn(
        'hover:-translate-y-0.5 hover:shadow-md transition-all duration-200',
      )}
    >
      <CardContent className="space-y-3 p-5">
        {/* Title */}
        <Link
          href={`/blog/posts/${slug}`}
          className="text-base font-medium hover:text-primary transition-colors line-clamp-1"
        >
          {title}
        </Link>

        {/* Date, word count, reading time */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(created)}
          </span>
          {hasUpdate && (
            <span className="text-muted-foreground/70">
              Updated: {formatDate(updated!)}
            </span>
          )}
          <Badge variant="secondary" className="text-xs">
            <BookOpen className="mr-1 h-3 w-3" />
            {wordCount.toLocaleString()} words
          </Badge>
          {readingTime && (
            <Badge variant="secondary" className="text-xs">
              {readingTime}
            </Badge>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <TagPill key={tag} tag={tag} variant="default" />
            ))}
          </div>
        )}

        {/* Summary */}
        {summary && (
          <p className="text-sm text-muted-foreground line-clamp-2">{summary}</p>
        )}

        {/* Series badge */}
        {series && (
          <Badge variant="outline" className="text-xs">
            {series.name} #{series.order}
          </Badge>
        )}

        {/* Health warnings */}
        {warnings.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {warnings.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1 text-xs text-amber-500"
              >
                <Icon className="h-3 w-3" />
                {label}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
