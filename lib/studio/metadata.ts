import type { Metadata } from 'next'
import { getConfig } from '@/lib/core'

const config = getConfig()
const studioSiteName = `Studio | ${config.site.title}`

export const defaultStudioDescription =
  'Create, share, and remix generative art with p5.js, GLSL shaders, and WebGPU compute'

export const studioNoIndexRobots: NonNullable<Metadata['robots']> = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
    noimageindex: true,
  },
}

interface CreateStudioMetadataOptions {
  path: string
  title?: string
  description?: string
  image?: string
  robots?: Metadata['robots']
  type?: 'website' | 'article'
}

function toAbsoluteUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${config.site.url}${normalizedPath}`
}

function toAbsoluteImageUrl(image: string): string {
  if (image.startsWith('https://') || image.startsWith('http://')) {
    return image
  }
  return toAbsoluteUrl(image)
}

export function createStudioMetadata({
  path,
  title,
  description = defaultStudioDescription,
  image = '/studio/opengraph-image',
  robots,
  type = 'website',
}: CreateStudioMetadataOptions): Metadata {
  const canonical = toAbsoluteUrl(path)
  const imageUrl = toAbsoluteImageUrl(image)
  const fullTitle = title ? `${title} | ${studioSiteName}` : studioSiteName
  const creator = config.site.author.twitter
    ? `@${config.site.author.twitter}`
    : undefined

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type,
      siteName: studioSiteName,
      title: fullTitle,
      description,
      url: canonical,
      images: [imageUrl],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [imageUrl],
      ...(creator && { creator }),
    },
    robots,
  }
}
