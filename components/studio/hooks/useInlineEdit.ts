'use client'

import * as React from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type { Monaco } from '@monaco-editor/react'
import type { MonacoEditorRef } from '@/components/studio/CodeEditor'
import type { EngineType } from '@/lib/studio/types'
import { extractContext, type SelectionRange } from '@/lib/studio/ai-context'
import { aiManager } from '@/lib/studio/ai-queue'
import { editCodeRegion } from '@/lib/studio/generate'
import { computeLineDiff } from '@/lib/studio/ai-diff'
import {
  InlineEditWidget,
  type InlineEditWidgetProps,
} from '@/components/studio/InlineEditWidget'

type IRange = Monaco['IRange']

export interface UseInlineEditReturn {
  isActive: boolean
  trigger: () => void
}

const WIDGET_ID = 'inline-edit-widget'

/**
 * Hook that orchestrates inline AI editing in a Monaco editor.
 *
 * Registers Cmd+I keybinding, shows a prompt widget, streams edits via WebLLM,
 * displays a line-level diff, and allows accept/reject.
 */
export function useInlineEdit(
  editorRef: React.MutableRefObject<MonacoEditorRef | null>,
  engineType: EngineType,
): UseInlineEditReturn {
  const [isActive, setIsActive] = React.useState(false)
  const isActiveRef = React.useRef(false)

  // Refs that persist across renders without causing re-registration
  const engineTypeRef = React.useRef(engineType)
  engineTypeRef.current = engineType

  const widgetStateRef = React.useRef<{
    widget: ReturnType<typeof createContentWidget> | null
    root: Root | null
    domNode: HTMLDivElement | null
    originalText: string
    selectionRange: IRange | null
    decorations: Monaco['editor']['IEditorDecorationsCollection'] | null
    state: 'prompt' | 'generating' | 'diff'
  }>({
    widget: null,
    root: null,
    domNode: null,
    originalText: '',
    selectionRange: null,
    decorations: null,
    state: 'prompt',
  })

  // Stable cleanup function
  const cleanup = React.useCallback(() => {
    const ref = editorRef.current
    const ws = widgetStateRef.current

    void aiManager.cancel()

    if (ws.decorations) {
      ws.decorations.clear()
      ws.decorations = null
    }

    if (ws.root) {
      ws.root.unmount()
    }

    if (ws.widget && ref) {
      ref.editor.removeContentWidget(ws.widget)
    }

    ws.widget = null
    ws.root = null
    ws.domNode = null
    ws.originalText = ''
    ws.selectionRange = null
    ws.state = 'prompt'

    isActiveRef.current = false
    setIsActive(false)
  }, [editorRef])

  // Refs to break circular dependency between renderWidget and handlers
  const handleSubmitRef = React.useRef<((instruction: string) => Promise<void>) | null>(null)
  const handleAcceptRef = React.useRef<(() => void) | null>(null)
  const handleRejectRef = React.useRef<(() => void) | null>(null)

  // Render the widget React tree with current state
  const renderWidget = React.useCallback(
    (state: 'prompt' | 'generating' | 'diff') => {
      const ws = widgetStateRef.current
      ws.state = state

      if (!ws.root) return

      ws.root.render(
        React.createElement(InlineEditWidget, {
          state,
          onSubmit: (instruction: string) => handleSubmitRef.current?.(instruction),
          onAccept: () => handleAcceptRef.current?.(),
          onReject: () => handleRejectRef.current?.(),
          onDismiss: cleanup,
        } satisfies InlineEditWidgetProps),
      )
    },
    [cleanup],
  )

  // ─── Event handlers (use refs to avoid stale closures) ──────────────────────

  const handleSubmit = React.useCallback(
    async (instruction: string) => {
      const ref = editorRef.current
      const ws = widgetStateRef.current
      if (!ref || !ws.selectionRange) return

      const { editor } = ref

      renderWidget('generating')

      try {
        await aiManager.ensureModel()

        const code = editor.getModel()?.getValue() ?? ''
        const sel = ws.selectionRange
        const ctx = extractContext(code, sel.startLineNumber, sel.startColumn, {
          startLine: sel.startLineNumber,
          startColumn: sel.startColumn,
          endLine: sel.endLineNumber,
          endColumn: sel.endColumn,
        } satisfies SelectionRange)

        // Stream the edit — editCodeRegion yields accumulated buffer
        let result = ''
        const generator = aiManager.run(() =>
          editCodeRegion(
            ctx.prefix,
            ctx.selected ?? '',
            ctx.suffix,
            instruction,
            engineTypeRef.current,
          ),
        )

        for await (const chunk of generator) {
          result = chunk
        }

        if (!result) {
          cleanup()
          return
        }

        // Strip markdown code fences if present
        result = stripCodeFences(result)

        // Compute diff for decorations
        const originalLines = ws.originalText.split('\n')
        const modifiedLines = result.split('\n')
        const diff = computeLineDiff(originalLines, modifiedLines)

        // Replace the selected region with generated text
        editor.executeEdits('inline-edit', [
          {
            range: ws.selectionRange,
            text: result,
          },
        ])

        // Update the selection range to cover the newly inserted text
        const startLine = ws.selectionRange.startLineNumber
        const newEndLine = startLine + modifiedLines.length - 1
        ws.selectionRange = {
          startLineNumber: startLine,
          startColumn: 1,
          endLineNumber: newEndLine,
          endColumn: modifiedLines[modifiedLines.length - 1].length + 1,
        }

        // Apply diff decorations
        const decorationEntries: {
          range: IRange
          options: { isWholeLine: boolean; className: string }
        }[] = []

        let lineNumber = startLine
        for (const line of diff) {
          if (line.type === 'added') {
            decorationEntries.push({
              range: {
                startLineNumber: lineNumber,
                startColumn: 1,
                endLineNumber: lineNumber,
                endColumn: 1,
              },
              options: {
                isWholeLine: true,
                className: 'inline-edit-added',
              },
            })
            lineNumber++
          } else if (line.type === 'removed') {
            // Removed lines are no longer in the document — they can't be
            // decorated directly. They are visually implied by the diff
            // context (the added lines that replaced them).
          } else {
            // Unchanged lines still occupy a line in the new text
            lineNumber++
          }
        }

        ws.decorations = editor.createDecorationsCollection(decorationEntries)

        // Reposition the widget below the new range end
        if (ws.widget) {
          ref.editor.layoutContentWidget(ws.widget)
        }

        renderWidget('diff')
      } catch {
        // On failure, clean up silently
        cleanup()
      }
    },
    [editorRef, renderWidget, cleanup],
  )

  const handleAccept = React.useCallback(() => {
    cleanup()
  }, [cleanup])

  const handleReject = React.useCallback(() => {
    const ref = editorRef.current
    const ws = widgetStateRef.current
    if (!ref || !ws.selectionRange) {
      cleanup()
      return
    }

    // Restore original text
    ref.editor.executeEdits('inline-edit-reject', [
      {
        range: ws.selectionRange,
        text: ws.originalText,
      },
    ])

    cleanup()
  }, [editorRef, cleanup])

  // Sync handler refs to break circular dependency with renderWidget
  handleSubmitRef.current = handleSubmit
  handleAcceptRef.current = handleAccept
  handleRejectRef.current = handleReject

  // ─── Trigger function (Cmd+I or external call) ─────────────────────────────

  const trigger = React.useCallback(() => {
    const ref = editorRef.current
    if (!ref || isActiveRef.current) return

    const { editor, monaco } = ref
    const model = editor.getModel()
    if (!model) return

    // Get selection or select the current line
    let selection = editor.getSelection()
    if (!selection || selection.isEmpty()) {
      const position = editor.getPosition()
      if (!position) return
      const lineLength = model.getLineLength(position.lineNumber)
      selection = new monaco.Selection(
        position.lineNumber,
        1,
        position.lineNumber,
        lineLength + 1,
      )
      editor.setSelection(selection)
    }

    const selectionRange: IRange = {
      startLineNumber: selection.startLineNumber,
      startColumn: selection.startColumn,
      endLineNumber: selection.endLineNumber,
      endColumn: selection.endColumn,
    }

    const originalText = model.getValueInRange(selectionRange)

    // Store state
    const ws = widgetStateRef.current
    ws.originalText = originalText
    ws.selectionRange = selectionRange
    ws.state = 'prompt'

    // Create the DOM node and React root for the widget
    const domNode = document.createElement('div')
    domNode.style.zIndex = '100'
    ws.domNode = domNode
    ws.root = createRoot(domNode)

    // Create and add the Monaco content widget
    const widget = createContentWidget(
      monaco,
      domNode,
      selection.endLineNumber,
    )
    ws.widget = widget
    editor.addContentWidget(widget)

    isActiveRef.current = true
    setIsActive(true)
    renderWidget('prompt')
  }, [editorRef, renderWidget])

  // ─── Register Cmd+I keybinding ──────────────────────────────────────────────

  React.useEffect(() => {
    const ref = editorRef.current
    if (!ref) return

    const { editor, monaco } = ref

    const commandDisposable = editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI,
      () => {
        trigger()
      },
    )

    return () => {
      commandDisposable?.dispose()
      // Clean up any active widget on unmount
      cleanup()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- trigger/cleanup are stable
  }, [editorRef])

  return { isActive, trigger }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createContentWidget(
  monaco: Monaco,
  domNode: HTMLDivElement,
  lineNumber: number,
): Monaco['editor']['IContentWidget'] {
  return {
    getId: () => WIDGET_ID,
    getDomNode: () => domNode,
    getPosition: () => ({
      position: { lineNumber, column: 1 },
      preference: [monaco.editor.ContentWidgetPositionPreference.BELOW],
    }),
  }
}

/**
 * Strip markdown code fences that LLMs sometimes wrap their output in.
 * Handles ```lang\n...\n``` and bare ```\n...\n```.
 */
function stripCodeFences(text: string): string {
  const trimmed = text.trim()
  const fenceStart = /^```\w*\n/
  const fenceEnd = /\n```$/

  if (fenceStart.test(trimmed) && fenceEnd.test(trimmed)) {
    return trimmed.replace(fenceStart, '').replace(fenceEnd, '')
  }

  return text
}
