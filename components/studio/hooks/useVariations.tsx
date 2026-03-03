'use client'

import * as React from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type { Monaco } from '@monaco-editor/react'
import type { MonacoEditorRef } from '@/components/studio/CodeEditor'
import type { EngineType } from '@/lib/studio/types'
import { extractContext } from '@/lib/studio/ai-context'
import { buildVariationsPrompt } from '@/lib/studio/ai-prompts'
import { aiManager } from '@/lib/studio/ai-queue'
import { completeCode } from '@/lib/studio/generate'
import { AI_AUTOCOMPLETE_MAX_TOKENS, AI_VARIATIONS_COUNT } from '@/lib/constants'
import { VariationsPicker, type Variation } from '@/components/studio/VariationsPicker'

export interface UseVariationsReturn {
  isActive: boolean
  trigger: () => void
}

type IContentWidget = Monaco['editor']['IContentWidget']

const WIDGET_ID = 'variations-picker-widget'
const TEMPERATURES = [0.7, 0.95, 1.2] as const

/**
 * Orchestrates multi-variation AI code generation and selection.
 *
 * - Registers Cmd+Shift+Enter keybinding to trigger the variations picker
 * - Generates AI_VARIATIONS_COUNT completions sequentially at different temperatures
 * - Renders a floating VariationsPicker panel as a Monaco ContentWidget
 * - Supports Alt+[/] cycling, Enter to insert, Esc to dismiss
 */
