---
description: Agent instructions for personal website (Next.js 16 + React 19 + TypeScript + MDX)
globs: "**/*"
---

# Personal Website Agent Instructions

> **Stack:** Next.js 16 · React 19 · TypeScript 5 · TailwindCSS 4 · MDX · Framer Motion · shadcn/ui

## Commands

```bash
pnpm dev                  # Dev server (port 3000)
pnpm build                # Production build
pnpm lint                 # ESLint
pnpm typecheck            # TypeScript strict mode
pnpm new-post             # Create blog post (interactive)
pnpm new-post --title "X" --tags "A,B"  # CLI mode
pnpm storybook            # Component explorer (port 6006)
pnpm preprocess           # Rebuild search index/cache
pnpm lclean               # Clean .next, .cache
```

## Project Structure

```
app/                      # Next.js App Router
├── blog/posts/{slug}/    # Blog posts (page.mdx)
├── api/                  # API routes (validated with Zod)
├── layout.tsx            # Root layout + providers
└── globals.scss          # Theme variables, prose styles

components/
├── ui/                   # shadcn/ui primitives ← USE THESE
├── hooks/                # Custom hooks
└── particles/            # TSParticles configs

lib/
├── server.ts             # BackendService singleton (posts, search, cache)
├── client.ts             # Type-safe API client
├── core.ts               # Types, Zod schemas, ApiError, logger
├── metadata.ts           # SEO metadata generators
├── schema.ts             # JSON-LD structured data
└── utils.ts              # cn(), formatDate, helpers

scripts/                  # Build preprocessing (new-post.ts, etc.)
public/                   # Static assets, particle configs
docs/                     # Fumadocs (separate pnpm workspace)
```

## Code Patterns

### Components — Use existing UI primitives
```typescript
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  variant: 'primary' | 'secondary'
  children: React.ReactNode
}

export function MyComponent({ variant, children }: Props) {
  return (
    <Button className={cn('px-4', variant === 'primary' && 'bg-accent')}>
      {children}
    </Button>
  )
}
```

### Server Components — Data fetching
```typescript
import { BackendService } from '@/lib/server'

export default async function Page() {
  await BackendService.ensurePreprocessed()
  const posts = await BackendService.getInstance().getAllPosts()
  return <PostList posts={posts} />
}
```

### Client Components — Interactivity
```typescript
'use client'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export function Interactive() {
  // Use Suspense for async, ErrorBoundary for resilience
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AsyncContent />
    </Suspense>
  )
}
```

## Naming

| Type | Pattern | Example |
|------|---------|---------|
| Components | PascalCase | `PostCard.tsx` |
| Hooks | use* | `useWindowSize.ts` |
| Utils | camelCase | `formatDate.ts` |
| Types | PascalCase | `PostMetadata` |
| CSS Modules | kebab-case | `blog-title.module.scss` |

## Blog Posts

**Location:** `app/blog/posts/{slug}/page.mdx`

```yaml
---
title: "Post Title"
image: "/post-hero.svg"      # In public/
caption: "Short tagline"
summary: "SEO description"
tags: ["Category", "Tech"]
created: "2026-01-15"
updated: "2026-01-15"
---
```

Create via `pnpm new-post` or manually.

## Git

- **Branch:** `master`
- **Commits:** `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`
- **Scope:** `feat(blog): add reading time`

## Boundaries

| | Rule |
|---|------|
| ✅ **Always** | Run `pnpm lint && pnpm typecheck` before commits |
| ✅ **Always** | Use `@/` path aliases |
| ✅ **Always** | Use existing `components/ui/` primitives |
| ✅ **Always** | Wrap async in `<Suspense>` |
| ⚠️ **Ask** | Adding dependencies |
| ⚠️ **Ask** | Modifying `next.config.mjs` MDX plugins |
| ⚠️ **Ask** | Changing `scripts/` or Tailwind config |
| 🚫 **Never** | Touch `.env*`, `node_modules/`, `.next/`, `pnpm-lock.yaml` |

## Key Files

| File | Purpose |
|------|---------|
| `lib/server.ts` | BackendService: posts, search, LRU cache |
| `lib/metadata.ts` | SEO: `generatePostMetadata()` |
| `lib/schema.ts` | JSON-LD: `generateArticleSchema()` |
| `lib/core.ts` | Types, Zod schemas, `ApiError`, logger |
| `next.config.mjs` | MDX plugins, webpack |
| `tailwind.config.js` | Theme, 30+ custom animations |

## Gotchas

- **Hydration:** Use `'use client'` + `useEffect` for browser-only code
- **MDX imports:** Always `@/` aliases, never relative
- **Particles:** Theme configs in `public/particles/`
- **Math:** Wrap LaTeX in `<Math>` component for numbering/anchors
- **Images:** Put in `public/`, reference as `/filename.svg`

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | ✅ | Site URL for meta tags, sitemap |
| `ANALYZE` | ❌ | Set `true` for bundle analyzer |
| `NODE_ENV` | Auto | `development` / `production` |

No `.env.local` needed for local dev (defaults work). For production, set `NEXT_PUBLIC_SITE_URL`.
