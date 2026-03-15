'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface Variation {
  text: string
  isLoading: boolean
}

export interface VariationsPickerProps {
  variations: Variation[]
  activeIndex: number
  onSelect: (index: number) => void
  onInsert: () => void
  onDismiss: () => void
}

/**
 * Floating panel rendered into a Monaco ContentWidget via createRoot().
 *
 * IMPORTANT: This component runs in an isolated React tree (no providers).
 * CSS custom variables propagate through the DOM so Tailwind theme classes work,
 * but React context does NOT. Never use useTheme(), useContext(), etc.
 */
export function VariationsPicker({
  variations,
  activeIndex,
  onSelect,
  onInsert,
  onDismiss,
}: VariationsPickerProps) {
  const total = variations.length
  const current = variations[activeIndex]

  const goPrev = React.useCallback(() => {
    onSelect((activeIndex - 1 + total) % total)
  }, [activeIndex, total, onSelect])

  const goNext = React.useCallback(() => {
    onSelect((activeIndex + 1) % total)
  }, [activeIndex, total, onSelect])

  // Keyboard shortcuts scoped to the panel DOM node
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        e.stopPropagation()
        onInsert()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        onDismiss()
      }
    },
    [onInsert, onDismiss],
  )

  return (
    <div
      className={cn(
        'w-[300px] rounded-lg border shadow-lg',
        'bg-popover text-popover-foreground border-border',
        'flex flex-col overflow-hidden',
      )}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-xs font-semibold">Variations</span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={goPrev}
            className={cn(
              'inline-flex h-5 w-5 items-center justify-center rounded',
              'hover:bg-accent hover:text-accent-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
              'text-muted-foreground transition-colors',
            )}
            aria-label="Previous variation"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <span className="min-w-[28px] text-center text-xs tabular-nums text-muted-foreground">
            {activeIndex + 1}/{total}
          </span>
          <button
            type="button"
            onClick={goNext}
            className={cn(
              'inline-flex h-5 w-5 items-center justify-center rounded',
              'hover:bg-accent hover:text-accent-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
              'text-muted-foreground transition-colors',
            )}
            aria-label="Next variation"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content preview */}
      <div className="min-h-[80px] px-3 py-2">
        {current?.isLoading && !current.text ? (
          <div className="flex items-center gap-2 py-4 text-xs text-muted-foreground">
            <svg className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <span>Generating variation {activeIndex + 1}...</span>
          </div>
        ) : (
          <div className="relative">
            <pre
              className={cn(
                'whitespace-pre-wrap break-words font-mono text-xs leading-relaxed',
                'line-clamp-5',
                current?.isLoading && 'opacity-70',
              )}
            >
              {current?.text || ''}
            </pre>
            {current?.isLoading && (
              <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <svg className="h-3 w-3 animate-spin motion-reduce:animate-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                <span>Streaming...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border px-3 py-2">
        <div className="flex gap-3 text-[10px] text-muted-foreground">
          <span>
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">
              Alt+[/]
            </kbd>{' '}
            cycle
          </span>
          <span>
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">
              Enter
            </kbd>{' '}
            insert
          </span>
          <span>
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">
              Esc
            </kbd>{' '}
            cancel
          </span>
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={onDismiss}
            className={cn(
              'rounded px-2 py-1 text-xs',
              'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
              'transition-colors',
            )}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onInsert}
            disabled={!current?.text}
            className={cn(
              'rounded px-2 py-1 text-xs font-medium',
              'bg-primary text-primary-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
              'hover:bg-primary/90 transition-colors',
              'disabled:opacity-50 disabled:pointer-events-none',
            )}
          >
            Insert
          </button>
        </div>
      </div>
    </div>
  )
}
