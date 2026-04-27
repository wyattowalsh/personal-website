'use client';

import { useState } from 'react';
import { Shield, ShieldOff, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Session {
  id: string;
  device: string;
  location: string;
  ip: string;
  createdAt: string;
  current: boolean;
}

const MOCK_SESSIONS: Session[] = [
  {
    id: 'sess-1',
    device: 'Chrome on macOS',
    location: 'San Francisco, CA',
    ip: '203.0.113.1',
    createdAt: '2026-04-27T08:00:00.000Z',
    current: true,
  },
  {
    id: 'sess-2',
    device: 'Safari on iOS',
    location: 'San Francisco, CA',
    ip: '203.0.113.45',
    createdAt: '2026-04-26T14:30:00.000Z',
    current: false,
  },
];

export function SessionManager() {
  const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS);

  function revokeSession(id: string) {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  function revokeAllOthers() {
    setSessions((prev) => prev.filter((s) => s.current));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Active Sessions</h3>
        <Button
          variant="destructive"
          size="sm"
          onClick={revokeAllOthers}
          disabled={sessions.length <= 1}
        >
          <ShieldOff className="mr-1.5 h-3.5 w-3.5" />
          Revoke All Other Sessions
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border/50 bg-card/40">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/30 bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Device
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Location
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                IP
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Created
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-sm text-muted-foreground"
                >
                  No active sessions
                </td>
              </tr>
            ) : (
              sessions.map((session) => (
                <tr
                  key={session.id}
                  className="border-b border-border/20 hover:bg-muted/40"
                >
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-muted-foreground" />
                      <span>{session.device}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{session.location}</td>
                  <td className="px-4 py-3 text-sm font-mono text-xs">
                    {session.ip}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(session.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {session.current ? (
                      <Badge variant="default" className="gap-1">
                        <Shield className="h-3 w-3" />
                        Current
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Active</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!session.current && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => revokeSession(session.id)}
                      >
                        Revoke
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
