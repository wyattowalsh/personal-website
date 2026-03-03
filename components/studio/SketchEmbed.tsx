'use client'

import * as React from 'react'
import { Play, Pause } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { SketchEmbedFallback } from './SketchEmbedFallback'

interface SketchEmbedProps {
  id?: string
  code?: string
  height?: number
}

export function SketchEmbed({ id, code, height = 400 }: SketchEmbedProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null)
  const [isVisible, setIsVisible] = React.useState(false)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [loaded, setLoaded] = React.useState(false)

  // Lazy-load with IntersectionObserver
  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Send code to iframe when playing
  React.useEffect(() => {
    if (!isPlaying || !loaded || !iframeRef.current) return

    const resolvedCode = code ?? ''
    iframeRef.current.contentWindow?.postMessage(
      { type: 'sketch:run', code: resolvedCode },
      '*'
    )

    const iframe = iframeRef.current
    return () => {
      iframe?.contentWindow?.postMessage(
        { type: 'sketch:stop' },
        '*'
      )
    }
  }, [isPlaying, loaded, code])

  const handleIframeLoad = React.useCallback(() => {
    setLoaded(true)
  }, [])

  const togglePlay = () => setIsPlaying((p) => !p)

  return (
    <div
      ref={containerRef}
      className={cn(
        'not-prose relative my-4 overflow-hidden rounded-lg border border-border',
      )}
      style={{ height }}
    >
      {!isVisible ? (
        <SketchEmbedFallback onLoad={() => {}} />
      ) : (
        <>
          <iframe
            ref={iframeRef}
            src={id ? `/studio/embed/${id}` : '/studio/sandbox.html'}
            sandbox="allow-scripts"
            className="h-full w-full border-0"
            title="Sketch embed"
            onLoad={handleIframeLoad}
          />
          <div className="absolute bottom-2 right-2">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full bg-black/60 text-white hover:bg-black/80"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
