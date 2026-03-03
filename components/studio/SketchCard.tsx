'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import type { SketchSummary } from '@/lib/studio/types'

interface SketchCardProps {
  sketch: SketchSummary
  onLike?: () => void
}

const engineBadgeColors: Record<string, string> = {
  p5js: 'bg-pink-500/15 text-pink-600 dark:text-pink-300 border border-pink-500/20',
  glsl: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20',
  webgpu: 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border border-blue-500/20',
}

function SketchCardInner({ sketch, onLike }: SketchCardProps) {
  return (
    <Card className="group relative overflow-hidden border-border/50 transition-all duration-300 hover:-translate-y-1.5 hover:border-border hover:shadow-xl hover:shadow-primary/5">
      <Link
        href={`/studio/${sketch.id}`}
        className="absolute inset-0 z-0 block rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label={`View sketch ${sketch.title}`}
      />
      <div className="relative z-10 pointer-events-none">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {sketch.thumbnailUrl ? (
            <Image
              src={sketch.thumbnailUrl}
              alt={sketch.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.08]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground/60">
              <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <span
            className={cn(
              'absolute right-2.5 top-2.5 rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider backdrop-blur-sm',
              engineBadgeColors[sketch.engine] ?? 'bg-muted/80 text-muted-foreground'
            )}
          >
            {sketch.engine}
          </span>
        </div>
        <CardContent className="p-4">
          <h3 className="truncate text-sm font-semibold sm:text-base">{sketch.title}</h3>
          <div className="mt-2 flex items-center gap-2.5">
            {sketch.authorImage ? (
              <Image
                src={sketch.authorImage}
                alt={sketch.authorName}
                width={24}
                height={24}
                className="rounded-full ring-1 ring-border"
              />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                {sketch.authorName?.charAt(0)?.toUpperCase() ?? '?'}
              </div>
            )}
            <span className="truncate text-sm text-muted-foreground">
              {sketch.authorName}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onLike?.()
              }}
              className="pointer-events-auto flex items-center gap-1.5 rounded-md px-1 py-0.5 transition-colors hover:text-red-400 focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Like (${sketch.likeCount})`}
            >
              <Heart className="h-3.5 w-3.5" />
              {sketch.likeCount}
            </button>
            <span className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              {sketch.viewCount}
            </span>
          </div>
          {sketch.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {sketch.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  )
}

export const SketchCard = React.memo(SketchCardInner)
SketchCard.displayName = 'SketchCard'
