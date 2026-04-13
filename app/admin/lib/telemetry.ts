import 'server-only';

import { BackendService } from '@/lib/server';
import { logger } from '@/lib/logger';
import { getAdminRateLimitSnapshot, getAdminRateLimitSummary } from '@/lib/admin-auth';
import type { LogEntry, RateLimitSnapshot } from '@/lib/types';

export interface AdminTelemetrySnapshot {
  generatedAt: string;
  status: 'healthy' | 'degraded';
  system: {
    uptimeSeconds: number;
    heapUsedMb: number;
    heapTotalMb: number;
    rssMb: number;
  };
  overview: {
    totalPosts: number;
    totalWords: number;
    totalTags: number;
    avgReadingMinutes: number;
    daysSinceLastPost: number | null;
    postsLast30Days: number;
    searchIndexSize: number;
    preprocessDurationMs: number | null;
    recentWarnings: number;
    recentErrors: number;
  };
  preprocess: {
    ready: boolean;
    inFlight: boolean;
    lastRunAt: string | null;
    startedAt: string | null;
    durationMs: number | null;
    errors: number;
    cache: {
      sortedPostsCached: boolean;
      taggedPostsCached: number;
    };
  };
  security: {
    trackedKeys: number;
    limitedKeys: number;
    totalBlockedAttempts: number;
    maxAttempts: number;
    windowMinutes: number;
    recentRateLimits: RateLimitSnapshot[];
    recentAuthEvents: LogEntry[];
  };
  recent: {
    logs: LogEntry[];
    calendar: Array<{
      created: string;
      title: string;
    }>;
    posts: Array<{
      slug: string;
      title: string;
      created: string;
      wordCount: number;
      tags: string[];
    }>;
  };
}

export async function getAdminTelemetrySnapshot(): Promise<AdminTelemetrySnapshot> {
  await BackendService.ensurePreprocessed();
  const backend = BackendService.getInstance();
  const [posts, tags] = await Promise.all([
    backend.getAllPosts(),
    backend.getAllTags(),
  ]);

  const telemetryState = backend.getTelemetryState();
  const recentLogs = logger.getRecentEntries(16);
  const recentAuthEvents = logger.getRecentEntries(8, { source: 'admin-auth' });
  const recentWarnings = logger.getRecentEntries(50, { levels: ['warning'] }).length;
  const recentErrors = logger.getRecentEntries(50, { levels: ['error'] }).length;
  const rateLimitSummary = getAdminRateLimitSummary();
  const recentRateLimits = getAdminRateLimitSnapshot(6);
  const memory = process.memoryUsage();

  const totalWords = posts.reduce((sum, post) => sum + (post.wordCount ?? 0), 0);
  const avgReadingMinutes = posts.length > 0
    ? Math.round(posts.reduce((sum, post) => {
      const match = post.readingTime?.match(/(\d+)/);
      return sum + (match ? parseInt(match[1], 10) : 0);
    }, 0) / posts.length)
    : 0;

  const sortedPosts = [...posts].sort(
    (left, right) => (right.createdTimestamp ?? 0) - (left.createdTimestamp ?? 0)
  );
  const lastPostDate = sortedPosts[0]?.created;
  const daysSinceLastPost = lastPostDate
    ? Math.floor((Date.now() - new Date(lastPostDate).getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const postsLast30Days = posts.filter((post) => {
    const ageMs = Date.now() - new Date(post.created).getTime();
    return ageMs <= 30 * 24 * 60 * 60 * 1000;
  }).length;

  const preprocessErrors = telemetryState.latestPreprocessStats?.errors ?? 0;
  const status = preprocessErrors > 0 || recentErrors > 0 ? 'degraded' : 'healthy';

  return {
    generatedAt: new Date().toISOString(),
    status,
    system: {
      uptimeSeconds: Math.round(process.uptime()),
      heapUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
      heapTotalMb: Math.round(memory.heapTotal / 1024 / 1024),
      rssMb: Math.round(memory.rss / 1024 / 1024),
    },
    overview: {
      totalPosts: posts.length,
      totalWords,
      totalTags: tags.length,
      avgReadingMinutes,
      daysSinceLastPost,
      postsLast30Days,
      searchIndexSize: telemetryState.counts.searchIndexSize,
      preprocessDurationMs: telemetryState.latestPreprocessStats?.duration ?? null,
      recentWarnings,
      recentErrors,
    },
    preprocess: {
      ready: telemetryState.preprocessed,
      inFlight: telemetryState.isPreprocessing,
      lastRunAt: telemetryState.lastPreprocessedAt,
      startedAt: telemetryState.lastPreprocessStartedAt,
      durationMs: telemetryState.latestPreprocessStats?.duration ?? null,
      errors: preprocessErrors,
      cache: telemetryState.cache,
    },
    security: {
      trackedKeys: rateLimitSummary.trackedKeys,
      limitedKeys: rateLimitSummary.limitedKeys,
      totalBlockedAttempts: rateLimitSummary.totalBlockedAttempts,
      maxAttempts: rateLimitSummary.maxAttempts,
      windowMinutes: Math.round(rateLimitSummary.windowMs / 1000 / 60),
      recentRateLimits,
      recentAuthEvents,
    },
    recent: {
      logs: recentLogs,
      calendar: sortedPosts.map((post) => ({
        created: post.created,
        title: post.title,
      })),
      posts: sortedPosts.slice(0, 5).map((post) => ({
        slug: post.slug,
        title: post.title,
        created: post.created,
        wordCount: post.wordCount ?? 0,
        tags: post.tags ?? [],
      })),
    },
  };
}