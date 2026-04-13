import 'server-only';
import type { LogEntry, TelemetryLogLevel } from './types';

const MAX_RECENT_ENTRIES = 120;
let logSequence = 0;
const recentEntries: LogEntry[] = [];

function scoped(message: string, source?: string): string {
  return source ? `[${source}] ${message}` : message;
}

function serialize(data: unknown): string | undefined {
  if (data === undefined) return undefined;
  if (typeof data === 'string') return data;
  if (data instanceof Error) return data.message;
  try { return JSON.stringify(data); } catch { return String(data); }
}

function record(level: TelemetryLogLevel, message: string, data?: unknown, source?: string) {
  recentEntries.push({
    id: `${Date.now()}-${logSequence++}`,
    timestamp: new Date().toISOString(),
    level, message, source,
    data: serialize(data),
  });
  if (recentEntries.length > MAX_RECENT_ENTRIES) {
    recentEntries.splice(0, recentEntries.length - MAX_RECENT_ENTRIES);
  }
}

export enum LogLevel { DEBUG = 0, INFO = 1, SUCCESS = 2, WARNING = 3, ERROR = 4 }

export const formatters = {
  duration(ms: number): string {
    if (ms < 1000) return `${ms.toFixed(2)}ms`;
    const s = ms / 1000;
    return s < 60 ? `${s.toFixed(2)}s` : `${(s / 60).toFixed(2)}m`;
  },
  fileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes, i = 0;
    while (size >= 1024 && i < units.length - 1) { size /= 1024; i++; }
    return `${size.toFixed(2)}${units[i]}`;
  },
  path(fullPath: string): string {
    return fullPath.replace(process.cwd(), '').replace(/^\//, '');
  },
};

export const logger = {
  level: LogLevel.INFO,
  setLevel(level: LogLevel) { this.level = level; },

  info(msg: string, data?: unknown, source?: string) {
    record('info', msg, data, source);
    console.log(`[INFO] ${scoped(msg, source)}`, data !== undefined ? data : '');
  },
  success(msg: string, data?: unknown, source?: string) {
    record('success', msg, data, source);
    console.log(`[SUCCESS] ${scoped(msg, source)}`, data !== undefined ? data : '');
  },
  warning(msg: string, data?: unknown, source?: string) {
    record('warning', msg, data, source);
    console.warn(`[WARN] ${scoped(msg, source)}`, data !== undefined ? data : '');
  },
  error(msg: string, error?: Error, source?: string) {
    record('error', msg, error, source);
    console.error(`[ERROR] ${scoped(msg, source)}`);
    if (error?.stack) console.error(error.stack);
  },
  debug(msg: string, data?: unknown, source?: string) {
    if (logger.level <= LogLevel.DEBUG) {
      record('debug', msg, data, source);
      console.log(`[DEBUG] ${scoped(msg, source)}`, data !== undefined ? data : '');
    }
  },
  timing(label: string, duration: number, source?: string) {
    const message = `${label}: ${formatters.duration(duration)}`;
    record('timing', message, { duration }, source);
    console.log(`[TIME] ${scoped(message, source)}`);
  },

  getRecentEntries(limit = 25, options?: { levels?: TelemetryLogLevel[]; source?: string }) {
    const filtered = recentEntries.filter((entry) => {
      if (options?.source && entry.source !== options.source) return false;
      if (options?.levels && !options.levels.includes(entry.level)) return false;
      return true;
    });
    return filtered.slice(-limit).toReversed();
  },

  formatters,
};
