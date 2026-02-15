import { Metadata } from 'next';
import { BackendService } from '@/lib/server';
import { generatePostMetadata } from '@/lib/metadata';

interface PostLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
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

export default function PostSlugLayout({ children }: PostLayoutProps) {
  return <>{children}</>;
}
