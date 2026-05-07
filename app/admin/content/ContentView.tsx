'use client';

import { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ContentFilters, DEFAULT_FILTERS, type ContentFilterValues } from '../components/ContentFilters';
import { PostCard, type PostCardProps } from '../components/PostCard';
import { SeriesView } from '../components/SeriesView';
import { AlertTriangle, BookOpen, FileText, Layers, ListChecks, Tags } from 'lucide-react';
import { AdminHero, AdminSurface, SignalCard } from '../components/AdminVisuals';
import { ExportButton } from '../components/ExportButton';
import { filterContentPosts } from './filter-utils';

interface ContentViewProps {
  posts: PostCardProps[];
  allTags: string[];
  initialFilters: ContentFilterValues;
}

function buildContentFilterUrl(pathname: string, filters: ContentFilterValues): string {
  const params = new URLSearchParams();
  if (filters.search !== DEFAULT_FILTERS.search) params.set('q', filters.search);
  if (filters.tag !== DEFAULT_FILTERS.tag) params.set('tag', filters.tag);
  if (filters.sort !== DEFAULT_FILTERS.sort) params.set('sort', filters.sort);
  if (filters.scope !== DEFAULT_FILTERS.scope) params.set('scope', filters.scope);
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function ContentView({ posts, allTags, initialFilters }: ContentViewProps) {
  const pathname = usePathname();
  const [filters, setFilters] = useState<ContentFilterValues>(initialFilters);

  const filteredPosts = useMemo(() => {
    return filterContentPosts(posts, filters);
  }, [posts, filters]);
  const exportRows = useMemo(() => filteredPosts.map((post) => ({
    slug: post.slug,
    title: post.title,
    created: post.created,
    updated: post.updated,
    wordCount: post.wordCount,
    readingTime: post.readingTime,
    tags: post.tags.join(', '),
    summary: post.summary ?? '',
    series: post.series?.name ?? '',
  })), [filteredPosts]);
  const totalWords = useMemo(() => posts.reduce((sum, post) => sum + post.wordCount, 0), [posts]);
  const metadataGaps = useMemo(() => posts.filter((post) => !post.image || !post.summary || post.tags.length === 0).length, [posts]);
  const seriesCount = useMemo(() => new Set(posts.map((post) => post.series?.name).filter(Boolean)).size, [posts]);

  const handleFilterChange = (nextFilters: ContentFilterValues) => {
    setFilters(nextFilters);
    window.history.replaceState(null, '', buildContentFilterUrl(pathname, nextFilters));
  };

  return (
    <AdminSurface>
      <div className="space-y-6">
        <AdminHero
          eyebrow="Content command"
          title="Content"
          description="Browse published posts, inspect metadata health, and track series structure."
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SignalCard label="Posts" value={posts.length} description="Published articles" icon={FileText} tone="blue" />
          <SignalCard label="Words" value={totalWords.toLocaleString()} description="Total indexed words" icon={BookOpen} tone="violet" />
          <SignalCard label="Tags" value={allTags.length} description="Available filters" icon={Tags} tone="emerald" />
          <SignalCard label="Metadata Gaps" value={metadataGaps} description={`${seriesCount} named series`} icon={metadataGaps > 0 ? AlertTriangle : ListChecks} tone={metadataGaps > 0 ? 'amber' : 'emerald'} />
        </div>

        <div className="rounded-lg border border-border/80 bg-card/80 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <ContentFilters
              allTags={allTags}
              filters={filters}
              onFilterChange={handleFilterChange}
            />
            <ExportButton
              data={exportRows}
              filename="content-posts-current-view.csv"
              label="Export view"
            />
          </div>
          <p
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="mt-3 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground"
          >
            {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'} in current view
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="list">
          <TabsList className="border border-border/80 bg-card/75">
            <TabsTrigger value="list" className="gap-1.5">
              <FileText aria-hidden="true" className="h-3.5 w-3.5" />
              List
            </TabsTrigger>
            <TabsTrigger value="series" className="gap-1.5">
              <Layers aria-hidden="true" className="h-3.5 w-3.5" />
              Series
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-4">
            {filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredPosts.map((post) => (
                  <PostCard key={post.slug} {...post} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText aria-hidden="true" className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No posts match your filters.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="series" className="mt-4">
            {filteredPosts.length > 0 ? (
              <SeriesView posts={filteredPosts} />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Layers aria-hidden="true" className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No posts match your filters.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminSurface>
  );
}
