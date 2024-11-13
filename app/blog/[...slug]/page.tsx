import 'css/prism.css';
import 'katex/dist/katex.css';

import PageTitle from '@/components/PageTitle';
import { components } from '@/components/MDXComponents';
import { MDXLayoutRenderer } from '@/components/MDXLayoutRenderer';
import { notFound } from 'next/navigation';
import PostSimple from '@/layouts/PostSimple';
import PostLayout from '@/layouts/PostLayout';
import PostBanner from '@/layouts/PostBanner';
import { Metadata } from 'next';
import siteMetadata from '@/data/siteMetadata';

const defaultLayout = 'PostLayout';
const layouts = {
  PostSimple,
  PostLayout,
  PostBanner,
};

export async function generateMetadata(props: {
  params: Promise<{ slug: string[] }>
}): Promise<Metadata | undefined> {
  const params = await props.params;
  const slug = decodeURI(params.slug.join('/'));
  // Fetch post data from your own data source
  const post = {}; // Replace with actual post fetching logic
  if (!post) {
    return;
  }

  const publishedAt = new Date(post.date).toISOString();
  const modifiedAt = new Date(post.lastmod || post.date).toISOString();
  let imageList = [siteMetadata.socialBanner];
  if (post.images) {
    imageList = typeof post.images === 'string' ? [post.images] : post.images;
  }
  const ogImages = imageList.map((img) => {
    return {
      url: img,
      width: 800,
      height: 600,
      alt: post.title,
    };
  });

  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      url: `${siteMetadata.siteUrl}/blog/${slug}`,
      type: 'article',
      publishedTime: publishedAt,
      modifiedTime: modifiedAt,
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
      images: ogImages,
    },
  };
}

export const generateStaticParams = async () => {
  // Replace with actual logic to get all slugs
  const allSlugs = []; // Replace with actual slugs fetching logic
  return allSlugs.map((slug) => ({ slug: slug.split('/').map((name) => decodeURI(name)) }));
};

export default async function Page(props: { params: Promise<{ slug: string[] }> }) {
  const params = await props.params;
  const slug = decodeURI(params.slug.join('/'));
  // Fetch post data from your own data source
  const post = {}; // Replace with actual post fetching logic
  if (!post) {
    return notFound();
  }

  const prev = {}; // Replace with actual previous post fetching logic
  const next = {}; // Replace with actual next post fetching logic
  const mainContent = {}; // Replace with actual main content fetching logic
  const jsonLd = {}; // Replace with actual JSON-LD fetching logic

  const Layout = layouts[post.layout || defaultLayout];

  return (
    <Layout content={mainContent} next={next} prev={prev}>
      <MDXLayoutRenderer layout={post.layout || defaultLayout} mdxSource={post.body.code} components={components} />
    </Layout>
  );
}
