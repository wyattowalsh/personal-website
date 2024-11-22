import { NextRequest, NextResponse } from 'next/server';
import { getAllPosts } from '@/lib/posts';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const currentSlug = searchParams.get('slug');

    if (!currentSlug) {
      return new NextResponse('Missing slug parameter', { status: 400 });
    }

    const posts = await getAllPosts();
    const sortedPosts = posts.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const currentIndex = sortedPosts.findIndex(post => post.slug === currentSlug);
    
    if (currentIndex === -1) {
      return new NextResponse('Post not found', { status: 404 });
    }

    return NextResponse.json({
      prevPost: currentIndex < sortedPosts.length - 1 ? {
        title: sortedPosts[currentIndex + 1].title,
        slug: sortedPosts[currentIndex + 1].slug
      } : null,
      nextPost: currentIndex > 0 ? {
        title: sortedPosts[currentIndex - 1].title,
        slug: sortedPosts[currentIndex - 1].slug
      } : null
    });
  } catch (error) {
    console.error('Error in adjacent posts route:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
