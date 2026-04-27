'use client';

import { useMemo, useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Search,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface DataColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: T[keyof T], item: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  searchable?: boolean;
}

interface DataGridProps<T extends Record<string, unknown>> {
  data: T[];
  columns: DataColumn<T>[];
  searchFields?: (keyof T)[];
  emptyMessage?: string;
}

export function DataGrid<T extends Record<string, unknown>>({
  data,
  columns,
  searchFields = [],
  emptyMessage = 'No data available',
}: DataGridProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filteredAndSorted = useMemo(() => {
    let result = [...data];

    // Search
    if (searchQuery && searchFields.length > 0) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) =>
        searchFields.some((field) =>
          String(item[field]).toLowerCase().includes(query)
        )
      );
    }

    // Sort
    if (sortKey) {
      result.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];

        if (aVal === bVal) return 0;
        if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
        return sortDir === 'asc' ? 1 : -1;
      });
    }

    return result;
  }, [data, searchQuery, sortKey, sortDir, searchFields]);

  const toggleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      {searchFields.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border/50 bg-card/40 backdrop-blur-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/30 bg-muted/30">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-muted/50',
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-right',
                    col.sortable && 'cursor-pointer'
                  )}
                  style={{ width: col.width }}
                  onClick={() => col.sortable && toggleSort(col.key)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>{col.label}</span>
                    {col.sortable && sortKey === col.key && (
                      <span className="text-[hsl(var(--chart-1))]">
                        {sortDir === 'asc' ? (
                          <ChevronUp className="size-4" />
                        ) : (
                          <ChevronDown className="size-4" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredAndSorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              filteredAndSorted.map((item, idx) => (
                <tr
                  key={idx}
                  className="border-b border-border/20 transition-colors hover:bg-muted/40"
                >
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className={cn(
                        'px-4 py-3 text-sm',
                        col.align === 'center' && 'text-center',
                        col.align === 'right' && 'text-right'
                      )}
                      style={{ width: col.width }}
                    >
                      {col.render ? col.render(item[col.key], item) : String(item[col.key])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Result count */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Showing {filteredAndSorted.length} of {data.length} {data.length === 1 ? 'result' : 'results'}
        </span>
      </div>
    </div>
  );
}
