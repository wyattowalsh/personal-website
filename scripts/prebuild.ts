import { scripts } from './index';

// Process is already available globally in Node.js
process.on('unhandledRejection', (error: unknown) => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});

// Add error handler for the scripts execution
scripts.prebuild().catch((error: unknown) => {
  console.error('Failed to run prebuild:', error);
  process.exit(1);
});
