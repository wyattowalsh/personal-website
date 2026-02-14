# app/ — Next.js App Router

## Structure

```
app/
├── layout.tsx            # Root layout (ThemeProvider, analytics, fonts)
├── page.tsx              # Home page
├── globals.scss          # Global styles, Tailwind layers
├── variables.module.scss # Theme CSS variables (light/dark)
├── blog/                 # Blog section
│   ├── posts/{slug}/     # Individual posts (page.mdx)
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
// Server Component (default) — use services API
import { services } from '@/lib/services'

export default async function Page() {
  const data = await services.posts.getAll()
  return <Component data={data} />
}
```

See [lib/AGENTS.md](../lib/AGENTS.md) for full `services` API.

## Client Components

```typescript
'use client'
// Only when needed: interactivity, hooks, browser APIs
// Keep client boundaries as low in tree as possible
```

## MDX Posts

Location: `blog/posts/{slug}/page.mdx`

- Frontmatter required (title, summary, tags, created, updated)
- Use `@/` imports, never relative
- Images reference `/public/` as `/filename.svg`

## API Routes

- All handlers in `api/` use Zod validation from `lib/core.ts`
- Return JSON with consistent shape
- Set appropriate Cache-Control headers
