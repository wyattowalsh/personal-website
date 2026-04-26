export const ANALYTICS_WINDOWS = [30, 90, 180, 365] as const;
export type AnalyticsWindowDays = typeof ANALYTICS_WINDOWS[number];

export const DEFAULT_ANALYTICS_WINDOW_DAYS: AnalyticsWindowDays = 30;
export const MAX_ANALYTICS_WINDOW_DAYS: AnalyticsWindowDays = 365;
export const DEFAULT_ROLLUP_REFRESH_DAYS = 8;

export function parseAnalyticsWindowDays(value: unknown): AnalyticsWindowDays {
  const raw = Array.isArray(value) ? value[0] : value;
  const numeric = typeof raw === 'number' ? raw : Number.parseInt(String(raw ?? ''), 10);

  return ANALYTICS_WINDOWS.find((windowDays) => windowDays === numeric) ?? DEFAULT_ANALYTICS_WINDOW_DAYS;
}

export function clampRollupRefreshDays(value: unknown): number {
  const numeric = Number.parseInt(String(value ?? DEFAULT_ROLLUP_REFRESH_DAYS), 10);

  if (!Number.isFinite(numeric)) return DEFAULT_ROLLUP_REFRESH_DAYS;
  return Math.max(1, Math.min(MAX_ANALYTICS_WINDOW_DAYS, numeric));
}
