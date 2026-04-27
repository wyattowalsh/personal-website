import { describe, expect, it } from 'vitest';
import { detectAnomalies, type AnomalyResult } from '../anomaly-detection';

describe('detectAnomalies()', () => {
  it('returns empty array for empty input', () => {
    const result = detectAnomalies([]);
    expect(result).toEqual([]);
  });

  it('returns non-anomaly for single value', () => {
    const result = detectAnomalies([42]);
    expect(result).toEqual<AnomalyResult[]>([
      { index: 0, value: 42, zScore: 0, isAnomaly: false },
    ]);
  });

  it('detects high outlier in normal data', () => {
    const data = [10, 12, 11, 13, 10, 11, 12, 100, 11, 10];
    const result = detectAnomalies(data);

    expect(result.length).toBe(10);
    expect(result[7].isAnomaly).toBe(true);
    expect(result[7].value).toBe(100);
    expect(result[7].zScore).toBeGreaterThan(2);

    const normalPoints = result.filter((r, i) => i !== 7);
    expect(normalPoints.every((r) => !r.isAnomaly)).toBe(true);
  });

  it('detects low outlier in normal data', () => {
    const data = [50, 52, 51, 53, 50, 1, 52, 51, 50, 53];
    const result = detectAnomalies(data);

    expect(result[5].isAnomaly).toBe(true);
    expect(result[5].value).toBe(1);
    expect(result[5].zScore).toBeLessThan(-2);
  });

  it('returns no anomalies for uniform data', () => {
    const data = [10, 10, 10, 10, 10];
    const result = detectAnomalies(data);

    expect(result.every((r) => !r.isAnomaly)).toBe(true);
    expect(result.every((r) => r.zScore === 0)).toBe(true);
  });

  it('respects custom sensitivity threshold', () => {
    const data = [10, 12, 11, 13, 10, 11, 12, 20, 11, 10];

    const strict = detectAnomalies(data, 1.5);
    const loose = detectAnomalies(data, 3);

    expect(strict[7].isAnomaly).toBe(true);
    expect(loose[7].isAnomaly).toBe(false);
  });

  it('handles negative values correctly', () => {
    const data = [-10, -12, -11, -13, -10, -100, -11];
    const result = detectAnomalies(data);

    expect(result[5].isAnomaly).toBe(true);
    expect(result[5].value).toBe(-100);
  });

  it('handles non-finite values as zeros', () => {
    const data = [10, NaN, 12, Infinity, 11];
    const result = detectAnomalies(data);

    expect(result[1].value).toBe(0);
    expect(result[3].value).toBe(0);
    expect(result.every((r) => Number.isFinite(r.zScore))).toBe(true);
  });

  it('preserves original index order', () => {
    const data = [5, 10, 15, 20, 25];
    const result = detectAnomalies(data);

    result.forEach((r, i) => {
      expect(r.index).toBe(i);
    });
  });
});
