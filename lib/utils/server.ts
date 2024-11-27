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

// Server utilities
export async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

export async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

export async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  await ensureDirectory(path.dirname(filePath));
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

export async function removeFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch {
    // Ignore errors if file doesn't exist
  }
}

export async function clearDirectory(dirPath: string): Promise<void> {
  try {
    const files = await fs.readdir(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = await fs.lstat(filePath);
      if (stat.isDirectory()) {
        await clearDirectory(filePath);
        await fs.rmdir(filePath);
      } else {
        await fs.unlink(filePath);
      }
    }
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    logger.error(`Failed to clear directory ${dirPath}:`, error as Error);
  }
}

export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';
