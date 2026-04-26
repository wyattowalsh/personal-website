'use client';

import { useState } from 'react';
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

  const sorted = [...posts].sort((a, b) => {
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

  function SortIcon({ column }: { column: SortColumn }) {
    if (sortColumn !== column) {
      return <ChevronDown className="h-3 w-3 text-muted-foreground/40" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-3 w-3 text-foreground" />
    ) : (
      <ChevronDown className="h-3 w-3 text-foreground" />
    );
  }

  return (
    <Card className="overflow-hidden border-border/80 bg-card/80">
      <ScrollArea className="w-full">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/80 bg-muted/20">
              <th
                className="cursor-pointer select-none px-4 py-3 text-left font-mono text-[0.68rem] font-medium uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => handleSort('title')}
              >
                <span className="inline-flex items-center gap-1">
                  Title
                  <SortIcon column="title" />
                </span>
              </th>
              <th
                className="cursor-pointer select-none px-4 py-3 text-left font-mono text-[0.68rem] font-medium uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground whitespace-nowrap"
                onClick={() => handleSort('created')}
              >
                <span className="inline-flex items-center gap-1">
                  Date
                  <SortIcon column="created" />
                </span>
              </th>
              <th
                className="cursor-pointer select-none px-4 py-3 text-right font-mono text-[0.68rem] font-medium uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground whitespace-nowrap"
                onClick={() => handleSort('wordCount')}
              >
                <span className="inline-flex items-center gap-1 justify-end">
                  Words
                  <SortIcon column="wordCount" />
                </span>
              </th>
              <th
                className="cursor-pointer select-none px-4 py-3 text-right font-mono text-[0.68rem] font-medium uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground whitespace-nowrap"
                onClick={() => handleSort('readingTime')}
              >
                <span className="inline-flex items-center gap-1 justify-end">
                  Reading Time
                  <SortIcon column="readingTime" />
                </span>
              </th>
              <th className="px-4 py-3 text-left font-mono text-[0.68rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Tags
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(post => (
              <tr
                key={post.slug}
                className={cn(
                  'border-b border-border/50 last:border-b-0',
                  'hover:bg-muted/50 transition-colors'
                )}
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/blog/posts/${post.slug}`}
                    className="font-medium text-foreground hover:text-primary no-underline transition-colors"
                  >
                    {post.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                  {formatDate(post.created, { year: 'numeric', month: 'short', day: 'numeric' })}
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
