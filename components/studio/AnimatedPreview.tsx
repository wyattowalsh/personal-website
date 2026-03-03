'use client'

import * as React from 'react'
import Image from 'next/image'
import type { EngineType } from '@/lib/studio/types'

interface AnimatedPreviewProps {
  code: string
  engine: EngineType
  thumbnailUrl?: string
}

export function AnimatedPreview({
  code,
  engine: _engine,
  thumbnailUrl,
}: AnimatedPreviewProps) {
  const [isHovered, setIsHovered] = React.useState(false)
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null)
  const [prefersReduced, setPrefersReduced] = React.useState(false)

  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Send code on hover
  React.useEffect(() => {
    if (!isHovered || prefersReduced || !iframeRef.current) return

    const iframe = iframeRef.current
    const onLoad = () => {
      iframe.contentWindow?.postMessage(
        { type: 'sketch:run', code },
        '*'
      )
    }
    iframe.addEventListener('load', onLoad)

    return () => {
      iframe.removeEventListener('load', onLoad)
      iframe.contentWindow?.postMessage({ type: 'sketch:stop' }, '*')
    }
  }, [isHovered, prefersReduced, code])

  if (prefersReduced) {
    return thumbnailUrl ? (
      <Image
        src={thumbnailUrl}
        alt="Sketch preview"
        fill
        className="object-cover"
      />
    ) : null
  }

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {thumbnailUrl && !isHovered && (
        <Image
          src={thumbnailUrl}
          alt="Sketch preview"
          fill
          className="object-cover"
        />
      )}
      {isHovered && (
        <iframe
          ref={iframeRef}
          src="/studio/sandbox.html"
          sandbox="allow-scripts"
          className="h-full w-full border-0"
          style={{ width: 200, height: 150 }}
          title="Animated preview"
        />
      )}
    </div>
  )
}
