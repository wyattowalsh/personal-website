import { Metadata } from 'next';
import { getConfig } from './config';

export function getDefaultMetadata(): Metadata {
  const config = getConfig();
  
  return {
    metadataBase: new URL(config.site.url),
    title: {
      default: config.site.title,
      template: `%s | ${config.site.title}`
    },
    description: config.site.description,
    authors: [
      {
        name: config.site.author.name,
        url: config.site.url,
      }
    ],
    creator: config.site.author.name,
    publisher: config.site.author.name,
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: config.site.url,
      title: config.site.title,
      description: config.site.description,
      siteName: config.site.title,
      images: [
        {
          url: `${config.site.url}/opengraph.png`,
          width: 1200,
          height: 630,
          alt: config.site.title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: config.site.title,
      description: config.site.description,
      creator: config.site.author.twitter,
      images: [`${config.site.url}/twitter-image.png`]
    },
    alternates: {
      canonical: config.site.url,
      types: {
        'application/rss+xml': `${config.site.url}/feed.xml`,
      }
    }
  };
}

export async function getPostMetadata(slug: string | null) {
  if (!slug) return null;

  try {
    const response = await fetch(`/api/blog/posts/${slug}`);
    if (!response.ok) return null;
    const { post } = await response.json();
    if (!post) return null;

    return {
      title: post.title,
      description: post.summary,
      openGraph: {
        title: post.title,
        description: post.summary,
        type: 'article',
        publishedTime: post.created,
        modifiedTime: post.updated,
        authors: [post.author],
        tags: post.tags
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.summary
      }
    };
  } catch (error) {
    console.error('Error fetching post metadata:', error);
    return null;
  }
}
