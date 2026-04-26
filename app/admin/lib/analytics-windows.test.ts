import { describe, expect, it } from 'vitest';
import { clampRollupRefreshDays, parseAnalyticsWindowDays } from './analytics-windows';

describe('analytics windows', () => {
  it('accepts only supported admin visitor windows', () => {
    expect(parseAnalyticsWindowDays('30')).toBe(30);
    expect(parseAnalyticsWindowDays('90')).toBe(90);
    expect(parseAnalyticsWindowDays('180')).toBe(180);
    expect(parseAnalyticsWindowDays('365')).toBe(365);
    expect(parseAnalyticsWindowDays('999')).toBe(30);
    expect(parseAnalyticsWindowDays(undefined)).toBe(30);
  });

  it('clamps rollup refresh windows to the retained PostHog range', () => {
    expect(clampRollupRefreshDays('1')).toBe(1);
    expect(clampRollupRefreshDays('400')).toBe(365);
    expect(clampRollupRefreshDays('-10')).toBe(1);
    expect(clampRollupRefreshDays(undefined)).toBe(8);
  });
});
