'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { Loader2, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { TagPill } from '@/components/ui/tag-pill'
import type { SketchSummary, EngineType } from '@/lib/studio/types'
import { SketchCard } from './SketchCard'

type SortMode = 'recent' | 'popular' | 'trending'

interface SketchGalleryProps {
  initialSketches: SketchSummary[]
  initialTotal: number
  initialNextCursor?: string | null
  className?: string
}

const PAGE_SIZE = 24

const ENGINE_LABELS: Record<string, string> = {
  all: 'All',
  p5js: 'p5.js',
  glsl: 'GLSL',
  webgpu: 'WebGPU',
}

const ENGINE_OPTIONS = ['all', 'p5js', 'glsl', 'webgpu'] as const
const SORT_OPTIONS = ['recent', 'popular', 'trending'] as const

export function SketchGallery({
  initialSketches,
  initialTotal,
  initialNextCursor = null,
  className,
}: SketchGalleryProps) {
  const [sketches, setSketches] = React.useState<SketchSummary[]>(initialSketches)
  const [total, setTotal] = React.useState(initialTotal)
  const [nextCursor, setNextCursor] = React.useState<string | null>(initialNextCursor)

  const [sort, setSort] = React.useState<SortMode>('recent')
  const [search, setSearch] = React.useState('')
  const [debouncedSearch, setDebouncedSearch] = React.useState('')
  const [engine, setEngine] = React.useState<EngineType | undefined>(undefined)
  const [activeTag, setActiveTag] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const searchInputId = React.useId()

  const sentinelRef = React.useRef<HTMLDivElement>(null)
  const initialFilterRef = React.useRef(true)
  const abortControllerRef = React.useRef<AbortController | null>(null)
  const loadingRef = React.useRef(false)

  const hasMore = nextCursor !== null

  // Collect unique tags from currently loaded sketches
  const allTags = React.useMemo(() => {
    const tagSet = new Set<string>()
    for (const s of sketches) {
      for (const t of s.tags) tagSet.add(t)
    }
    return Array.from(tagSet).sort()
  }, [sketches])

  // Debounce search input (300ms)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Fetch sketches from API
  const fetchSketches = React.useCallback(
    async (
      params: {
        sort: SortMode
        search?: string
        engine?: EngineType
        tag?: string
        offset?: number
        cursor?: string
      },
      append = false
    ) => {
      // Cancel any in-flight request
      abortControllerRef.current?.abort()
      const controller = new AbortController()
      abortControllerRef.current = controller

      loadingRef.current = true
      setLoading(true)

      try {
        const url = new URL('/api/studio/sketches', window.location.origin)
        url.searchParams.set('sort', params.sort)
        url.searchParams.set('limit', String(PAGE_SIZE))

        if (params.cursor) {
          url.searchParams.set('cursor', params.cursor)
        } else {
          url.searchParams.set('offset', String(params.offset ?? 0))
        }

        if (params.search) url.searchParams.set('search', params.search)
        if (params.engine) url.searchParams.set('engine', params.engine)
        if (params.tag) url.searchParams.set('tag', params.tag)

        const res = await fetch(url, { signal: controller.signal })

        if (!res.ok) {
          console.error('Failed to fetch sketches:', res.status)
          return
        }

        const data: {
          sketches: SketchSummary[]
          total: number
          nextCursor?: string | null
        } = await res.json()

        if (append) {
          setSketches((prev) => [...prev, ...data.sketches])
        } else {
          setSketches(data.sketches)
        }
        setTotal(data.total)
        setNextCursor(data.nextCursor ?? null)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        console.error('Error fetching sketches:', err)
      } finally {
        if (!controller.signal.aborted) {
          loadingRef.current = false
          setLoading(false)
        }
      }
    },
    []
  )

  // Load more (append) for infinite scroll
  const loadMore = React.useCallback(() => {
    if (loadingRef.current || !hasMore) return

    fetchSketches(
      {
        sort,
        search: debouncedSearch || undefined,
        engine,
        tag: activeTag ?? undefined,
        offset: nextCursor ? undefined : sketches.length,
        cursor: nextCursor ?? undefined,
      },
      true
    )
  }, [hasMore, fetchSketches, sort, debouncedSearch, engine, activeTag, sketches.length, nextCursor])
  const loadMoreRef = React.useRef(loadMore)
  loadMoreRef.current = loadMore

  // Re-fetch when filters change (not on initial mount since we have SSR data)
  React.useEffect(() => {
    if (initialFilterRef.current) {
      initialFilterRef.current = false
      return
    }

    fetchSketches({
      sort,
      search: debouncedSearch || undefined,
      engine,
      tag: activeTag ?? undefined,
      offset: 0,
    })
  }, [sort, debouncedSearch, engine, activeTag, fetchSketches])

  // IntersectionObserver for infinite scroll
  React.useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreRef.current()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  const sketchItems = React.useMemo(
    () =>
      sketches.map((sketch, i) => (
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
      )),
    [sketches]
  )

  return (
    <div className={cn('space-y-4', className)}>
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <label htmlFor={searchInputId} className="sr-only">
            Search sketches
          </label>
          <input
            id={searchInputId}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sketches..."
            className="h-10 w-full rounded-lg border border-input bg-background/50 pl-10 pr-4 text-sm shadow-sm backdrop-blur-sm placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent transition-shadow duration-200"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Engine filter */}
          <div className="flex gap-0.5 rounded-lg bg-muted/50 p-0.5">
            {ENGINE_OPTIONS.map((eng) => (
              <Button
                key={eng}
                variant={engine === (eng === 'all' ? undefined : eng) ? 'secondary' : 'ghost'}
                size="sm"
                className={cn(
                  'h-8 rounded-md text-xs font-medium transition-all',
                  engine === (eng === 'all' ? undefined : eng) && 'shadow-sm'
                )}
                onClick={() => setEngine(eng === 'all' ? undefined : eng)}
              >
                {ENGINE_LABELS[eng]}
              </Button>
            ))}
          </div>

          <div className="mx-1 h-5 w-px bg-border/60" />

          {/* Sort buttons */}
          <div className="flex gap-0.5 rounded-lg bg-muted/50 p-0.5">
            {SORT_OPTIONS.map((s) => (
              <Button
                key={s}
                variant={sort === s ? 'secondary' : 'ghost'}
                size="sm"
                className={cn(
                  'h-8 rounded-md text-xs font-medium transition-all',
                  sort === s && 'shadow-sm'
                )}
                onClick={() => setSort(s)}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Tags */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <TagPill
            tag="All"
            variant={activeTag === null ? 'active' : 'interactive'}
            onClick={() => setActiveTag(null)}
          />
          {allTags.map((tag) => (
            <TagPill
              key={tag}
              tag={tag}
              variant={activeTag === tag ? 'active' : 'interactive'}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            />
          ))}
        </div>
      )}

      {/* Results count */}
      {(debouncedSearch || activeTag || engine) && (
        <p className="text-sm text-muted-foreground">
          {total} {total === 1 ? 'sketch' : 'sketches'} found
        </p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">{sketchItems}</AnimatePresence>
      </div>

      {/* Empty state */}
      {sketches.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/30 py-20 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/80">
            <svg
              className="h-10 w-10 text-muted-foreground/40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold">No sketches found</h3>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            {debouncedSearch || activeTag || engine
              ? 'Try adjusting your search or filters'
              : 'Be the first to create something amazing'}
          </p>
          {!debouncedSearch && !activeTag && !engine && (
            <Button asChild className="mt-6 shadow-sm">
              <Link href="/studio/new">Create a Sketch</Link>
            </Button>
          )}
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-1" />
    </div>
  )
}
