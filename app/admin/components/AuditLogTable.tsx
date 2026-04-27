'use client';

import { useEffect, useState } from 'react';
import { DataGrid } from './DataGrid';
import { Badge } from '@/components/ui/badge';
import type { AuditAction } from '../lib/audit-log';

const ACTION_VARIANTS: Record<
  AuditAction,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  LOGIN: 'default',
  LOGOUT: 'secondary',
  EXPORT: 'outline',
  SETTINGS_CHANGE: 'secondary',
  DATA_PRUNE: 'destructive',
  BACKUP_CREATE: 'default',
};

export function AuditLogTable() {
  const [events, setEvents] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch('/api/admin/audit-log');
        if (!res.ok) throw new Error('Failed to fetch audit log');
        const data = (await res.json()) as Record<string, unknown>[];
        setEvents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  if (loading)
    return <div className="text-sm text-muted-foreground">Loading audit log...</div>;
  if (error)
    return <div className="text-sm text-destructive">{error}</div>;

  return (
    <DataGrid
      data={events}
      columns={[
        {
          key: 'timestamp',
          label: 'Timestamp',
          sortable: true,
          render: (value) => new Date(String(value)).toLocaleString(),
        },
        {
          key: 'action',
          label: 'Action',
          render: (value) => (
            <Badge variant={ACTION_VARIANTS[value as AuditAction] ?? 'default'}>
              {String(value)}
            </Badge>
          ),
        },
        { key: 'actor', label: 'Actor' },
        { key: 'resource', label: 'Resource' },
        {
          key: 'details',
          label: 'Details',
          render: (value) => String(value ?? '-'),
        },
      ]}
      searchFields={['action', 'actor', 'resource', 'details']}
      emptyMessage="No audit events found"
    />
  );
}
