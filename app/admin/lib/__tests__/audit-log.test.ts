import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  logAuditEvent,
  getAuditLog,
  ensureAuditSchema,
  type AuditEvent,
} from '../audit-log';

const mockClient = {
  execute: vi.fn(),
  close: vi.fn(),
};

vi.mock('@libsql/client/web', () => ({
  createClient: vi.fn(() => mockClient),
}));

const ORIGINAL_ENV = process.env;

beforeEach(() => {
  vi.restoreAllMocks();
  process.env = { ...ORIGINAL_ENV };
  mockClient.execute.mockReset();
  mockClient.close.mockReset();
});

afterEach(() => {
  process.env = ORIGINAL_ENV;
});

function mockEventRow(event: Partial<AuditEvent> = {}) {
  return {
    id: event.id ?? 'uuid-1',
    action: event.action ?? 'LOGIN',
    actor: event.actor ?? 'admin',
    resource: event.resource ?? '/admin',
    details: event.details ?? null,
    timestamp: event.timestamp ?? '2026-04-27T00:00:00.000Z',
    ip: event.ip ?? null,
  };
}

describe('audit-log', () => {
  it('creates audit_log schema with indexes', async () => {
    process.env.TURSO_DATABASE_URL = 'libsql://example.turso.io';
    process.env.TURSO_AUTH_TOKEN = 'token';
    mockClient.execute.mockResolvedValue({ rows: [] });

    await ensureAuditSchema(mockClient as never);

    const calls = mockClient.execute.mock.calls.map((c) => c[0] as string);
    expect(
      calls.some((sql) => sql.includes('CREATE TABLE IF NOT EXISTS audit_log'))
    ).toBe(true);
    expect(
      calls.some((sql) => sql.includes('idx_audit_log_timestamp'))
    ).toBe(true);
  });

  it('logs an audit event with defaults', async () => {
    process.env.TURSO_DATABASE_URL = 'libsql://example.turso.io';
    process.env.TURSO_AUTH_TOKEN = 'token';
    mockClient.execute.mockResolvedValue({ rows: [] });

    await logAuditEvent({
      action: 'LOGIN',
      actor: 'admin',
      resource: '/admin',
      ip: '127.0.0.1',
    });

    const insertCall = mockClient.execute.mock.calls.find(
      (c) =>
        typeof c[0] === 'object' &&
        (c[0] as { sql?: string }).sql?.includes('INSERT INTO audit_log')
    );
    expect(insertCall).toBeDefined();
    const args = (insertCall![0] as { args: unknown[] }).args;
    expect(args[1]).toBe('LOGIN');
    expect(args[2]).toBe('admin');
    expect(args[3]).toBe('/admin');
    expect(args[6]).toBe('127.0.0.1');
  });

  it('retrieves audit log ordered by timestamp desc', async () => {
    process.env.TURSO_DATABASE_URL = 'libsql://example.turso.io';
    process.env.TURSO_AUTH_TOKEN = 'token';
    mockClient.execute.mockResolvedValue({
      rows: [
        mockEventRow({
          action: 'LOGOUT',
          actor: 'admin',
          timestamp: '2026-04-27T12:00:00.000Z',
        }),
        mockEventRow({
          action: 'LOGIN',
          actor: 'admin',
          timestamp: '2026-04-27T11:00:00.000Z',
        }),
      ],
    });

    const logs = await getAuditLog(20);

    expect(logs).toHaveLength(2);
    expect(logs[0].action).toBe('LOGOUT');
    expect(logs[1].action).toBe('LOGIN');
    expect(logs[0].actor).toBe('admin');
  });

  it('throws when Turso env vars are missing', async () => {
    delete process.env.TURSO_DATABASE_URL;
    delete process.env.TURSO_AUTH_TOKEN;

    await expect(
      logAuditEvent({ action: 'LOGIN', actor: 'admin', resource: '/admin' })
    ).rejects.toThrow('Missing Turso environment variables');
  });

  it('respects the limit parameter', async () => {
    process.env.TURSO_DATABASE_URL = 'libsql://example.turso.io';
    process.env.TURSO_AUTH_TOKEN = 'token';
    mockClient.execute.mockResolvedValue({ rows: [] });

    await getAuditLog(50);

    const selectCall = mockClient.execute.mock.calls.find(
      (c) =>
        typeof c[0] === 'object' &&
        (c[0] as { sql?: string }).sql?.includes('LIMIT')
    );
    expect(selectCall).toBeDefined();
    expect((selectCall![0] as { args: unknown[] }).args[0]).toBe(50);
  });
});
