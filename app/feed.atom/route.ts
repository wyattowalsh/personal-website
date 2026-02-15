import { buildFeed } from '@/lib/feed';

export async function GET() {
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
    console.error('Error generating Atom feed:', error);
    return new Response('Error generating feed', { status: 500 });
  }
}
