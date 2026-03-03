'use client'

import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Sketch } from '@/lib/studio/types'

interface EmbedCanvasProps {
  sketch: Sketch
}

export function EmbedCanvas({ sketch }: EmbedCanvasProps) {
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null)
  const [loaded, setLoaded] = React.useState(false)

  React.useEffect(() => {
    if (!loaded || !iframeRef.current) return

    iframeRef.current.contentWindow?.postMessage(
      { type: 'sketch:run', code: sketch.code },
      window.location.origin
    )
  }, [loaded, sketch.code])

  const handleLoad = React.useCallback(() => {
    setLoaded(true)
  }, [])

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <iframe
        ref={iframeRef}
        src="/studio/sandbox.html"
        sandbox="allow-scripts"
        className="h-full w-full border-0"
        title={sketch.title}
        onLoad={handleLoad}
      />

      {/* Watermark link */}
      <Link
        href={`/studio/${sketch.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'absolute bottom-2 right-2 z-10',
          'rounded-full bg-black/60 px-2.5 py-1',
          'text-[10px] text-white/70 no-underline',
          'backdrop-blur-sm transition-colors',
          'hover:bg-black/80 hover:text-white'
        )}
      >
        w4w.dev/studio
      </Link>
    </div>
  )
}
