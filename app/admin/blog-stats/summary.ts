type BlogStatsPostInput = {
  slug: string;
  title: string;
  created: string;
  tags: string[];
  readingTime?: string;
  wordCount: number;
};

function formatPostDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { timeZone: 'UTC' });
}

function parseReadingMinutes(readingTime: string | undefined): number {
  const minutes = parseInt(readingTime || '0', 10);
  return Number.isNaN(minutes) ? 0 : minutes;
}

function truncateTitle(title: string): string {
  return title.length > 25 ? `${title.slice(0, 25)}...` : title;
}

export function getPostDateRange(posts: Pick<BlogStatsPostInput, 'created'>[]) {
  if (posts.length === 0) {
    return {
      oldestPost: 'N/A',
      newestPost: 'N/A',
    };
  }

  const sortedPosts = [...posts].sort(
    (a, b) => new Date(a.created).getTime() - new Date(b.created).getTime()
  );

  return {
    oldestPost: formatPostDate(sortedPosts[0].created),
    newestPost: formatPostDate(sortedPosts[sortedPosts.length - 1].created),
  };
}

export function getInventoryChange(): undefined {
  return undefined;
}

export function getInventoryTrend(): 'neutral' {
  return 'neutral';
}

export function buildBlogStatsSummary(posts: BlogStatsPostInput[], tags: string[]) {
  const totalWords = posts.reduce((sum, post) => sum + post.wordCount, 0);
  const avgReadingTime = posts.length > 0
    ? Math.round(posts.reduce((sum, post) => sum + parseReadingMinutes(post.readingTime), 0) / posts.length)
    : 0;

  const postsByYearMap = new Map<number, number>();
  posts.forEach((post) => {
    const year = new Date(post.created).getFullYear();
    postsByYearMap.set(year, (postsByYearMap.get(year) || 0) + 1);
  });
  const postsByYear = Array.from(postsByYearMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([year, count]) => ({ year: String(year), count }));

  const tagCountMap = new Map<string, number>();
  posts.forEach((post) => {
    post.tags.forEach((tag) => tagCountMap.set(tag, (tagCountMap.get(tag) || 0) + 1));
  });
  const tagData = Array.from(tagCountMap.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([tag, count]) => ({ tag, count }));

  const readingTimeBuckets = [
    { label: '1-3 min', min: 1, max: 3 },
    { label: '4-6 min', min: 4, max: 6 },
    { label: '7-10 min', min: 7, max: 10 },
    { label: '10+ min', min: 11, max: Infinity },
  ];

  const { oldestPost, newestPost } = getPostDateRange(posts);

  return {
    avgPostsPerYear: posts.length > 0 && postsByYear.length > 0 ? (posts.length / postsByYear.length).toFixed(1) : '0',
    avgReadingTime,
    avgWordCount: posts.length > 0 ? Math.round(totalWords / posts.length) : 0,
    maxWordCount: Math.max(...posts.map((post) => post.wordCount), 0),
    minWordCount: posts.length > 0 ? Math.min(...posts.map((post) => post.wordCount)) : 0,
    newestPost,
    oldestPost,
    postsByYear,
    postsTableData: posts.map((post) => ({
      slug: post.slug,
      title: post.title,
      created: post.created,
      wordCount: post.wordCount,
      readingTime: post.readingTime,
      tags: post.tags,
    })),
    readingTimeDist: readingTimeBuckets.map(({ label, min, max }) => ({
      bucket: label,
      count: posts.filter((post) => {
        const minutes = parseReadingMinutes(post.readingTime);
        return minutes >= min && minutes <= max;
      }).length,
    })),
    tagData,
    topTags: tagData.slice(0, 3).map((tag) => tag.tag).join(', ') || 'None',
    totalWords,
    uniqueTagCount: tags.length,
    wordData: posts.map((post) => ({
      name: truncateTitle(post.title),
      words: post.wordCount,
    })),
    wordTimeline: [...posts]
      .sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime())
      .map((post) => ({
        date: new Date(post.created).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        words: post.wordCount,
        title: post.title,
      })),
  };
}