export function useVariations(
  editorRef: React.MutableRefObject<MonacoEditorRef | null>,
  engineType: EngineType,
): UseVariationsReturn {
  const [isActive, setIsActive] = React.useState(false)

  const engineTypeRef = React.useRef(engineType)
  engineTypeRef.current = engineType

  // Mutable state for the widget lifecycle — avoids stale closures in Monaco callbacks
  const stateRef = React.useRef<{
    widget: IContentWidget | null
    root: Root | null
    domNode: HTMLDivElement | null
    variations: Variation[]
    activeIndex: number
    cursorLineNumber: number
    cursorColumn: number
    aborted: boolean
  }>({
    widget: null,
    root: null,
    domNode: null,
    variations: [],
    activeIndex: 0,
    cursorLineNumber: 1,
    cursorColumn: 1,
    aborted: false,
  })

  // ─── Render helper ──────────────────────────────────────────────────────────
  const renderPicker = React.useCallback(() => {
    const s = stateRef.current
    if (!s.root) return

    s.root.render(
      <VariationsPicker
        variations={s.variations}
        activeIndex={s.activeIndex}
        onSelect={(idx: number) => {
          s.activeIndex = idx
          renderPicker()
        }}
        onInsert={() => insertVariation()}
        onDismiss={() => dismiss()}
      />,
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ─── Insert the selected variation ──────────────────────────────────────────
  const insertVariation = React.useCallback(() => {
    const ref = editorRef.current
    const s = stateRef.current
    if (!ref || !s.widget) return

    const text = s.variations[s.activeIndex]?.text
    if (!text) return

    const { editor } = ref
    editor.executeEdits('variations', [
      {
        range: {
          startLineNumber: s.cursorLineNumber,
          startColumn: s.cursorColumn,
          endLineNumber: s.cursorLineNumber,
          endColumn: s.cursorColumn,
        },
        text,
      },
    ])

    cleanup()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorRef])

  // ─── Dismiss the picker ─────────────────────────────────────────────────────
  const dismiss = React.useCallback(async () => {
    stateRef.current.aborted = true
    await aiManager.cancel()
    cleanup()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ─── Cleanup widget + React root ───────────────────────────────────────────
  const cleanup = React.useCallback(() => {
    const ref = editorRef.current
    const s = stateRef.current

    if (ref && s.widget) {
      ref.editor.removeContentWidget(s.widget)
    }
    if (s.root) {
      s.root.unmount()
    }

    s.widget = null
    s.root = null
    s.domNode = null
    s.variations = []
    s.activeIndex = 0
    s.aborted = false
    setIsActive(false)
  }, [editorRef])

  // ─── Generate variations sequentially ───────────────────────────────────────
  const generateVariations = React.useCallback(
    async (code: string, lineNumber: number, column: number) => {
      const s = stateRef.current
      const ctx = extractContext(code, lineNumber, column)
      const { user } = buildVariationsPrompt(ctx, engineTypeRef.current)

      for (let i = 0; i < AI_VARIATIONS_COUNT; i++) {
        if (s.aborted) return

        const temperature = TEMPERATURES[i] ?? 0.7

        try {
          const generator = aiManager.run(() =>
            completeCode(user, ctx.suffix, engineTypeRef.current, {
              maxTokens: AI_AUTOCOMPLETE_MAX_TOKENS,
              temperature,
            }),
          )

          for await (const chunk of generator) {
            if (s.aborted) return
            s.variations[i] = { text: chunk, isLoading: true }
            renderPicker()
          }
        } catch {
          // Generation was cancelled or failed — stop generating more
          break
        }

        if (s.aborted) return
        // Mark this variation as complete (preserve text even if empty)
        s.variations[i] = { text: s.variations[i]?.text ?? '', isLoading: false }
        renderPicker()
      }
    },
    [renderPicker],
  )

  // ─── Trigger: open the picker and start generation ─────────────────────────
  const trigger = React.useCallback(() => {
    const ref = editorRef.current
    if (!ref) return

    const { editor, monaco } = ref
    const position = editor.getPosition()
    const code = editor.getModel()?.getValue()
    if (!position || !code) return

    // If already active, dismiss first
    if (stateRef.current.widget) {
      cleanup()
    }

    const s = stateRef.current
    s.cursorLineNumber = position.lineNumber
    s.cursorColumn = position.column
    s.aborted = false
    s.activeIndex = 0

    // Initialize empty loading variations
    s.variations = Array.from({ length: AI_VARIATIONS_COUNT }, () => ({
      text: '',
      isLoading: true,
    }))

    // Create DOM node + React root for the ContentWidget
    const domNode = document.createElement('div')
    domNode.style.zIndex = '100'
    s.domNode = domNode
    s.root = createRoot(domNode)

    // Build and add the Monaco ContentWidget
    const widget: IContentWidget = {
      getId: () => WIDGET_ID,
      getDomNode: () => domNode,
      getPosition: () => ({
        position: { lineNumber: position.lineNumber, column: 1 },
        preference: [monaco.editor.ContentWidgetPositionPreference.BELOW],
      }),
    }
    s.widget = widget
    editor.addContentWidget(widget)

    setIsActive(true)
    renderPicker()

    // Fire-and-forget generation
    generateVariations(code, position.lineNumber, position.column)
  }, [editorRef, cleanup, renderPicker, generateVariations])

  // ─── Register keybindings on the Monaco editor ─────────────────────────────
  React.useEffect(() => {
    const ref = editorRef.current
    if (!ref) return

    const { editor, monaco } = ref

    // Cmd+Shift+Enter — trigger variations picker
    const triggerCmd = editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter,
      () => trigger(),
    )

    // Alt+[ — previous variation
    const prevCmd = editor.addCommand(
      monaco.KeyMod.Alt | monaco.KeyCode.BracketLeft,
      () => {
        const s = stateRef.current
        if (!s.widget) return
        const total = s.variations.length
        s.activeIndex = (s.activeIndex - 1 + total) % total
        renderPicker()
      },
    )

    // Alt+] — next variation
    const nextCmd = editor.addCommand(
      monaco.KeyMod.Alt | monaco.KeyCode.BracketRight,
      () => {
        const s = stateRef.current
        if (!s.widget) return
        const total = s.variations.length
        s.activeIndex = (s.activeIndex + 1) % total
        renderPicker()
      },
    )

    // Capture ref for cleanup — React warns about stale refs in effect teardown
    const state = stateRef.current

    return () => {
      triggerCmd?.dispose()
      prevCmd?.dispose()
      nextCmd?.dispose()

      // Clean up if still active when editor unmounts
      if (state.widget) {
        state.aborted = true
        aiManager.cancel()
        cleanup()
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorRef])

  return { isActive, trigger }
}
