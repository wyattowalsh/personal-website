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
pnpm test                 # Run vitest tests
pnpm new-post             # Create blog post (interactive)
pnpm new-post --title "X" --tags "A,B"  # CLI mode
pnpm storybook            # Component explorer (port 6006)
pnpm preprocess           # Rebuild search index/cache
pnpm lclean               # Clean .next, .cache
```

## Project Structure

```
app/                      # Next.js App Router
├── blog/posts/[slug]/    # Blog post route (dynamic segment)
├── blog/archive/         # Blog archive
├── admin/                # Admin dashboard
├── api/                  # API routes (validated with Zod)
├── .well-known/          # security.txt, webfinger
├── layout.tsx            # Root layout + providers
└── globals.scss          # Theme variables, prose styles

components/
├── ui/                   # shadcn/ui primitives ← USE THESE
├── hooks/                # Custom hooks
└── particles/            # TSParticles configs

content/posts/{slug}/     # Blog post source (index.mdx)

lib/
├── server.ts             # BackendService singleton (posts, search)
├── types.ts              # Shared types (Post, Config, PostMetadata)
├── core.ts               # Zod schemas, ApiError, logger (server-only)
├── metadata.ts           # SEO metadata generators
├── schema.ts             # JSON-LD structured data
├── utils.ts              # cn(), formatDate, isExternal, helpers
├── constants.ts          # Centralized constants
└── admin-auth.ts         # Admin authentication

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

**Location:** `content/posts/{slug}/index.mdx`

```yaml
---
title: "Post Title"
image: "/post-hero.svg"      # In public/
caption: "Short tagline"
summary: "SEO description"
tags: ["Category", "Tech"]
created: "2026-01-15"
updated: "2026-01-15"
series:                       # Optional
  name: "Series Name"
  order: 1
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
| ✅ **Always** | Run `pnpm lint && pnpm typecheck && pnpm test` before commits |
| ✅ **Always** | Use `@/` path aliases |
| ✅ **Always** | Use existing `components/ui/` primitives |
| ✅ **Always** | Wrap async in `<Suspense>` |
| ✅ **Always** | Prefer surgical edits over full rewrites |
| ✅ **Always** | Prefer named exports over default exports |
| ⚠️ **Ask** | Adding dependencies |
| ⚠️ **Ask** | Modifying `next.config.mjs` MDX plugins |
| ⚠️ **Ask** | Changing `scripts/` or Tailwind config |
| ⚠️ **Avoid** | Creating new files when editing existing ones suffices |
| 🚫 **Never** | Touch `.env*`, `node_modules/`, `.next/`, `pnpm-lock.yaml` |

## Key Files

| File | Purpose |
|------|---------|
| `lib/server.ts` | BackendService: posts, search |
| `lib/types.ts` | Shared types: Post, Config, PostMetadata |
| `lib/core.ts` | Zod schemas, ApiError, logger (server-only) |
| `lib/metadata.ts` | SEO: `generatePostMetadata()` |
| `lib/schema.ts` | JSON-LD: `generateArticleSchema()` |
| `next.config.mjs` | MDX plugins, webpack, CSP |
| `app/tailwind.css` | Theme, fonts, animations (CSS-first v4) |

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
