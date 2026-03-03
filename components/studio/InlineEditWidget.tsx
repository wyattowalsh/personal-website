'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InlineEditWidgetProps {
  onSubmit: (instruction: string) => void
  onAccept: () => void
  onReject: () => void
  onDismiss: () => void
  state: 'prompt' | 'generating' | 'diff'
}

/**
 * Inline edit widget rendered inside a Monaco ContentWidget via createRoot().
 *
 * IMPORTANT: This component runs in an isolated React tree — CSS custom variables
 * propagate through the DOM so Tailwind theme classes work, but React context
 * does NOT. Never use useTheme(), useContext(), or any provider-dependent hooks.
 */
export function InlineEditWidget({
  onSubmit,
  onAccept,
  onReject,
  onDismiss,
  state,
}: InlineEditWidgetProps) {
  const [instruction, setInstruction] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Auto-focus the input when the widget mounts or returns to prompt state
  React.useEffect(() => {
    if (state === 'prompt') {
      // Defer focus to ensure the DOM node is attached to the editor
      const id = requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
      return () => cancelAnimationFrame(id)
    }
  }, [state])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && instruction.trim()) {
      e.preventDefault()
      e.stopPropagation()
      onSubmit(instruction.trim())
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      onDismiss()
    }
  }

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 rounded-md border border-border',
        'bg-background px-2 py-1 shadow-md',
        'text-sm font-sans',
      )}
      // Prevent Monaco from stealing keyboard events inside the widget
      onKeyDown={(e) => e.stopPropagation()}
    >
      {state === 'prompt' && (
        <>
          <input
            ref={inputRef}
            type="text"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe edit..."
            aria-label="Edit instruction"
            className={cn(
              'h-6 w-56 rounded border-none bg-transparent px-1',
              'text-foreground placeholder:text-muted-foreground',
              'outline-none ring-0 focus:ring-0',
            )}
          />
          <button
            type="button"
            onClick={() => {
              if (instruction.trim()) onSubmit(instruction.trim())
            }}
            disabled={!instruction.trim()}
            className={cn(
              'flex h-6 w-6 shrink-0 items-center justify-center rounded',
              'bg-primary text-primary-foreground',
              'hover:bg-primary/90 disabled:opacity-40',
              'transition-colors',
            )}
            aria-label="Submit edit instruction"
          >
            <ArrowIcon />
          </button>
        </>
      )}

      {state === 'generating' && (
        <div className="flex items-center gap-2 px-1 py-0.5">
          <SpinnerIcon />
          <span className="text-xs text-muted-foreground">Editing...</span>
        </div>
      )}

      {state === 'diff' && (
        <div className="flex items-center gap-1 px-0.5">
          <button
            type="button"
            onClick={onAccept}
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded',
              'text-emerald-500 hover:bg-emerald-500/10',
              'transition-colors',
            )}
            aria-label="Accept edit"
          >
            <CheckIcon />
          </button>
          <button
            type="button"
            onClick={onReject}
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded',
              'text-red-500 hover:bg-red-500/10',
              'transition-colors',
            )}
            aria-label="Reject edit"
          >
            <XIcon />
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Inline SVG icons (avoids importing lucide-react into the isolated tree) ──

function ArrowIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="animate-spin"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
