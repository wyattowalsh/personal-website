'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { getEngineColor, createEngineLabel } from '@/lib/studio/engine-adapter'
import { getFpsColor } from './FpsOverlay'
import type { EngineType, SketchConfig } from '@/lib/studio/types'

export type PreviewBackground = 'dark' | 'light' | 'checkerboard' | 'transparent'

interface PreviewChromeProps {
  engine: EngineType
  config: SketchConfig
  fps?: number
  previewBg: PreviewBackground
  onPreviewBgChange: (bg: PreviewBackground) => void
  children: React.ReactNode
  className?: string
}

const bgStyles: Record<PreviewBackground, string> = {
  dark: 'bg-neutral-900',
  light: 'bg-white',
  checkerboard: '',
  transparent: 'bg-transparent',
}

export function PreviewChrome({
  engine,
  config,
  fps,
  previewBg,
  onPreviewBgChange: _onPreviewBgChange,
  children,
  className,
}: PreviewChromeProps) {
  const engineColor = getEngineColor(engine)
  const engineLabel = createEngineLabel(engine)

  return (
    <div className={cn('relative flex flex-col', className)}>
      {/* Top info bar */}
      <div className="flex items-center gap-3 border-b border-border/60 bg-background/70 px-2.5 py-1 text-[10px] font-mono text-muted-foreground/90">
        {/* Engine badge */}
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: engineColor }}
          />
          {engineLabel}
        </span>

        {/* Dimensions */}
        <span>{config.width}&times;{config.height}</span>

        {/* FPS counter */}
        {fps != null && (
          <span className={cn('ml-auto tabular-nums', getFpsColor(fps))}>
            {fps} fps
          </span>
        )}
      </div>

      {/* Canvas frame */}
      <div
        className={cn(
          'relative overflow-hidden rounded-md border border-border/60',
          bgStyles[previewBg],
        )}
        style={
          previewBg === 'checkerboard'
            ? {
                backgroundImage:
                  'repeating-conic-gradient(rgba(128,128,128,0.12) 0% 25%, transparent 0% 50%)',
                backgroundSize: '16px 16px',
              }
            : undefined
        }
      >
        {children}
      </div>
    </div>
  )
}
