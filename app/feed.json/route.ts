import { buildFeed } from '@/lib/feed';

export async function GET() {
  try {
    const feed = await buildFeed();
    const json = feed.json1();
    return new Response(json, {
      headers: {
        'Content-Type': 'application/feed+json; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    console.error('Error generating JSON feed:', error);
    return new Response('Error generating feed', { status: 500 });
  }
}
