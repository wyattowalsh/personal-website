# Gemini CLI Instructions

@./AGENTS.md

## Gemini-Specific Guidance

**Approach:**
- Incremental changes over large rewrites
- Follow existing patterns in the codebase
- Verify with `pnpm lint && pnpm typecheck` before commits

**Prefer:**
- Existing `components/ui/` primitives
- Type-safe patterns with Zod schemas from `lib/core.ts`
- `@/` path aliases for all imports

**Key entry points:**
- `content/posts/{slug}/index.mdx` — Authored blog post source
- `lib/server.ts` — `BackendService` for blog data and search
- `lib/metadata.ts` — SEO metadata + structured data helpers
- `lib/utils.ts` — cn(), formatDate helpers
- `app/globals.scss` — Theme CSS variables

**MDX posts:**
- Preserve frontmatter structure exactly
- Images in `public/`, referenced as `/filename.svg`
- Use `@/` imports, never relative

**Stack context:** Next.js 16 · React 19 · TypeScript 5 · TailwindCSS 4

<!-- @-imports AGENTS.md as canonical source -->
