import { buildFeed } from '@/lib/feed';
import { api as coreApi, logger } from '@/lib/core';

export const GET = coreApi.middleware.withErrorHandler(
  async () => {
    try {
      const feed = await buildFeed();
      const rss = feed.rss2();
      return new Response(rss, {
        headers: {
          'Content-Type': 'application/rss+xml; charset=utf-8',
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      });
    } catch (error) {
      logger.error('Error generating RSS feed:', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  },
);
