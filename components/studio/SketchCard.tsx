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
  p5js: 'border border-pink-500/25 bg-pink-500/10 text-pink-700 dark:text-pink-200',
  glsl: 'border border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200',
  webgpu: 'border border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-200',
}

function SketchCardInner({ sketch, onLike }: SketchCardProps) {
  return (
    <Card className="group relative overflow-hidden border-border/70 bg-card/80 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-border hover:shadow-lg focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 motion-reduce:hover:translate-y-0 motion-reduce:transition-none">
      <Link
        href={`/studio/${sketch.id}`}
        className="absolute inset-0 z-0 block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label={`View sketch ${sketch.title}`}
      />
      <div className="relative z-10 pointer-events-none">
        <div className="relative aspect-square overflow-hidden bg-muted/50">
          {sketch.thumbnailUrl ? (
            <Image
                src={sketch.thumbnailUrl}
                alt={sketch.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground/55">
              <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none" />
          <span
            className={cn(
              'absolute right-2.5 top-2.5 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] backdrop-blur-md',
               engineBadgeColors[sketch.engine] ?? 'border border-border/80 bg-background/70 text-muted-foreground'
            )}
          >
            {sketch.engine}
          </span>
        </div>
        <CardContent className="p-4">
          <h3 className="truncate text-sm font-semibold leading-tight sm:text-base">{sketch.title}</h3>
          <div className="mt-2.5 flex items-center gap-2.5">
            {sketch.authorImage ? (
              <Image
                src={sketch.authorImage}
                alt={sketch.authorName}
                width={24}
                height={24}
                 className="rounded-full ring-1 ring-border/80"
              />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted/70 text-xs font-semibold">
                {sketch.authorName?.charAt(0)?.toUpperCase() ?? '?'}
              </div>
            )}
            <span className="truncate text-sm text-muted-foreground">
              {sketch.authorName}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-4 rounded-lg border border-border/60 bg-muted/20 px-2.5 py-1.5 text-xs text-muted-foreground">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onLike?.()
              }}
              className="pointer-events-auto flex items-center gap-1.5 rounded-md px-1 py-0.5 transition-colors hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
                   className="rounded-md border border-border/70 bg-background/50 px-2 py-0.5 text-[11px] text-muted-foreground"
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
