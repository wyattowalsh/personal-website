#!/usr/bin/env node
import { BackendService } from '../lib/server';
import { logger, LogLevel } from '../lib/logger';
import type { PreprocessStats } from '../lib/types';
import { generateParticleConfigs } from './particles';

interface PreprocessOptions {
  writeGenerated?: boolean;
}

// Main preprocessing function
async function processFiles(isDev = false, options?: PreprocessOptions): Promise<PreprocessStats> {
  const startTime = Date.now();
  const writeGenerated = options?.writeGenerated ?? false;
  
  try {
    logger.info('Build Process Started');
    logger.info(`Environment: ${isDev ? 'Development' : 'Production'}`);
    logger.info(`Generated file mode: ${writeGenerated ? 'write' : 'check'}`);

    // Set log level based on environment
    logger.setLevel(isDev ? LogLevel.DEBUG : LogLevel.INFO);

    // Get backend service instance
    const backend = BackendService.getInstance();

    // Generate particle configs first
    logger.info('Generating particle configurations');
    const particleConfigPath = await generateParticleConfigs({ write: writeGenerated });
    logger.info(`Generated: ${particleConfigPath}`);

    // Run preprocessing tasks
    logger.info('Running preprocessing pipeline');
    const stats = await backend.preprocess(isDev);

    const duration = Date.now() - startTime;
    logger.timing('Total build time', duration);

    const result: PreprocessStats = {
      ...stats,
      particleConfigPath
    };

    return result;
  } catch (error) {
    logger.error(`Build failed for ${isDev ? 'development' : 'production'}`, error as Error);
    throw error;
  }
}

// Main execution - ESM compatible check
const isMainModule = import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith('scripts/index.ts') ||
  process.argv[1]?.endsWith('scripts/index.js');

if (isMainModule) {
  const isDev = process.env.NODE_ENV === 'development';
  const writeGenerated =
    process.argv.includes('--write-generated') ||
    process.env.PREPROCESS_WRITE_GENERATED === '1';
  
  // Handle unhandled rejections
  process.on('unhandledRejection', (error: unknown) => {
    console.error('Unhandled rejection:', error);
    process.exit(1);
  });

  // Run preprocessing
  processFiles(isDev, { writeGenerated }).then((_stats) => {
    logger.success(`${isDev ? 'Development' : 'Production'} preprocessing complete!`);
  }).catch((error) => {
    logger.error(`${isDev ? 'Development' : 'Production'} preprocessing failed!`, error as Error);
    process.exit(1);
  });
}

// Export for programmatic usage
export const preprocess = processFiles;
