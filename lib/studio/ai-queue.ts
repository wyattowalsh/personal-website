/**
 * AI request manager for the studio editor.
 *
 * Enforces the one-at-a-time constraint: only one WebLLM generation can run at a time.
 * New requests preemptively cancel the in-flight one via engine.interruptGenerate().
 *
 * IMPORTANT: WebLLM has no AbortSignal support on chat.completions.create().
 * Simply breaking from the for-await loop does NOT stop the GPU — the engine lock
 * stays held until the generation finishes. Always call interruptGenerate() first.
 */

import { getEngine, initWebLLM, isModelReady, disposeWebLLM } from './generate'

export type AIModelState = 'idle' | 'downloading' | 'loading' | 'ready' | 'error'

type ProgressListener = (state: AIModelState, progress?: number) => void

class AIRequestManager {
  private _state: AIModelState = 'idle'
  private _progressListeners: Set<ProgressListener> = new Set()
  private _isRunning = false

  get modelState(): AIModelState {
    return this._state
  }

  onProgress(listener: ProgressListener): () => void {
    this._progressListeners.add(listener)
    return () => this._progressListeners.delete(listener)
  }

  private _emit(state: AIModelState, progress?: number) {
    this._state = state
    this._progressListeners.forEach((l) => l(state, progress))
  }

  /**
   * Ensure the WebLLM model is loaded. Idempotent — safe to call multiple times.
   * Shows download/load progress via the progress listeners.
   */
  async ensureModel(): Promise<void> {
    if (isModelReady()) return

    this._emit('downloading', 0)
    try {
      // Wire our progress listener before calling initWebLLM
      const { setProgressListener } = await import('./generate')
      setProgressListener((progress) => {
        const state: AIModelState = progress < 0.1 ? 'downloading' : 'loading'
        this._emit(state, progress)
      })

      await initWebLLM()

      setProgressListener(null)
      this._emit('ready')
    } catch (err) {
      this._emit('error')
      throw err
    }
  }

  /**
   * Cancel any in-flight generation. Uses engine.interruptGenerate() which
   * sets an interruptSignal flag checked between token decode steps — this is
   * the only way to actually stop GPU execution (breaking the for-await loop alone
   * holds the engine lock for all remaining tokens).
   */
  async cancel(): Promise<void> {
    const engine = getEngine()
    if (engine) {
      await engine.interruptGenerate()
    }
  }

  /**
   * Cancel any in-flight generation, then run the provided async generator,
   * yielding each accumulated buffer string. The caller is responsible for
   * calling cancel() if they want to abort mid-stream.
   */
  async *run<T>(
    makeGenerator: () => AsyncGenerator<T>,
  ): AsyncGenerator<T> {
    // Cancel previous request before starting a new one
    await this.cancel()

    this._isRunning = true
    this._emit('ready')

    try {
      const generator = makeGenerator()
      for await (const value of generator) {
        yield value
      }
    } finally {
      this._isRunning = false
    }
  }

  /**
   * Dispose the WebLLM engine and release GPU resources.
   * Call when navigating away from the studio.
   */
  async dispose(): Promise<void> {
    await this.cancel()
    disposeWebLLM()
    this._isRunning = false
    this._emit('idle')
  }
}

export const aiManager = new AIRequestManager()
