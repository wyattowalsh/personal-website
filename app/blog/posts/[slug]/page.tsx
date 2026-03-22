import fs from 'fs/promises';
import path from 'path';
import { notFound } from 'next/navigation';
import { compileMDX } from 'next-mdx-remote/rsc';
import { BackendService } from '@/lib/server';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkMdxMathEnhanced from 'remark-mdx-math-enhanced';
import rehypeSlug from 'rehype-slug';
import rehypePrismPlus from 'rehype-prism-plus';
import rehypeCallouts from 'rehype-callouts';
import { useMDXComponents as getMDXComponents } from '../../../../mdx-components';
import { ArticleTracker } from '@/components/ArticleTracker';

export const dynamicParams = false;

const CONTENT_DIR = path.join(process.cwd(), 'content/posts');

const mdxComponents = getMDXComponents({});

export async function generateStaticParams() {
  await BackendService.ensurePreprocessed();
  const posts = await BackendService.getInstance().getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const filePath = path.join(CONTENT_DIR, slug, 'index.mdx');

  let source: string;
  try {
    source = await fs.readFile(filePath, 'utf-8');
  } catch {
    notFound();
  }

  const { content } = await compileMDX({
    source,
    components: mdxComponents,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [
          remarkGfm,
          remarkMath,
          [remarkMdxMathEnhanced, { component: 'Math' }],
        ],
        rehypePlugins: [
          rehypeSlug,
          [rehypePrismPlus, { ignoreMissing: true }],
          rehypeCallouts,
        ],
      },
    },
  });

  return (
    <>
      {content}
      <ArticleTracker slug={slug} />
    </>
  );
}
