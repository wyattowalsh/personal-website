import { Metadata } from 'next';
import { BackendService } from '@/lib/server';
import { generatePostMetadata, generatePostStructuredData } from '@/lib/metadata';

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

  return (
    <>
      {post && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: generatePostStructuredData(post, slug).replace(/</g, '\\u003c'),
          }}
        />
      )}
      {children}
    </>
  );
}
