'use client'

import * as React from 'react'
import { Sparkles, Wrench, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import type { EngineType } from '@/lib/studio/types'
import { transformCode } from '@/lib/studio/sandbox'
import {
  isWebGPUAvailable,
  generateSketchCode,
  fixSketchCode,
} from '@/lib/studio/generate'
import { aiManager } from '@/lib/studio/ai-queue'
import { GenerateProgress } from './GenerateProgress'
import { CodeEditor } from './CodeEditor'

type DialogMode = 'generate' | 'fix'

interface GenerateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGenerate: (code: string) => void
  engine: EngineType
  currentCode?: string
  errors?: string[]
  initialMode?: DialogMode
}

type Stage = 'idle' | 'downloading' | 'loading' | 'generating' | 'done'

function getErrorMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err)

  if (msg.includes('WebGPU is not available')) {
    return 'Your browser doesn\u2019t support WebGPU. Try Chrome 113+ or Edge 113+.'
  }
  if (msg.includes('timed out')) {
    return 'Model download timed out. Check your connection and try again.'
  }
  if (msg.includes('NetworkError') || msg.includes('fetch') || msg.includes('Failed to fetch')) {
    return 'Failed to download the AI model. This may be a network or CSP issue.'
  }
  return msg
}

export function GenerateDialog({
  open,
  onOpenChange,
  onGenerate,
  engine,
  currentCode = '',
  errors = [],
  initialMode = 'generate',
}: GenerateDialogProps) {
  const [mode, setMode] = React.useState<DialogMode>(initialMode)
  const [prompt, setPrompt] = React.useState('')
  const [stage, setStage] = React.useState<Stage>('idle')
  const [progress, setProgress] = React.useState({ downloaded: 0, total: 0 })
  const [generatedCode, setGeneratedCode] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const abortRef = React.useRef(false)
  const promptFieldId = React.useId()

  // Sync mode when initialMode changes (e.g. opening via Fix button)
  React.useEffect(() => {
    if (open) setMode(initialMode)
  }, [open, initialMode])

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setError(null)
    abortRef.current = false

    if (!isWebGPUAvailable()) {
      setError('Your browser doesn\u2019t support WebGPU. Try Chrome 113+ or Edge 113+.')
      return
    }

    setStage('downloading')

    // Use aiManager for shared model state
    const unsub = aiManager.onProgress((aiState, p) => {
      if (aiState === 'downloading') {
        setStage('downloading')
        setProgress({ downloaded: (p ?? 0) * 100, total: 100 })
      } else if (aiState === 'loading') {
        setStage('loading')
        setProgress({ downloaded: (p ?? 0) * 100, total: 100 })
      }
    })

    try {
      await aiManager.ensureModel()
      unsub()

      if (abortRef.current) return
      setStage('generating')

      const makeGenerator = () =>
        mode === 'fix'
          ? fixSketchCode(prompt, currentCode, errors, engine)
          : generateSketchCode(prompt, engine)

      for await (const code of aiManager.run(makeGenerator)) {
        if (abortRef.current) break
        setGeneratedCode(code)
      }

      if (!abortRef.current) setStage('done')
    } catch (err) {
      setError(getErrorMessage(err))
      setStage('idle')
    } finally {
      unsub()
    }
  }

  const handleUse = () => {
    const safeCode = engine === 'p5js' ? transformCode(generatedCode) : generatedCode
    onGenerate(safeCode)
    onOpenChange(false)
    setStage('idle')
    setGeneratedCode('')
    setPrompt('')
  }

  const handleClose = async (v: boolean) => {
    if (!v) {
      abortRef.current = true
      await aiManager.cancel()
      setStage('idle')
      setGeneratedCode('')
      setError(null)
    }
    onOpenChange(v)
  }

  const editorLanguage =
    engine === 'glsl' ? 'glsl' : engine === 'webgpu' ? 'wgsl' : 'javascript'

  const modeConfig = mode === 'fix'
    ? { Icon: Wrench, verb: 'Fix', gerund: 'Fixing code...', title: 'Fix with AI', description: 'Describe what to fix or change and AI will update your code.' }
    : { Icon: Sparkles, verb: 'Generate', gerund: 'Generating code...', title: 'Generate with AI', description: 'Describe what you want to create and AI will generate the code.' }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <modeConfig.Icon className="h-4 w-4" />
            {modeConfig.title}
          </DialogTitle>
          <DialogDescription>
            {modeConfig.description}
          </DialogDescription>
        </DialogHeader>

        {/* Mode toggle — only show when idle and there's code to fix */}
        {stage === 'idle' && currentCode && (
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => setMode('generate')}
              className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                mode === 'generate'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sparkles className="mr-1.5 inline h-3 w-3" />
              Generate new
            </button>
            <button
              type="button"
              onClick={() => setMode('fix')}
              className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                mode === 'fix'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Wrench className="mr-1.5 inline h-3 w-3" />
              Fix / edit existing
            </button>
          </div>
        )}

        {stage === 'idle' && (
          <div className="space-y-3">
            {/* Show errors panel in fix mode */}
            {mode === 'fix' && errors.length > 0 && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
                <p className="mb-1.5 text-xs font-medium text-destructive">
                  Recent errors ({errors.length})
                </p>
                <div className="max-h-24 overflow-y-auto font-mono text-xs text-destructive/80">
                  {errors.map((err, i) => (
                    <div key={i} className="truncate py-0.5">
                      {err}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <label htmlFor={promptFieldId} className="sr-only">
              {mode === 'fix' ? 'Describe what to fix' : 'Describe what to generate'}
            </label>
            <textarea
              id={promptFieldId}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                mode === 'fix'
                  ? 'Fix the syntax error...'
                  : 'A colorful spirograph pattern that responds to mouse movement...'
              }
              rows={3}
              className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
        )}

        {(stage === 'downloading' || stage === 'loading') && (
          <GenerateProgress
            downloaded={progress.downloaded}
            total={progress.total}
            stage={stage}
          />
        )}

        {stage === 'generating' && generatedCode ? (
          <div className="h-64 overflow-hidden rounded-md border border-border">
            <CodeEditor
              code={generatedCode}
              onChange={setGeneratedCode}
              language={editorLanguage}
            />
          </div>
        ) : stage === 'generating' ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2 className="h-8 w-8 animate-spin motion-reduce:animate-none text-primary" />
            <p className="text-sm text-muted-foreground">
              {modeConfig.gerund}
            </p>
          </div>
        ) : null}

        {stage === 'done' && (
          <div className="h-64 overflow-hidden rounded-md border border-border">
            <CodeEditor
              code={generatedCode}
              onChange={setGeneratedCode}
              language={editorLanguage}
            />
          </div>
        )}

        <DialogFooter>
          {stage === 'idle' && (
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim()}
              className="gap-1.5"
            >
              <modeConfig.Icon className="h-3.5 w-3.5" />
              {modeConfig.verb}
            </Button>
          )}
          {stage === 'done' && (
            <Button onClick={handleUse} className="gap-1.5">
              Use this code
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
