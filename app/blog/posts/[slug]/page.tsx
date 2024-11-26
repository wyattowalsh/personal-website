import { notFound } from 'next/navigation';
import { getPost, getAllPosts } from '@/lib/services';
import { Metadata } from 'next';
import { PostLayout } from '@/components/PostLayout';
import { MathProvider } from '@/components/MathContext';

interface PostPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const post = await getPost(params.slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.title,
    description: post.summary,
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <MathProvider>
      <PostLayout>
        <article className="prose dark:prose-invert max-w-none">
          {/* Your MDX content will be rendered here */}
        </article>
      </PostLayout>
    </MathProvider>
  );
}
