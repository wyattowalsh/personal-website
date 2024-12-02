// app/api/blog/posts/[slug]/route.ts
import { backend } from '@/lib/services/backend'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const post = await backend.getPost(params.slug)

    if (!post) {
      return new NextResponse('Post not found', { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}