// app/api/blog/posts/[slug]/route.ts
import { getPost } from '@/lib/services' // Updated import
import { NextResponse } from 'next/server'
import { commonMiddleware } from '@/lib/api' // Updated import

export const GET = commonMiddleware.simple(
  async (request: Request, { params }: { params: { slug: string } }) => {
    const post = await getPost(params.slug)

    if (!post) {
      return new NextResponse('Post not found', { status: 404 })
    }

    return NextResponse.json(post)
  }
);