import type { EngineType } from './types'

const MODEL_ID = 'Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC'

let engine: import('@mlc-ai/web-llm').MLCEngine | null = null

/** Expose the engine singleton for shared use (e.g., ai-queue.ts). */
export function getEngine(): import('@mlc-ai/web-llm').MLCEngine | null {
  return engine
}

/** Returns true if the model is loaded and ready for generation. */
export function isModelReady(): boolean {
  return engine !== null && initPromise === null
}
let initPromise: Promise<void> | null = null
let downloadProgress: { downloaded: number; total: number } | null = null
let progressListener: ((progress: number) => void) | null = null

export function setProgressListener(listener: ((progress: number) => void) | null): void {
  progressListener = listener
}

export function isWebGPUAvailable(): boolean {
  if (typeof navigator === 'undefined') return false
  return 'gpu' in navigator
}

export function getModelDownloadProgress(): {
  downloaded: number
  total: number
} | null {
  return downloadProgress
}

export function initWebLLM(): Promise<void> {
  if (engine) return Promise.resolve()
  if (initPromise) return initPromise

  if (!isWebGPUAvailable()) {
    return Promise.reject(new Error('WebGPU is not available in this browser'))
  }

  initPromise = (async () => {
    const { MLCEngine } = await import('@mlc-ai/web-llm')

    engine = new MLCEngine({
      initProgressCallback: (report: { progress: number; text?: string }) => {
        downloadProgress = {
          downloaded: report.progress,
          total: 1,
        }
        progressListener?.(report.progress)
      },
    })
    const DOWNLOAD_TIMEOUT_MS = 5 * 60 * 1000
    let timeoutId: ReturnType<typeof setTimeout>
    await Promise.race([
      engine.reload(MODEL_ID),
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Model download timed out after 5 minutes')), DOWNLOAD_TIMEOUT_MS)
      }),
    ]).finally(() => clearTimeout(timeoutId!))
    initPromise = null
    downloadProgress = null
  })().catch((err) => {
    engine = null
    initPromise = null
    throw err
  })

  return initPromise
}

function getSystemPrompt(engineType: EngineType): string {
  switch (engineType) {
    case 'p5js':
      return `You are a creative coding assistant that generates p5.js sketches.
Output ONLY valid JavaScript code using p5.js global mode (function setup(), function draw(), etc.).
Do NOT include any explanation, comments about what the code does, or markdown formatting.
Use createCanvas() in setup(). Use standard p5.js functions: background, fill, stroke, circle, rect, line, etc.
The code must be self-contained and immediately executable in a p5.js sketch.`

    case 'glsl':
      return `You are a shader programming assistant that generates GLSL fragment shaders.
Output ONLY valid GLSL code in Shadertoy format with a mainImage function.
Do NOT include any explanation or markdown formatting.
Available uniforms: iTime (float), iResolution (vec3), iMouse (vec4), iFrame (int).
Signature: void mainImage(out vec4 fragColor, in vec2 fragCoord)
The code must be valid GLSL ES 3.0.`

    case 'webgpu':
      return `You are a GPU programming assistant that generates WGSL compute shaders.
Output ONLY valid WGSL code for a compute shader.
Do NOT include any explanation or markdown formatting.
Use @compute @workgroup_size(8, 8) for the entry point.
Available uniforms via struct: time (f32), width (f32), height (f32).
Output to a texture_storage_2d<rgba8unorm, write>.`
  }
}

function getFixSystemPrompt(engineType: EngineType): string {
  switch (engineType) {
    case 'p5js':
      return `You are a creative coding assistant that fixes and improves p5.js sketches.
You will receive existing code, an instruction, and optionally error messages.
Output ONLY the complete fixed JavaScript code using p5.js global mode.
Do NOT include any explanation, comments about what you changed, or markdown formatting.
Output the FULL working code, not a diff or partial snippet.`

    case 'glsl':
      return `You are a shader programming assistant that fixes and improves GLSL fragment shaders.
You will receive existing code, an instruction, and optionally error messages.
Output ONLY the complete fixed GLSL code in Shadertoy format with a mainImage function.
Do NOT include any explanation or markdown formatting.
Output the FULL working code, not a diff or partial snippet.`

    case 'webgpu':
      return `You are a GPU programming assistant that fixes and improves WGSL compute shaders.
You will receive existing code, an instruction, and optionally error messages.
Output ONLY the complete fixed WGSL code for a compute shader.
Do NOT include any explanation or markdown formatting.
Output the FULL working code, not a diff or partial snippet.`
  }
}

