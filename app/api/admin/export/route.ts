import { NextResponse } from 'next/server';
import { z } from 'zod';
import { BackendService } from '@/lib/server';
import { api } from '@/lib/core';
import { getVisitorAnalyticsSnapshot } from '@/app/admin/lib/visitor-analytics';
import { getRollupConfig } from '@/app/admin/lib/analytics-rollups';
import { createClient } from '@libsql/client';

export const dynamic = 'force-dynamic';

const querySchema = z.object({
  format: z.enum(['csv', 'json']),
  type: z.enum(['analytics', 'posts', 'visitors']),
});

function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const lines: string[] = [];

  const sanitize = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const str = String(value).replace(/"/g, '""');
    if (/[",\n\r]/.test(String(value))) return `"${str}"`;
    return str;
  };

  lines.push(headers.map(sanitize).join(','));
  for (const row of rows) {
    lines.push(headers.map((h) => sanitize(row[h])).join(','));
  }
  return lines.join('\n');
}

function downloadResponse(data: string, filename: string, contentType: string): NextResponse {
  return new NextResponse(data, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}

export const GET = api.middleware.withErrorHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse(Object.fromEntries(searchParams));

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { format, type } = parsed.data;

  if (type === 'posts') {
    await BackendService.ensurePreprocessed();
    const posts = await BackendService.getInstance().getAllPosts();
    const rows = posts.map((post) => ({
      slug: post.slug,
      title: post.title,
      summary: post.summary ?? '',
      created: post.created,
      updated: post.updated ?? post.created,
      tags: post.tags.join(', '),
      wordCount: post.wordCount,
      readingTime: post.readingTime ?? '',
      image: post.image ?? '',
      caption: post.caption ?? '',
      series: post.series?.name ?? '',
      seriesOrder: post.series?.order ?? '',
    }));

    if (format === 'csv') {
      return downloadResponse(toCSV(rows), 'posts.csv', 'text/csv;charset=utf-8;');
    }
    return downloadResponse(JSON.stringify(rows, null, 2), 'posts.json', 'application/json;charset=utf-8;');
  }

  if (type === 'visitors') {
    const snapshot = await getVisitorAnalyticsSnapshot();
    const rows = [
      {
        metric: 'status',
        value: snapshot.status,
        windowDays: snapshot.windowDays,
        generatedAt: snapshot.generatedAt,
      },
      ...snapshot.overview.map((item) => ({
        metric: item.label,
        value: item.value,
        description: item.description,
        windowDays: snapshot.windowDays,
        generatedAt: snapshot.generatedAt,
      })),
      ...snapshot.topPages.map((item, i) => ({
        metric: `top_page_${i + 1}`,
        label: item.label,
        value: item.value,
        detail: item.detail ?? '',
        windowDays: snapshot.windowDays,
        generatedAt: snapshot.generatedAt,
      })),
      ...snapshot.referrers.map((item, i) => ({
        metric: `referrer_${i + 1}`,
        label: item.label,
        value: item.value,
        detail: item.detail ?? '',
        windowDays: snapshot.windowDays,
        generatedAt: snapshot.generatedAt,
      })),
      ...snapshot.devices.map((item, i) => ({
        metric: `device_${i + 1}`,
        label: item.label,
        value: item.value,
        detail: item.detail ?? '',
        windowDays: snapshot.windowDays,
        generatedAt: snapshot.generatedAt,
      })),
    ];

    if (format === 'csv') {
      return downloadResponse(toCSV(rows), 'visitors.csv', 'text/csv;charset=utf-8;');
    }
    return downloadResponse(JSON.stringify(rows, null, 2), 'visitors.json', 'application/json;charset=utf-8;');
  }

  // type === 'analytics'
  const { config } = getRollupConfig();
  if (!config) {
    return NextResponse.json(
      { error: 'Analytics rollup database is not configured' },
      { status: 503 }
    );
  }

  const client = createClient({ url: config.url, authToken: config.authToken });
  try {
    const result = await client.execute(
      'SELECT day, pageviews, visitors, sessions, interactions, searches, outbound_clicks FROM analytics_rollup_days ORDER BY day ASC'
    );
    const rows = result.rows.map((row) => ({
      day: String(row.day ?? ''),
      pageviews: Number(row.pageviews ?? 0),
      visitors: Number(row.visitors ?? 0),
      sessions: Number(row.sessions ?? 0),
      interactions: Number(row.interactions ?? 0),
      searches: Number(row.searches ?? 0),
      outboundClicks: Number(row.outbound_clicks ?? 0),
    }));

    if (format === 'csv') {
      return downloadResponse(toCSV(rows), 'analytics.csv', 'text/csv;charset=utf-8;');
    }
    return downloadResponse(JSON.stringify(rows, null, 2), 'analytics.json', 'application/json;charset=utf-8;');
  } finally {
    client.close();
  }
});
