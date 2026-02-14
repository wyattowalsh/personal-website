# GitHub Copilot Instructions

See [AGENTS.md](../AGENTS.md) for full project guidance.

## Quick Commands

```bash
pnpm dev          # Dev server (port 3000)
pnpm lint         # ESLint
pnpm typecheck    # TypeScript strict mode
pnpm new-post     # Create blog post
```

## Copilot-Specific Guidance

**Stack:** Next.js 16 · React 19 · TypeScript 5 · TailwindCSS 4

**Prefer:**
- Existing `components/ui/` primitives
- `@/` path aliases for imports
- `cn()` from `@/lib/utils` for classNames
- Server components by default

**Conventions:**
- Components: `PascalCase.tsx`
- Hooks: `use*.ts`
- Commits: `feat:`, `fix:`, `docs:`, `refactor:`

**Before commits:** `pnpm lint && pnpm typecheck`

**Never modify:** `.env*`, `node_modules/`, `.next/`, `pnpm-lock.yaml`

<!-- Copilot: Points to AGENTS.md as canonical source. -->
