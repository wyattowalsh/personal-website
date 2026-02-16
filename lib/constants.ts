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
