import { scripts } from './index';

// Process is already available globally in Node.js
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});

// Add error handler for the scripts execution
scripts.predev().catch((error) => {
  console.error('Failed to run predev:', error);
  process.exit(1);
});
