import { AI_CONTEXT_MAX_CHARS } from '@/lib/constants'

export interface ContextWindow {
  prefix: string
  selected?: string
  suffix: string
}

export interface SelectionRange {
  startLine: number
  startColumn: number
  endLine: number
  endColumn: number
}

/**
 * Split code into lines, split at the given position, and return the text
 * before and after, respecting the character budget.
 *
 * Budget allocation: 60% to prefix (imports/structure matter more), 40% to suffix.
 */
export function extractContext(
  code: string,
  cursorLine: number,
  cursorColumn: number,
  selection?: SelectionRange,
  maxChars: number = AI_CONTEXT_MAX_CHARS,
): ContextWindow {
  const lines = code.split('\n')

  if (selection) {
    // Inline edit: split into before-selection, selected, after-selection
    const beforeLines = lines.slice(0, selection.startLine - 1)
    const selectedLines = lines.slice(selection.startLine - 1, selection.endLine)
    const afterLines = lines.slice(selection.endLine)

    // Adjust first selected line by column
    if (selectedLines.length > 0 && selection.startColumn > 1) {
      const firstLine = selectedLines[0]
      beforeLines.push(firstLine.slice(0, selection.startColumn - 1))
      selectedLines[0] = firstLine.slice(selection.startColumn - 1)
    }
    // Adjust last selected line by column
    if (selectedLines.length > 0 && selection.endColumn > 0) {
      const lastIdx = selectedLines.length - 1
      const lastLine = selectedLines[lastIdx]
      const afterRemainder = lastLine.slice(selection.endColumn - 1)
      selectedLines[lastIdx] = lastLine.slice(0, selection.endColumn - 1)
      if (afterRemainder) {
        afterLines.unshift(afterRemainder)
      }
    }

    const selected = selectedLines.join('\n')
    const prefixBudget = Math.floor((maxChars - selected.length) * 0.6)
    const suffixBudget = maxChars - selected.length - prefixBudget

    return {
      prefix: truncatePrefix(beforeLines.join('\n'), prefixBudget),
      selected,
      suffix: truncateSuffix(afterLines.join('\n'), suffixBudget),
    }
  }

  // Autocomplete / variations: split at cursor
  const beforeLines = lines.slice(0, cursorLine - 1)
  const cursorLineText = lines[cursorLine - 1] ?? ''
  const prefix = beforeLines.join('\n') + '\n' + cursorLineText.slice(0, cursorColumn - 1)
  const suffix = cursorLineText.slice(cursorColumn - 1) + '\n' + lines.slice(cursorLine).join('\n')

  const prefixBudget = Math.floor(maxChars * 0.6)
  const suffixBudget = maxChars - prefixBudget

  return {
    prefix: truncatePrefix(prefix, prefixBudget),
    suffix: truncateSuffix(suffix, suffixBudget),
  }
}

/** Keep the *end* of the prefix (most recently written code is most relevant). */
function truncatePrefix(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text
  return '...' + text.slice(text.length - maxChars)
}

/** Keep the *start* of the suffix (immediately following context is most relevant). */
function truncateSuffix(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text
  return text.slice(0, maxChars) + '...'
}
