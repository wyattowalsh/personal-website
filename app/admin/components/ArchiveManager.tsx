'use client';

import { useMemo, useState } from 'react';
import { Archive, CheckCircle2, Clock, ListPlus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataGrid, type DataColumn } from './DataGrid';
import type { ArchiveSuggestion } from '../lib/archive-mode';

interface ArchiveManagerProps {
  suggestions: ArchiveSuggestion[];
}

type ActionType = ArchiveSuggestion['action'];

const actionBadge: Record<ActionType, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  update: { label: 'Update', variant: 'default' },
  merge: { label: 'Merge', variant: 'secondary' },
  redirect: { label: 'Redirect', variant: 'destructive' },
};

interface ArchiveRow {
  slug: string;
  title: string;
  lastUpdated: string;
  ageDays: number;
  action: ActionType;
  reason: string;
}

export function ArchiveManager({ suggestions }: ArchiveManagerProps) {
  const [queue, setQueue] = useState<Set<string>>(new Set());
  const [markedUpdated, setMarkedUpdated] = useState<Set<string>>(new Set());

  const rows: ArchiveRow[] = useMemo(
    () =>
      suggestions.map((s) => ({
        slug: s.slug,
        title: s.title,
        lastUpdated: s.lastUpdated,
        ageDays: s.ageDays,
        action: s.action,
        reason: s.reason,
      })),
    [suggestions]
  );

  const addToQueue = (slug: string) => {
    setQueue((prev) => new Set(prev).add(slug));
  };

  const markUpdated = (slug: string) => {
    setMarkedUpdated((prev) => new Set(prev).add(slug));
  };

  const columns: DataColumn<ArchiveRow>[] = [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      searchable: true,
      render: (_value, item) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{item.title}</p>
          <p className="text-xs text-muted-foreground">{item.slug}</p>
        </div>
      ),
    },
    {
      key: 'lastUpdated',
      label: 'Last Updated',
      sortable: true,
      width: '140px',
      render: (value) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {String(value)}
        </span>
      ),
    },
    {
      key: 'ageDays',
      label: 'Age',
      sortable: true,
      width: '100px',
      align: 'right',
      render: (value) => (
        <span className="tabular-nums text-xs text-muted-foreground">
          {value}d
        </span>
      ),
    },
    {
      key: 'action',
      label: 'Suggested Action',
      sortable: true,
      width: '120px',
      render: (value) => {
        const config = actionBadge[value as ActionType];
        return (
          <Badge variant={config.variant} className="text-[0.6rem] uppercase tracking-wider">
            {config.label}
          </Badge>
        );
      },
    },
    {
      key: 'slug',
      label: 'Actions',
      width: '200px',
      align: 'right',
      render: (_value, item) => (
        <div className="flex items-center justify-end gap-2">
          {markedUpdated.has(item.slug) ? (
            <Badge variant="outline" className="gap-1 text-[0.6rem]">
              <CheckCircle2 className="size-3" />
              Updated
            </Badge>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => markUpdated(item.slug)}
            >
              <RotateCcw className="size-3" />
              Mark Updated
            </Button>
          )}
          {queue.has(item.slug) ? (
            <Badge variant="outline" className="gap-1 text-[0.6rem]">
              <Clock className="size-3" />
              Queued
            </Badge>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => addToQueue(item.slug)}
            >
              <ListPlus className="size-3" />
              Queue
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader className="border-b border-border/60 bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="rounded-md border border-[hsl(var(--chart-1)/0.25)] bg-[hsl(var(--chart-1)/0.1)] p-2 text-[hsl(var(--chart-1))]">
            <Archive className="size-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold tracking-wide">Archive Manager</CardTitle>
            <p className="text-xs text-muted-foreground">
              {suggestions.length} stale posts need attention
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <DataGrid
          data={rows as unknown as Record<string, unknown>[]}
          columns={columns as unknown as DataColumn<Record<string, unknown>>[]}
          searchFields={['title', 'slug']}
          emptyMessage="No stale or archived posts found."
        />
      </CardContent>
    </Card>
  );
}
