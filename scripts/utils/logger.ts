export const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
} as const;

export const logger = {
  info: (msg: string) => console.log(`${colors.blue}ℹ️ Info:${colors.reset} ${msg}`),
  success: (msg: string) => console.log(`${colors.green}✨ Success:${colors.reset} ${msg}`),
  warning: (msg: string) => console.log(`${colors.yellow}⚠️ Warning:${colors.reset} ${msg}`),
  error: (msg: string) => console.error(`${colors.red}❌ Error:${colors.reset} ${msg}`),
  debug: (msg: string) => console.log(`${colors.gray}🔍 Debug:${colors.reset} ${msg}`),
  step: (msg: string) => console.log(`${colors.cyan}📝 Step:${colors.reset} ${msg}`),
  header: (msg: string) => console.log(`\n${colors.bright}${colors.magenta}🚀 ${msg}${colors.reset}\n`),
  
  // Enhanced error handling with more descriptive emoji
  fatal: (msg: string, error?: Error) => {
    console.error(`${colors.red}💥 FATAL ERROR: ${msg}${colors.reset}`);
    if (error?.stack) {
      console.error(`${colors.dim}🔍 Stack Trace:\n${error.stack}${colors.reset}`);
    }
    process.exit(1);
  }
};
