import 'server-only';

import { DEFAULT_POSTHOG_API_HOST, INTERACTION_EVENTS, POSTHOG_QUERY_TIMEOUT_MS } from './analytics-constants';

export interface PostHogConfig {
  apiHost: string;
  personalApiKey: string;
  projectId: string;
}

interface PostHogQueryResponse {
  results?: unknown[][];
  error?: string;
  detail?: string;
}

export function cleanEnvValue(value: string | undefined): string | undefined {
  const cleaned = value?.trim().replace(/\\n$/g, '');
  return cleaned || undefined;
}

function deriveApiHostFromCaptureHost(captureHost?: string): string {
  if (!captureHost) return DEFAULT_POSTHOG_API_HOST;

  try {
    const url = new URL(captureHost);
    url.hostname = url.hostname.replace('.i.posthog.com', '.posthog.com');
    return url.origin;
  } catch {
    return DEFAULT_POSTHOG_API_HOST;
  }
}

export function getPostHogConfig(): { config: PostHogConfig | null; missingEnv: string[] } {
  const missingEnv: string[] = [];
  const publicToken = cleanEnvValue(process.env.NEXT_PUBLIC_POSTHOG_TOKEN);
  const personalApiKey = cleanEnvValue(process.env.POSTHOG_PERSONAL_API_KEY);
  const projectId = cleanEnvValue(process.env.POSTHOG_PROJECT_ID);
  const apiHost = (
    cleanEnvValue(process.env.POSTHOG_API_HOST)
    || deriveApiHostFromCaptureHost(cleanEnvValue(process.env.NEXT_PUBLIC_POSTHOG_HOST))
  ).replace(/\/+$/, '');

  if (!publicToken) missingEnv.push('NEXT_PUBLIC_POSTHOG_TOKEN');
  if (!personalApiKey) missingEnv.push('POSTHOG_PERSONAL_API_KEY');
  if (!projectId) missingEnv.push('POSTHOG_PROJECT_ID');

  if (!personalApiKey || !projectId || !publicToken) {
    return { config: null, missingEnv };
  }

  return {
    config: { apiHost, personalApiKey, projectId },
    missingEnv,
  };
}

export function eventList(): string {
  return INTERACTION_EVENTS.map((event) => `'${event}'`).join(', ');
}

export async function queryPostHog(config: PostHogConfig, name: string, query: string): Promise<unknown[][]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), POSTHOG_QUERY_TIMEOUT_MS);
  let response: Response;

  try {
    response = await fetch(`${config.apiHost}/api/projects/${config.projectId}/query/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.personalApiKey}`,
      },
      body: JSON.stringify({
        name,
        query: {
          kind: 'HogQLQuery',
          query,
        },
      }),
      cache: 'no-store',
      signal: controller.signal,
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(`PostHog query timed out after ${Math.round(POSTHOG_QUERY_TIMEOUT_MS / 1000)}s`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  const payload = (await response.json().catch(() => ({}))) as PostHogQueryResponse;

  if (!response.ok) {
    throw new Error(payload.detail || payload.error || `PostHog query failed with ${response.status}`);
  }

  if (!Array.isArray(payload.results)) {
    throw new Error('PostHog query response did not include results');
  }

  return payload.results;
}
