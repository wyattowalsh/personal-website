// ═══════════════════════════════════════════════════════════════
// PostHog Timeouts
// ═══════════════════════════════════════════════════════════════
export const DEFAULT_POSTHOG_API_HOST = 'https://us.posthog.com';
export const POSTHOG_QUERY_TIMEOUT_MS = 10_000;
export const POSTHOG_ROLLUP_QUERY_TIMEOUT_MS = 45_000;
export const POSTHOG_LIVE_QUERY_TIMEOUT_MS = 8_000;

// ═══════════════════════════════════════════════════════════════
// Provider-Specific Timeouts (used with Promise.allSettled)
// ═══════════════════════════════════════════════════════════════
export const PAGESPEED_QUERY_TIMEOUT_MS = 12_000;
export const SEARCH_CONSOLE_QUERY_TIMEOUT_MS = 10_000;
export const GITHUB_API_TIMEOUT_MS = 10_000;
export const INDEXNOW_API_TIMEOUT_MS = 5_000;
export const VERCEL_API_TIMEOUT_MS = 8_000;

// ═══════════════════════════════════════════════════════════════
// Parallelism & Performance
// ═══════════════════════════════════════════════════════════════
export const MAX_CONCURRENT_EXTERNAL_CALLS = 4;
export const FAST_PROVIDER_TIMEOUT_MS = 3_000;
export const SLOW_PROVIDER_TIMEOUT_MS = 5_000;

// ═══════════════════════════════════════════════════════════════
// Rollup & Window Configuration
// ═══════════════════════════════════════════════════════════════
export const ROLLUP_CHUNK_DAYS = 30;
export const MAX_ANALYTICS_WINDOW_DAYS = 90;
export const DEFAULT_ANALYTICS_WINDOW_DAYS = 30;

// ═══════════════════════════════════════════════════════════════
// Anomaly Detection
// ═══════════════════════════════════════════════════════════════
export const ANOMALY_THRESHOLD_STD_DEV = 2;

// ═══════════════════════════════════════════════════════════════
// Data Retention (Turso free tier: 5GB)
// ═══════════════════════════════════════════════════════════════
export const DATA_RETENTION_DAYS = 90;

// ═══════════════════════════════════════════════════════════════
// Auth & Session
// ═══════════════════════════════════════════════════════════════
export const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours
export const RATE_LIMIT_MAX_ATTEMPTS = 5;
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const ADMIN_SESSION_COOKIE_NAME = 'admin_session';

// ═══════════════════════════════════════════════════════════════
// Caching
// ═══════════════════════════════════════════════════════════════
export const DASHBOARD_CACHE_STALE_MS = 5 * 60 * 1000; // 5 minutes
export const FEATURE_FLAG_PREFIX = 'ADMIN_FF_';

// ═══════════════════════════════════════════════════════════════
// Build
// ═══════════════════════════════════════════════════════════════
export const BUNDLE_ANALYZER_ENABLED = process.env.ANALYZE === 'true';

// ═══════════════════════════════════════════════════════════════
// Feature Flags
// ═══════════════════════════════════════════════════════════════
export const FeatureFlags = {
  analytics: true,
  telemetry: true,
  contentIntelligence: true,
  securityAudit: true,
  performanceOptimization: true,
  growthTools: true,
  exportBackup: true,
  dashboardCustomization: true,
} as const;

// ═══════════════════════════════════════════════════════════════
// Interaction Events
// ═══════════════════════════════════════════════════════════════
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
