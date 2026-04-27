import 'server-only';

import { createClient, type InValue } from '@libsql/client';
import { getRollupConfig } from './analytics-rollups';

export interface BackupResult {
  version: '1.0';
  exportedAt: string;
  tables: {
    analytics_rollup_days: Array<Record<string, unknown>>;
    analytics_rollup_dimensions: Array<Record<string, unknown>>;
    analytics_rollup_runs: Array<Record<string, unknown>>;
  };
}

interface TursoRow {
  [key: string]: unknown;
}

function serializeRow(row: TursoRow): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    result[key] = value;
  }
  return result;
}

/**
 * Dump all analytics rollup tables from Turso into a portable JSON backup object.
 */
export async function createTursoBackup(): Promise<BackupResult> {
  const { config, missingEnv } = getRollupConfig();
  if (!config) {
    throw new Error(`Missing analytics rollup env vars: ${missingEnv.join(', ')}`);
  }

  const client = createClient({ url: config.url, authToken: config.authToken });

  try {
    const [daysResult, dimensionsResult, runsResult] = await Promise.all([
      client.execute('SELECT * FROM analytics_rollup_days ORDER BY day ASC'),
      client.execute('SELECT * FROM analytics_rollup_dimensions ORDER BY day ASC, kind ASC, label ASC'),
      client.execute('SELECT * FROM analytics_rollup_runs ORDER BY started_at ASC'),
    ]);

    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      tables: {
        analytics_rollup_days: daysResult.rows.map(serializeRow),
        analytics_rollup_dimensions: dimensionsResult.rows.map(serializeRow),
        analytics_rollup_runs: runsResult.rows.map(serializeRow),
      },
    };
  } finally {
    client.close();
  }
}

/**
 * Restore analytics rollup tables from a portable JSON backup object.
 * Uses REPLACE INTO to overwrite existing rows.
 */
export async function restoreTursoBackup(backup: BackupResult): Promise<void> {
  const { config, missingEnv } = getRollupConfig();
  if (!config) {
    throw new Error(`Missing analytics rollup env vars: ${missingEnv.join(', ')}`);
  }

  const client = createClient({ url: config.url, authToken: config.authToken });

  try {
    const dayRows = backup.tables.analytics_rollup_days;
    const dimensionRows = backup.tables.analytics_rollup_dimensions;
    const runRows = backup.tables.analytics_rollup_runs;

    // Restore analytics_rollup_days
    if (dayRows.length > 0) {
      await client.batch(
        dayRows.map((row) => ({
          sql: `REPLACE INTO analytics_rollup_days
            (day, pageviews, visitors, sessions, interactions, searches, outbound_clicks, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            row.day,
            row.pageviews,
            row.visitors,
            row.sessions,
            row.interactions,
            row.searches,
            row.outbound_clicks,
            row.updated_at,
          ] as InValue[],
        })),
        'write'
      );
    }

    // Restore analytics_rollup_dimensions
    if (dimensionRows.length > 0) {
      await client.batch(
        dimensionRows.map((row) => ({
          sql: `REPLACE INTO analytics_rollup_dimensions
            (day, kind, label, detail_key, value, detail, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
          args: [
            row.day,
            row.kind,
            row.label,
            row.detail_key,
            row.value,
            row.detail ?? null,
            row.updated_at,
          ] as InValue[],
        })),
        'write'
      );
    }

    // Restore analytics_rollup_runs
    if (runRows.length > 0) {
      await client.batch(
        runRows.map((row) => ({
          sql: `REPLACE INTO analytics_rollup_runs
            (id, started_at, completed_at, status, window_days, error)
            VALUES (?, ?, ?, ?, ?, ?)`,
          args: [
            row.id,
            row.started_at,
            row.completed_at ?? null,
            row.status,
            row.window_days,
            row.error ?? null,
          ] as InValue[],
        })),
        'write'
      );
    }
  } finally {
    client.close();
  }
}
