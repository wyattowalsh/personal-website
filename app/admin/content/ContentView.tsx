'use client';

import { useState, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ContentFilters, DEFAULT_FILTERS, type ContentFilterValues } from '../components/ContentFilters';
import { PostCard, type PostCardProps } from '../components/PostCard';
import { SeriesView } from '../components/SeriesView';
import { AlertTriangle, BookOpen, FileText, Layers, ListChecks, Tags } from 'lucide-react';
import { AdminHero, AdminSurface, SignalCard } from '../components/AdminVisuals';

interface ContentViewProps {
  posts: PostCardProps[];
  allTags: string[];
}

export function ContentView({ posts, allTags }: ContentViewProps) {
  const [filters, setFilters] = useState<ContentFilterValues>({ ...DEFAULT_FILTERS });

  const filteredPosts = useMemo(() => {
    let result = [...posts];

    // Filter by tag
    if (filters.tag !== 'all') {
      result = result.filter((post) => post.tags.includes(filters.tag));
    }

    // Filter by search
    if (filters.search) {
      const query = filters.search.toLowerCase();
      result = result.filter((post) => post.title.toLowerCase().includes(query));
    }

    // Sort
    switch (filters.sort) {
      case 'newest':
        result.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime());
        break;
      case 'most-words':
        result.sort((a, b) => b.wordCount - a.wordCount);
        break;
      case 'least-words':
        result.sort((a, b) => a.wordCount - b.wordCount);
        break;
      case 'a-z':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return result;
  }, [posts, filters]);
  const totalWords = posts.reduce((sum, post) => sum + post.wordCount, 0);
  const metadataGaps = posts.filter((post) => !post.image || !post.summary || post.tags.length === 0).length;
  const seriesCount = new Set(posts.map((post) => post.series?.name).filter(Boolean)).size;

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
          <ContentFilters
            allTags={allTags}
            filters={filters}
            onFilterChange={setFilters}
          />
          <p className="mt-3 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground">
            {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'} in current view
          </p>
        </div>

      {/* Tabs */}
      <Tabs defaultValue="list">
        <TabsList className="border border-border/80 bg-card/75">
          <TabsTrigger value="list" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            List
          </TabsTrigger>
          <TabsTrigger value="series" className="gap-1.5">
            <Layers className="h-3.5 w-3.5" />
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
              <FileText className="h-10 w-10 text-muted-foreground/40 mb-3" />
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
              <Layers className="h-10 w-10 text-muted-foreground/40 mb-3" />
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
