import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Eye, GitFork, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getSketchById } from '@/lib/studio/db'
import { auth } from '@/lib/studio/auth'
import { UserAvatar } from '@/components/studio/UserAvatar'
import { LikeButtonConnected } from '@/components/studio/LikeButtonConnected'
import { ForkBadge } from '@/components/studio/ForkBadge'
import { ShareButton } from '@/components/studio/ShareButton'
import { ReportButtonConnected } from '@/components/studio/ReportButtonConnected'
import { BookmarkButton } from '@/components/studio/BookmarkButton'
import { CommentSection } from '@/components/studio/CommentSection'
import { SketchEmbed } from '@/components/studio/SketchEmbed'
import { SketchViewTracker } from '@/components/studio/SketchViewTracker'
import { createStudioMetadata, studioNoIndexRobots } from '@/lib/studio/metadata'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params
  // Pass null viewerId — only public sketches get metadata
  const sketch = await getSketchById(id, null)

  if (!sketch) {
    return createStudioMetadata({
      title: 'Sketch Not Found',
      description: 'The requested Studio sketch could not be found',
      path: `/studio/${id}`,
      robots: studioNoIndexRobots,
    })
  }

  return createStudioMetadata({
    title: sketch.title,
    description: sketch.description || `A ${sketch.engine} generative art sketch`,
    path: `/studio/${id}`,
    image: sketch.thumbnailUrl ?? undefined,
    type: 'article',
  })
}

export default async function SketchViewPage({ params }: PageProps) {
  const { id } = await params
  const [sketch, session] = await Promise.all([getSketchById(id), auth()])

  if (!sketch || !sketch.isPublic) {
    notFound()
  }

  // Fetch parent sketch info for fork badge
  let parentSketch: { title: string; authorName: string } | null = null
  if (sketch.forkedFrom) {
    const parent = await getSketchById(sketch.forkedFrom)
    if (parent) {
      parentSketch = { title: parent.title, authorName: parent.authorName }
    }
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <SketchViewTracker sketchId={id} />
      {/* Header */}
      <div className="mb-6 space-y-3">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {sketch.title}
        </h1>

        {sketch.forkedFrom && parentSketch && (
          <ForkBadge
            parentId={sketch.forkedFrom}
            parentTitle={parentSketch.title}
            parentAuthorName={parentSketch.authorName}
          />
        )}

        {/* Author + meta row */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <Link
            href={`/studio/profile/${sketch.authorId}`}
            className="flex items-center gap-2 hover:text-foreground"
          >
            <UserAvatar
              name={sketch.authorName}
              image={sketch.authorImage ?? null}
              size="sm"
            />
            <span>{sketch.authorName}</span>
          </Link>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(sketch.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {sketch.viewCount.toLocaleString()}
          </span>
          <Badge variant="secondary" className="text-xs">
            {sketch.engine}
          </Badge>
        </div>
      </div>

      {/* Sketch preview */}
      <div className="mb-6">
        <Suspense
          fallback={
            <div className="aspect-square w-full animate-pulse rounded-lg bg-muted" />
          }
        >
          <SketchEmbed id={id} height={500} />
        </Suspense>
      </div>

      {/* Action bar */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <LikeButtonConnected
          sketchId={id}
          initialCount={sketch.likeCount}
        />
        <ShareButton sketchId={id} title={sketch.title} />
        <ReportButtonConnected sketchId={id} />
        <BookmarkButton sketchId={id} initialBookmarked={false} currentUserId={session?.user?.id} />
        <div className="flex-1" />
        <Button variant="outline" asChild>
          <Link href={`/studio/new?fork=${id}`} className="gap-2">
            <GitFork className="h-4 w-4" />
            Remix
          </Link>
        </Button>
      </div>

      {/* Description */}
      {sketch.description && (
        <p className="mb-6 text-muted-foreground">{sketch.description}</p>
      )}

      {/* Tags */}
      {sketch.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {sketch.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Comments */}
      <div className="mt-8 border-t border-border pt-8">
        <CommentSection sketchId={id} currentUserId={session?.user?.id} />
      </div>
    </div>
  )
}
