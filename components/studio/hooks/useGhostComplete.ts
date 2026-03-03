'use client'

import * as React from 'react'
import type { Monaco } from '@monaco-editor/react'
import type { EngineType } from '@/lib/studio/types'
import type { MonacoEditorRef } from '@/components/studio/CodeEditor'
import { extractContext } from '@/lib/studio/ai-context'
import { buildCompletionPrompt } from '@/lib/studio/ai-prompts'
import { aiManager } from '@/lib/studio/ai-queue'
import { completeCode } from '@/lib/studio/generate'
import { AI_AUTOCOMPLETE_DEBOUNCE_MS, AI_AUTOCOMPLETE_MAX_TOKENS } from '@/lib/constants'

export interface UseGhostCompleteReturn {
  autoMode: boolean
  toggleAutoMode: () => void
}

type ITextModel = Monaco['editor']['ITextModel']
type IPosition = Monaco['IPosition']
type CancellationToken = Parameters<Monaco['languages']['InlineCompletionsProvider']['provideInlineCompletions']>[3]
type InlineCompletionContext = Parameters<Monaco['languages']['InlineCompletionsProvider']['provideInlineCompletions']>[2]

/**
 * Registers a Monaco InlineCompletionsProvider for AI ghost-text autocomplete.
 *
 * Key implementation notes:
 * - Uses provider.debounceDelayMs (NOT manual debounce — manual debounce causes
 *   janky/non-rendering suggestions in Monaco).
 * - Wires token.onCancellationRequested → engine.interruptGenerate() so Monaco
 *   can properly cancel in-flight WebLLM generation when the user types more.
 * - Uses disposeInlineCompletions (renamed from freeInlineCompletions in 0.53+).
 */
export function useGhostComplete(
  editorRef: React.MutableRefObject<MonacoEditorRef | null>,
  engineType: EngineType,
): UseGhostCompleteReturn {
  const [autoMode, setAutoMode] = React.useState(false)
  const autoModeRef = React.useRef(autoMode)
  autoModeRef.current = autoMode

  const engineTypeRef = React.useRef(engineType)
  engineTypeRef.current = engineType

  React.useEffect(() => {
    const ref = editorRef.current
    if (!ref) return

    const { editor, monaco } = ref
    const language = editor.getModel()?.getLanguageId() ?? 'javascript'

    // Build the inline completions provider
    const provider = {
      // Use Monaco's built-in debounce support instead of manual debounce
      debounceDelayMs: AI_AUTOCOMPLETE_DEBOUNCE_MS,

      async provideInlineCompletions(
        model: ITextModel,
        position: IPosition,
        context: InlineCompletionContext,
        token: CancellationToken,
      ) {
        // Skip auto-triggered completions when auto mode is off
        const triggerKind = (context as { triggerKind?: number }).triggerKind
        const isAutomatic = triggerKind === 0 // InlineCompletionTriggerKind.Automatic
        if (isAutomatic && !autoModeRef.current) {
          return { items: [] }
        }

        // Wire cancellation: when Monaco cancels (user typed more), interrupt the GPU
        token.onCancellationRequested(async () => {
          await aiManager.cancel()
        })

        try {
          await aiManager.ensureModel()

          const code = model.getValue()
          const ctx = extractContext(code, position.lineNumber, position.column)
          const { user } = buildCompletionPrompt(ctx, engineTypeRef.current)

          // Wait for full completion (max AI_AUTOCOMPLETE_MAX_TOKENS tokens)
          // Streaming via onDidChangeInlineCompletions is an optional future upgrade
          let result = ''
          const generator = aiManager.run(() =>
            completeCode(user, ctx.suffix, engineTypeRef.current, {
              maxTokens: AI_AUTOCOMPLETE_MAX_TOKENS,
              temperature: 0.7,
            })
          )

          for await (const chunk of generator) {
            if (token.isCancellationRequested) break
            result = chunk
          }

          if (!result || token.isCancellationRequested) {
            return { items: [] }
          }

          return {
            items: [
              {
                insertText: result,
                range: {
                  startLineNumber: position.lineNumber,
                  startColumn: position.column,
                  endLineNumber: position.lineNumber,
                  endColumn: position.column,
                },
              },
            ],
            enableForwardStability: true,
          }
        } catch {
          return { items: [] }
        }
      },

      // Required cleanup method (renamed from freeInlineCompletions in monaco 0.53+)
      disposeInlineCompletions() {
        // No-op: we don't hold per-completion resources
      },
    }

    const disposable = monaco.languages.registerInlineCompletionsProvider(
      language,
      provider as Monaco['languages']['InlineCompletionsProvider'],
    )

    // Register manual trigger keybinding: Ctrl+Shift+Space
    const commandDisposable = editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Space,
      () => {
        editor.trigger('keyboard', 'editor.action.inlineSuggest.trigger', {})
      }
    )

    return () => {
      disposable.dispose()
      commandDisposable?.dispose()
    }
  }, [editorRef])

  const toggleAutoMode = React.useCallback(() => {
    setAutoMode((prev) => !prev)
  }, [])

  return { autoMode, toggleAutoMode }
}
