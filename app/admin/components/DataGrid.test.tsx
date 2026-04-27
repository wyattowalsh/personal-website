// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataGrid } from './DataGrid';

const testData = [
  { id: 1, name: 'Alpha', value: 100, category: 'A' },
  { id: 2, name: 'Beta', value: 50, category: 'B' },
  { id: 3, name: 'Gamma', value: 200, category: 'A' },
  { id: 4, name: 'Delta', value: 75, category: 'C' },
] as Record<string, unknown>[];

const columns = [
  { key: 'name' as const, label: 'Name', sortable: true, searchable: true },
  { key: 'value' as const, label: 'Value', sortable: true, align: 'right' as const },
  { key: 'category' as const, label: 'Category', searchable: true },
];

describe('DataGrid', () => {
  it('renders all rows', () => {
    render(<DataGrid data={testData} columns={columns} />);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByText('Gamma')).toBeInTheDocument();
    expect(screen.getByText('Delta')).toBeInTheDocument();
  });

  it('shows empty message when no data', () => {
    render(<DataGrid data={[]} columns={columns} emptyMessage="No items found" />);
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('filters by search query', () => {
    render(
      <DataGrid
        data={testData}
        columns={columns}
        searchFields={['name', 'category']}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'Alpha' } });

    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.queryByText('Beta')).not.toBeInTheDocument();
  });

  it('sorts descending on first click (default)', () => {
    render(<DataGrid data={testData} columns={columns} />);

    const valueHeader = screen.getByText('Value');
    fireEvent.click(valueHeader);

    const rows = screen.getAllByRole('row');
    // Default sort is desc — highest value first
    expect(rows[1]).toHaveTextContent('Gamma');
  });

  it('sorts ascending on second click', () => {
    render(<DataGrid data={testData} columns={columns} />);

    const valueHeader = screen.getByText('Value');
    fireEvent.click(valueHeader); // desc
    fireEvent.click(valueHeader); // asc

    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Beta');
  });

  it('calls custom render function', () => {
    const customColumns = [
      {
        key: 'value' as const,
        label: 'Value',
        render: (value: unknown) => `$${value}`,
      },
    ];

    render(<DataGrid data={testData} columns={customColumns} />);
    expect(screen.getByText('$100')).toBeInTheDocument();
  });

  it('shows result count', () => {
    render(<DataGrid data={testData} columns={columns} />);
    expect(screen.getByText(/Showing 4 of 4 results/)).toBeInTheDocument();
  });
});
