'use client'

import * as React from 'react'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EngineBadge } from './EngineBadge'
import { getFpsColor } from './FpsOverlay'
import type { EngineType } from '@/lib/studio/types'

interface StatusBarProps {
  cursorLine: number
  cursorColumn: number
  lineCount: number
  engine: EngineType
  onEngineChange: (engine: EngineType) => void
  autoDetectEnabled: boolean
  onToggleAutoDetect: () => void
  wasAutoDetected?: boolean
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error'
  codeSize: number
  fps?: number
  className?: string
  aiAutoMode?: boolean
  onToggleAiAutoMode?: () => void
}

export function StatusBar({
  cursorLine,
  cursorColumn,
  lineCount,
  engine,
  onEngineChange,
  autoDetectEnabled,
  onToggleAutoDetect,
  wasAutoDetected,
  saveStatus,
  codeSize,
  fps,
  className,
  aiAutoMode,
  onToggleAiAutoMode,
}: StatusBarProps) {
  const sizeLabel = codeSize < 1024
    ? `${codeSize} B`
    : `${(codeSize / 1024).toFixed(1)} KB`

  const saveLabel = saveStatus === 'saving' ? 'Saving...'
    : saveStatus === 'saved' ? 'Saved'
    : saveStatus === 'error' ? 'Save failed'
    : null

  return (
    <div className={cn(
      'flex items-center gap-2 border-t border-border/60 bg-background/70 px-3 py-1 text-[11px] text-muted-foreground',
      className
    )}>
      {/* Engine badge */}
      <EngineBadge
        engine={engine}
        onChange={onEngineChange}
        autoDetectEnabled={autoDetectEnabled}
        onToggleAutoDetect={onToggleAutoDetect}
        wasAutoDetected={wasAutoDetected}
      />

      {/* Cursor position */}
      <span className="rounded-md border border-border/60 bg-muted/25 px-1.5 py-0.5">
        Ln {cursorLine}, Col {cursorColumn}
      </span>

      {/* Line count */}
      <span className="hidden sm:inline">{lineCount} lines</span>

      {/* Code size */}
      <span className="hidden sm:inline">{sizeLabel}</span>

      {/* FPS */}
      {fps != null && (
        <span className={cn('tabular-nums', getFpsColor(fps))}>
          {fps} fps
        </span>
      )}

      <div className="flex-1" />

      {/* Save status */}
      {saveLabel && (
        <span className={cn(
          'rounded-md border px-1.5 py-0.5',
          saveStatus === 'error' && 'border-destructive/40 bg-destructive/10 text-destructive',
          saveStatus === 'saved' && 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
          saveStatus === 'saving' && 'border-border/60 bg-muted/25'
        )}>
          {saveLabel}
        </span>
      )}

      {/* AI autocomplete toggle */}
      {onToggleAiAutoMode !== undefined && (
        <button
          type="button"
          onClick={onToggleAiAutoMode}
          aria-pressed={aiAutoMode}
          aria-label={aiAutoMode ? 'Disable AI autocomplete' : 'Enable AI autocomplete'}
          title={aiAutoMode ? 'AI autocomplete: on (click to disable)' : 'AI autocomplete: off (click to enable)'}
          className={cn(
            'flex items-center gap-1 rounded-md border px-1.5 py-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
            aiAutoMode
              ? 'border-violet-500/40 bg-violet-500/10 text-violet-700 hover:bg-violet-500/15 dark:text-violet-300'
              : 'border-transparent hover:border-border/60 hover:bg-muted/25 hover:text-foreground'
          )}
        >
          <Sparkles className="h-3 w-3" />
          <span>AI</span>
        </button>
      )}
    </div>
  )
}
