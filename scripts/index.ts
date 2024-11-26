import { logger } from '@/lib/utils';
import { backend } from '@/lib/services/backend';

export async function process(isDev = false) {
  const startTime = Date.now();
  logger.info(`Starting ${isDev ? 'development' : 'production'} preprocessing...`);

  try {
    const stats = await (isDev ? backend.preprocess(true) : backend.preprocess(false));
    const duration = Date.now() - startTime;

    logger.success(`${isDev ? 'Development' : 'Production'} preprocessing complete!`);
    logger.timing('Total time', duration);

    if (stats.errors.length > 0) {
      stats.errors.forEach(error => logger.warning(`Non-fatal error: ${error.message}`));
    }

    logger.info(`Processed ${stats.postsProcessed} posts`);
    logger.info(`Search index size: ${stats.searchIndexSize} bytes`);
    logger.info(`Cache size: ${stats.cacheSize} bytes`);

    if (!isDev) {
      logger.info('RSS feed generated');
      logger.info('Sitemap generated');
    }

    return stats;
  } catch (error) {
    logger.error(`Failed to preprocess for ${isDev ? 'development' : 'production'}`, error as Error);
    process.exit(1);
  }
}

// Export prebuild and predev as simple wrappers
export const prebuild = () => process(false);
export const predev = () => process(true);
