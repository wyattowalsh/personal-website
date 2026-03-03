'use client'

import * as React from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import {
  ResizablePanelGroup,
  ResizablePanel,
} from '@/components/ui/resizable'
import {
  STUDIO_DEFAULT_CONFIG,
  STUDIO_AUTOSAVE_INTERVAL_MS,
  STUDIO_MAX_CONSOLE_ENTRIES,
} from '@/lib/constants'
import { transformCode } from '@/lib/studio/sandbox'
import { saveDraft, getDraftEntry, clearDraft } from '@/lib/studio/autosave'
import type {
  ConsoleEntry,
  SketchConfig,
  SketchTemplate,
  EngineType,
} from '@/lib/studio/types'
import { useWindowSize } from '@/components/hooks/useWindowSize'
import { CodeEditor, type MonacoEditorRef } from './CodeEditor'
import { useGhostComplete } from './hooks/useGhostComplete'
import { useInlineEdit } from './hooks/useInlineEdit'
import { useVariations } from './hooks/useVariations'
import { useEngineDetection } from './hooks/useEngineDetection'
import { useFpsCounter } from './FpsOverlay'
import { disposeWebLLM } from '@/lib/studio/generate'
import { ConsoleOutput } from './ConsoleOutput'
import { CrashOverlay } from './CrashOverlay'
import { UnifiedPreview, type UnifiedPreviewHandle } from './UnifiedPreview'
import { PremiumToolbar } from './PremiumToolbar'
import { PremiumResizableHandle } from './PremiumResizableHandle'
import { DraftRecoveryBanner } from './DraftRecoveryBanner'
import { PreviewChrome, type PreviewBackground } from './PreviewChrome'
import { ErrorOverlay } from './ErrorOverlay'
import { PreviewControls } from './PreviewControls'
import { FullscreenOverlay } from './FullscreenOverlay'
import { CommandPalette, createStudioActions } from './CommandPalette'
import { SnippetPalette } from './SnippetPalette'
import { SketchSettings } from './SketchSettings'
import { TemplateSelector } from './TemplateSelector'
import { GenerateDialog } from './GenerateDialog'
import { BufferPanel } from './BufferPanel'
import { StatusBar } from './StatusBar'
import { KeyboardShortcutsDialog } from './KeyboardShortcutsDialog'

/* -------------------------------------------------------------------------- */
/*                                State Types                                 */
/* -------------------------------------------------------------------------- */

interface EditorState {
  code: string
  isRunning: boolean
  consoleEntries: ConsoleEntry[]
  error: string | null
  errorLine: number | null
  crashed: boolean
  config: SketchConfig
  engine: EngineType
  templatesOpen: boolean
  generateOpen: boolean
  generateMode: 'generate' | 'fix'
  activeBuffer: string
  bufferCode: Record<string, string>
  autoDetectEnabled: boolean
  wasAutoDetected: boolean
  commandPaletteOpen: boolean
  snippetPaletteOpen: boolean
  previewBg: PreviewBackground
  previewZoom: number
}

type EditorAction =
  | { type: 'SET_CODE'; code: string }
  | { type: 'RUN' }
  | { type: 'STOP' }
  | { type: 'CONSOLE'; entry: ConsoleEntry }
  | { type: 'CLEAR_CONSOLE' }
  | { type: 'ERROR'; error: string; line?: number }
  | { type: 'CLEAR_ERROR' }
  | { type: 'CRASH' }
  | { type: 'RESTART' }
  | { type: 'SET_CONFIG'; config: SketchConfig }
  | { type: 'SET_ENGINE'; engine: EngineType }
  | { type: 'TOGGLE_TEMPLATES'; open: boolean }
  | { type: 'TOGGLE_GENERATE'; open: boolean; mode?: 'generate' | 'fix' }
  | { type: 'SET_ACTIVE_BUFFER'; buffer: string }
  | { type: 'SET_BUFFER_CODE'; buffer: string; code: string }
  | { type: 'LOAD_DRAFT'; code: string; config: SketchConfig; engine: EngineType }
  | { type: 'AUTO_DETECT_ENGINE'; engine: EngineType }
  | { type: 'MANUAL_SET_ENGINE'; engine: EngineType }
  | { type: 'TOGGLE_AUTO_DETECT' }
  | { type: 'SET_PREVIEW_BG'; bg: PreviewBackground }
  | { type: 'SET_PREVIEW_ZOOM'; zoom: number }
  | { type: 'TOGGLE_COMMAND_PALETTE'; open: boolean }
  | { type: 'TOGGLE_SNIPPET_PALETTE'; open: boolean }
  | { type: 'CLEAR_AUTO_DETECTED' }

