import { backend } from '@/lib/services/backend';
import { ApiError } from '@/lib/api';
import { schemas } from '@/lib/api/middleware';

type Params = Promise<{ slug: string }>;

export async function GET(
  request: Request,
  { params }: { params: Params }
): Promise<Response> {
  const { slug } = await params;
  
  return schemas.slug.parseAsync({ slug })
    .then(() => backend.getAdjacentPosts(slug))
    .then(posts => {
      return Response.json(posts, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
        }
      });
    })
    .catch(error => {
      if (error instanceof ApiError) {
        return error.toResponse();
      }
      return new ApiError(500, 'Internal Server Error', { error }).toResponse();
    });
}
