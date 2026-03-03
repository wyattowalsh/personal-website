export interface DiffLine {
  type: 'unchanged' | 'added' | 'removed'
  text: string
}

/**
 * Compute the Longest Common Subsequence table for two string arrays.
 * Returns a 2D array where lcs[i][j] = length of LCS of original[0..i-1] and modified[0..j-1].
 */
function buildLcsTable(original: string[], modified: string[]): number[][] {
  const m = original.length
  const n = modified.length
  const table: number[][] = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(0),
  )

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (original[i - 1] === modified[j - 1]) {
        table[i][j] = table[i - 1][j - 1] + 1
      } else {
        table[i][j] = Math.max(table[i - 1][j], table[i][j - 1])
      }
    }
  }

  return table
}

/**
 * Compute a line-level diff between two arrays of lines using LCS.
 *
 * Walks the LCS table backwards to produce a sequence of unchanged, added,
 * and removed lines in document order.
 */
export function computeLineDiff(
  original: string[],
  modified: string[],
): DiffLine[] {
  const table = buildLcsTable(original, modified)
  const result: DiffLine[] = []

  let i = original.length
  let j = modified.length

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && original[i - 1] === modified[j - 1]) {
      result.push({ type: 'unchanged', text: original[i - 1] })
      i--
      j--
    } else if (j > 0 && (i === 0 || table[i][j - 1] >= table[i - 1][j])) {
      result.push({ type: 'added', text: modified[j - 1] })
      j--
    } else {
      result.push({ type: 'removed', text: original[i - 1] })
      i--
    }
  }

  return result.reverse()
}
