# Claude Code Instructions

@AGENTS.md

## Claude-Specific Guidance

**Approach:**
- Surgical edits over rewrites — change only what's needed
- Read existing patterns before creating new ones
- Verify with `pnpm lint && pnpm typecheck` before commits

**Prefer:**
- Existing `components/ui/` over new primitives
- `cn()` for className composition
- Server components unless `'use client'` needed
- Named exports over default exports

**Avoid:**
- Creating files when editing suffices
- Inline styles (use Tailwind classes)
- Relative imports in MDX (use `@/`)

**MDX posts:**
- Preserve frontmatter structure exactly
- Images in `public/`, referenced as `/filename.svg`
- Math in `<Math>` component for numbering

**Key entry points:**
- `lib/services.ts` — `services.posts.*`, `services.tags.*`
- `lib/utils.ts` — cn(), formatDate
- `components/ui/` — Button, Card, etc.

<!-- @-imports AGENTS.md as canonical source -->
