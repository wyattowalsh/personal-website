import { NextResponse } from 'next/server';
import { z } from 'zod';
import { clampRollupRefreshDays } from '@/app/admin/lib/analytics-windows';
import { refreshAnalyticsRollups, pruneAnalyticsData } from '@/app/admin/lib/analytics-rollups';
import { getRollupConfig } from '@/app/admin/lib/analytics-rollups';
import { cleanEnvValue } from '@/app/admin/lib/posthog-query';
import { DATA_RETENTION_DAYS } from '@/app/admin/lib/analytics-constants';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const querySchema = z.object({
  days: z.string().optional(),
});

function isAuthorized(request: Request): boolean {
  const cronSecret = cleanEnvValue(process.env.CRON_SECRET);
  if (!cronSecret) return false;
  return request.headers.get('authorization') === `Bearer ${cronSecret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const days = clampRollupRefreshDays(parsed.data.days);
  const result = await refreshAnalyticsRollups(days);

  // Prune old analytics data after successful refresh to prevent Turso free tier overflow
  if (result.status !== 'error') {
    try {
      const { config } = getRollupConfig();
      if (config) {
        const { createClient } = await import('@libsql/client/web');
        const client = createClient({ url: config.url, authToken: config.authToken });
        try {
          const pruneResult = await pruneAnalyticsData(client, DATA_RETENTION_DAYS);
          Object.assign(result, { pruneResult });
        } finally {
          client.close();
        }
      }
    } catch {
      // Pruning failure is non-critical; don't fail the cron
    }
  }

  const status = result.status === 'error' ? 500 : 200;

  return NextResponse.json(result, {
    status,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
