'use client'

import { useCallback, useEffect, useRef } from 'react'
import { detectEngine } from '@/lib/studio/engine-detect'
import type { EngineType } from '@/lib/studio/types'
import {
  STUDIO_ENGINE_DETECT_DEBOUNCE_MS,
  STUDIO_ENGINE_DETECT_THRESHOLD,
  STUDIO_ENGINE_DETECT_SUPPRESS_MS,
} from '@/lib/constants'

interface UseEngineDetectionOptions {
  code: string
  currentEngine: EngineType
  autoDetectEnabled: boolean
  onDetect: (engine: EngineType, confidence: number) => void
}

export function useEngineDetection({
  code,
  currentEngine,
  autoDetectEnabled,
  onDetect,
}: UseEngineDetectionOptions): {
  suppressDetection: () => void
} {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const suppressedUntilRef = useRef<number>(0)
  const onDetectRef = useRef(onDetect)
  onDetectRef.current = onDetect
  const currentEngineRef = useRef(currentEngine)
  currentEngineRef.current = currentEngine

  const suppressDetection = useCallback(() => {
    suppressedUntilRef.current = Date.now() + STUDIO_ENGINE_DETECT_SUPPRESS_MS
  }, [])

  useEffect(() => {
    if (!autoDetectEnabled) return

    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    timerRef.current = setTimeout(() => {
      timerRef.current = null

      // Skip if suppressed
      if (Date.now() < suppressedUntilRef.current) return

      const { engine, confidence } = detectEngine(code)

      // Only fire if different engine with sufficient confidence
      if (engine === currentEngineRef.current) return
      if (confidence < STUDIO_ENGINE_DETECT_THRESHOLD) return

      // WebGPU availability check
      if (engine === 'webgpu') {
        if (typeof navigator === 'undefined' || !navigator.gpu) return
      }

      onDetectRef.current(engine, confidence)
    }, STUDIO_ENGINE_DETECT_DEBOUNCE_MS)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [code, autoDetectEnabled])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [])

  return { suppressDetection }
}
