'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

const FPS_SAMPLE_INTERVAL = 500

/**
 * Standalone hook that measures FPS via requestAnimationFrame.
 * Recalculates every 500ms for a stable reading.
 */
export function useFpsCounter(): number {
  const [fps, setFps] = React.useState(0)
  const framesRef = React.useRef(0)
  const lastTimeRef = React.useRef(0)
  const rafRef = React.useRef(0)

  React.useEffect(() => {
    lastTimeRef.current = performance.now()
    framesRef.current = 0

    const tick = (now: number) => {
      framesRef.current++
      const elapsed = now - lastTimeRef.current

      if (elapsed >= FPS_SAMPLE_INTERVAL) {
        const measured = Math.round((framesRef.current / elapsed) * 1000)
        setFps(measured)
        framesRef.current = 0
        lastTimeRef.current = now
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return fps
}

export function getFpsColor(fps: number): string {
  if (fps >= 55) return 'text-emerald-400'
  if (fps >= 30) return 'text-amber-400'
  return 'text-red-400'
}

interface FpsOverlayProps {
  onFps?: (fps: number) => void
  className?: string
}

export function FpsOverlay({ onFps, className }: FpsOverlayProps) {
  const fps = useFpsCounter()

  // Share measured fps with parent when callback is provided
  React.useEffect(() => {
    onFps?.(fps)
  }, [fps, onFps])

  return (
    <div
      className={cn(
        'absolute right-2 top-2 z-10 rounded-full bg-black/40 px-2 py-0.5 font-mono text-[10px] backdrop-blur-sm',
        getFpsColor(fps),
        className,
      )}
    >
      {fps} fps
    </div>
  )
}
