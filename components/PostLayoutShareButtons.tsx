"use client";

import { ShareButtons } from '@/components/ShareButtons';

interface PostLayoutShareButtonsProps {
  slug: string;
  title: string;
}

export function PostLayoutShareButtons({ slug, title }: PostLayoutShareButtonsProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://w4w.dev';
  const url = `${siteUrl}/blog/posts/${slug}`;

  return (
    <ShareButtons
      url={url}
      title={title}
      className="justify-center py-4"
    />
  );
}
