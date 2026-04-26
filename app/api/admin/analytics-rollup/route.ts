import { NextResponse } from 'next/server';
import { z } from 'zod';
import { clampRollupRefreshDays } from '@/app/admin/lib/analytics-windows';
import { refreshAnalyticsRollups } from '@/app/admin/lib/analytics-rollups';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const querySchema = z.object({
  days: z.string().optional(),
});

function isAuthorized(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
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
  const status = result.status === 'error' ? 500 : 200;

  return NextResponse.json(result, {
    status,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
