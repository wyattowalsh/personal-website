import 'server-only';
import { createClient, type Client } from '@libsql/client';
import { randomUUID } from 'crypto';

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'EXPORT'
  | 'SETTINGS_CHANGE'
  | 'DATA_PRUNE'
  | 'BACKUP_CREATE';

export interface AuditEvent {
  id: string;
  action: AuditAction;
  actor: string;
  resource: string;
  details?: string;
  timestamp: string;
  ip?: string;
}

interface AuditConfig {
  url: string;
  authToken: string;
}

function getAuditConfig(): AuditConfig | null {
  const url = process.env.TURSO_DATABASE_URL?.trim();
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim();
  if (!url || !authToken) return null;
  return { url, authToken };
}

function createAuditClient(config: AuditConfig): Client {
  return createClient({ url: config.url, authToken: config.authToken });
}

async function withAuditClient<T>(
  callback: (client: Client) => Promise<T>
): Promise<T> {
  const config = getAuditConfig();
  if (!config) {
    throw new Error(
      'Missing Turso environment variables for audit logging'
    );
  }
  const client = createAuditClient(config);
  try {
    return await callback(client);
  } finally {
    client.close();
  }
}

export async function ensureAuditSchema(client: Client): Promise<void> {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT NOT NULL PRIMARY KEY,
      action TEXT NOT NULL,
      actor TEXT NOT NULL,
      resource TEXT NOT NULL DEFAULT '',
      details TEXT,
      timestamp TEXT NOT NULL,
      ip TEXT
    )
  `);
  await client.execute(
    `CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp DESC)`
  );
}

export async function logAuditEvent(
  event: Omit<AuditEvent, 'id' | 'timestamp'> &
    Partial<Pick<AuditEvent, 'id' | 'timestamp'>>
): Promise<void> {
  return withAuditClient(async (client) => {
    await ensureAuditSchema(client);
    const id = event.id ?? randomUUID();
    const timestamp = event.timestamp ?? new Date().toISOString();
    await client.execute({
      sql: `INSERT INTO audit_log (id, action, actor, resource, details, timestamp, ip)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        event.action,
        event.actor,
        event.resource,
        event.details ?? null,
        timestamp,
        event.ip ?? null,
      ],
    });
  });
}

export async function getAuditLog(limit = 100): Promise<AuditEvent[]> {
  return withAuditClient(async (client) => {
    await ensureAuditSchema(client);
    const result = await client.execute({
      sql: `SELECT id, action, actor, resource, details, timestamp, ip
            FROM audit_log
            ORDER BY timestamp DESC
            LIMIT ?`,
      args: [Math.max(1, limit)],
    });
    return result.rows.map((row) => ({
      id: String(row.id ?? ''),
      action: String(row.action ?? '') as AuditAction,
      actor: String(row.actor ?? ''),
      resource: String(row.resource ?? ''),
      details: row.details ? String(row.details) : undefined,
      timestamp: String(row.timestamp ?? ''),
      ip: row.ip ? String(row.ip) : undefined,
    }));
  });
}
