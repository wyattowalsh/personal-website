# lib/ — Core Utilities & Services

## Files

| File | Purpose | Key Exports |
|------|---------|-------------|
| `server.ts` | Backend singleton | `BackendService` |
| `core.ts` | Config, API schemas, error helpers | `getConfig()`, `ApiError`, `api`, `schemas` |
| `metadata.ts` | SEO metadata + post structured data | `generatePostMetadata()`, `generatePostStructuredData()` |
| `schema.ts` | JSON-LD generators | `generateArticleSchema()`, `generateBreadcrumbSchema()` |
| `types.ts` | Shared content/config types | `Post`, `PostMetadata`, `Config` |
| `utils.ts` | Helpers | `cn()`, `formatDate()`, `slugify()` |
| `logger.ts` | Structured server logger | `logger`, `formatters` |

## BackendService (Primary API)

```typescript
import { BackendService } from '@/lib/server'

// Must call ensurePreprocessed() before accessing data
await BackendService.ensurePreprocessed()
const backend = BackendService.getInstance()

// Available methods:
const posts = await backend.getAllPosts()
const post = await backend.getPost(slug)       // null if not found
const results = await backend.search(query)
const tagged = await backend.getPostsByTag(tag)
const adjacent = await backend.getAdjacentPosts(slug)  // { previous, next }
const tags = await backend.getAllTags()
```

Features: promise-deduplicated preprocessing, cached post/tag lookups, Fuse.js search

## Metadata & SEO (metadata.ts)

```typescript
import { generatePostMetadata, generatePostStructuredData } from '@/lib/metadata'

// In app/blog/posts/[slug]/layout.tsx
export async function generateMetadata() {
  return generatePostMetadata({ post, slug })
}

// For the shared JSON-LD script tag in layout code
const structuredData = generatePostStructuredData(post, slug)
```

## JSON-LD Schema (schema.ts)

```typescript
import { generateArticleSchema, generateBreadcrumbSchema, generateWebSiteSchema } from '@/lib/schema'

// Article schema for blog posts
const articleLD = generateArticleSchema(post, { baseUrl: 'https://w4w.dev' })

// Breadcrumb schema
const breadcrumbLD = generateBreadcrumbSchema([
  { name: 'Home', item: '/' },
  { name: 'Blog', item: '/blog' },
], 'https://w4w.dev')

// Site-wide schema (cached)
const siteLD = generateWebSiteSchema()
```

## Utilities (utils.ts)

```typescript
import { cn, formatDate, slugify, truncate } from '@/lib/utils'

cn('px-4', condition && 'bg-blue', className)  // tailwind-merge
formatDate('2026-01-15')                       // "January 15, 2026"
slugify('Post Title')                          // "post-title"
truncate(text, 100)                            // "text..." (max 100 chars)
```

## Logger & Error Handling (core.ts)

```typescript
import { logger, ApiError } from '@/lib/core'

logger.info('Message')
logger.error('Error', error)

// In API routes
throw new ApiError('Not found', 404)
```

## Conventions

- Use `BackendService` in app code (call `ensurePreprocessed()` first)
- `BackendService` is the single entry point for all post data access
- Keep utils pure and tree-shakeable
