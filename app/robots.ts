import type { MetadataRoute } from 'next'
import { getConfig } from '@/lib/core'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getConfig().site.url

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
