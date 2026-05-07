export const CONTENT_SEARCH_SCOPES = ['title', 'summary', 'tags', 'all'] as const;
export const CONTENT_SORTS = ['newest', 'oldest', 'most-words', 'least-words', 'a-z'] as const;

export type ContentSearchScope = typeof CONTENT_SEARCH_SCOPES[number];
export type ContentSort = typeof CONTENT_SORTS[number];

export interface ContentFilterValues {
  tag: string;
  sort: ContentSort;
  search: string;
  scope: ContentSearchScope;
}

export interface FilterableContentPost {
  slug: string;
  title: string;
  summary?: string;
  tags: string[];
  created: string;
  wordCount: number;
}

export const DEFAULT_FILTERS: ContentFilterValues = {
  tag: 'all',
  sort: 'newest',
  search: '',
  scope: 'title',
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function isContentSort(value: string | undefined): value is ContentSort {
  return CONTENT_SORTS.includes(value as ContentSort);
}

function isContentSearchScope(value: string | undefined): value is ContentSearchScope {
  return CONTENT_SEARCH_SCOPES.includes(value as ContentSearchScope);
}

export function parseContentFilters(searchParams: Record<string, string | string[] | undefined>): ContentFilterValues {
  const search = firstParam(searchParams.q)?.trim() ?? DEFAULT_FILTERS.search;
  const tag = firstParam(searchParams.tag)?.trim() || DEFAULT_FILTERS.tag;
  const sort = firstParam(searchParams.sort);
  const scope = firstParam(searchParams.scope);

  return {
    tag,
    sort: isContentSort(sort) ? sort : DEFAULT_FILTERS.sort,
    search,
    scope: isContentSearchScope(scope) ? scope : DEFAULT_FILTERS.scope,
  };
}

function includesQuery(value: string | undefined, query: string): boolean {
  return (value ?? '').toLowerCase().includes(query);
}

function postMatchesSearch(post: FilterableContentPost, query: string, scope: ContentSearchScope): boolean {
  if (!query) return true;

  if (scope === 'title') return includesQuery(post.title, query);
  if (scope === 'summary') return includesQuery(post.summary, query);
  if (scope === 'tags') return post.tags.some((tag) => includesQuery(tag, query));

  return [post.title, post.summary, post.slug, ...post.tags].some((value) => includesQuery(value, query));
}

export function filterContentPosts<TPost extends FilterableContentPost>(posts: TPost[], filters: ContentFilterValues): TPost[] {
  const query = filters.search.toLowerCase();
  const result = posts.filter((post) => {
    if (filters.tag !== 'all' && !post.tags.includes(filters.tag)) return false;
    return postMatchesSearch(post, query, filters.scope);
  });

  switch (filters.sort) {
    case 'newest':
      return result.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
    case 'oldest':
      return result.sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime());
    case 'most-words':
      return result.sort((a, b) => b.wordCount - a.wordCount);
    case 'least-words':
      return result.sort((a, b) => a.wordCount - b.wordCount);
    case 'a-z':
      return result.sort((a, b) => a.title.localeCompare(b.title));
  }
}
