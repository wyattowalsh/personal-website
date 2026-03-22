"use client";

import { usePathname } from 'next/navigation';
import { ShareButtons } from '@/components/ShareButtons';

/**
 * Client wrapper around ShareButtons that resolves the current page URL and title.
 */
export function PostLayoutShareButtons() {
  const pathname = usePathname();

  // Build URL from pathname (avoids SSR window access)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://w4w.dev';
  const url = `${siteUrl}${pathname}`;

  // Use document.title at render time (available client-side)
  const title = typeof document !== 'undefined' ? document.title : '';

  return (
    <ShareButtons
      url={url}
      title={title}
      className="justify-center py-4"
    />
  );
}
