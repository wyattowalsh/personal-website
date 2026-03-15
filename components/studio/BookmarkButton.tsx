'use client'

import * as React from 'react'
import { Bookmark, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface BookmarkButtonProps {
  sketchId: string
  initialBookmarked: boolean
  currentUserId?: string | null
  className?: string
}

export function BookmarkButton({ sketchId, initialBookmarked, currentUserId, className }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = React.useState(initialBookmarked)
  const [loading, setLoading] = React.useState(false)

  const handleToggle = async () => {
    if (!currentUserId || loading) return

    const prev = bookmarked
    setBookmarked(!prev)
    setLoading(true)

    try {
      const res = await fetch(`/api/studio/sketches/${sketchId}/bookmark`, {
        method: 'POST',
      })
      if (!res.ok) {
        setBookmarked(prev)
      }
    } catch {
      setBookmarked(prev)
    } finally {
      setLoading(false)
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn('gap-1.5 px-2', className)}
            onClick={handleToggle}
            disabled={!currentUserId || loading}
            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
            ) : (
              <Bookmark
                className={cn(
                  'h-4 w-4 transition-colors',
                  bookmarked
                    ? 'fill-foreground text-foreground'
                    : 'text-muted-foreground'
                )}
              />
            )}
          </Button>
        </TooltipTrigger>
        {!currentUserId && (
          <TooltipContent>Sign in to bookmark</TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )
}
