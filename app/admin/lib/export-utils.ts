/**
 * Browser-side export utilities for CSV and JSON downloads.
 */

function triggerDownload(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Sanitize a single value for CSV output.
 * - Wraps in quotes if value contains commas, quotes, or newlines
 * - Doubles internal quotes per RFC 4180
 */
export function sanitizeCSVValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // Escape quotes by doubling them
  const escaped = stringValue.replace(/"/g, '""');

  // Wrap in quotes if contains comma, quote, or newline
  if (/[",\n\r]/.test(stringValue)) {
    return `"${escaped}"`;
  }

  return escaped;
}

/**
 * Convert an array of objects to a CSV string and trigger a browser download.
 */
export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  if (data.length === 0) {
    triggerDownload('', filename, 'text/csv;charset=utf-8;');
    return;
  }

  const headers = Object.keys(data[0]);
  const lines: string[] = [];

  // Header row
  lines.push(headers.map(sanitizeCSVValue).join(','));

  // Data rows
  for (const row of data) {
    const values = headers.map((header) => sanitizeCSVValue(row[header]));
    lines.push(values.join(','));
  }

  const csv = lines.join('\n');
  triggerDownload(csv, filename, 'text/csv;charset=utf-8;');
}

/**
 * Serialize data to JSON and trigger a browser download.
 */
export function exportToJSON(data: unknown, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  triggerDownload(json, filename, 'application/json;charset=utf-8;');
}
