import type { GlobOptions } from 'glob';
import { glob } from 'glob';

// Use glob's native promise support with proper type definitions
export const globAsync = async (pattern: string, options: GlobOptions = {}): Promise<string[]> => {
  const results = await glob(pattern, options);
  // Convert Path[] to string[] if necessary
  return results.map(result => result.toString());
};
