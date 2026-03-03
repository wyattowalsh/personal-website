import { STUDIO_LOOP_LIMIT } from '@/lib/constants'

/**
 * Transforms user code to inject loop protection.
 * Uses regex-based injection to add iteration counters into for/while/do-while loops.
 * Covers both braced and single-statement (brace-less) loops.
 * Runs client-side before posting code to the sandboxed iframe.
 *
 * Known limitations: The regex `[^)]*` cannot handle nested parentheses in loop
 * conditions (e.g., `for (let i = fn(0, x => x); ...)`), and may falsely match
 * arrow function bodies with braces. The time-based guard (`Date.now() - __startTime > 10000`)
 * provides the effective infinite loop safeguard; the iteration counter is supplementary.
 * The sandbox iframe is the primary security boundary.
 */
export function transformCode(code: string): string {
  let loopId = 0
  const limit = STUDIO_LOOP_LIMIT

  // Inject loop protection by wrapping loop bodies with a counter check.
  // This is a simpler approach than full AST transformation that avoids
  // @babel/standalone's missing `template` API.
  try {
    // Add counter declarations at the top
    const counters: string[] = []

    // Pass 1: Match for/while/do-while loops with braces and inject guards.
    const transformed = code.replace(
      /\b(for|while|do)\s*(\([^)]*\))?\s*\{/g,
      (match) => {
        const id = loopId++
        const counterName = `__lc_${id}`
        counters.push(`var ${counterName} = 0;`)
        return `${match} if (++${counterName} > ${limit} || (Date.now() - __startTime) > 10000) throw new Error("Infinite loop detected (loop #${id}, exceeded ${limit} iterations)");`
      },
    )

    // Pass 2: Match single-statement (brace-less) for/while loops and wrap them.
    // Matches: for(...) stmt; or while(...) stmt; where stmt is not a block.
    const transformed2 = transformed.replace(
      /\b(for|while)\s*(\([^)]*\))\s*(?!\{)([^\n;{]+;)/g,
      (_match, keyword, condition, body) => {
        const id = loopId++
        const counterName = `__lc_${id}`
        counters.push(`var ${counterName} = 0;`)
        return `${keyword} ${condition} { if (++${counterName} > ${limit} || (Date.now() - __startTime) > 10000) throw new Error("Infinite loop detected (loop #${id}, exceeded ${limit} iterations)"); ${body.trim()} }`
      },
    )

    if (counters.length > 0) {
      // Prepend start-time sentinel plus all counter declarations.
      const preamble = `var __startTime = Date.now();\n` + counters.join('\n')
      return preamble + '\n' + transformed2
    }

    return transformed2
  } catch {
    // If transform fails, return original code
    // The sandbox will catch the runtime error
    return code
  }
}
