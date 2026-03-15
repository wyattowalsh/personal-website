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
import { StudioPageContainer } from '@/components/studio/StudioShell'
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
    <StudioPageContainer className="max-w-5xl py-6">
      <SketchViewTracker sketchId={id} />
      {/* Header */}
      <div className="mb-6 rounded-2xl border border-border/60 bg-card/40 p-4 sm:p-6">
        <div className="space-y-4">
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
          <div className="flex flex-wrap items-center gap-2.5 text-sm text-muted-foreground">
            <Link
              href={`/studio/profile/${sketch.authorId}`}
              className="flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-2.5 py-1 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <UserAvatar
                name={sketch.authorName}
                image={sketch.authorImage ?? null}
                size="sm"
              />
              <span>{sketch.authorName}</span>
            </Link>
            <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/40 px-2.5 py-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(sketch.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/40 px-2.5 py-1">
              <Eye className="h-3.5 w-3.5" />
              {sketch.viewCount.toLocaleString()}
            </span>
            <Badge
              variant="secondary"
              className="rounded-full border border-border/60 bg-background/40 text-xs"
            >
              {sketch.engine}
            </Badge>
          </div>
        </div>
      </div>

      {/* Sketch preview */}
      <div className="mb-6 overflow-hidden rounded-xl border border-border/60 bg-black/70">
        <Suspense
          fallback={
            <div className="aspect-square w-full animate-pulse bg-muted/60" />
          }
        >
          <SketchEmbed id={id} height={500} />
        </Suspense>
      </div>

      {/* Action bar */}
      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-border/60 bg-card/30 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <LikeButtonConnected
            sketchId={id}
            initialCount={sketch.likeCount}
          />
          <ShareButton sketchId={id} title={sketch.title} />
          <BookmarkButton sketchId={id} initialBookmarked={false} currentUserId={session?.user?.id} />
          <ReportButtonConnected sketchId={id} />
        </div>
        <Button variant="outline" asChild className="border-border/70 bg-background/60">
          <Link href={`/studio/new?fork=${id}`} className="gap-2">
            <GitFork className="h-4 w-4" />
            Remix
          </Link>
        </Button>
      </div>

      {/* Description + tags */}
      {(sketch.description || sketch.tags.length > 0) && (
        <div className="mb-6 rounded-xl border border-border/60 bg-card/30 p-4 sm:p-5">
          {sketch.description && (
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              {sketch.description}
            </p>
          )}

          {sketch.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {sketch.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="border-border/70 bg-background/40">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Comments */}
      <div className="mt-8 border-t border-border pt-8">
        <CommentSection sketchId={id} currentUserId={session?.user?.id} />
      </div>
    </StudioPageContainer>
  )
}
