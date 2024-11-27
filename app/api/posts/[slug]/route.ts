import { NextResponse } from 'next/server';
import { backend } from '@/lib/services/backend';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const post = await backend.getPost(params.slug);
    
    if (!post) {
      return new NextResponse(null, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return new NextResponse(null, { status: 500 });
  }
}
