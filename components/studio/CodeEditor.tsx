'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'

export interface CodeEditorDiagnostic {
  message: string
  line?: number | null
}

export interface MonacoEditorRef {
  editor: import('@monaco-editor/react').Monaco['editor']['IStandaloneCodeEditor']
  monaco: import('@monaco-editor/react').Monaco
}

interface CodeEditorProps {
  code: string
  onChange: (code: string) => void
  onRun?: () => void
  readOnly?: boolean
  language?: 'javascript' | 'glsl' | 'wgsl'
  className?: string
  diagnostic?: CodeEditorDiagnostic | null
  onCursorChange?: (line: number, column: number) => void
  onEditorReady?: (ref: MonacoEditorRef | null) => void
}

const MonacoEditor = dynamic(
  () => import('./CodeEditorInner').then((mod) => mod.CodeEditorInner),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-background font-mono text-sm text-muted-foreground">
        Loading editor...
      </div>
    ),
  }
)

export function CodeEditor({
  code,
  onChange,
  onRun,
  readOnly,
  language = 'javascript',
  className,
  diagnostic,
  onCursorChange,
  onEditorReady,
}: CodeEditorProps) {
  const [isReady, setIsReady] = React.useState(false)
  const [loadMonaco, setLoadMonaco] = React.useState(() => process.env.NODE_ENV === 'test')

  const enableAdvancedEditor = React.useCallback(() => {
    setLoadMonaco(true)
  }, [])

  const handleFallbackKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault()
        onRun?.()
      }
    },
    [onRun],
  )

  React.useEffect(() => {
    if (!loadMonaco) {
      setIsReady(false)
      onEditorReady?.(null)
    }
  }, [loadMonaco, onEditorReady])

  return (
    <div
      className={cn('h-full w-full overflow-hidden', className)}
      data-testid="code-editor"
      data-editor-engine={loadMonaco ? 'monaco' : 'textarea'}
      data-editor-language={language}
      data-editor-ready={isReady ? 'true' : 'false'}
    >
      {loadMonaco ? (
        <MonacoEditor
          code={code}
          onChange={onChange}
          onRun={onRun}
          readOnly={readOnly}
          language={language}
          diagnostic={diagnostic}
          onReadyChange={setIsReady}
          onCursorChange={onCursorChange}
          onEditorReady={onEditorReady}
        />
      ) : (
        <div className="flex h-full min-h-0 flex-col bg-background">
          <div className="flex items-center justify-between border-b border-border px-3 py-1.5 text-xs text-muted-foreground">
            <span>Lightweight editor mode</span>
            <button
              type="button"
              onClick={enableAdvancedEditor}
              className="rounded px-2 py-1 font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              aria-label="Enable advanced code editor"
            >
              Enable advanced editor
            </button>
          </div>
          <textarea
            value={code}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleFallbackKeyDown}
            onSelect={(event) => {
              const target = event.currentTarget
              const before = target.value.slice(0, target.selectionStart ?? 0)
              const line = before.split('\n').length
              const column = before.length - before.lastIndexOf('\n')
              onCursorChange?.(line, column)
            }}
            readOnly={readOnly}
            spellCheck={false}
            aria-label="Code editor"
            className="h-full w-full resize-none border-0 bg-background p-3 font-mono text-sm text-foreground outline-none"
          />
        </div>
      )}
    </div>
  )
}
