'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  STUDIO_WATCHDOG_TIMEOUT_MS,
  STUDIO_HEARTBEAT_INTERVAL_MS,
} from '@/lib/constants'
import type { ConsoleEntry, SketchConfig, SandboxResponse } from '@/lib/studio/types'

export interface SketchPreviewHandle {
  capture: () => void
  captureSvg: () => void
}

interface SketchPreviewProps {
  code: string
  config: SketchConfig
  isRunning: boolean
  onConsole: (entry: ConsoleEntry) => void
  onError: (error: string) => void
  onCapture: (dataUrl: string) => void
  onCaptureSvg?: (svg: string) => void
  onCrash: () => void
  className?: string
}

export const SketchPreview = React.forwardRef<SketchPreviewHandle, SketchPreviewProps>(function SketchPreview({
  code,
  config,
  isRunning,
  onConsole,
  onError,
  onCapture,
  onCaptureSvg,
  onCrash,
  className,
}, ref) {
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null)
  const watchdogRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastHeartbeatRef = React.useRef<number>(Date.now())

  // Stable callback refs
  const onConsoleRef = React.useRef(onConsole)
  onConsoleRef.current = onConsole
  const onErrorRef = React.useRef(onError)
  onErrorRef.current = onError
  const onCaptureRef = React.useRef(onCapture)
  onCaptureRef.current = onCapture
  const onCaptureSvgRef = React.useRef(onCaptureSvg)
  onCaptureSvgRef.current = onCaptureSvg
  const onCrashRef = React.useRef(onCrash)
  onCrashRef.current = onCrash

  const clearWatchdog = React.useCallback(() => {
    if (watchdogRef.current) {
      clearInterval(watchdogRef.current)
      watchdogRef.current = null
    }
  }, [])

  const postToSandbox = React.useCallback(
    (msg: Record<string, unknown>) => {
      iframeRef.current?.contentWindow?.postMessage(msg, '*')
    },
    []
  )

  React.useImperativeHandle(ref, () => ({
    capture: () => postToSandbox({ type: 'sketch:capture' }),
    captureSvg: () => postToSandbox({ type: 'sketch:capture-svg' }),
  }), [postToSandbox])

  // Message listener
  React.useEffect(() => {
    const handler = (event: MessageEvent) => {
      // Sandboxed iframes without allow-same-origin have origin "null"
      if (event.origin !== 'null') return

      const data = event.data as SandboxResponse
      if (!data?.type) return

      switch (data.type) {
        case 'sandbox:ready':
          // Sandbox loaded, send initial config
          break
        case 'sandbox:heartbeat':
          lastHeartbeatRef.current = Date.now()
          break
        case 'sandbox:console':
          if (data.entries) {
            for (const entry of data.entries) {
              onConsoleRef.current(entry)
            }
          }
          break
        case 'sandbox:error':
          if (data.error) onErrorRef.current(data.error)
          break
        case 'sandbox:capture':
          if (data.dataUrl) onCaptureRef.current(data.dataUrl as string)
          break
        case 'sandbox:capture-svg':
          if (data.svg && onCaptureSvgRef.current) onCaptureSvgRef.current(data.svg as string)
          break
      }
    }

    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  // Run / stop sketch
  React.useEffect(() => {
    if (isRunning) {
      postToSandbox({
        type: 'sketch:configure',
        config,
      })
      postToSandbox({
        type: 'sketch:run',
        code,
      })

      // Start watchdog
      lastHeartbeatRef.current = Date.now()
      clearWatchdog()
      watchdogRef.current = setInterval(() => {
        const elapsed = Date.now() - lastHeartbeatRef.current
        if (elapsed > STUDIO_WATCHDOG_TIMEOUT_MS) {
          clearWatchdog()
          onCrashRef.current()
        }
      }, STUDIO_HEARTBEAT_INTERVAL_MS)
    } else {
      postToSandbox({ type: 'sketch:stop' })
      clearWatchdog()
    }

    return clearWatchdog
  }, [isRunning, code, config, postToSandbox, clearWatchdog])

  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden bg-black',
        className
      )}
      style={{ backgroundColor: config.backgroundColor }}
    >
      <iframe
        ref={iframeRef}
        src="/studio/sandbox.html"
        sandbox="allow-scripts"
        className="border-0"
        style={{
          width: config.width,
          height: config.height,
        }}
        title="Sketch preview"
      />
    </div>
  )
})
