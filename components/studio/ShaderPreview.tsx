'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import type { SketchConfig } from '@/lib/studio/types'

export interface ShaderPreviewHandle {
  capture: () => void
}

interface ShaderPreviewProps {
  code: string
  buffers?: Record<string, string>
  config: SketchConfig
  isRunning: boolean
  onError: (error: string, line?: number) => void
  onCapture: (dataUrl: string) => void
  className?: string
}

class ShaderError extends Error {
  line?: number
  constructor(message: string, line?: number) {
    super(message)
    this.name = 'ShaderError'
    this.line = line
  }
}

const VERTEX_SHADER = `#version 300 es
in vec4 a_position;
void main() {
  gl_Position = a_position;
}
`

const FULLSCREEN_QUAD = new Float32Array([
  -1, -1, 1, -1, -1, 1,
  -1, 1, 1, -1, 1, 1,
])

function parseErrorLine(log: string): number | undefined {
  const match = log.match(/ERROR:\s*\d+:(\d+)/)
  return match ? parseInt(match[1], 10) : undefined
}

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) ?? 'Unknown compile error'
    gl.deleteShader(shader)
    throw new ShaderError(log, parseErrorLine(log))
  }
  return shader
}

function createProgram(
  gl: WebGL2RenderingContext,
  vertSrc: string,
  fragSrc: string
): WebGLProgram | null {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vertSrc)
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc)
  if (!vs || !fs) return null

  const program = gl.createProgram()
  if (!program) return null
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) ?? 'Unknown link error'
    gl.deleteProgram(program)
    throw new ShaderError(log)
  }
  return program
}

