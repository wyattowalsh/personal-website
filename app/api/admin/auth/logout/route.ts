import {
  ADMIN_SESSION_LEGACY_PATH,
  serializeAdminSessionCookie,
  validateRequestOrigin,
} from '@/lib/admin-auth';
import { api as coreApi, ApiError } from '@/lib/core';

export const POST = coreApi.middleware.withErrorHandler(
  async (request: Request) => {
    if (!validateRequestOrigin(request)) {
      throw new ApiError(403, 'Forbidden', undefined, 'FORBIDDEN_ORIGIN');
    }

    const response = Response.json({ success: true });
    response.headers.append(
      'Set-Cookie',
      serializeAdminSessionCookie('', { maxAge: 0 })
    );
    response.headers.append(
      'Set-Cookie',
      serializeAdminSessionCookie('', { maxAge: 0, path: ADMIN_SESSION_LEGACY_PATH })
    );
    return response;
  }
);
