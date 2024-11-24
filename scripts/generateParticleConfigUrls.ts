import fs from 'fs';
import path from 'path';
import { logger, colors } from './utils/logger';

const PARTICLES_DIR = path.join(process.cwd(), 'public/particles/');
const OUTPUT_FILE = path.join(process.cwd(), 'components/particles/configUrls.ts');

async function generateConfigUrls() {
  logger.header('Generating Particle Config URLs');
  
  try {
    const themes = ['light', 'dark'];
    const configUrls: Record<string, string[]> = {};
    const stats = {
      totalFiles: 0,
      themeStats: {} as Record<string, number>
    };

    // Create themes directory if it doesn't exist
    logger.step('Setting up directories...');
    if (!fs.existsSync(PARTICLES_DIR)) {
      logger.info(`Creating particles directory: ${PARTICLES_DIR}`);
      await fs.promises.mkdir(PARTICLES_DIR, { recursive: true });
    }

    for (const theme of themes) {
      logger.step(`Processing ${theme} theme...`);
      const themePath = path.join(PARTICLES_DIR, theme);
      configUrls[theme] = [];

      if (fs.existsSync(themePath)) {
        const files = await fs.promises.readdir(themePath);
        const jsonFiles = files.filter(f => f.endsWith('.json'));
        
        stats.themeStats[theme] = jsonFiles.length;
        stats.totalFiles += jsonFiles.length;

        if (jsonFiles.length === 0) {
          logger.warning(`No JSON files found in ${theme} theme directory`);
        } else {
          logger.success(`Found ${jsonFiles.length} JSON files for ${theme} theme`);
        }

        // Add valid config URLs
        configUrls[theme] = jsonFiles.map(file => {
          const configUrl = `/particles/${theme}/${file}`;
          logger.debug(`Added config: ${configUrl}`);
          return configUrl;
        });
      } else {
        logger.warning(`Theme directory not found: ${themePath}`);
        logger.info(`Creating ${theme} theme directory...`);
        await fs.promises.mkdir(themePath, { recursive: true });
        stats.themeStats[theme] = 0;
      }
    }

    const output = `// This file is auto-generated. Do not edit manually.

type ParticleConfigUrls = readonly string[];

export const configUrls: Record<'light' | 'dark', ParticleConfigUrls> = {
  light: ${JSON.stringify(configUrls.light || [], null, 2)} as const,
  dark: ${JSON.stringify(configUrls.dark || [], null, 2)} as const
} as const;
`;

    logger.step('Writing output file...');
    await fs.promises.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
    await fs.promises.writeFile(OUTPUT_FILE, output, 'utf8');
    
    logger.success(`Generated config URLs successfully at: ${OUTPUT_FILE}`);
    logger.info('\nSummary:');
    console.log(`${colors.dim}Total files processed: ${stats.totalFiles}`);
    Object.entries(stats.themeStats).forEach(([theme, count]) => {
      console.log(`${theme} theme: ${count} files${colors.reset}`);
    });

  } catch (error) {
    logger.fatal('Failed to generate particle config URLs', error as Error);
  }
}

// Run the script
generateConfigUrls();
