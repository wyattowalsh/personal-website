import { describe, expect, it } from 'vitest';
import { calculateContentQualityScore } from '../content-scoring';
import type { Post } from '@/lib/types';

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    slug: 'test-post',
    title: 'Test Post',
    content: 'Body',
    created: '2026-01-01',
    tags: [],
    wordCount: 500,
    ...overrides,
  };
}

describe('calculateContentQualityScore()', () => {
  it('scores a perfect post highly', () => {
    const post = makePost({
      wordCount: 2000,
      readingTime: '12 min read',
      tags: ['Tech', 'Tutorial', 'Guide', 'Next.js'],
      image: '/hero.png',
      summary: 'A comprehensive guide.',
      caption: 'Hero caption',
      series: { name: 'Series', order: 1 },
      updated: '2026-04-20',
    });

    const score = calculateContentQualityScore(post);

    expect(score.overall).toBeGreaterThanOrEqual(75);
    expect(score.breakdown.readability).toBeGreaterThanOrEqual(70);
    expect(score.breakdown.completeness).toBeGreaterThanOrEqual(80);
    expect(score.breakdown.freshness).toBeGreaterThanOrEqual(70);
    expect(score.breakdown.engagement).toBeGreaterThanOrEqual(70);
  });

  it('scores a minimal post lower', () => {
    const post = makePost({
      wordCount: 200,
      tags: [],
    });

    const score = calculateContentQualityScore(post);

    expect(score.overall).toBeLessThan(60);
    expect(score.breakdown.readability).toBeLessThan(60);
    expect(score.breakdown.completeness).toBeLessThan(60);
  });

  it('handles missing fields gracefully', () => {
    const post = makePost({
      wordCount: 600,
      readingTime: undefined,
      image: undefined,
      summary: undefined,
      caption: undefined,
      series: undefined,
      tags: ['one'],
    });

    const score = calculateContentQualityScore(post);

    expect(score.overall).toBeGreaterThanOrEqual(0);
    expect(score.overall).toBeLessThanOrEqual(100);
    expect(score.breakdown.completeness).toBeLessThan(70);
  });

  it('rewards fresh posts with higher freshness score', () => {
    const recent = makePost({ updated: new Date().toISOString(), wordCount: 1000 });
    const old = makePost({ updated: '2024-01-01', created: '2024-01-01', wordCount: 1000 });

    const recentScore = calculateContentQualityScore(recent);
    const oldScore = calculateContentQualityScore(old);

    expect(recentScore.breakdown.freshness).toBeGreaterThan(oldScore.breakdown.freshness);
  });

  it('rewards series membership in engagement', () => {
    const withSeries = makePost({ series: { name: 'Guide', order: 1 }, wordCount: 1000, tags: ['a', 'b'] });
    const withoutSeries = makePost({ wordCount: 1000, tags: ['a', 'b'] });

    const withScore = calculateContentQualityScore(withSeries);
    const withoutScore = calculateContentQualityScore(withoutSeries);

    expect(withScore.breakdown.engagement).toBeGreaterThan(withoutScore.breakdown.engagement);
  });

  it('clamps overall score between 0 and 100', () => {
    const post = makePost({ wordCount: 50, tags: [] });
    const score = calculateContentQualityScore(post);

    expect(score.overall).toBeGreaterThanOrEqual(0);
    expect(score.overall).toBeLessThanOrEqual(100);
  });

  it('returns consistent breakdown structure', () => {
    const post = makePost();
    const score = calculateContentQualityScore(post);

    expect(score).toHaveProperty('overall');
    expect(score).toHaveProperty('breakdown');
    expect(score.breakdown).toHaveProperty('readability');
    expect(score.breakdown).toHaveProperty('completeness');
    expect(score.breakdown).toHaveProperty('freshness');
    expect(score.breakdown).toHaveProperty('engagement');
  });
});
