/**
 * Centralized constants for the application
 *
 * This file contains all magic numbers and configuration values used throughout
 * the codebase to improve maintainability and consistency.
 */

// Cache configuration
export const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
export const LRU_MAX_ENTRIES = 50;

// Blog configuration
export const POSTS_PER_PAGE = 20;

// API configuration
export const API_REVALIDATE_SECONDS = 3600;

// Search configuration
export const SEARCH_THRESHOLD = 0.3;
export const SEARCH_CACHE_TTL_SECONDS = 1800;

// Response time formatting
export const MS_THRESHOLD = 1000;
export const SECONDS_THRESHOLD = 60;

// Studio configuration
export const STUDIO_MAX_CODE_SIZE = 100_000; // 100KB
export const STUDIO_MAX_THUMBNAIL_SIZE = 2_000_000; // 2MB
export const STUDIO_LOOP_LIMIT = 100_000;
export const STUDIO_THUMBNAIL_WIDTH = 400;
export const STUDIO_THUMBNAIL_HEIGHT = 400;
export const STUDIO_MAX_CONSOLE_ENTRIES = 500;
export const STUDIO_AUTOSAVE_INTERVAL_MS = 30_000;
export const STUDIO_MAX_AUTOSAVE_SLOTS = 10;
export const STUDIO_WATCHDOG_TIMEOUT_MS = 5_000;
export const STUDIO_HEARTBEAT_INTERVAL_MS = 2_000;
export const STUDIO_MAX_TAGS = 10;
export const STUDIO_MAX_TITLE_LENGTH = 200;
export const STUDIO_RATE_LIMIT_SAVES_PER_HOUR = 10;
export const STUDIO_RATE_LIMIT_LIKES_PER_HOUR = 50;
export const STUDIO_P5_VERSION = '2.2.1';
export const STUDIO_DEFAULT_CONFIG: {
  width: number;
  height: number;
  fps: number;
  backgroundColor: string;
  pixelDensity: number;
} = {
  width: 400,
  height: 400,
  fps: 60,
  backgroundColor: '#000000',
  pixelDensity: 1,
};
// Studio AI configuration
export const AI_AUTOCOMPLETE_DEBOUNCE_MS = 1500;
export const AI_AUTOCOMPLETE_MAX_TOKENS = 200;
export const AI_INLINE_EDIT_MAX_TOKENS = 1500;
export const AI_VARIATIONS_COUNT = 3;
export const AI_CONTEXT_MAX_CHARS = 6000;

export const STUDIO_ENGINE_DETECT_DEBOUNCE_MS = 800;
export const STUDIO_ENGINE_DETECT_THRESHOLD = 0.35;
export const STUDIO_ENGINE_DETECT_SUPPRESS_MS = 10_000;

export const STUDIO_CANVAS_PRESETS = [
  { label: '400\u00d7400', width: 400, height: 400 },
  { label: '800\u00d7600', width: 800, height: 600 },
  { label: '1920\u00d71080', width: 1920, height: 1080 },
] as const;
