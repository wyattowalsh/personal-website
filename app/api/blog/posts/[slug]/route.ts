// app/blog/posts/[slug]/page.tsx
import { backend } from '@/lib/services/backend'
import { PostLayout } from '@/components/PostLayout'
import { notFound } from 'next/navigation'

export default async function PostsLayout({ 
  params: { slug },
  children 
}: {
  params: { slug: string }
  children: React.ReactNode
}) {
  try {
    // Check if post exists before rendering
    const post = await backend.getPost(slug)
    if (!post) notFound()

    // Pass the post data to PostLayout 
    return <PostLayout post={post}>{children}</PostLayout>
  } catch (error) {
    notFound()
  }
}

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