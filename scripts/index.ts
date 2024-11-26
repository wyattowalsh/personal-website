#!/usr/bin/env node

import * as path from 'path';
import * as process from 'process';
import chalk from 'chalk';
// Update to relative paths
import { backend } from '../lib/services/backend';
import type { PreprocessStats } from '../lib/types';
import { logger } from '@/lib/utils/logger';

// Enhanced error handling setup using global process
globalThis.process.on('unhandledRejection', (error) => {
  logger.error('Unhandled rejection:', error as Error);
  process.exit(1);
});

globalThis.process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error as Error);
  process.exit(1);
});

// Main processing function with enhanced error handling and logging
export async function processFiles(isDev = false): Promise<PreprocessStats> {
  const startTime = Date.now();
  
  try {
    logger.info('Starting preprocessing...');
    logger.info(`Mode: ${isDev ? 'development' : 'production'}`);

    // Clean up existing cache
    logger.step('Cleaning cache directories...');
    await backend.cleanup();

    // Run preprocessing
    logger.step('Running preprocessing pipeline...');
    const stats = await backend.preprocess(isDev);

    // Log completion stats
    const duration = Date.now() - startTime;
    logger.success(`Preprocessing complete in ${duration}ms!`);
    logger.info(`Processed ${stats.postsProcessed} posts`);
    logger.info(`Search index size: ${(stats.searchIndexSize / 1024).toFixed(2)}KB`);
    logger.info(`Cache entries: ${stats.cacheSize}`);

    if (stats.errors.length > 0) {
      logger.warning(`Completed with ${stats.errors.length} errors`);
      stats.errors.forEach(error => logger.error('Processing error:', error));
    }

    return stats;
  } catch (error) {
    logger.error(`Failed to preprocess for ${isDev ? 'development' : 'production'}`, error as Error);
    throw error;
  }
}

// Simplified script runners
export const scripts = {
  predev: async () => {
    try {
      await processFiles(true);
      logger.success('Development preprocessing complete!');
    } catch (error) {
      logger.error('Development preprocessing failed!', error as Error);
      process.exit(1);
    }
  },

  prebuild: async () => {
    try {
      await processFiles(false);
      logger.success('Production preprocessing complete!');
    } catch (error) {
      logger.error('Production preprocessing failed!', error as Error);
      process.exit(1);
    }
  }
} as const;

// Auto-execute if run directly
if (require.main === module) {
  const isDev = process.argv.includes('--dev');
  (isDev ? scripts.predev() : scripts.prebuild())
    .catch(() => process.exit(1));
}
