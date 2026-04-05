import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BackendService } from '@/lib/server';
import { generatePostMetadata, generatePostStructuredData } from '@/lib/metadata';
import { PostLayout } from '@/components/PostLayout';

type SeriesNavigationData = {
  seriesName: string;
  currentSlug: string;
  posts: Array<{ slug: string; title: string; order: number }>;
} | null;

async function getSeriesNavigationData(slug: string, seriesName: string): Promise<SeriesNavigationData> {
  const seriesPosts = await BackendService.getInstance().getSeriesPosts(seriesName);

  if (seriesPosts.length < 2) {
    return null;
  }

  return {
    seriesName,
    currentSlug: slug,
    posts: seriesPosts.map((post) => ({
      slug: post.slug,
      title: post.title,
      order: post.series?.order ?? 0,
    })),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  await BackendService.ensurePreprocessed();
  const backend = BackendService.getInstance();
  const post = await backend.getPost(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested blog post could not be found.',
    };
  }

  return generatePostMetadata({ post, slug });
}

export default async function PostSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  await BackendService.ensurePreprocessed();
  const backend = BackendService.getInstance();
  const post = await backend.getPost(slug);

  if (!post) {
    notFound();
  }

  const [adjacentPosts, relatedPosts, seriesNavigation] = await Promise.all([
    backend.getAdjacentPostLinks(slug),
    backend.getRelatedPostSummaries(slug),
    post.series?.name
      ? getSeriesNavigationData(slug, post.series.name)
      : Promise.resolve<SeriesNavigationData>(null),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: generatePostStructuredData(post, slug).replace(/</g, '\\u003c'),
        }}
      />
      <PostLayout
        post={post}
        adjacentPosts={adjacentPosts}
        relatedPosts={relatedPosts ?? []}
        seriesNavigation={seriesNavigation}
      >
        {children}
      </PostLayout>
    </>
  );
}