/* -------------------------------------------------------------------------- */
/*                                  Reducer                                   */
/* -------------------------------------------------------------------------- */

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_CODE':
      return { ...state, code: action.code }
    case 'RUN':
      return { ...state, isRunning: true, error: null, errorLine: null, crashed: false }
    case 'STOP':
      return { ...state, isRunning: false }
    case 'CONSOLE': {
      const entries = [...state.consoleEntries, action.entry]
      return {
        ...state,
        consoleEntries: entries.length > STUDIO_MAX_CONSOLE_ENTRIES
          ? entries.slice(-STUDIO_MAX_CONSOLE_ENTRIES)
          : entries,
      }
    }
    case 'CLEAR_CONSOLE':
      return { ...state, consoleEntries: [] }
    case 'ERROR':
      return {
        ...state,
        error: action.error,
        errorLine: action.line ?? null,
        isRunning: false,
      }
    case 'CLEAR_ERROR':
      return { ...state, error: null, errorLine: null }
    case 'CRASH':
      return { ...state, crashed: true, isRunning: false }
    case 'RESTART':
      return { ...state, crashed: false, error: null, errorLine: null, isRunning: true }
    case 'SET_CONFIG':
      return { ...state, config: action.config }
    case 'SET_ENGINE':
      return { ...state, engine: action.engine, wasAutoDetected: false }
    case 'TOGGLE_TEMPLATES':
      return { ...state, templatesOpen: action.open }
    case 'TOGGLE_GENERATE':
      return { ...state, generateOpen: action.open, generateMode: action.mode ?? state.generateMode }
    case 'SET_ACTIVE_BUFFER':
      return { ...state, activeBuffer: action.buffer }
    case 'SET_BUFFER_CODE':
      return { ...state, bufferCode: { ...state.bufferCode, [action.buffer]: action.code } }
    case 'LOAD_DRAFT':
      return { ...state, code: action.code, config: action.config, engine: action.engine }
    case 'AUTO_DETECT_ENGINE':
      if (!state.autoDetectEnabled) return state
      return { ...state, engine: action.engine, wasAutoDetected: true, isRunning: false, error: null, errorLine: null }
    case 'MANUAL_SET_ENGINE':
      return { ...state, engine: action.engine, wasAutoDetected: false }
    case 'TOGGLE_AUTO_DETECT':
      return { ...state, autoDetectEnabled: !state.autoDetectEnabled }
    case 'SET_PREVIEW_BG':
      return { ...state, previewBg: action.bg }
    case 'SET_PREVIEW_ZOOM':
      return { ...state, previewZoom: action.zoom }
    case 'TOGGLE_COMMAND_PALETTE':
      return { ...state, commandPaletteOpen: action.open }
    case 'TOGGLE_SNIPPET_PALETTE':
      return { ...state, snippetPaletteOpen: action.open }
    case 'CLEAR_AUTO_DETECTED':
      return { ...state, wasAutoDetected: false }
    default:
      return state
  }
}

const DEFAULT_P5_CODE = `function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  ellipse(mouseX, mouseY, 50, 50);
}
`

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

