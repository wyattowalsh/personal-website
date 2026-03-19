import 'server-only';
import chalk from "chalk";

// Log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  SUCCESS = 2,
  WARNING = 3,
  ERROR = 4
}

// Log formatting utilities
export const formatters = {
  // Format duration in a human readable way
  duration: (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(2)}ms`;
    const seconds = ms / 1000;
    if (seconds < 60) return `${seconds.toFixed(2)}s`;
    const minutes = seconds / 60;
    return `${minutes.toFixed(2)}m`;
  },

  // Format file size
  fileSize: (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(2)}${units[unitIndex]}`;
  },

  // Format path relative to project root
  path: (fullPath: string): string => {
    return fullPath.replace(process.cwd(), '').replace(/^\//, '');
  }
};

// Enhanced logger implementation
export const logger = {
  info: (msg: string, data?: unknown) => {
    console.log(
      chalk.blue('ℹ'),
      chalk.blue.dim('[INFO]'),
      chalk.gray('→'),
      msg,
      data ? '\n' + chalk.dim(JSON.stringify(data, null, 2)) : ''
    );
  },

  success: (msg: string, data?: unknown) => {
    console.log(
      chalk.green('✓'),
      chalk.green.dim('[SUCCESS]'),
      chalk.gray('→'),
      msg,
      data ? '\n' + chalk.dim(JSON.stringify(data, null, 2)) : ''
    );
  },

  warning: (msg: string, data?: unknown) => {
    console.log(
      chalk.yellow('⚠'),
      chalk.yellow.dim('[WARN]'),
      chalk.gray('→'),
      msg,
      data ? '\n' + chalk.dim(JSON.stringify(data, null, 2)) : ''
    );
  },

  error: (msg: string, error?: Error) => {
    console.error(
      chalk.red('✖'),
      chalk.red.dim('[ERROR]'),
      chalk.gray('→'),
      msg
    );
    if (error?.stack) {
      console.error(chalk.dim(
        error.stack.split('\n')
          .map(line => '  ' + line)
          .join('\n')
      ));
    }
  },

  debug: (msg: string, data?: unknown) => {
    if (logger.level <= LogLevel.DEBUG) {
      console.log(
        chalk.magenta('🔍'),
        chalk.magenta.dim('[DEBUG]'),
        chalk.gray('→'),
        msg,
        data ? '\n' + chalk.dim(JSON.stringify(data, null, 2)) : ''
      );
    }
  },

  step: (msg: string, current?: number, total?: number) => {
    const progress = current && total ? ` (${current}/${total})` : '';
    console.log(
      chalk.cyan('→'),
      chalk.cyan.dim('[STEP]'),
      chalk.gray('→'),
      `${msg}${progress}`
    );
  },

  timing: (label: string, duration: number) => {
    console.log(
      chalk.magenta('⏱'),
      chalk.magenta.dim('[TIME]'),
      chalk.gray('→'),
      `${label}: ${duration.toFixed(2)}ms`
    );
  },

  group: (label: string) => {
    console.group(
      chalk.blue('◆'),
      chalk.blue.dim('[GROUP]'),
      chalk.gray('→'),
      label
    );
  },

  groupEnd: () => console.groupEnd(),

  table: (data: unknown[], columns?: string[]) => {
    console.log(chalk.blue('▤'), chalk.blue.dim('[TABLE]'));
    console.table(data, columns);
  },

  level: LogLevel.INFO, // Default level

  setLevel(level: LogLevel) {
    this.level = level;
  },

  progress: (current: number, total: number, msg: string) => {
    const percentage = (current / total * 100).toFixed(1);
    const bar = '█'.repeat(Math.floor(current / total * 20)).padEnd(20, '░');
    console.log(
      chalk.blue('↳'),
      chalk.blue.dim('[PROGRESS]'),
      chalk.gray('→'),
      `${bar} ${percentage}% | ${msg}`
    );
  },

  memory: () => {
    const used = process.memoryUsage();
    console.log(
      chalk.cyan('📊'),
      chalk.cyan.dim('[MEMORY]'),
      chalk.gray('→'),
      Object.entries(used).map(([key, value]) =>
        `${key}: ${formatters.fileSize(value)}`
      ).join(', ')
    );
  },

  file: (action: string, filePath: string, details?: unknown) => {
    console.log(
      chalk.yellow('📄'),
      chalk.yellow.dim('[FILE]'),
      chalk.gray('→'),
      `${action}: ${formatters.path(filePath)}`,
      details ? chalk.dim(`(${JSON.stringify(details)})`) : ''
    );
  },

  formatters
};
