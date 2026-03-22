"use client";

import { useReadingProgress } from '@/components/hooks/useReadingProgress';

interface ArticleTrackerProps {
  slug: string;
}

export function ArticleTracker({ slug }: ArticleTrackerProps) {
  useReadingProgress(slug);
  return null;
}
