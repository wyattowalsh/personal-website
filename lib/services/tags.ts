import { backend } from './backend';

export async function getAllTags(): Promise<string[]> {
  return await backend.getAllTags();
}
