import 'server-only';

import { z } from 'zod';

export const PostHogConfigSchema = z.object({
  apiKey: z.string().min(1, 'PostHog API key is required'),
  projectId: z.string().min(1, 'PostHog project ID is required'),
  host: z.string().url().default('https://us.posthog.com'),
});

export type ValidatedPostHogConfig = z.infer<typeof PostHogConfigSchema>;

export const PostHogQueryResultSchema = z.array(z.array(z.unknown()));

export function validatePostHogConfig(
  raw: unknown
): { success: true; data: ValidatedPostHogConfig } | { success: false; error: string } {
  const result = PostHogConfigSchema.safeParse(raw);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error.issues.map((issue) => issue.message).join(', ') };
}

export function validatePostHogResponse(
  raw: unknown
): { success: true; data: unknown[][] } | { success: false; error: string } {
  const result = PostHogQueryResultSchema.safeParse(raw);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error.issues.map((issue) => issue.message).join(', ') };
}
