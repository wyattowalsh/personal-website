# OpenAI Codex CLI Instructions

See [AGENTS.md](./AGENTS.md) for full project guidance.

## Quick Commands

```bash
pnpm dev          # Dev server (port 3000)
pnpm lint         # ESLint
pnpm typecheck    # TypeScript strict mode
pnpm new-post     # Create blog post
```

## Codex-Specific Guidance

**Stack:** Next.js 16 · React 19 · TypeScript 5 · TailwindCSS 4

**Approach:**
- Verify with `pnpm lint && pnpm typecheck` before commits
- Follow existing patterns in the codebase

**Prefer:**
- `@/` path aliases for imports
- `cn()` from `@/lib/utils` for classNames
- Existing `components/ui/` primitives
- Server components by default, `'use client'` when needed

**Key entry points:**
- `content/posts/{slug}/index.mdx` — Authored blog post source
- `lib/server.ts` — `BackendService` for posts, tags, and search
- `lib/metadata.ts` — Post metadata + structured data helpers
- `lib/utils.ts` — cn(), formatDate
- `components/ui/` — Button, Card, etc.

**Never modify:** `.env*`, `node_modules/`, `.next/`, `pnpm-lock.yaml`

<!-- Points to AGENTS.md as canonical source -->
