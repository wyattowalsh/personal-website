'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CONTENT_SEARCH_SCOPES,
  DEFAULT_FILTERS,
  type ContentFilterValues,
} from '../content/filter-utils';

export { DEFAULT_FILTERS, type ContentFilterValues } from '../content/filter-utils';

interface ContentFiltersProps {
  allTags: string[];
  onFilterChange: (filters: ContentFilterValues) => void;
  filters: ContentFilterValues;
}

export function ContentFilters({ allTags, onFilterChange, filters }: ContentFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestFiltersRef = useRef(filters);
  const syncedSearchRef = useRef(filters.search);

  useEffect(() => {
    latestFiltersRef.current = filters;
  }, [filters]);

  // Debounce search input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (searchInput !== latestFiltersRef.current.search) {
        onFilterChange({ ...latestFiltersRef.current, search: searchInput });
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [onFilterChange, searchInput]);

  // Sync external filter reset back to local input
  useEffect(() => {
    if (filters.search !== syncedSearchRef.current) {
      syncedSearchRef.current = filters.search;
      setSearchInput(filters.search); // eslint-disable-line react-hooks/set-state-in-effect -- sync from prop
    }
  }, [filters.search]);

  const isFiltered =
    filters.tag !== DEFAULT_FILTERS.tag ||
    filters.sort !== DEFAULT_FILTERS.sort ||
    filters.search !== DEFAULT_FILTERS.search ||
    filters.scope !== DEFAULT_FILTERS.scope;

  const handleReset = () => {
    setSearchInput('');
    onFilterChange({ ...DEFAULT_FILTERS });
  };

  return (
    <form
      role="search"
      aria-label="Filter posts"
      className="flex flex-wrap items-center gap-3"
      onSubmit={(event) => event.preventDefault()}
    >
      {/* Search */}
      <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
        <Search aria-hidden="true" className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="admin-content-search"
          name="search"
          type="search"
          aria-label="Search posts"
          autoComplete="off"
          placeholder="Search posts..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="border-border/80 bg-background/70 pl-9"
        />
      </div>

      {/* Tag filter */}
      <Select
        value={filters.tag}
        onValueChange={(value) => onFilterChange({ ...filters, tag: value })}
      >
        <SelectTrigger aria-label="Filter by tag" className="w-[160px] border-border/80 bg-background/70">
          <SelectValue placeholder="All Tags" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Tags</SelectItem>
          {allTags.map((tag) => (
            <SelectItem key={tag} value={tag}>
              {tag}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Search scope */}
      <Select
        value={filters.scope}
        onValueChange={(value) => onFilterChange({ ...filters, scope: value as ContentFilterValues['scope'] })}
      >
        <SelectTrigger aria-label="Search scope" className="w-[160px] border-border/80 bg-background/70">
          <SelectValue placeholder="Title" />
        </SelectTrigger>
        <SelectContent>
          {CONTENT_SEARCH_SCOPES.map((scope) => (
            <SelectItem key={scope} value={scope}>
              {scope === 'all' ? 'All Fields' : scope[0].toUpperCase() + scope.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Sort */}
      <Select
        value={filters.sort}
        onValueChange={(value) => onFilterChange({ ...filters, sort: value as ContentFilterValues['sort'] })}
      >
        <SelectTrigger aria-label="Sort posts" className="w-[160px] border-border/80 bg-background/70">
          <SelectValue placeholder="Newest" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="oldest">Oldest</SelectItem>
          <SelectItem value="most-words">Most Words</SelectItem>
          <SelectItem value="least-words">Least Words</SelectItem>
          <SelectItem value="a-z">A-Z</SelectItem>
        </SelectContent>
      </Select>

      {/* Reset */}
      {isFiltered && (
        <Button type="button" variant="ghost" size="sm" onClick={handleReset} className="gap-1.5">
          <X aria-hidden="true" className="h-3.5 w-3.5" />
          Reset
        </Button>
      )}
    </form>
  );
}
