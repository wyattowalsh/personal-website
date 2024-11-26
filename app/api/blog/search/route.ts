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
