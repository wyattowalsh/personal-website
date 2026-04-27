import type { Post } from '@/lib/types';

export interface ContentScore {
  overall: number;
  breakdown: {
    readability: number;
    completeness: number;
    freshness: number;
    engagement: number;
  };
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function ageInDays(post: Post): number {
  const basis = post.updated || post.created;
  const timestamp = new Date(basis).getTime();
  if (Number.isNaN(timestamp)) return 0;
  return Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
}

function scoreReadability(post: Post): number {
  const wordCount = post.wordCount ?? 0;
  const readingTimeMinutes = parseReadingTime(post.readingTime);

  let score = 50;

  if (wordCount >= 1500) score += 25;
  else if (wordCount >= 800) score += 15;
  else if (wordCount >= 500) score += 5;
  else score -= 10;

  if (readingTimeMinutes >= 8) score += 15;
  else if (readingTimeMinutes >= 4) score += 10;
  else if (readingTimeMinutes >= 2) score += 5;
  else score -= 5;

  return clamp(score);
}

function parseReadingTime(readingTime: string | undefined): number {
  if (!readingTime) return 0;
  const match = readingTime.match(/(\d+)/);
  return match ? Number.parseInt(match[1], 10) : 0;
}

function scoreCompleteness(post: Post): number {
  let score = 40;

  if (post.image) score += 15;
  if (post.summary) score += 15;
  if (post.caption) score += 10;
  if (post.tags.length >= 3) score += 15;
  else if (post.tags.length >= 1) score += 5;
  else score -= 5;

  return clamp(score);
}

function scoreFreshness(post: Post): number {
  const age = ageInDays(post);

  if (age <= 7) return 100;
  if (age <= 30) return 90;
  if (age <= 90) return 75;
  if (age <= 180) return 60;
  if (age <= 365) return 45;
  return 25;
}

function scoreEngagement(post: Post): number {
  let score = 40;

  if (post.series) score += 20;
  if (post.tags.length >= 4) score += 15;
  else if (post.tags.length >= 2) score += 10;
  else if (post.tags.length >= 1) score += 5;
  if (post.image) score += 10;
  if (post.wordCount >= 1000) score += 15;
  else if (post.wordCount >= 500) score += 5;

  return clamp(score);
}

export function calculateContentQualityScore(post: Post): ContentScore {
  const readability = scoreReadability(post);
  const completeness = scoreCompleteness(post);
  const freshness = scoreFreshness(post);
  const engagement = scoreEngagement(post);

  const overall = Math.round((readability + completeness + freshness + engagement) / 4);

  return {
    overall: clamp(overall),
    breakdown: {
      readability,
      completeness,
      freshness,
      engagement,
    },
  };
}
