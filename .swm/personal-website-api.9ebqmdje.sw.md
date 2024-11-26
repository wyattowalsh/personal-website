---
title: |
  personal-website -- API
---
<SwmSnippet path="/app/api/blog/posts/[slug]/route.ts" line="2">

---

&nbsp;

```typescript
import { createRouteHandler } from '../../../shared/route';
import { backend } from '@/lib/services/backend';
import { ApiError } from '@/lib/api';
import { schemas } from '@/lib/api';

export const GET = createRouteHandler({
  schema: schemas.slug,
  handler: async ({ slug }) => {
    const post = await backend.getPost(slug);
    if (!post) {
      throw new ApiError(404, `Post ${slug} not found`);
    }
    return { post };
  },
  cache: true,
  revalidate: 3600
});

```

---

</SwmSnippet>

<SwmSnippet path="/app/api/blog/posts/metadata/[slug]/route.ts" line="2">

---

&nbsp;

```typescript
// app/api/blog/posts/metadata/[slug]/route.ts
import { NextRequest } from 'next/server';
import { commonMiddleware, schemas } from '@/lib/api/middleware';
import { getPostMetadata } from '@/lib/metadata';

export const GET = commonMiddleware.cached.withMiddleware(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');

  // Validate slug
  await schemas.slug.parseAsync({ slug });

  // Get post metadata
  const metadata = await getPostMetadata(slug);
  if (!metadata) {
    throw new Error('Post not found');
  }

  return Response.json({ metadata });
});
```

---

</SwmSnippet>

<SwmSnippet path="/app/api/blog/posts/route.ts" line="2">

---

&nbsp;

```typescript
import { createRouteHandler } from '../../shared/route';
import { backend } from '@/lib/services/backend';
import { ApiError } from '@/lib/api';

export const GET = createRouteHandler({
  handler: async () => {
    const posts = await backend.getAllPosts();
    if (!posts.length) {
      throw new ApiError(404, 'No posts found');
    }
    return { posts };
  },
  cache: true,
  revalidate: 3600
});
```

---

</SwmSnippet>

<SwmSnippet path="/app/api/blog/search/route.ts" line="2">

---

&nbsp;

```typescript
import { createRouteHandler } from '../../shared/route';
import { schemas } from '@/lib/api';
import { backend } from '@/lib/services/backend';

export const GET = createRouteHandler({
  schema: schemas.search,
  handler: async ({ query }) => ({
    results: await backend.search(query),
    metadata: {
      query,
      timestamp: new Date().toISOString()
    }
  })
});

```

---

</SwmSnippet>

<SwmSnippet path="/app/api/shared/route.ts" line="2">

---

&nbsp;

```typescript
import { NextRequest } from 'next/server';
import { ApiError } from '@/lib/api';
import { backend } from '@/lib/services/backend';
import { z } from 'zod';

export const createRouteHandler = (options: {
  schema?: z.ZodSchema;
  handler: (params: any) => Promise<any>;
  cache?: boolean;
  revalidate?: number;
}) => {
  return async (req: NextRequest) => {
    try {
      const { searchParams } = new URL(req.url);
      const params = Object.fromEntries(searchParams);

      // Validate params if schema provided
      if (options.schema) {
        await options.schema.parseAsync(params);
      }

      const result = await options.handler(params);

      return Response.json(result, {
        headers: {
          'Cache-Control': options.cache 
            ? `public, s-maxage=${options.revalidate || 3600}, stale-while-revalidate=86400`
            : 'no-cache, no-store, must-revalidate'
        }
      });
    } catch (error) {
      if (error instanceof ApiError) {
        return error.toResponse();
      }
      return new ApiError(500, 'Internal Server Error', { error }).toResponse();
    }
  };
};

```

---

</SwmSnippet>

<SwmMeta version="3.0.0" repo-id="Z2l0aHViJTNBJTNBcGVyc29uYWwtd2Vic2l0ZSUzQSUzQXd5YXR0b3dhbHNo" repo-name="personal-website"><sup>Powered by [Swimm](https://app.swimm.io/)</sup></SwmMeta>
