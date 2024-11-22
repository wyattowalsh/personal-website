import { NextRequest } from 'next/server';
import { getAllPosts } from '@/lib/posts';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const currentSlug = searchParams.get('slug');

  if (!currentSlug) {
    return new Response('Missing slug parameter', { status: 400 });
  }

  const posts = await getAllPosts();
  const sortedPosts = posts.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const currentIndex = sortedPosts.findIndex(post => post.slug === currentSlug);
  
  const previousPost = currentIndex < sortedPosts.length - 1 ? 
    sortedPosts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? 
    sortedPosts[currentIndex - 1] : null;

  return Response.json({
    previous: previousPost ? {
      title: previousPost.title,
      slug: previousPost.slug
    } : null,
    next: nextPost ? {
      title: nextPost.title,
      slug: nextPost.slug
    } : null
  });
}
