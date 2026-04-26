export const DEFAULT_POSTHOG_API_HOST = 'https://us.posthog.com';
export const POSTHOG_QUERY_TIMEOUT_MS = 10_000;
export const POSTHOG_ROLLUP_QUERY_TIMEOUT_MS = 45_000;
export const ROLLUP_CHUNK_DAYS = 30;

export const INTERACTION_EVENTS = [
  'reading_progress',
  'time_on_page',
  'search_query',
  'search_no_results',
  'share_click',
  'scroll_depth',
  'link_click',
  'code_copied',
  'theme_changed',
] as const;
