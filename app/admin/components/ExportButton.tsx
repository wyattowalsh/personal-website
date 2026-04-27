'use client';

import { useState } from 'react';
import { Download, ChevronDown, FileSpreadsheet, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { exportToCSV, exportToJSON } from '@/app/admin/lib/export-utils';

export type ExportFormat = 'csv' | 'json';

interface ExportButtonProps {
  data: Record<string, unknown>[] | unknown;
  filename: string;
  formats?: ExportFormat[];
  className?: string;
  label?: string;
}

export function ExportButton({
  data,
  filename,
  formats = ['csv', 'json'],
  className,
  label = 'Export',
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  function handleExport(format: ExportFormat) {
    setIsExporting(true);
    try {
      if (format === 'csv') {
        exportToCSV(data as Record<string, unknown>[], filename.replace(/\.\w+$/, '.csv'));
      } else {
        exportToJSON(data, filename.replace(/\.\w+$/, '.json'));
      }
    } finally {
      // Reset after a short delay to allow the browser to process the download
      setTimeout(() => setIsExporting(false), 500);
    }
  }

  if (formats.length === 1) {
    const format = formats[0];
    return (
      <Button
        variant="outline"
        size="sm"
        className={cn('gap-2', className)}
        disabled={isExporting}
        onClick={() => handleExport(format)}
      >
        <Download className="size-4" />
        {label}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('gap-2', className)}
          disabled={isExporting}
        >
          <Download className="size-4" />
          {label}
          <ChevronDown className="size-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {formats.includes('csv') && (
          <DropdownMenuItem onClick={() => handleExport('csv')} className="gap-2">
            <FileSpreadsheet className="size-4 text-muted-foreground" />
            Export as CSV
          </DropdownMenuItem>
        )}
        {formats.includes('json') && (
          <DropdownMenuItem onClick={() => handleExport('json')} className="gap-2">
            <FileJson className="size-4 text-muted-foreground" />
            Export as JSON
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
