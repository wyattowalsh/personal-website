import { buildFeed } from '@/lib/feed';
import { api as coreApi, logger } from '@/lib/core';

export const revalidate = 3600;

export const GET = coreApi.middleware.withErrorHandler(
  async () => {
    try {
      const feed = await buildFeed();
      const atom = feed.atom1();
      return new Response(atom, {
        headers: {
          'Content-Type': 'application/atom+xml; charset=utf-8',
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      });
    } catch (error) {
      logger.error('Error generating Atom feed:', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  },
);
