'use client';

import { track as vercelTrack } from '@vercel/analytics';

export function track(event: string, properties?: Record<string, string | number | boolean>) {
  if (process.env.NODE_ENV === 'development') {
    console.debug('[Analytics]', event, properties);
  }
  vercelTrack(event, properties);
}
