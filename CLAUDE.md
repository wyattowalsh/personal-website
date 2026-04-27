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
- `lib/server.ts` — `BackendService` singleton (posts, search, cache)
- `lib/admin-auth.ts` — Admin session and rate limiting
- `app/admin/` — Admin dashboard with analytics and content management
- `lib/utils.ts` — cn(), formatDate
- `components/ui/` — Button, Card, etc.

**Admin dashboard:**
- Requires `ADMIN_PASSWORD` and `SESSION_SIGNING_KEY` in production
- Analytics powered by Turso + PostHog (optional; shows setup state if unconfigured)
- See AGENTS.md "Admin Dashboard" section for full configuration

<!-- @-imports AGENTS.md as canonical source -->
