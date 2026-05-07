// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
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
    expect(screen.getByRole('combobox', { name: 'Filter by tag' })).toHaveTextContent('All Tags');
    expect(screen.getByRole('combobox', { name: 'Sort posts' })).toHaveTextContent('Newest');
  });

  it('exposes search as a named search field with form metadata', () => {
    const onChange = vi.fn();
    render(
      <ContentFilters
        allTags={['react', 'typescript', 'nextjs']}
        onFilterChange={onChange}
        filters={DEFAULT_FILTERS}
      />
    );

    expect(screen.getByRole('search', { name: 'Filter posts' })).toBeInTheDocument();
    const searchInput = screen.getByRole('searchbox', { name: 'Search posts' });

    expect(searchInput).toHaveAttribute('id', 'admin-content-search');
    expect(searchInput).toHaveAttribute('name', 'search');
  });

  it('does not submit the filter form when pressing Enter in search', () => {
    const onChange = vi.fn();
    render(
      <ContentFilters
        allTags={['react', 'typescript', 'nextjs']}
        onFilterChange={onChange}
        filters={DEFAULT_FILTERS}
      />
    );

    const form = screen.getByRole('search', { name: 'Filter posts' });
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(submitEvent);

    expect(submitEvent.defaultPrevented).toBe(true);
  });

  it('names tag and sort filter controls', () => {
    const onChange = vi.fn();
    render(
      <ContentFilters
        allTags={['react', 'typescript', 'nextjs']}
        onFilterChange={onChange}
        filters={DEFAULT_FILTERS}
      />
    );

    expect(screen.getByRole('combobox', { name: 'Filter by tag' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Sort posts' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Search scope' })).toBeInTheDocument();
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

  it('keeps typed search text while debouncing parent filter updates', () => {
    vi.useFakeTimers();
    const onChange = vi.fn();

    try {
      render(
        <ContentFilters
          allTags={['Agents', 'Admin']}
          onFilterChange={onChange}
          filters={{ ...DEFAULT_FILTERS }}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search posts...') as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'Agents' } });

      expect(searchInput.value).toBe('Agents');
      expect(onChange).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_FILTERS, search: 'Agents' });
    } finally {
      vi.useRealTimers();
    }
  });
});