interface SketchEditorProps {
  initialCode?: string
  initialEngine?: EngineType
  initialConfig?: SketchConfig
  templates?: SketchTemplate[]
  className?: string
  onCodeChange?: (code: string) => void
  onEngineChange?: (engine: EngineType) => void
  onConfigChange?: (config: SketchConfig) => void
  onSave?: () => void
  onPublish?: () => void
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error'
}

export function SketchEditor({
  initialCode,
  initialEngine = 'p5js',
  initialConfig,
  templates = [],
  className,
  onCodeChange,
  onEngineChange,
  onConfigChange,
  onSave,
  onPublish,
  saveStatus,
}: SketchEditorProps) {
  const { width } = useWindowSize()
  const isMobile = width > 0 && width < 768
  const panelDirection = isMobile ? 'vertical' : 'horizontal'

  const [state, dispatch] = React.useReducer(editorReducer, {
    code: initialCode ?? DEFAULT_P5_CODE,
    isRunning: false,
    consoleEntries: [],
    error: null,
    errorLine: null,
    crashed: false,
    config: initialConfig ?? { ...STUDIO_DEFAULT_CONFIG },
    engine: initialEngine,
    templatesOpen: false,
    generateOpen: false,
    generateMode: 'generate' as const,
    activeBuffer: 'main',
    bufferCode: {},
    autoDetectEnabled: true,
    wasAutoDetected: false,
    commandPaletteOpen: false,
    snippetPaletteOpen: false,
    previewBg: 'dark' as PreviewBackground,
    previewZoom: 1,
  })

  // Unified preview ref
  const previewRef = React.useRef<UnifiedPreviewHandle>(null)

  // Monaco editor ref
  const monacoEditorRef = React.useRef<MonacoEditorRef | null>(null)
  const handleEditorReady = React.useCallback((ref: MonacoEditorRef | null) => {
    monacoEditorRef.current = ref
  }, [])

  // AI hooks
  const { autoMode, toggleAutoMode } = useGhostComplete(monacoEditorRef, state.engine)
  useInlineEdit(monacoEditorRef, state.engine)
  useVariations(monacoEditorRef, state.engine)

  // FPS measurement
  const measuredFps = useFpsCounter()

  // Engine auto-detection
  const handleAutoDetect = React.useCallback(
    (engine: EngineType, _confidence: number) => {
      dispatch({ type: 'AUTO_DETECT_ENGINE', engine })
      onEngineChange?.(engine)
      setTimeout(() => dispatch({ type: 'CLEAR_AUTO_DETECTED' }), 3000)
    },
    [onEngineChange],
  )

  const { suppressDetection } = useEngineDetection({
    code: state.code,
    currentEngine: state.engine,
    autoDetectEnabled: state.autoDetectEnabled,
    onDetect: handleAutoDetect,
  })

  // Release GPU resources on unmount
  React.useEffect(() => {
    return () => {
      disposeWebLLM()
    }
  }, [])

  // Draft state
  const [draftTimestamp, setDraftTimestamp] = React.useState<number | undefined>()
  const [showDraftPrompt, setShowDraftPrompt] = React.useState(false)
  const [cursorPos, setCursorPos] = React.useState({ line: 1, col: 1 })
  const [fullscreen, setFullscreen] = React.useState(false)
  const [shortcutsOpen, setShortcutsOpen] = React.useState(false)

  // Check for saved draft on mount
  React.useEffect(() => {
    if (initialCode) return
    const draft = getDraftEntry()
    if (draft) {
      setShowDraftPrompt(true)
      setDraftTimestamp(draft.timestamp)
    }
  }, [initialCode])

  const restoreDraft = React.useCallback(() => {
    const draft = getDraftEntry()
    if (draft) {
      dispatch({
        type: 'LOAD_DRAFT',
        code: draft.code,
        config: draft.config,
        engine: draft.engine,
      })
    }
    setShowDraftPrompt(false)
  }, [])

  const discardDraft = React.useCallback(() => {
    clearDraft()
    setShowDraftPrompt(false)
  }, [])

  // Auto-save interval
  const stateRef = React.useRef(state)
  stateRef.current = state

  React.useEffect(() => {
    const interval = setInterval(() => {
      const { code, config, engine } = stateRef.current
      saveDraft({
        code,
        title: 'Untitled',
        config,
        engine,
        timestamp: Date.now(),
      })
    }, STUDIO_AUTOSAVE_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  // Keyboard shortcuts
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey

      // Cmd+S — save
      if (meta && e.key === 's') {
        e.preventDefault()
        onSave?.()
        return
      }

      // Cmd+Shift+F — fullscreen
      if (meta && e.shiftKey && e.key === 'f') {
        e.preventDefault()
        setFullscreen((f) => !f)
        return
      }

      // Escape — exit fullscreen
      if (e.key === 'Escape' && fullscreen) {
        setFullscreen(false)
        return
      }

      // Cmd+? — shortcuts dialog
      if (meta && e.key === '?') {
        e.preventDefault()
        setShortcutsOpen((o) => !o)
        return
      }

      // Cmd+K — command palette
      if (meta && e.key === 'k') {
        e.preventDefault()
        dispatch({ type: 'TOGGLE_COMMAND_PALETTE', open: true })
        return
      }

      // Cmd+Shift+P — snippet palette
      if (meta && e.shiftKey && e.key === 'p') {
        e.preventDefault()
        dispatch({ type: 'TOGGLE_SNIPPET_PALETTE', open: true })
        return
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [fullscreen, onSave])

  /* ---------------------------------------------------------------------- */
  /*                            Action Handlers                              */
  /* ---------------------------------------------------------------------- */

  const handleRun = React.useCallback(() => dispatch({ type: 'RUN' }), [])
  const handleStop = React.useCallback(() => dispatch({ type: 'STOP' }), [])

  const handleToggle = React.useCallback(() => {
    if (state.isRunning) {
      handleStop()
    } else {
      handleRun()
    }
  }, [state.isRunning, handleRun, handleStop])

  const handleCapture = React.useCallback(() => {
    previewRef.current?.capture()
  }, [])

  const handleCaptureSvg = React.useCallback(() => {
    previewRef.current?.captureSvg?.()
  }, [])

  const handleCaptureResult = React.useCallback((dataUrl: string) => {
    const link = document.createElement('a')
    link.download = 'sketch.png'
    link.href = dataUrl
    link.click()
  }, [])

  const handleSvgResult = React.useCallback((svg: string) => {
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = 'sketch.svg'
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }, [])

  const handleDownload = React.useCallback(() => {
    const ext = state.engine === 'glsl' ? 'glsl' : state.engine === 'webgpu' ? 'wgsl' : 'js'
    const blob = new Blob([state.code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `sketch.${ext}`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }, [state.code, state.engine])

  const handleGenerate = React.useCallback(
    (code: string) => {
      dispatch({ type: 'SET_CODE', code })
      onCodeChange?.(code)
    },
    [onCodeChange],
  )

  const handleManualEngineChange = React.useCallback(
    (engine: EngineType) => {
      dispatch({ type: 'MANUAL_SET_ENGINE', engine })
      suppressDetection()
      onEngineChange?.(engine)
    },
    [suppressDetection, onEngineChange],
  )

  const handleTemplateSelect = React.useCallback(
    (template: SketchTemplate) => {
      dispatch({ type: 'SET_CODE', code: template.code })
      dispatch({ type: 'MANUAL_SET_ENGINE', engine: template.engine })
      suppressDetection()
      onCodeChange?.(template.code)
      onEngineChange?.(template.engine)
    },
    [suppressDetection, onCodeChange, onEngineChange],
  )

  const handleGoToLine = React.useCallback((line: number) => {
    const editor = monacoEditorRef.current?.editor
    if (!editor) return
    editor.revealLineInCenter(line)
    editor.setPosition({ lineNumber: line, column: 1 })
    editor.focus()
  }, [])

  const handleInsertSnippet = React.useCallback((code: string) => {
    const editor = monacoEditorRef.current?.editor
    if (!editor) return
    const selection = editor.getSelection()
    if (!selection) return
    editor.executeEdits('snippet', [{ range: selection, text: code }])
    editor.focus()
  }, [])

  /* ---------------------------------------------------------------------- */
  /*                                Memos                                    */
  /* ---------------------------------------------------------------------- */

  const transformedCode = React.useMemo(() => {
    return state.engine === 'p5js' ? transformCode(state.code) : state.code
  }, [state.code, state.engine])

  const recentErrors = React.useMemo(() => {
    const consoleErrors = state.consoleEntries
      .filter((e) => e.type === 'error')
      .slice(-5)
      .map((e) => e.args.join(' '))
    if (state.error && !consoleErrors.includes(state.error)) {
      consoleErrors.push(state.error)
    }
    return consoleErrors
  }, [state.consoleEntries, state.error])

  const editorDiagnostic = React.useMemo(() => {
    if (!state.error || !state.errorLine) return null
    if (state.engine !== 'glsl' && state.engine !== 'webgpu') return null
    return { message: state.error, line: state.errorLine }
  }, [state.engine, state.error, state.errorLine])

  const commandActions = React.useMemo(
    () =>
      createStudioActions({
        onRun: handleRun,
        onStop: handleStop,
        onSave,
        onPublish,
        onCapture: handleCapture,
        onCaptureSvg: state.engine === 'p5js' ? handleCaptureSvg : undefined,
        onDownload: handleDownload,
        onOpenTemplates: () => dispatch({ type: 'TOGGLE_TEMPLATES', open: true }),
        onOpenGenerate: () => dispatch({ type: 'TOGGLE_GENERATE', open: true, mode: 'generate' }),
        onOpenFix: () => dispatch({ type: 'TOGGLE_GENERATE', open: true, mode: 'fix' }),
        onToggleFullscreen: () => setFullscreen((f) => !f),
        onOpenShortcuts: () => setShortcutsOpen(true),
        onClearConsole: () => dispatch({ type: 'CLEAR_CONSOLE' }),
        onOpenSnippets: () => dispatch({ type: 'TOGGLE_SNIPPET_PALETTE', open: true }),
        isRunning: state.isRunning,
        engine: state.engine,
      }),
    [handleRun, handleStop, onSave, onPublish, handleCapture, handleCaptureSvg, handleDownload, state.isRunning, state.engine],
  )

  /* ---------------------------------------------------------------------- */
  /*                            Render Helpers                               */
  /* ---------------------------------------------------------------------- */

  const renderCodePanel = () => (
    <div className="flex h-full min-h-0 flex-col">
      {state.engine === 'glsl' ? (
        <BufferPanel
          activeBuffer={state.activeBuffer}
          onBufferChange={(buffer) => dispatch({ type: 'SET_ACTIVE_BUFFER', buffer })}
          bufferCode={{ main: state.code, ...state.bufferCode }}
          onBufferCodeChange={(buffer, code) => {
            if (buffer === 'main') {
              dispatch({ type: 'SET_CODE', code })
              onCodeChange?.(code)
            } else {
              dispatch({ type: 'SET_BUFFER_CODE', buffer, code })
            }
          }}
        />
      ) : (
        <CodeEditor
          code={state.code}
          onChange={(code) => {
            dispatch({ type: 'SET_CODE', code })
            onCodeChange?.(code)
          }}
          onRun={handleToggle}
          language={state.engine === 'webgpu' ? 'wgsl' : 'javascript'}
          diagnostic={editorDiagnostic}
          className="min-h-0 flex-1"
          onCursorChange={(line, col) => setCursorPos({ line, col })}
          onEditorReady={handleEditorReady}
        />
      )}
      <ConsoleOutput
        entries={state.consoleEntries}
        onClear={() => dispatch({ type: 'CLEAR_CONSOLE' })}
      />
      <StatusBar
        cursorLine={cursorPos.line}
        cursorColumn={cursorPos.col}
        lineCount={state.code.split('\n').length}
        engine={state.engine}
        onEngineChange={handleManualEngineChange}
        autoDetectEnabled={state.autoDetectEnabled}
        onToggleAutoDetect={() => dispatch({ type: 'TOGGLE_AUTO_DETECT' })}
        wasAutoDetected={state.wasAutoDetected}
        saveStatus={saveStatus}
        codeSize={new Blob([state.code]).size}
        fps={state.isRunning ? measuredFps : undefined}
        aiAutoMode={autoMode}
        onToggleAiAutoMode={toggleAutoMode}
      />
    </div>
  )

  const renderPreviewPanel = () => (
    <div className="relative h-full min-h-0">
      <PreviewChrome
        engine={state.engine}
        config={state.config}
        fps={state.isRunning ? measuredFps : undefined}
        previewBg={state.previewBg}
        onPreviewBgChange={(bg) => dispatch({ type: 'SET_PREVIEW_BG', bg })}
        className="h-full"
      >
        <div
          className="h-full w-full"
          style={
            state.previewZoom !== 1
              ? { transform: `scale(${state.previewZoom})`, transformOrigin: 'center center' }
              : undefined
          }
        >
          <UnifiedPreview
            ref={previewRef}
            engine={state.engine}
            code={state.code}
            transformedCode={transformedCode}
            config={state.config}
            isRunning={state.isRunning}
            onConsole={(entry) => dispatch({ type: 'CONSOLE', entry })}
            onError={(err, line) => dispatch({ type: 'ERROR', error: err, line })}
            onCapture={handleCaptureResult}
            onCaptureSvg={handleSvgResult}
            onCrash={() => dispatch({ type: 'CRASH' })}
            className="h-full w-full"
          />
        </div>
      </PreviewChrome>

      <PreviewControls
        zoom={state.previewZoom}
        onZoomChange={(zoom) => dispatch({ type: 'SET_PREVIEW_ZOOM', zoom })}
        previewBg={state.previewBg}
        onPreviewBgChange={(bg) => dispatch({ type: 'SET_PREVIEW_BG', bg })}
      />

      <CrashOverlay
        error={state.error ?? undefined}
        onRestart={() => dispatch({ type: 'RESTART' })}
        onFix={() => dispatch({ type: 'TOGGLE_GENERATE', open: true, mode: 'fix' })}
        visible={state.crashed}
      />

      <ErrorOverlay
        error={state.error}
        errorLine={state.errorLine}
        crashed={state.crashed}
        onGoToLine={handleGoToLine}
        onFix={() => dispatch({ type: 'TOGGLE_GENERATE', open: true, mode: 'fix' })}
        onDismiss={() => dispatch({ type: 'CLEAR_ERROR' })}
      />
    </div>
  )

  /* ---------------------------------------------------------------------- */
  /*                                 JSX                                     */
  /* ---------------------------------------------------------------------- */

  return (
    <motion.div
      className={cn('flex h-full min-h-0 flex-col', className)}
      layout
    >
      {/* Draft recovery banner */}
      <DraftRecoveryBanner
        visible={showDraftPrompt}
        draftTimestamp={draftTimestamp}
        onRestore={restoreDraft}
        onDiscard={discardDraft}
      />

      {/* Premium toolbar */}
      <PremiumToolbar
        isRunning={state.isRunning}
        onRun={handleRun}
        onStop={handleStop}
        onCapture={handleCapture}
        onCaptureSvg={state.engine === 'p5js' ? handleCaptureSvg : undefined}
        onDownload={handleDownload}
        onOpenTemplates={() => dispatch({ type: 'TOGGLE_TEMPLATES', open: true })}
        onOpenGenerate={() => dispatch({ type: 'TOGGLE_GENERATE', open: true, mode: 'generate' })}
        onOpenFix={() => dispatch({ type: 'TOGGLE_GENERATE', open: true, mode: 'fix' })}
        hasErrors={recentErrors.length > 0}
        engine={state.engine}
        onSave={onSave}
        onPublish={onPublish}
        saveStatus={saveStatus}
        onToggleFullscreen={() => setFullscreen((f) => !f)}
        onOpenShortcuts={() => setShortcutsOpen(true)}
      >
        <SketchSettings
          config={state.config}
          onChange={(config) => {
            dispatch({ type: 'SET_CONFIG', config })
            onConfigChange?.(config)
          }}
          aiAutoMode={autoMode}
          onToggleAiAutoMode={toggleAutoMode}
        />
      </PremiumToolbar>

      {/* Main editor + preview */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <ResizablePanelGroup direction={panelDirection} key={panelDirection}>
          {isMobile ? (
            <>
              {/* Mobile: preview on top, code below */}
              <ResizablePanel defaultSize={40} minSize={20}>
                {renderPreviewPanel()}
              </ResizablePanel>

              <PremiumResizableHandle direction="vertical" />

              <ResizablePanel defaultSize={60} minSize={20}>
                {renderCodePanel()}
              </ResizablePanel>
            </>
          ) : (
            <>
              {/* Desktop: code on left, preview on right */}
              <ResizablePanel defaultSize={50} minSize={25}>
                {renderCodePanel()}
              </ResizablePanel>

              <PremiumResizableHandle direction="horizontal" />

              <ResizablePanel defaultSize={50} minSize={25}>
                {renderPreviewPanel()}
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>

      {/* Template selector dialog */}
      <TemplateSelector
        templates={templates}
        onSelect={handleTemplateSelect}
        open={state.templatesOpen}
        onOpenChange={(open) => dispatch({ type: 'TOGGLE_TEMPLATES', open })}
      />

      {/* AI generate dialog */}
      <GenerateDialog
        open={state.generateOpen}
        onOpenChange={(open) => dispatch({ type: 'TOGGLE_GENERATE', open })}
        onGenerate={handleGenerate}
        engine={state.engine}
        currentCode={state.code}
        errors={recentErrors}
        initialMode={state.generateMode}
      />

      {/* Fullscreen preview */}
      <FullscreenOverlay
        visible={fullscreen}
        isRunning={state.isRunning}
        onExit={() => setFullscreen(false)}
        onRun={handleRun}
        onStop={handleStop}
        onCapture={handleCapture}
      >
        <UnifiedPreview
          ref={previewRef}
          engine={state.engine}
          code={state.code}
          transformedCode={transformedCode}
          config={state.config}
          isRunning={state.isRunning}
          onConsole={(entry) => dispatch({ type: 'CONSOLE', entry })}
          onError={(err, line) => dispatch({ type: 'ERROR', error: err, line })}
          onCapture={handleCaptureResult}
          onCaptureSvg={handleSvgResult}
          onCrash={() => dispatch({ type: 'CRASH' })}
          className="h-full w-full"
        />
      </FullscreenOverlay>

      {/* Keyboard shortcuts dialog */}
      <KeyboardShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />

      {/* Command palette */}
      <CommandPalette
        open={state.commandPaletteOpen}
        onOpenChange={(open) => dispatch({ type: 'TOGGLE_COMMAND_PALETTE', open })}
        actions={commandActions}
        engine={state.engine}
      />

      {/* Snippet palette */}
      <SnippetPalette
        open={state.snippetPaletteOpen}
        onOpenChange={(open) => dispatch({ type: 'TOGGLE_SNIPPET_PALETTE', open })}
        engine={state.engine}
        onInsert={handleInsertSnippet}
      />
    </motion.div>
  )
}
