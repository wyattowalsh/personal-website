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
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  function handleExport(format: ExportFormat) {
    setIsExporting(true);
    setErrorMessage('');
    setStatusMessage(`Preparing ${format.toUpperCase()} export.`);
    try {
      if (format === 'csv') {
        exportToCSV(data as Record<string, unknown>[], filename.replace(/\.\w+$/, '.csv'));
      } else {
        exportToJSON(data, filename.replace(/\.\w+$/, '.json'));
      }
      setStatusMessage(`${format.toUpperCase()} export started.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Export failed.';
      setErrorMessage(message);
      setStatusMessage(`Export failed: ${message}`);
    } finally {
      // Reset after a short delay to allow the browser to process the download
      setTimeout(() => setIsExporting(false), 500);
    }
  }

  const liveStatus = (
    <>
      <p aria-live="polite" className="sr-only">{statusMessage}</p>
      {errorMessage ? <p className="mt-2 text-xs text-destructive">{errorMessage}</p> : null}
    </>
  );

  if (formats.length === 1) {
    const format = formats[0];
    return (
      <div>
        <Button
          variant="outline"
          size="sm"
          className={cn('gap-2', className)}
          disabled={isExporting}
          onClick={() => handleExport(format)}
        >
          <Download aria-hidden="true" className="size-4" />
          {label}
        </Button>
        {liveStatus}
      </div>
    );
  }

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn('gap-2', className)}
            disabled={isExporting}
          >
            <Download aria-hidden="true" className="size-4" />
            {label}
            <ChevronDown aria-hidden="true" className="size-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {formats.includes('csv') && (
            <DropdownMenuItem onClick={() => handleExport('csv')} className="gap-2">
              <FileSpreadsheet aria-hidden="true" className="size-4 text-muted-foreground" />
              Export as CSV
            </DropdownMenuItem>
          )}
          {formats.includes('json') && (
            <DropdownMenuItem onClick={() => handleExport('json')} className="gap-2">
              <FileJson aria-hidden="true" className="size-4 text-muted-foreground" />
              Export as JSON
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {liveStatus}
    </div>
  );
}
