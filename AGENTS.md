---
description: Agent instructions for personal website (Next.js 16 + React 19 + TypeScript + MDX)
globs: "**/*"
---

# Personal Website Agent Instructions

> **Stack:** Next.js 16 · React 19 · TypeScript 5 · TailwindCSS 4 · MDX · Framer Motion · shadcn/ui

## Commands

```bash
pnpm dev                  # Dev server (port 3458)
pnpm build                # Production build
pnpm lint                 # ESLint
pnpm typecheck            # TypeScript strict mode
pnpm test                 # Run vitest tests
pnpm test:subtitle-geometry  # Playwright homepage subtitle geometry gate
pnpm new-post             # Create blog post (interactive)
pnpm new-post --title "X" --tags "A,B"  # CLI mode
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
| `lib/admin-auth.ts` | Admin authentication, session cookies, rate limiting |
| `app/admin/` | Admin dashboard (auth, content, blog-stats, telemetry) |
| `app/admin/lib/analytics-rollups.ts` | Turso DB schema health & repair, analytics aggregation |
| `next.config.mjs` | MDX plugins, webpack, CSP |
| `app/tailwind.css` | Theme, fonts, animations (CSS-first v4) |

## Admin Dashboard

The `/admin` dashboard provides visitor analytics, content management, and growth metrics. It requires authentication and database configuration.

### Authentication

- **Local dev:** No password required (empty password)
- **Production:** Set `ADMIN_PASSWORD` in Vercel environment variables
- **Session:** Signed with `SESSION_SIGNING_KEY` (HMAC); 24-hour expiry
- **Rate limit:** 5 login attempts per 15 minutes
- Cookies are HttpOnly, Secure (production), and SameSite=Strict

See `lib/admin-auth.ts` for session creation, validation, and cookie management.

### Analytics Database

Analytics data is stored in a Turso SQLite database with automatic schema management:

- **Schema health states:** `healthy` (ready), `outdated` (needs migration), `unknown` (not initialized)
- **Fresh DB init:** Tables created with hardened NOT NULL constraints on first deploy
- **Race condition safety:** COUNT queries wrapped in try-catch; treats failures as empty tables
- **Data-aware repair:** Won't repair tables with existing data (requires manual backup/restore)
- **Required env:** `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` (production only)

The schema repair logic is in `app/admin/lib/analytics-rollups.ts` with full inline documentation.

### PostHog Integration

The admin dashboard queries PostHog for aggregate visitor analytics. Requires:

- `POSTHOG_PERSONAL_API_KEY` (server-only, `query:read` scope, **not** the public token)
- `POSTHOG_PROJECT_ID` (numeric)
- `POSTHOG_API_HOST` (optional; defaults to US region)

Without these, the Analytics panel shows a setup state instead of charts.

### Key Panels

| Panel | Data Source | Required Env |
|-------|-------------|--------------|
| Analytics | PostHog aggregate queries | `POSTHOG_*` vars |
| Content | Blog posts, series, tags | None (local) |
| Blog Stats | Reading time, engagement metrics | None (local) |
| Growth | Google Search Console, PageSpeed, IndexNow | `GOOGLE_OAUTH_*`, `PAGESPEED_API_KEY`, `INDEXNOW_KEY` |
| Deployments | Vercel | `VERCEL_TOKEN`, `VERCEL_PROJECT_ID` |

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
| `ADMIN_PASSWORD` | ⚠️ | Admin login password (production only; empty in dev) |
| `SESSION_SIGNING_KEY` | ⚠️ | HMAC key for admin session cookies (production only) |
| `TURSO_DATABASE_URL` | ⚠️ | Turso DB URL for admin analytics (if using `/admin`) |
| `TURSO_AUTH_TOKEN` | ⚠️ | Turso auth token (if using `/admin`) |
| `POSTHOG_PERSONAL_API_KEY` | ⚠️ | PostHog query API key for admin analytics (if using `/admin`) |
| `POSTHOG_PROJECT_ID` | ⚠️ | PostHog project ID (if using `/admin`) |
| `ANALYZE` | ❌ | Set `true` for bundle analyzer |
| `NODE_ENV` | Auto | `development` / `production` |

**Notes:**

- ✅ = Required for site to function
- ⚠️ = Required only for specific features (admin, analytics)
- ❌ = Optional

No `.env.local` needed for local dev. The site works without admin or analytics vars; features that require them show setup states instead.

For production `/admin` access, set `ADMIN_PASSWORD` and `SESSION_SIGNING_KEY`. For analytics, also set `TURSO_*` and `POSTHOG_*` vars.
