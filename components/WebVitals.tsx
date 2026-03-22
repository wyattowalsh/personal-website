"use client";

import { useReportWebVitals } from 'next/web-vitals';
import { track } from '@/lib/analytics';

export function WebVitals() {
  useReportWebVitals((metric) => {
    track('web_vital', {
      name: metric.name,
      value: Math.round(metric.value),
      ...(metric.rating && { rating: metric.rating }),
    });
  });
  return null;
}
