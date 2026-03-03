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
      'flex items-center gap-2 border-t border-white/[0.06] bg-background/60 px-3 py-0.5 text-[11px] text-muted-foreground backdrop-blur-sm',
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
      <span className="rounded-full bg-muted/40 px-2 py-0.5">
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
          'rounded-full px-2 py-0.5',
          saveStatus === 'error' && 'bg-destructive/10 text-destructive',
          saveStatus === 'saved' && 'bg-emerald-500/10 text-emerald-500',
          saveStatus === 'saving' && 'bg-muted/40'
        )}>
          {saveLabel}
        </span>
      )}

      {/* AI autocomplete toggle */}
      {onToggleAiAutoMode !== undefined && (
        <button
          type="button"
          onClick={onToggleAiAutoMode}
          title={aiAutoMode ? 'AI autocomplete: on (click to disable)' : 'AI autocomplete: off (click to enable)'}
          className={cn(
            'flex items-center gap-1 rounded-full px-2 py-0.5 transition-colors',
            aiAutoMode
              ? 'bg-violet-500/10 text-violet-500 hover:text-violet-400'
              : 'hover:bg-muted/40 hover:text-foreground'
          )}
        >
          <Sparkles className="h-3 w-3" />
          <span>AI</span>
        </button>
      )}
    </div>
  )
}
