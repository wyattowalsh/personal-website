"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { extractPostSlug } from '@/lib/utils';
import { SeriesNav } from '@/components/SeriesNav';

interface SeriesPost {
  slug: string;
  title: string;
  series?: { name: string; order: number };
}

type SeriesData = {
  seriesName: string;
  currentSlug: string;
  posts: Array<{ slug: string; title: string; order: number }>;
} | null;

// Module-level cache prevents duplicate fetches when rendered at both
// top and bottom of PostLayout simultaneously
const seriesDataCache = new Map<string, { data: SeriesData; promise: Promise<void> | null }>();

/**
 * Client wrapper around SeriesNav that fetches the current post's series data.
 * Renders nothing if the post is not part of a series.
 */
export function PostLayoutSeriesNav() {
  const pathname = usePathname();
  const [seriesData, setSeriesData] = useState<SeriesData>(null);

  useEffect(() => {
    const slug = extractPostSlug(pathname);
    if (!slug) return;

    let cancelled = false;
    const cached = seriesDataCache.get(slug);

    // Cache hit — data already resolved
    if (cached && cached.promise === null) {
      setSeriesData(cached.data); // eslint-disable-line react-hooks/set-state-in-effect -- restore from module cache
      return;
    }

    // Cache hit — fetch in flight from the other instance
    if (cached && cached.promise !== null) {
      cached.promise.then(() => {
        if (!cancelled) {
          const resolved = seriesDataCache.get(slug);
          setSeriesData(resolved?.data ?? null);
        }
      });
      return;
    }

    // Cache miss — initiate the fetch and store the promise
    const controller = new AbortController();

    const fetchPromise = fetch(`/api/blog/posts/${slug}`, { signal: controller.signal })
      .then((r) => r.json())
      .then(({ data }) => {
        if (!data?.series?.name) {
          seriesDataCache.set(slug, { data: null, promise: null });
          if (!cancelled) setSeriesData(null);
          return;
        }

        const seriesName = data.series.name;

        return fetch('/api/blog/posts', { signal: controller.signal })
          .then((r) => r.json())
          .then(({ data: allPosts }) => {
            const seriesPosts = (allPosts as SeriesPost[])
              .filter((p) => p.series?.name === seriesName)
              .sort((a, b) => (a.series?.order ?? 0) - (b.series?.order ?? 0))
              .map((p) => ({
                slug: p.slug,
                title: p.title,
                order: p.series?.order ?? 0,
              }));

            const result: SeriesData = {
              seriesName,
              currentSlug: slug,
              posts: seriesPosts,
            };
            seriesDataCache.set(slug, { data: result, promise: null });
            if (!cancelled) setSeriesData(result);
          });
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          seriesDataCache.delete(slug);
          if (!cancelled) setSeriesData(null);
        }
      });

    seriesDataCache.set(slug, { data: null, promise: fetchPromise });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [pathname]);

  if (!seriesData || seriesData.posts.length < 2) return null;

  return (
    <div className="max-w-5xl mx-auto not-prose">
      <SeriesNav
        seriesName={seriesData.seriesName}
        currentSlug={seriesData.currentSlug}
        posts={seriesData.posts}
      />
    </div>
  );
}
