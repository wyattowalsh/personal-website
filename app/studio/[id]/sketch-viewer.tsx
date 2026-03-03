'use client'

import * as React from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { GitFork, Code2, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/studio/UserAvatar'
import { LikeButton } from '@/components/studio/LikeButton'
import { ForkBadge } from '@/components/studio/ForkBadge'
import { ShareButton } from '@/components/studio/ShareButton'
import { EmbedDialog } from '@/components/studio/EmbedDialog'
import { ReportButton } from '@/components/studio/ReportButton'
import type { Sketch } from '@/lib/studio/types'

interface SketchViewerProps {
  sketch: Sketch & { authorName: string; authorImage: string | null }
  parentSketch: {
    id: string
    title: string
    authorName: string
  } | null
}

export function SketchViewer({ sketch, parentSketch }: SketchViewerProps) {
  const { data: session } = useSession()
  const [liked, setLiked] = React.useState(false)
  const [likeCount, setLikeCount] = React.useState(sketch.likeCount)
  const [embedOpen, setEmbedOpen] = React.useState(false)

  // Check if the current user has liked this sketch
  React.useEffect(() => {
    if (!session?.user?.id) return
    fetch(`/api/studio/sketches/${sketch.id}/like`)
      .then((res) => res.json())
      .then((data) => {
        if (data.liked !== undefined) setLiked(data.liked)
      })
      .catch(() => {})
  }, [session?.user?.id, sketch.id])

  const handleToggleLike = async () => {
    if (!session?.user?.id) return
    try {
      const res = await fetch(`/api/studio/sketches/${sketch.id}/like`, {
        method: 'POST',
      })
      if (res.ok) {
        const data = await res.json()
        setLiked(data.liked)
        setLikeCount(data.count)
      }
    } catch {
      /* ignore */
    }
  }

  const handleReport = async (reason: string) => {
    if (!session?.user?.id) return
    try {
      await fetch(`/api/studio/sketches/${sketch.id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
    } catch {
      /* ignore */
    }
  }

  const isOwner = session?.user?.id === sketch.authorId

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      {/* Back navigation */}
      <Link
        href="/studio"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Gallery
      </Link>

      {/* Fork badge */}
      {parentSketch && (
        <div className="mb-3">
          <ForkBadge
            parentTitle={parentSketch.title}
            parentId={parentSketch.id}
            parentAuthorName={parentSketch.authorName}
          />
        </div>
      )}

      {/* Title and actions */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {sketch.title}
          </h1>
          {sketch.description && (
            <p className="mt-1 text-muted-foreground">{sketch.description}</p>
          )}
          <div className="mt-3 flex items-center gap-3">
            <Link
              href={`/studio/profile/${sketch.authorId}`}
              className="flex items-center gap-2 transition-opacity hover:opacity-80"
            >
              <UserAvatar
                name={sketch.authorName}
                image={sketch.authorImage}
                size="sm"
              />
              <span className="text-sm font-medium">{sketch.authorName}</span>
            </Link>
            <span className="text-xs text-muted-foreground">
              {new Date(sketch.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <LikeButton
            liked={liked}
            count={likeCount}
            onToggle={handleToggleLike}
            disabled={!session?.user}
          />
          <ShareButton sketchId={sketch.id} title={sketch.title} />
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={() => setEmbedOpen(true)}
          >
            <Code2 className="h-3.5 w-3.5" />
            Embed
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5" asChild>
            <Link href={`/studio/new?fork=${sketch.id}`}>
              <GitFork className="h-3.5 w-3.5" />
              Fork
            </Link>
          </Button>
          {isOwner && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/studio/${sketch.id}/edit`}>Edit</Link>
            </Button>
          )}
          {!isOwner && session?.user && (
            <ReportButton sketchId={sketch.id} onReport={handleReport} />
          )}
        </div>
      </div>

      {/* Sketch preview */}
      <div
        className={cn(
          'relative overflow-hidden rounded-xl border border-border',
          'bg-black'
        )}
      >
        <iframe
          src={`/studio/embed/${sketch.id}`}
          className="aspect-square w-full border-0 sm:aspect-video"
          title={sketch.title}
          sandbox="allow-scripts"
          loading="lazy"
        />
      </div>

      {/* Tags */}
      {sketch.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {sketch.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Code viewer (read-only) */}
      <details className="mt-6 rounded-lg border border-border">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/50">
          View Source Code
        </summary>
        <pre className="overflow-x-auto p-4 text-sm">
          <code>{sketch.code}</code>
        </pre>
      </details>

      <EmbedDialog
        sketchId={sketch.id}
        thumbnailUrl={sketch.thumbnailUrl ?? undefined}
        open={embedOpen}
        onOpenChange={setEmbedOpen}
      />
    </div>
  )
}
