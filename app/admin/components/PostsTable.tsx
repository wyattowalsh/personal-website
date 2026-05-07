'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn, formatDate } from '@/lib/utils';

interface PostRow {
  slug: string;
  title: string;
  created: string;
  wordCount: number;
  readingTime?: string;
  tags: string[];
}

interface PostsTableProps {
  posts: PostRow[];
}

type SortColumn = 'title' | 'created' | 'wordCount' | 'readingTime';
type SortDirection = 'asc' | 'desc';

const COLUMN_LABELS: Record<SortColumn, string> = {
  title: 'Title',
  created: 'Date',
  wordCount: 'Words',
  readingTime: 'Reading Time',
};

function parseReadingTime(rt?: string): number {
  if (!rt) return 0;
  const match = rt.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

export function PostsTable({ posts }: PostsTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('created');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  function handleSort(column: SortColumn) {
    if (sortColumn === column) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  }

  const sorted = useMemo(() => {
    return [...posts].sort((a, b) => {
      const dir = sortDirection === 'asc' ? 1 : -1;
      switch (sortColumn) {
        case 'title':
          return dir * a.title.localeCompare(b.title);
        case 'created':
          return dir * (new Date(a.created).getTime() - new Date(b.created).getTime());
        case 'wordCount':
          return dir * (a.wordCount - b.wordCount);
        case 'readingTime':
          return dir * (parseReadingTime(a.readingTime) - parseReadingTime(b.readingTime));
        default:
          return 0;
      }
    });
  }, [posts, sortColumn, sortDirection]);

  function getAriaSort(column: SortColumn): 'ascending' | 'descending' | 'none' {
    if (sortColumn !== column) return 'none';
    return sortDirection === 'asc' ? 'ascending' : 'descending';
  }

  function SortIcon({ column }: { column: SortColumn }) {
    if (sortColumn !== column) {
      return <ChevronDown aria-hidden="true" className="h-3 w-3 text-muted-foreground/40" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp aria-hidden="true" className="h-3 w-3 text-foreground" />
    ) : (
      <ChevronDown aria-hidden="true" className="h-3 w-3 text-foreground" />
    );
  }

  function SortHeader({ column, align = 'left' }: { column: SortColumn; align?: 'left' | 'right' }) {
    const active = sortColumn === column;
    const sortLabel = active
      ? `Sort by ${COLUMN_LABELS[column].toLowerCase()}, currently ${sortDirection === 'asc' ? 'ascending' : 'descending'}`
      : `Sort by ${COLUMN_LABELS[column].toLowerCase()}`;

    return (
      <th
        scope="col"
        aria-sort={getAriaSort(column)}
        className={cn(
          'px-4 py-3 font-mono text-[0.68rem] font-medium uppercase tracking-[0.14em] text-muted-foreground whitespace-nowrap',
          align === 'right' ? 'text-right' : 'text-left'
        )}
      >
        <button
          type="button"
          aria-label={sortLabel}
          className={cn(
            'inline-flex items-center gap-1 rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            align === 'right' && 'justify-end'
          )}
          onClick={() => handleSort(column)}
        >
          {COLUMN_LABELS[column]}
          <SortIcon column={column} />
        </button>
      </th>
    );
  }

  return (
    <Card className="overflow-hidden border-border/80 bg-card/80">
      <ScrollArea className="w-full">
        <table className="w-full text-sm">
          <caption className="sr-only">Published post inventory sorted by the selected column.</caption>
          <thead>
            <tr className="border-b border-border/80 bg-muted/20">
              <SortHeader column="title" />
              <SortHeader column="created" />
              <SortHeader column="wordCount" align="right" />
              <SortHeader column="readingTime" align="right" />
              <th scope="col" className="px-4 py-3 text-left font-mono text-[0.68rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Tags
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No posts available.
                </td>
              </tr>
            ) : sorted.map(post => (
              <tr
                key={post.slug}
                className={cn(
                  'border-b border-border/50 last:border-b-0',
                  'hover:bg-muted/50 transition-colors'
                )}
              >
                <th scope="row" className="px-4 py-3 text-left">
                  <Link
                    href={`/blog/posts/${post.slug}`}
                    className="font-medium text-foreground hover:text-primary no-underline transition-colors"
                  >
                    {post.title}
                  </Link>
                </th>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                  {formatDate(post.created, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                  {post.wordCount.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground whitespace-nowrap">
                  {post.readingTime ?? '-'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {post.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-[0.65rem] px-1.5 py-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </Card>
  );
}
