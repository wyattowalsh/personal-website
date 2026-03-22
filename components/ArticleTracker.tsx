"use client";

import { useReadingProgress } from '@/components/hooks/useReadingProgress';
import { useTimeOnPage } from '@/components/hooks/useTimeOnPage';

interface ArticleTrackerProps {
  slug: string;
}

export function ArticleTracker({ slug }: ArticleTrackerProps) {
  useReadingProgress(slug);
  useTimeOnPage(slug);
  return null;
}
