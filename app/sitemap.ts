import type { MetadataRoute } from 'next'
import { BackendService } from '@/lib/server'
import { getConfig } from '@/lib/config'
import { getTagHref } from '@/lib/utils'

function latestPostDate(posts: Array<{ created: string; updated?: string }>): Date {
  const latest = posts.reduce((max, post) => {
    const time = new Date(post.updated || post.created).getTime()
    return Number.isFinite(time) && time > max ? time : max
  }, 0)

  return latest > 0 ? new Date(latest) : new Date('2025-01-01')
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const config = getConfig()
  const siteUrl = config.site.url

  await BackendService.ensurePreprocessed()
  const backend = BackendService.getInstance()
  const posts = await backend.getAllPosts()
  const tags = await backend.getAllTags()
  const contentLastModified = latestPostDate(posts)

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}/blog/posts/${post.slug}`,
    lastModified: new Date(post.updated || post.created),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const tagEntries: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: `${siteUrl}${getTagHref(tag)}`,
    lastModified: contentLastModified,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  return [
    {
      url: siteUrl,
      lastModified: contentLastModified,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: contentLastModified,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/blog/archive`,
      lastModified: contentLastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    ...postEntries,
    {
      url: `${siteUrl}/blog/tags`,
      lastModified: contentLastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    ...tagEntries,
    {
      url: `${siteUrl}/privacy`,
      lastModified: new Date('2025-01-01'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}
