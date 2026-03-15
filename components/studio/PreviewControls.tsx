'use client'

import * as React from 'react'
import { motion } from 'motion/react'
import { ZoomIn, ZoomOut, Grid3x3, Sun, Moon, Square, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { PreviewBackground } from './PreviewChrome'

const ZOOM_STEPS = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4] as const

interface PreviewControlsProps {
  zoom: number
  onZoomChange: (zoom: number) => void
  previewBg: PreviewBackground
  onPreviewBgChange: (bg: PreviewBackground) => void
  isRecording?: boolean
  onToggleRecording?: () => void
  className?: string
}

function nextZoomStep(current: number, direction: 'in' | 'out'): number {
  if (direction === 'in') {
    const next = ZOOM_STEPS.find((s) => s > current + 0.001)
    return next ?? ZOOM_STEPS[ZOOM_STEPS.length - 1]
  }
  const reversed = [...ZOOM_STEPS].reverse()
  const prev = reversed.find((s) => s < current - 0.001)
  return prev ?? ZOOM_STEPS[0]
}

const BG_OPTIONS: { value: PreviewBackground; icon: React.ElementType; label: string }[] = [
  { value: 'checkerboard', icon: Grid3x3, label: 'Checkerboard' },
  { value: 'dark', icon: Moon, label: 'Dark' },
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'transparent', icon: Square, label: 'Transparent' },
]

const AUTO_HIDE_DELAY = 2000

export function PreviewControls({
  zoom,
  onZoomChange,
  previewBg,
  onPreviewBgChange,
  isRecording,
  onToggleRecording,
  className,
}: PreviewControlsProps) {
  const [visible, setVisible] = React.useState(true)
  const timerRef = React.useRef<ReturnType<typeof setTimeout>>(null)
  const [recordSeconds, setRecordSeconds] = React.useState(0)
  const recordTimerRef = React.useRef<ReturnType<typeof setInterval>>(null)
  const focusWithinRef = React.useRef(false)

  const clearTimer = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // Auto-hide timer management
  const resetTimer = React.useCallback(() => {
    setVisible(true)
    clearTimer()
    if (focusWithinRef.current) return
    timerRef.current = setTimeout(() => setVisible(false), AUTO_HIDE_DELAY)
  }, [clearTimer])

  React.useEffect(() => {
    resetTimer()
    return clearTimer
  }, [resetTimer, clearTimer])

  // Track recording time
  React.useEffect(() => {
    if (isRecording) {
      setRecordSeconds(0)
      recordTimerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1)
      }, 1000)
    } else {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current)
      setRecordSeconds(0)
    }
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current)
    }
  }, [isRecording])

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleFocusCapture = React.useCallback(() => {
    focusWithinRef.current = true
    setVisible(true)
    clearTimer()
  }, [clearTimer])

  const handleBlurCapture = React.useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      const nextTarget = event.relatedTarget as Node | null
      if (nextTarget && event.currentTarget.contains(nextTarget)) return
      focusWithinRef.current = false
      resetTimer()
    },
    [resetTimer],
  )

  const zoomPercent = `${Math.round(zoom * 100)}%`

  return (
    <motion.div
      className={cn(
        'absolute bottom-3 left-1/2 z-10 -translate-x-1/2',
        className,
      )}
      onMouseMove={resetTimer}
      onMouseEnter={() => setVisible(true)}
      onFocusCapture={handleFocusCapture}
      onBlurCapture={handleBlurCapture}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.2 }}
    >
      <TooltipProvider delayDuration={300}>
        <div className="flex items-center gap-0.5 rounded-full border border-white/[0.06] bg-background/70 px-2 py-1 shadow-lg backdrop-blur-xl">
          {/* Zoom controls */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onZoomChange(nextZoomStep(zoom, 'out'))}
                disabled={zoom <= ZOOM_STEPS[0]}
                aria-label="Zoom out"
              >
                <ZoomOut className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom out</TooltipContent>
          </Tooltip>

          <button
            type="button"
            onClick={() => onZoomChange(1)}
            className="min-w-[3rem] rounded px-1 text-center font-mono text-[10px] text-foreground/80 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            title="Reset zoom to 100%"
            aria-label="Reset zoom to 100%"
          >
            {zoomPercent}
          </button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onZoomChange(nextZoomStep(zoom, 'in'))}
                disabled={zoom >= ZOOM_STEPS[ZOOM_STEPS.length - 1]}
                aria-label="Zoom in"
              >
                <ZoomIn className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom in</TooltipContent>
          </Tooltip>

          {/* Divider */}
          <div className="mx-1 h-4 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

          {/* Background selector */}
          {BG_OPTIONS.map(({ value, icon: Icon, label }) => (
            <Tooltip key={value}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-6 w-6',
                    previewBg === value && 'bg-primary/20 text-primary',
                    value === 'transparent' && 'border border-dashed border-muted-foreground/30',
                  )}
                  onClick={() => onPreviewBgChange(value)}
                  aria-label={`Set preview background to ${label.toLowerCase()}`}
                  aria-pressed={previewBg === value}
                >
                  <Icon className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{label}</TooltipContent>
            </Tooltip>
          ))}

          {/* Recording controls */}
          {onToggleRecording && (
            <>
              {/* Divider */}
              <div className="mx-1 h-4 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={onToggleRecording}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                      isRecording
                        ? 'bg-red-500/20 text-red-400'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {isRecording ? (
                      <>
                        <span className="inline-block h-1.5 w-1.5 animate-pulse motion-reduce:animate-none rounded-full bg-red-500" />
                        {formatTime(recordSeconds)}
                      </>
                    ) : (
                      <>
                        <Circle className="h-3 w-3 text-red-400" />
                        REC
                      </>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>{isRecording ? 'Stop recording' : 'Start recording'}</TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      </TooltipProvider>
    </motion.div>
  )
}
