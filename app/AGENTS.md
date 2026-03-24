# app/ — Next.js App Router

## Structure

```
app/
├── layout.tsx            # Root layout (ThemeProvider, analytics, fonts)
├── page.tsx              # Home page
├── globals.scss          # Global styles, Tailwind layers
├── variables.module.scss # Theme CSS variables (light/dark)
├── blog/                 # Blog section
│   ├── posts/[slug]/     # Shared post route (layout.tsx + page.tsx)
│   └── tags/[tag]/       # Tag filtering
├── api/                  # API routes
└── feed.*/               # RSS/Atom/JSON feeds
```

## Conventions

- **Layouts:** Use for shared UI (headers, providers)
- **Pages:** `page.tsx` or `page.mdx` for routes
- **Loading:** `loading.tsx` for Suspense fallbacks
- **Error:** `error.tsx` for error boundaries
- **Route groups:** `(group)/` for organization without URL segments

## Data Fetching

```typescript
// Server Component (default) — use BackendService for blog data
import { BackendService } from '@/lib/server'

export default async function Page() {
  await BackendService.ensurePreprocessed()
  const posts = await BackendService.getInstance().getAllPosts()
  return <Component data={posts} />
}
```

See [lib/AGENTS.md](../lib/AGENTS.md) for the full `BackendService` API.

## Client Components

```typescript
'use client'
// Only when needed: interactivity, hooks, browser APIs
// Keep client boundaries as low in tree as possible
```

## MDX Posts

Location: `content/posts/{slug}/index.mdx`

- Frontmatter required (title, summary, tags, created, updated)
- `app/blog/posts/[slug]/page.tsx` renders that MDX file
- `app/blog/posts/[slug]/layout.tsx` generates metadata and JSON-LD
- Do not create per-post `page.mdx` files under `app/blog/posts/`
- Use `@/` imports, never relative
- Images reference `/public/` as `/filename.svg`

## API Routes

- All handlers in `api/` use Zod validation from `lib/core.ts`
- Return JSON with consistent shape
- Set appropriate Cache-Control headers
