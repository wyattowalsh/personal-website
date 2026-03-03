'use client'

import * as React from 'react'

interface SketchViewTrackerProps {
  sketchId: string
}

export function SketchViewTracker({ sketchId }: SketchViewTrackerProps) {
  React.useEffect(() => {
    fetch(`/api/studio/sketches/${sketchId}/view`, {
      method: 'POST',
      keepalive: true,
      cache: 'no-store',
    }).catch(() => {})
  }, [sketchId])

  return null
}
