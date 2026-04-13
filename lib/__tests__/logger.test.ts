import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';

vi.mock('server-only', () => ({}));

import { logger, LogLevel, formatters } from '@/lib/logger';

beforeAll(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  vi.restoreAllMocks();
});

// ---------- Ring buffer overflow ----------

describe('ring buffer overflow', () => {
  const SRC = 'ring-buffer-test';

  it('caps entries at 120 and evicts oldest', () => {
    for (let i = 0; i < 150; i++) {
      logger.info(`ring-${i}`, undefined, SRC);
    }

    const entries = logger.getRecentEntries(200, { source: SRC });

    expect(entries).toHaveLength(120);
    // getRecentEntries returns newest first
    expect(entries[0].message).toBe('ring-149');
    // oldest surviving entry should be ring-30 (0..29 evicted)
    expect(entries[entries.length - 1].message).toBe('ring-30');
    // ring-0 should be gone
    expect(entries.find((e) => e.message === 'ring-0')).toBeUndefined();
  });
});

// ---------- debug() level gate ----------

describe('debug() level gate', () => {
  const SRC = 'debug-gate-test';

  afterAll(() => {
    logger.level = LogLevel.INFO;
  });

  it('does not record debug entries at default INFO level', () => {
    expect(logger.level).toBe(LogLevel.INFO);
    logger.debug('should-be-hidden', undefined, SRC);

    const entries = logger.getRecentEntries(100, {
      source: SRC,
      levels: ['debug'],
    });
    expect(entries).toHaveLength(0);
  });

  it('records debug entries when level is set to DEBUG', () => {
    logger.level = LogLevel.DEBUG;
    logger.debug('visible', undefined, SRC);

    const entries = logger.getRecentEntries(100, {
      source: SRC,
      levels: ['debug'],
    });
    expect(entries).toHaveLength(1);
    expect(entries[0].message).toBe('visible');
  });
});

// ---------- getRecentEntries() filtering ----------

describe('getRecentEntries() filtering', () => {
  const SRC_A = 'filter-srcA';
  const SRC_B = 'filter-srcB';

  beforeAll(() => {
    logger.info('msg1', undefined, SRC_A);
    logger.warning('msg2', undefined, SRC_B);
    logger.error('msg3', new Error('oops'), SRC_A);
  });

  it('filters by source', () => {
    const entries = logger.getRecentEntries(100, { source: SRC_A });
    expect(entries).toHaveLength(2);
    expect(entries.every((e) => e.source === SRC_A)).toBe(true);
  });

  it('filters by levels', () => {
    const entries = logger.getRecentEntries(100, {
      source: SRC_B,
      levels: ['warning'],
    });
    expect(entries).toHaveLength(1);
    expect(entries[0].level).toBe('warning');
  });

  it('filters by both source and levels', () => {
    const entries = logger.getRecentEntries(100, {
      source: SRC_A,
      levels: ['error'],
    });
    expect(entries).toHaveLength(1);
    expect(entries[0].level).toBe('error');
    expect(entries[0].data).toBe('oops');
  });

  it('respects the limit parameter', () => {
    const entries = logger.getRecentEntries(1, { source: SRC_A });
    expect(entries).toHaveLength(1);
    // newest first — should be the error entry
    expect(entries[0].message).toBe('msg3');
  });
});

// ---------- formatters ----------

describe('formatters', () => {
  it('duration() formats milliseconds', () => {
    const result = formatters.duration(500);
    expect(result).toContain('ms');
    expect(result).toBe('500.00ms');
  });

  it('duration() formats seconds', () => {
    const result = formatters.duration(2500);
    expect(result).toContain('s');
    expect(result).toBe('2.50s');
  });

  it('fileSize() formats 1024 bytes as 1.00KB', () => {
    expect(formatters.fileSize(1024)).toBe('1.00KB');
  });

  it('fileSize() formats 0 bytes as 0.00B', () => {
    expect(formatters.fileSize(0)).toBe('0.00B');
  });
});
