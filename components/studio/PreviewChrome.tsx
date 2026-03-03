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
      {/* Ambient engine glow */}
      <div
        className="absolute inset-0 -z-10 scale-150 opacity-[0.15] blur-3xl"
        style={{ backgroundColor: engineColor }}
        aria-hidden
      />

      {/* Top info bar */}
      <div className="flex items-center gap-3 bg-muted/30 px-2 py-1 text-[10px] font-mono text-foreground/80">
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
          'relative overflow-hidden rounded-md ring-1 ring-white/[0.06] dark:ring-white/[0.04]',
          bgStyles[previewBg],
        )}
        style={
          previewBg === 'checkerboard'
            ? {
                backgroundImage:
                  'repeating-conic-gradient(rgba(128,128,128,0.15) 0% 25%, transparent 0% 50%)',
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
