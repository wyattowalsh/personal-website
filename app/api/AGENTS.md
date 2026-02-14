# app/api/ — API Routes

## Structure

```
api/
├── blog/
│   ├── posts/
│   │   └── route.ts      # GET /api/blog/posts
│   └── search/
│       └── route.ts      # GET /api/blog/search?q=
└── shared/
    └── route.ts          # Shared utilities
```

## Route Handler Pattern

```typescript
import { NextResponse } from 'next/server'
import { BackendService } from '@/lib/server'

export async function GET(request: Request) {
  try {
    const data = await BackendService.getInstance().getAllPosts()
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, max-age=3600' }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## Validation with Zod

```typescript
import { z } from 'zod'

const querySchema = z.object({
  q: z.string().min(1),
  limit: z.coerce.number().optional()
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const result = querySchema.safeParse(Object.fromEntries(searchParams))
  
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  
  const { q, limit } = result.data
  // ...
}
```

## Conventions

- Return JSON with consistent shape
- Set Cache-Control headers appropriately
- Validate inputs with Zod (schemas in `lib/core.ts` or `lib/schema.ts`)
- Use try/catch with `logger.error()` from `lib/core.ts`
- Throw `ApiError` for known errors: `throw new ApiError('Not found', 404)`
