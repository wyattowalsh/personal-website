'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { SketchPreview } from '@/components/studio/SketchPreview'
import { ShaderPreview } from '@/components/studio/ShaderPreview'
import { WebGPUPreview } from '@/components/studio/WebGPUPreview'
import type { SketchPreviewHandle } from '@/components/studio/SketchPreview'
import type { ShaderPreviewHandle } from '@/components/studio/ShaderPreview'
import type { WebGPUPreviewHandle } from '@/components/studio/WebGPUPreview'
import type { SketchConfig, EngineType, ConsoleEntry } from '@/lib/studio/types'

export interface UnifiedPreviewHandle {
  capture: () => void
  captureSvg?: () => void
}

interface UnifiedPreviewProps {
  engine: EngineType
  code: string
  transformedCode: string
  config: SketchConfig
  isRunning: boolean
  onConsole: (entry: ConsoleEntry) => void
  onError: (error: string, line?: number) => void
  onCapture: (dataUrl: string) => void
  onCaptureSvg?: (svg: string) => void
  onCrash: () => void
  onFps?: (fps: number) => void
  className?: string
}

export const UnifiedPreview = React.forwardRef<UnifiedPreviewHandle, UnifiedPreviewProps>(
  function UnifiedPreview(
    {
      engine,
      code,
      transformedCode,
      config,
      isRunning,
      onConsole,
      onError,
      onCapture,
      onCaptureSvg,
      onCrash,
      onFps: _onFps,
      className,
    },
    ref,
  ) {
    const sketchRef = React.useRef<SketchPreviewHandle>(null)
    const shaderRef = React.useRef<ShaderPreviewHandle>(null)
    const webgpuRef = React.useRef<WebGPUPreviewHandle>(null)

    React.useImperativeHandle(
      ref,
      () => ({
        capture: () => {
          switch (engine) {
            case 'p5js':
              sketchRef.current?.capture()
              break
            case 'glsl':
              shaderRef.current?.capture()
              break
            case 'webgpu':
              webgpuRef.current?.capture()
              break
          }
        },
        captureSvg:
          engine === 'p5js'
            ? () => {
                sketchRef.current?.captureSvg()
              }
            : undefined,
      }),
      [engine],
    )

    return (
      <div className={cn('relative overflow-hidden', className)}>
        <AnimatePresence mode="wait">
          {engine === 'p5js' && (
            <motion.div
              key="p5js"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full w-full"
            >
              <SketchPreview
                ref={sketchRef}
                code={transformedCode}
                config={config}
                isRunning={isRunning}
                onConsole={onConsole}
                onError={onError}
                onCapture={onCapture}
                onCaptureSvg={onCaptureSvg}
                onCrash={onCrash}
                className="h-full w-full"
              />
            </motion.div>
          )}

          {engine === 'glsl' && (
            <motion.div
              key="glsl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full w-full"
            >
              <ShaderPreview
                ref={shaderRef}
                code={code}
                config={config}
                isRunning={isRunning}
                onError={onError}
                onCapture={onCapture}
                className="h-full w-full"
              />
            </motion.div>
          )}

          {engine === 'webgpu' && (
            <motion.div
              key="webgpu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full w-full"
            >
              <WebGPUPreview
                ref={webgpuRef}
                code={code}
                config={config}
                isRunning={isRunning}
                onError={onError}
                onCapture={onCapture}
                className="h-full w-full"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  },
)