export const ShaderPreview = React.forwardRef<ShaderPreviewHandle, ShaderPreviewProps>(function ShaderPreview({
  code,
  buffers,
  config,
  isRunning,
  onError,
  onCapture,
  className,
}, ref) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const glRef = React.useRef<WebGL2RenderingContext | null>(null)
  const rafRef = React.useRef<number>(0)
  const startTimeRef = React.useRef(0)
  const frameRef = React.useRef(0)
  const mouseRef = React.useRef([0, 0, 0, 0])
  const programsRef = React.useRef<Map<string, WebGLProgram>>(new Map())
  const fbosRef = React.useRef<Map<string, { fbo: WebGLFramebuffer; tex: WebGLTexture }>>(new Map())

  const onErrorRef = React.useRef(onError)
  onErrorRef.current = onError
  const onCaptureRef = React.useRef(onCapture)
  onCaptureRef.current = onCapture

  // Mouse tracking
  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current[0] = e.clientX - rect.left
      mouseRef.current[1] = rect.height - (e.clientY - rect.top)
    }
    const onMouseDown = () => {
      mouseRef.current[2] = mouseRef.current[0]
      mouseRef.current[3] = mouseRef.current[1]
    }
    canvas.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('mousedown', onMouseDown)
    return () => {
      canvas.removeEventListener('mousemove', onMouseMove)
      canvas.removeEventListener('mousedown', onMouseDown)
    }
  }, [])

  // Debounce code changes to avoid recompiling on every keystroke
  const [debouncedCode, setDebouncedCode] = React.useState(code)
  React.useEffect(() => {
    const timeout = setTimeout(() => setDebouncedCode(code), 300)
    return () => clearTimeout(timeout)
  }, [code])

  // Clean up FBOs and programs
  const cleanup = React.useCallback(() => {
    const gl = glRef.current
    if (!gl) return
    for (const p of programsRef.current.values()) gl.deleteProgram(p)
    programsRef.current.clear()
    for (const { fbo, tex } of fbosRef.current.values()) {
      gl.deleteFramebuffer(fbo)
      gl.deleteTexture(tex)
    }
    fbosRef.current.clear()
  }, [])

  // Create FBO for buffer pass
  const createFBO = React.useCallback(
    (gl: WebGL2RenderingContext, name: string) => {
      const tex = gl.createTexture()!
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, config.width, config.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

      const fbo = gl.createFramebuffer()!
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)

      fbosRef.current.set(name, { fbo, tex })
    },
    [config.width, config.height]
  )

  // Compile and render
  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !isRunning) {
      cancelAnimationFrame(rafRef.current)
      return
    }

    const gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true })
    if (!gl) {
      onErrorRef.current('WebGL2 not available')
      return
    }
    glRef.current = gl

    cleanup()

    // Vertex buffer
    const vbo = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
    gl.bufferData(gl.ARRAY_BUFFER, FULLSCREEN_QUAD, gl.STATIC_DRAW)

    // Compile main program and buffer programs
    const allPasses: Array<{ name: string; src: string }> = []
    if (buffers) {
      for (const [name, src] of Object.entries(buffers)) {
        if (src.trim()) allPasses.push({ name, src })
      }
    }
    allPasses.push({ name: 'main', src: debouncedCode })

    try {
      for (const pass of allPasses) {
        const program = createProgram(gl, VERTEX_SHADER, pass.src)
        if (program) {
          programsRef.current.set(pass.name, program)
          if (pass.name !== 'main') {
            createFBO(gl, pass.name)
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof ShaderError) {
        onErrorRef.current(err.message, err.line)
      } else if (err instanceof Error) {
        onErrorRef.current(err.message)
      } else {
        onErrorRef.current(String(err))
      }
      return
    }

    startTimeRef.current = performance.now() / 1000
    frameRef.current = 0

    let lastFrame = performance.now()

    const render = () => {
      const now = performance.now()
      const elapsed = 1000 / config.fps
      if (now - lastFrame < elapsed) {
        rafRef.current = requestAnimationFrame(render)
        return
      }
      lastFrame = now

      const time = now / 1000 - startTimeRef.current
      const date = new Date()

      // Render each pass
      for (const pass of allPasses) {
        const program = programsRef.current.get(pass.name)
        if (!program) continue

        const fboData = pass.name !== 'main' ? fbosRef.current.get(pass.name) : null
        if (fboData) {
          gl.bindFramebuffer(gl.FRAMEBUFFER, fboData.fbo)
        } else {
          gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        }

        gl.viewport(0, 0, config.width, config.height)
        gl.useProgram(program)

        // Set uniforms
        const setUniform = (name: string, ...vals: number[]) => {
          const loc = gl.getUniformLocation(program, name)
          if (!loc) return
          if (vals.length === 1) gl.uniform1f(loc, vals[0])
          else if (vals.length === 2) gl.uniform2f(loc, vals[0], vals[1])
          else if (vals.length === 3) gl.uniform3f(loc, vals[0], vals[1], vals[2])
          else if (vals.length === 4) gl.uniform4f(loc, vals[0], vals[1], vals[2], vals[3])
        }

        setUniform('iTime', time)
        setUniform('iResolution', config.width, config.height, 1)
        setUniform('iMouse', ...mouseRef.current)
        setUniform('iFrame', frameRef.current)
        setUniform('iTimeDelta', elapsed / 1000)
        setUniform('iDate', date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds())

        // Bind buffer textures as channels
        let texUnit = 0
        for (const [bufName, bufData] of fbosRef.current) {
          if (bufName === pass.name) continue
          const loc = gl.getUniformLocation(program, `iChannel${texUnit}`)
          if (loc) {
            gl.activeTexture(gl.TEXTURE0 + texUnit)
            gl.bindTexture(gl.TEXTURE_2D, bufData.tex)
            gl.uniform1i(loc, texUnit)
          }
          texUnit++
        }

        // Draw
        const posLoc = gl.getAttribLocation(program, 'a_position')
        gl.enableVertexAttribArray(posLoc)
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)
        gl.drawArrays(gl.TRIANGLES, 0, 6)
      }

      frameRef.current++
      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(rafRef.current)
      cleanup()
      gl.deleteBuffer(vbo)
    }
  }, [debouncedCode, buffers, config, isRunning, cleanup, createFBO])

  const captureFrame = React.useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
    onCaptureRef.current(dataUrl)
  }, [])

  React.useImperativeHandle(ref, () => ({
    capture: captureFrame,
  }), [captureFrame])

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
    </div>
  )
})
