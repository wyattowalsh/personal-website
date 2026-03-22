'use client';

import { useState, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ContentFilters, DEFAULT_FILTERS, type ContentFilterValues } from '../components/ContentFilters';
import { PostCard, type PostCardProps } from '../components/PostCard';
import { SeriesView } from '../components/SeriesView';
import { FileText, Layers } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Content</h1>
        <p className="text-muted-foreground mt-1">
          Manage and browse all posts
        </p>
      </div>

      {/* Filters */}
      <ContentFilters
        allTags={allTags}
        filters={filters}
        onFilterChange={setFilters}
      />

      {/* Result count */}
      <p className="text-sm text-muted-foreground">
        {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
      </p>

      {/* Tabs */}
      <Tabs defaultValue="list">
        <TabsList>
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
  );
}
