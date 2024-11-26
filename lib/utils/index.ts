import { exec } from 'child_process';
import { promisify } from 'util';
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import chalk from 'chalk';

// Types
export interface GitDates {
  created: string | null;
  updated: string | null;
}

export type CoreContent<T> = Omit<T, '_id' | '_raw' | 'body'>;

// Utility functions
const execAsync = promisify(exec);

export const git = {
  async getFileData(filePath: string): Promise<GitDates> {
    try {
      const [created, updated] = await Promise.all([
        execAsync(`git log --follow --format=%aI --reverse "${filePath}" | head -1`),
        execAsync(`git log -1 --format=%aI "${filePath}"`)
      ]);

      return {
        created: created.stdout.trim() || null,
        updated: updated.stdout.trim() || null
      };
    } catch (error) {
      logger.error(`Git data error for ${filePath}:`, error as Error);
      return { created: null, updated: null };
    }
  }
};

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

// Utility functions
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (
  date: string | undefined,
  locale = "en-US",
  options?: Intl.DateTimeFormatOptions
): string => {
  try {
    if (!date) return "Invalid Date";
    const cleanDate = date.endsWith('Z') ? date : date + 'Z';
    const utcDate = new Date(cleanDate);
    if (isNaN(utcDate.getTime())) return "Invalid Date";
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'
    };

    return new Intl.DateTimeFormat(
      locale, 
      options || defaultOptions
    ).format(utcDate);
  } catch {
    return "Invalid Date";
  }
};
