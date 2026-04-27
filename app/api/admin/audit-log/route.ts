import { z } from 'zod';
import { api as coreApi, ApiError } from '@/lib/core';
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
  actor: z.string().min(1),
  resource: z.string().default(''),
  details: z.string().optional(),
  ip: z.string().optional(),
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
    const isAuthenticated = await validateAdminSession();
    if (!isAuthenticated) {
      throw new ApiError(401, 'Unauthorized');
    }

    const body = await coreApi.middleware.validateRequest(
      request,
      auditActionSchema
    );
    await logAuditEvent(body);
    return Response.json({ success: true });
  }
);
