// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ExportButton } from './ExportButton';
import { exportToCSV } from '@/app/admin/lib/export-utils';

vi.mock('@/app/admin/lib/export-utils', () => ({
  exportToCSV: vi.fn(),
  exportToJSON: vi.fn(),
}));

describe('ExportButton', () => {
  it('announces a successful single-format export', () => {
    render(
      <ExportButton
        data={[{ title: 'Post' }]}
        filename="posts.csv"
        formats={['csv']}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    expect(exportToCSV).toHaveBeenCalledWith([{ title: 'Post' }], 'posts.csv');
    expect(screen.getByText('CSV export started.')).toHaveClass('sr-only');
  });

  it('surfaces export failures accessibly', () => {
    vi.mocked(exportToCSV).mockImplementationOnce(() => {
      throw new Error('Download blocked');
    });

    render(
      <ExportButton
        data={[{ title: 'Post' }]}
        filename="posts.csv"
        formats={['csv']}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    expect(screen.getByText('Download blocked')).toBeInTheDocument();
    expect(screen.getByText('Export failed: Download blocked')).toHaveClass('sr-only');
  });
});
