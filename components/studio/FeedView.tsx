'use client'

import * as React from 'react'
import Link from 'next/link'
import { Loader2, Users, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { SketchCard } from './SketchCard'
import type { SketchSummary } from '@/lib/studio/types'

interface FeedViewProps {
  className?: string
}

export function FeedView({ className }: FeedViewProps) {
  const [sketches, setSketches] = React.useState<SketchSummary[]>([])
  const [nextCursor, setNextCursor] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [loadingMore, setLoadingMore] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [retryCount, setRetryCount] = React.useState(0)
  const sentinelRef = React.useRef<HTMLDivElement>(null)

  const hasMore = nextCursor !== null

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('/api/studio/feed?limit=24')
        if (res.ok && !cancelled) {
          const data = await res.json()
          setSketches(data.sketches)
          setNextCursor(data.nextCursor ?? null)
        }
      } catch {
        if (!cancelled) setError('Failed to load feed. Check your connection and try again.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [retryCount])

  const loadMore = React.useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const params = new URLSearchParams({ limit: '24' })
      if (nextCursor) params.set('cursor', nextCursor)
      const res = await fetch(`/api/studio/feed?${params}`)
      if (res.ok) {
        const data = await res.json()
        setSketches(prev => [...prev, ...data.sketches])
        setNextCursor(data.nextCursor ?? null)
      }
    } catch {
      // swallow
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, hasMore, nextCursor])

  React.useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, loadMore])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-destructive/50" />
        <h3 className="text-lg font-medium">Failed to load feed</h3>
        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        <Button
          className="mt-4"
          onClick={() => { setError(null); setLoading(true); setRetryCount(c => c + 1) }}
        >
          Try again
        </Button>
      </div>
    )
  }

  if (sketches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Users className="mb-4 h-16 w-16 text-muted-foreground/30" />
        <h3 className="text-lg font-medium">Your feed is empty</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Follow artists to see their latest creations here
        </p>
        <Button asChild className="mt-4">
          <Link href="/studio">Browse Gallery</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {sketches.map((sketch, i) => (
            <motion.div
              key={sketch.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.2) }}
            >
              <SketchCard sketch={sketch} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {loadingMore && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      <div ref={sentinelRef} className="h-1" />
    </div>
  )
}
