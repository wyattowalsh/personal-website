import chalk from 'chalk';

export const logger = {
  info: (msg: string) => console.log(
    chalk.blue('ℹ'),
    chalk.blue.dim('info'),
    chalk.gray('→'),
    msg
  ),
  success: (msg: string) => console.log(
    chalk.green('✓'),
    chalk.green.dim('success'),
    chalk.gray('→'),
    msg
  ),
  warning: (msg: string) => console.log(
    chalk.yellow('⚠'),
    chalk.yellow.dim('warning'),
    chalk.gray('→'),
    msg
  ),
  error: (msg: string, error?: Error) => {
    console.error(
      chalk.red('✖'),
      chalk.red.dim('error'),
      chalk.gray('→'),
      msg
    );
    if (error?.stack) {
      console.error(
        chalk.dim(
          error.stack.split('\n').map(line => '  ' + line).join('\n')
        )
      );
    }
  },
  step: (msg: string) => console.log(
    chalk.cyan('→'),
    chalk.cyan.dim('step'),
    chalk.gray('→'),
    msg
  )
};
