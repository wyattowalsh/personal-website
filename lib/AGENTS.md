# lib/ — Core Utilities & Services

## Files

| File | Purpose | Key Exports |
|------|---------|-------------|
| `server.ts` | Backend singleton | `BackendService` |
| `services.ts` | Simplified API wrapper | `services.posts.*`, `services.tags.*` |
| `client.ts` | Browser API client | `api` |
| `core.ts` | Types, schemas, logger | `Post`, `ApiError`, `logger`, `schemas` |
| `metadata.ts` | SEO metadata | `generatePostMetadata()`, `generatePostStructuredData()` |
| `schema.ts` | JSON-LD generators | `generateArticleSchema()`, `generateBreadcrumbSchema()` |
| `types.ts` | TypeScript interfaces | `PostMetadata`, `AdjacentPost` |
| `utils.ts` | Helpers | `cn()`, `formatDate()`, `slugify()` |

## services (Recommended API)

Prefer `services` over `BackendService` directly—handles preprocessing automatically:

```typescript
import { services } from '@/lib/services'

// Posts
const posts = await services.posts.getAll()
const post = await services.posts.get(slug)    // null if not found
const results = await services.posts.search(query)
const tagged = await services.posts.getByTag(tag)
const { previous, next } = await services.posts.getAdjacent(slug)

// Tags
const tags = await services.tags.getAll()
```

## BackendService (Low-level)

```typescript
import { BackendService } from '@/lib/server'
const backend = BackendService.getInstance()

// Same methods as services, but must call ensurePreprocessed() first
await BackendService.ensurePreprocessed()
```

Features: LRU cache (500 items, 1hr TTL), Fuse.js search

## Metadata & SEO (metadata.ts)

```typescript
import { generatePostMetadata, generatePostStructuredData } from '@/lib/metadata'

// In page.tsx or generateMetadata()
export const metadata = generatePostMetadata({ post, slug })

// For JSON-LD script tag
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

- Use `services.*` in app code (auto-preprocesses)
- Use `BackendService` only in build scripts
- Keep utils pure and tree-shakeable
