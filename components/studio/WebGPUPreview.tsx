'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import type { SketchConfig } from '@/lib/studio/types'

export interface WebGPUPreviewHandle {
  capture: () => void
}

interface WebGPUPreviewProps {
  code: string
  config: SketchConfig
  isRunning: boolean
  onError: (error: string, line?: number) => void
  onCapture: (dataUrl: string) => void
  className?: string
}

const FULLSCREEN_WGSL = `
@vertex
fn vs_main(@builtin(vertex_index) idx: u32) -> @builtin(position) vec4f {
  var pos = array<vec2f, 6>(
    vec2f(-1, -1), vec2f(1, -1), vec2f(-1, 1),
    vec2f(-1, 1), vec2f(1, -1), vec2f(1, 1),
  );
  return vec4f(pos[idx], 0, 1);
}
`

interface Uniforms {
  time: number
  resolution: [number, number]
  mouse: [number, number]
  frame_count: number
}

export const WebGPUPreview = React.forwardRef<WebGPUPreviewHandle, WebGPUPreviewProps>(function WebGPUPreview({
  code,
  config,
  isRunning,
  onError,
  onCapture,
  className,
}, ref) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const rafRef = React.useRef<number>(0)
  const deviceRef = React.useRef<GPUDevice | null>(null)
  const mouseRef = React.useRef<[number, number]>([0, 0])
  const [fpsDisplay, setFpsDisplay] = React.useState(0)

  const onErrorRef = React.useRef(onError)
  onErrorRef.current = onError
  const onCaptureRef = React.useRef(onCapture)
  onCaptureRef.current = onCapture
  const captureNextFrameRef = React.useRef(false)

  // Debounce code changes to avoid recompiling on every keystroke
  const [debouncedCode, setDebouncedCode] = React.useState(code)
  React.useEffect(() => {
    const timeout = setTimeout(() => setDebouncedCode(code), 300)
    return () => clearTimeout(timeout)
  }, [code])

  const captureFrame = React.useCallback(() => {
    // Schedule capture inside the render loop so toDataURL gets the current frame
    captureNextFrameRef.current = true
  }, [])

  React.useImperativeHandle(ref, () => ({
    capture: captureFrame,
  }), [captureFrame])

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = [
        e.clientX - rect.left,
        rect.height - (e.clientY - rect.top),
      ]
    }
    canvas.addEventListener('mousemove', onMouseMove)
    return () => canvas.removeEventListener('mousemove', onMouseMove)
  }, [])

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !isRunning) {
      cancelAnimationFrame(rafRef.current)
      return
    }

    if (!navigator.gpu) {
      onErrorRef.current('WebGPU is not supported in this browser')
      return
    }

    let cancelled = false

    async function init() {
      const adapter = await navigator.gpu.requestAdapter()
      if (!adapter || cancelled) {
        if (!cancelled) onErrorRef.current('No WebGPU adapter found')
        return
      }

      const device = await adapter.requestDevice()
      if (cancelled) {
        device.destroy()
        return
      }
      deviceRef.current = device

      const context = canvas!.getContext('webgpu')
      if (!context || cancelled) {
        if (!cancelled) onErrorRef.current('Could not get WebGPU context')
        return
      }

      const format = navigator.gpu.getPreferredCanvasFormat()
      context.configure({ device, format, alphaMode: 'premultiplied' })

      // Create uniform buffer
      const uniformBufferSize = 32 // 8 floats * 4 bytes
      const uniformBuffer = device.createBuffer({
        size: uniformBufferSize,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      })

      // Compile user fragment shader
      let fragmentModule: GPUShaderModule
      try {
        fragmentModule = device.createShaderModule({ code: debouncedCode })
        const info = await fragmentModule.getCompilationInfo()
        for (const msg of info.messages) {
          if (msg.type === 'error') {
            onErrorRef.current(msg.message, msg.lineNum)
            return
          }
        }
      } catch (err) {
        onErrorRef.current(String(err))
        return
      }

      // Compile vertex shader
      const vertexModule = device.createShaderModule({ code: FULLSCREEN_WGSL })

      // Bind group layout
      const bindGroupLayout = device.createBindGroupLayout({
        entries: [
          {
            binding: 0,
            visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
            buffer: { type: 'uniform' },
          },
        ],
      })

      const pipelineLayout = device.createPipelineLayout({
        bindGroupLayouts: [bindGroupLayout],
      })

      const pipeline = device.createRenderPipeline({
        layout: pipelineLayout,
        vertex: { module: vertexModule, entryPoint: 'vs_main' },
        fragment: {
          module: fragmentModule,
          entryPoint: 'fs_main',
          targets: [{ format }],
        },
        primitive: { topology: 'triangle-list' },
      })

      const bindGroup = device.createBindGroup({
        layout: bindGroupLayout,
        entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
      })

      const startTime = performance.now() / 1000
      let frame = 0
      let lastFpsTime = performance.now()
      let fpsFrames = 0

      const render = () => {
        if (cancelled) return

        const now = performance.now()
        const time = now / 1000 - startTime

        // Update uniforms
        const uniforms: Uniforms = {
          time,
          resolution: [config.width, config.height],
          mouse: mouseRef.current,
          frame_count: frame,
        }
        const data = new Float32Array([
          uniforms.time,
          0, // padding
          uniforms.resolution[0],
          uniforms.resolution[1],
          uniforms.mouse[0],
          uniforms.mouse[1],
          uniforms.frame_count,
          0, // padding
        ])
        device.queue.writeBuffer(uniformBuffer, 0, data)

        const encoder = device.createCommandEncoder()
        const pass = encoder.beginRenderPass({
          colorAttachments: [
            {
              view: context!.getCurrentTexture().createView(),
              clearValue: { r: 0, g: 0, b: 0, a: 1 },
              loadOp: 'clear',
              storeOp: 'store',
            },
          ],
        })
        pass.setPipeline(pipeline)
        pass.setBindGroup(0, bindGroup)
        pass.draw(6)
        pass.end()
        device.queue.submit([encoder.finish()])

        // Capture after submit — schedule for next frame when texture is presented
        if (captureNextFrameRef.current) {
          captureNextFrameRef.current = false
          requestAnimationFrame(() => {
            const dataUrl = canvas!.toDataURL('image/png')
            onCaptureRef.current(dataUrl)
          })
        }

        frame++
        fpsFrames++
        if (now - lastFpsTime >= 1000) {
          setFpsDisplay(fpsFrames)
          fpsFrames = 0
          lastFpsTime = now
        }

        rafRef.current = requestAnimationFrame(render)
      }

      rafRef.current = requestAnimationFrame(render)
    }

    init()

    return () => {
      cancelled = true
      cancelAnimationFrame(rafRef.current)
      deviceRef.current?.destroy()
      deviceRef.current = null
    }
  }, [debouncedCode, config, isRunning])

  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden',
        className
      )}
      style={{ backgroundColor: config.backgroundColor }}
    >
      <canvas
        ref={canvasRef}
        width={config.width * config.pixelDensity}
        height={config.height * config.pixelDensity}
        style={{ width: config.width, height: config.height }}
      />
      {isRunning && (
        <div className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[10px] text-white/70">
          {fpsDisplay} fps
        </div>
      )}
    </div>
  )
})
