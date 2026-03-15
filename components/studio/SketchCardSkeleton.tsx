'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

export function SketchCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('overflow-hidden border-border/50', className)}>
      <div className="relative aspect-square overflow-hidden bg-muted">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] motion-reduce:animate-none bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
      <CardContent className="p-4">
        <div className="h-5 w-3/4 rounded-md bg-muted" />
        <div className="mt-2 flex items-center gap-2.5">
          <div className="h-6 w-6 rounded-full bg-muted" />
          <div className="h-4 w-1/2 rounded-md bg-muted" />
        </div>
        <div className="mt-3 flex gap-4">
          <div className="h-4 w-10 rounded-md bg-muted" />
          <div className="h-4 w-10 rounded-md bg-muted" />
        </div>
        <div className="mt-3 flex gap-1.5">
          <div className="h-5 w-12 rounded-full bg-muted" />
          <div className="h-5 w-14 rounded-full bg-muted" />
        </div>
      </CardContent>
    </Card>
  )
}
