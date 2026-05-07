import { z } from 'zod';
import { api as coreApi, ApiError } from '@/lib/core';
import { resolveClientIp, validateRequestOrigin } from '@/lib/admin-auth';
import { validateAdminSession } from '@/app/admin/lib/auth';
import { logAuditEvent, getAuditLog } from '@/app/admin/lib/audit-log';

const auditActionSchema = z.object({
  action: z.enum([
    'LOGIN',
    'LOGOUT',
    'EXPORT',
    'SETTINGS_CHANGE',
    'DATA_PRUNE',
    'BACKUP_CREATE',
  ]),
  resource: z.string().default(''),
  details: z.string().optional(),
});

export const GET = coreApi.middleware.withErrorHandler(async () => {
  const isAuthenticated = await validateAdminSession();
  if (!isAuthenticated) {
    throw new ApiError(401, 'Unauthorized');
  }

  const events = await getAuditLog(100);
  return Response.json(events);
});

export const POST = coreApi.middleware.withErrorHandler(
  async (request: Request) => {
    if (!validateRequestOrigin(request)) {
      throw new ApiError(403, 'Forbidden', undefined, 'FORBIDDEN_ORIGIN');
    }

    const isAuthenticated = await validateAdminSession();
    if (!isAuthenticated) {
      throw new ApiError(401, 'Unauthorized');
    }

    const body = await coreApi.middleware.validateRequest(
      request,
      auditActionSchema
    );
    await logAuditEvent({
      ...body,
      actor: 'admin',
      ip: resolveClientIp(request) ?? undefined,
    });
    return Response.json({ success: true });
  }
);
