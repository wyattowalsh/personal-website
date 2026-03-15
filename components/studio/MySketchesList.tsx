'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Eye,
  EyeOff,
  Heart,
  Pencil,
  Trash2,
  Loader2,
  ImageIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { OwnedSketchSummary } from '@/lib/studio/types'

const engineBadgeColors: Record<string, string> = {
  p5js: 'bg-pink-500/20 text-pink-700 dark:text-pink-300',
  glsl: 'bg-green-500/20 text-green-700 dark:text-green-300',
  webgpu: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
}

interface MySketchesListProps {
  initialSketches: OwnedSketchSummary[]
}

export function MySketchesList({ initialSketches }: MySketchesListProps) {
  const [sketches, setSketches] =
    React.useState<OwnedSketchSummary[]>(initialSketches)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [togglingId, setTogglingId] = React.useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this sketch? This cannot be undone.')) return

    setDeletingId(id)
    try {
      const res = await fetch(`/api/studio/sketches/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setSketches((prev) => prev.filter((s) => s.id !== id))
      }
    } catch {
      // silently fail — user can retry
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleVisibility = async (
    id: string,
    currentlyPublic: boolean
  ) => {
    setTogglingId(id)
    try {
      const res = await fetch(`/api/studio/sketches/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !currentlyPublic }),
      })
      if (res.ok) {
        setSketches((prev) =>
          prev.map((s) =>
            s.id === id ? { ...s, isPublic: !currentlyPublic } : s
          )
        )
      }
    } catch {
      // silently fail — user can retry
    } finally {
      setTogglingId(null)
    }
  }

  if (sketches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ImageIcon className="mb-4 h-16 w-16 text-muted-foreground/30" />
        <h3 className="text-lg font-medium">No sketches yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Create your first generative art piece
        </p>
        <Button asChild className="mt-4">
          <Link href="/studio/new">Create a Sketch</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {sketches.map((sketch) => (
        <div
          key={sketch.id}
          className="flex items-center gap-4 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/30"
        >
          {/* Thumbnail */}
          <Link href={`/studio/${sketch.id}`} className="shrink-0">
            {sketch.thumbnailUrl ? (
              <Image
                src={sketch.thumbnailUrl}
                alt={sketch.title}
                width={56}
                height={56}
                className="h-14 w-14 rounded-md object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-md bg-muted">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
          </Link>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <Link
              href={`/studio/${sketch.id}`}
              className="line-clamp-1 font-medium hover:underline"
            >
              {sketch.title}
            </Link>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
              <Badge
                variant="secondary"
                className={cn(
                  'px-1.5 py-0 text-[10px]',
                  engineBadgeColors[sketch.engine]
                )}
              >
                {sketch.engine}
              </Badge>
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-medium',
                  sketch.isPublic
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                    : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                )}
              >
                {sketch.isPublic ? (
                  <Eye className="h-2.5 w-2.5" />
                ) : (
                  <EyeOff className="h-2.5 w-2.5" />
                )}
                {sketch.isPublic ? 'Public' : 'Private'}
              </span>
              <span className="flex items-center gap-0.5">
                <Heart className="h-3 w-3" />
                {sketch.likeCount}
              </span>
              <span className="flex items-center gap-0.5">
                <Eye className="h-3 w-3" />
                {sketch.viewCount}
              </span>
              <span className="hidden sm:inline">
                {new Date(sketch.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                handleToggleVisibility(sketch.id, sketch.isPublic)
              }
              disabled={togglingId === sketch.id}
              title={sketch.isPublic ? 'Make private' : 'Make public'}
            >
              {togglingId === sketch.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" />
              ) : sketch.isPublic ? (
                <EyeOff className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/studio/${sketch.id}/edit`}>
                <Pencil className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(sketch.id)}
              disabled={deletingId === sketch.id}
              className="text-destructive hover:text-destructive"
            >
              {deletingId === sketch.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