const MAX_CODE_CHARS = 8000
const MAX_ERRORS_CHARS = 1200

function buildFixUserMessage(
  instruction: string,
  code: string,
  errors: string[],
): string {
  // Keep leading code — structure/imports matter more than the end
  const truncatedCode =
    code.length > MAX_CODE_CHARS
      ? code.slice(0, MAX_CODE_CHARS) + '\n[...truncated]'
      : code

  const errorsText = errors.join('\n')
  // Keep trailing errors — most recent errors are most relevant for fixing
  const truncatedErrors =
    errorsText.length > MAX_ERRORS_CHARS
      ? errorsText.slice(-MAX_ERRORS_CHARS)
      : errorsText

  let msg = `## Instruction\n${instruction}\n\n## Current Code\n\`\`\`\n${truncatedCode}\n\`\`\``

  if (truncatedErrors) {
    msg += `\n\n## Errors\n${truncatedErrors}`
  }

  return msg
}

export async function* fixSketchCode(
  instruction: string,
  currentCode: string,
  errors: string[],
  engineType: EngineType,
): AsyncGenerator<string> {
  if (!engine) {
    throw new Error('WebLLM not initialized. Call initWebLLM() first.')
  }

  const systemPrompt = getFixSystemPrompt(engineType)
  const userMessage = buildFixUserMessage(instruction, currentCode, errors)

  const chunks = await engine.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.7,
    max_tokens: 2048,
    stream: true,
  })

  let buffer = ''
  for await (const chunk of chunks) {
    const delta = chunk.choices[0]?.delta?.content
    if (delta) {
      buffer += delta
      yield buffer
    }
  }
}

export async function* generateSketchCode(
  prompt: string,
  engineType: EngineType,
): AsyncGenerator<string> {
  if (!engine) {
    throw new Error('WebLLM not initialized. Call initWebLLM() first.')
  }

  const systemPrompt = getSystemPrompt(engineType)

  const chunks = await engine.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 2048,
    stream: true,
  })

  let buffer = ''
  for await (const chunk of chunks) {
    const delta = chunk.choices[0]?.delta?.content
    if (delta) {
      buffer += delta
      yield buffer
    }
  }
}

export async function* completeCode(
  prefix: string,
  _suffix: string,
  engineType: EngineType,
  options?: { maxTokens?: number; temperature?: number },
): AsyncGenerator<string> {
  if (!engine) {
    throw new Error('WebLLM not initialized. Call initWebLLM() first.')
  }

  const systemPrompt = getSystemPrompt(engineType)
  const chunks = await engine.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prefix },
    ],
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 200,
    stream: true,
  })

  let buffer = ''
  for await (const chunk of chunks) {
    const delta = chunk.choices[0]?.delta?.content
    if (delta) {
      buffer += delta
      yield buffer
    }
  }
}

export async function* editCodeRegion(
  contextBefore: string,
  selectedCode: string,
  contextAfter: string,
  instruction: string,
  engineType: EngineType,
): AsyncGenerator<string> {
  if (!engine) {
    throw new Error('WebLLM not initialized. Call initWebLLM() first.')
  }

  const systemPrompt = getFixSystemPrompt(engineType)

  let userMessage = `## Instruction\n${instruction}\n\n`
  if (contextBefore) {
    userMessage += `## Code before selection\n\`\`\`\n${contextBefore}\n\`\`\`\n\n`
  }
  userMessage += `## Selected region to replace\n\`\`\`\n${selectedCode}\n\`\`\``
  if (contextAfter) {
    userMessage += `\n\n## Code after selection\n\`\`\`\n${contextAfter}\n\`\`\``
  }

  const chunks = await engine.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.7,
    max_tokens: 1500,
    stream: true,
  })

  let buffer = ''
  for await (const chunk of chunks) {
    const delta = chunk.choices[0]?.delta?.content
    if (delta) {
      buffer += delta
      yield buffer
    }
  }
}

export function disposeWebLLM(): void {
  if (engine) {
    engine.unload()
    engine = null
  }
  initPromise = null
  downloadProgress = null
}
