#!/usr/bin/env node
import path from 'path';
import { BackendService } from '../lib/server';
import { logger, LogLevel } from '../lib/core';
import type { PreprocessStats } from '../lib/core';
import { generateParticleConfigs } from './particles';

// Main preprocessing function
async function processFiles(isDev = false): Promise<PreprocessStats> {
  const startTime = Date.now();
  
  try {
    logger.group('Build Process Started');
    logger.memory();
    logger.info(`Environment: ${isDev ? 'Development' : 'Production'}`);

    // Set log level based on environment
    logger.setLevel(isDev ? LogLevel.DEBUG : LogLevel.INFO);

    // Get backend service instance
    const backend = BackendService.getInstance();

    // Generate particle configs first
    logger.step('Generating particle configurations');
    let particleConfigPath: string | undefined;
    
    try {
      particleConfigPath = await generateParticleConfigs();
      logger.file('Generated', particleConfigPath);
    } catch (error) {
      logger.error('Failed to generate particle configs:', error as Error);
      // Continue with other preprocessing even if particle config fails
    }

    // Run preprocessing tasks
    logger.step('Running preprocessing pipeline');
    const stats = await backend.preprocess(isDev);

    const duration = Date.now() - startTime;
    logger.timing('Total build time', duration);
    logger.memory();
    logger.groupEnd();

    const result: PreprocessStats = {
      ...stats,
      particleConfigPath
    };

    return result;
  } catch (error) {
    logger.error(`Build failed for ${isDev ? 'development' : 'production'}`, error as Error);
    logger.memory();
    logger.groupEnd();
    throw error;
  }
}

// Main execution - ESM compatible check
const isMainModule = import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith('scripts/index.ts') ||
  process.argv[1]?.endsWith('scripts/index.js');

if (isMainModule) {
  const isDev = process.env.NODE_ENV === 'development';
  
  // Handle unhandled rejections
  process.on('unhandledRejection', (error: unknown) => {
    console.error('Unhandled rejection:', error);
    process.exit(1);
  });

  // Run preprocessing
  processFiles(isDev).then((stats) => {
    logger.success(`${isDev ? 'Development' : 'Production'} preprocessing complete!`);
  }).catch((error) => {
    logger.error(`${isDev ? 'Development' : 'Production'} preprocessing failed!`, error as Error);
    process.exit(1);
  });
}

// Export for programmatic usage
export const preprocess = processFiles;
