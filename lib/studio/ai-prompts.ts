import type { EngineType } from './types'
import type { ContextWindow } from './ai-context'

// ─── System prompts ───────────────────────────────────────────────────────────

function getCompletionSystemPrompt(engineType: EngineType): string {
  switch (engineType) {
    case 'p5js':
      return `You are a creative coding assistant. Continue the p5.js JavaScript code exactly where it left off.
Output ONLY the continuation code — no explanation, no markdown, no repetition of existing code.
Use p5.js global mode functions (setup, draw, createCanvas, background, etc.).`

    case 'glsl':
      return `You are a shader programming assistant. Continue the GLSL code exactly where it left off.
Output ONLY the continuation code — no explanation, no markdown, no repetition of existing code.
Use valid GLSL ES 3.0 syntax.`

    case 'webgpu':
      return `You are a GPU programming assistant. Continue the WGSL code exactly where it left off.
Output ONLY the continuation code — no explanation, no markdown, no repetition of existing code.
Use valid WGSL syntax.`
  }
}

function getInlineEditSystemPrompt(engineType: EngineType): string {
  switch (engineType) {
    case 'p5js':
      return `You are a creative coding assistant that edits p5.js JavaScript code.
You will receive code context and a selected region to modify, plus an instruction.
Output ONLY the replacement for the selected region — exact same region, modified per instruction.
No explanation, no markdown, no code outside the selection region.
Use p5.js global mode functions. Output must be valid JavaScript.`

    case 'glsl':
      return `You are a shader programming assistant that edits GLSL code.
You will receive code context and a selected region to modify, plus an instruction.
Output ONLY the replacement for the selected region — exact same region, modified per instruction.
No explanation, no markdown, no code outside the selection region.
Output must be valid GLSL ES 3.0.`

    case 'webgpu':
      return `You are a GPU programming assistant that edits WGSL code.
You will receive code context and a selected region to modify, plus an instruction.
Output ONLY the replacement for the selected region — exact same region, modified per instruction.
No explanation, no markdown, no code outside the selection region.
Output must be valid WGSL.`
  }
}

// ─── User message builders ────────────────────────────────────────────────────

export function buildCompletionPrompt(ctx: ContextWindow, engineType: EngineType) {
  const system = getCompletionSystemPrompt(engineType)
  const user = ctx.prefix
  return { system, user }
}

export function buildInlineEditPrompt(
  ctx: ContextWindow,
  instruction: string,
  engineType: EngineType,
) {
  const system = getInlineEditSystemPrompt(engineType)

  let user = `## Instruction\n${instruction}\n\n`

  if (ctx.prefix) {
    user += `## Code before selection\n\`\`\`\n${ctx.prefix}\n\`\`\`\n\n`
  }

  user += `## Selected region to replace\n\`\`\`\n${ctx.selected ?? ''}\n\`\`\`\n`

  if (ctx.suffix) {
    user += `\n## Code after selection\n\`\`\`\n${ctx.suffix}\n\`\`\``
  }

  return { system, user }
}

export function buildVariationsPrompt(ctx: ContextWindow, engineType: EngineType) {
  // Variations use the same prompt as completion — temperature variation provides diversity
  return buildCompletionPrompt(ctx, engineType)
}
