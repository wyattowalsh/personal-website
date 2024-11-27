import { exec } from 'child_process';
import { promises as fs } from 'fs';
import { promisify } from 'util';
import path from 'path';
import chalk from 'chalk';

const execAsync = promisify(exec);

export const logger = {
  info: (msg: string) => console.log(chalk.blue('ℹ'), msg),
  success: (msg: string) => console.log(chalk.green('✨'), msg),
  warning: (msg: string) => console.log(chalk.yellow('⚠'), msg),
  error: (msg: string, error?: Error) => {
    console.error(chalk.red('✖'), msg);
    if (error?.stack) console.error(chalk.dim(error.stack));
  },
  step: (msg: string) => console.log(chalk.cyan('→'), msg),
  timing: (label: string, duration: number) => 
    console.log(chalk.magenta('⏱'), `${label}: ${duration.toFixed(2)}ms`)
};

// Git utilities
export async function getGitFileData(filePath: string) {
  try {
    const [created, updated] = await Promise.all([
      execAsync(`git log --follow --format=%aI --reverse "${filePath}" | head -1`),
      execAsync(`git log -1 --format=%aI "${filePath}"`)
    ]);

    return {
      created: created.stdout.trim() || null,
      lastModified: updated.stdout.trim() || null
    };
  } catch (error) {
    logger.error(`Git data error for ${filePath}:`, error as Error);
    return { created: null, lastModified: null };
  }
}
