#!/usr/bin/env node
import path from 'path';
import chalk from 'chalk';
import { backend } from '../lib/services/backend';
import { logger } from '../lib/utils/logger';
import { fileURLToPath } from 'url';

// Add PreprocessStats interface
interface PreprocessStats {
  postsProcessed: number;
  searchIndexSize: number;
  cacheSize: number;
  errors: Error[];
}

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
async function processFiles(isDev = false): Promise<PreprocessStats> {
  const startTime = Date.now();
  
  try {
    logger.info('Starting preprocessing...');
    logger.info(`Mode: ${isDev ? 'development' : 'production'}`);

    // Clean up existing cache
    logger.step('Cleaning cache directories...');
    await backend.cleanup();

    // Run preprocessing and ensure indices are created
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

// Define scripts object (without export)
const scripts = {
  predev: async () => {
    try {
      logger.info('Starting development preprocessing...');
      await backend.cleanup();
      const stats = await backend.preprocess(true);
      logger.success('Development preprocessing complete!');
      return stats;
    } catch (error: unknown) {
      logger.error('Development preprocessing failed!', error as Error);
      process.exit(1);
    }
  },

  prebuild: async () => {
    try {
      logger.info('Starting production preprocessing...');
      await backend.cleanup();
      const stats = await backend.preprocess(false);
      logger.success('Production preprocessing complete!');
      return stats;
    } catch (error: unknown) {
      logger.error('Production preprocessing failed!', error as Error);
      process.exit(1);
    }
  }
};

// Handle direct script execution
if (require.main === module) {
  const isDev = process.argv.includes('--dev');
  (isDev ? scripts.predev() : scripts.prebuild())
    .catch((error: unknown) => {
      logger.error('Script execution failed:', error as Error);
      process.exit(1);
    });
}

// Single export statement
export { scripts };
