// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContentFilters, DEFAULT_FILTERS } from './ContentFilters';

describe('ContentFilters', () => {
  it('renders search input and filters', () => {
    const onChange = vi.fn();
    render(
      <ContentFilters
        allTags={['react', 'typescript', 'nextjs']}
        onFilterChange={onChange}
        filters={DEFAULT_FILTERS}
      />
    );

    expect(screen.getByPlaceholderText('Search posts...')).toBeInTheDocument();
    expect(screen.getByText('All Tags')).toBeInTheDocument();
    expect(screen.getByText('Newest')).toBeInTheDocument();
  });

  it('shows reset button when filtered', () => {
    const onChange = vi.fn();
    render(
      <ContentFilters
        allTags={['react']}
        onFilterChange={onChange}
        filters={{ ...DEFAULT_FILTERS, tag: 'react' }}
      />
    );

    expect(screen.getByText('Reset')).toBeInTheDocument();
  });

  it('hides reset button with default filters', () => {
    const onChange = vi.fn();
    render(
      <ContentFilters
        allTags={['react']}
        onFilterChange={onChange}
        filters={DEFAULT_FILTERS}
      />
    );

    expect(screen.queryByText('Reset')).not.toBeInTheDocument();
  });

  it('resets filters when reset clicked', () => {
    const onChange = vi.fn();
    render(
      <ContentFilters
        allTags={['react']}
        onFilterChange={onChange}
        filters={{ ...DEFAULT_FILTERS, tag: 'react', search: 'test' }}
      />
    );

    fireEvent.click(screen.getByText('Reset'));
    expect(onChange).toHaveBeenCalledWith(DEFAULT_FILTERS);
  });
});
