import { glob as globWithCallback } from 'glob';
import { promisify } from 'util';

export const glob = promisify(globWithCallback);
