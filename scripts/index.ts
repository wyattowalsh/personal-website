#!/usr/bin/env node
import path from 'path';
import { backend } from '../lib/services/backend';
import { logger } from '../lib/utils/logger';
import { generateParticleConfigs } from './utils/particles';

// Define PreprocessStats interface
interface PreprocessStats {
  postsProcessed: number;
  searchIndexSize: number;
  cacheSize: number;
  errors: Error[];
  particleConfigPath?: string;
}

// Main preprocessing function
async function processFiles(isDev = false): Promise<PreprocessStats> {
  try {
    logger.info('Starting preprocessing...');
    logger.info(`Mode: ${isDev ? 'development' : 'production'}`);

    // Generate particle configs first
    logger.step('Generating particle configurations...');
    let particleConfigPath: string | undefined;
    
    try {
      particleConfigPath = await generateParticleConfigs();
    } catch (error) {
      logger.error('Failed to generate particle configs:', error as Error);
      // Continue with other preprocessing even if particle config fails
    }

    // Run other preprocessing tasks
    logger.step('Running preprocessing pipeline...');
    const stats = await backend.preprocess(isDev);

    return {
      ...stats,
      particleConfigPath
    };
  } catch (error) {
    logger.error(`Failed to preprocess for ${isDev ? 'development' : 'production'}`, error as Error);
    throw error;
  }
}

// Export scripts object
export const scripts = {
  predev: async () => {
    try {
      const stats = await processFiles(true);
      logger.success('Development preprocessing complete!');
      return stats;
    } catch (error) {
      logger.error('Development preprocessing failed!', error as Error);
      throw error;
    }
  },

  prebuild: async () => {
    try {
      const stats = await processFiles(false);
      logger.success('Production preprocessing complete!');
      return stats;
    } catch (error) {
      logger.error('Production preprocessing failed!', error as Error);
      throw error;
    }
  }
};
