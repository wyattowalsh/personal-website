import { NextRequest } from 'next/server'
import { getConfig } from '@/lib/config'

export const revalidate = 86400

export async function GET(request: NextRequest) {
  const config = getConfig()
  const siteUrl = config.site.url
  const resource = request.nextUrl.searchParams.get('resource')

  // Validate resource parameter
  const validResources = [
    `acct:wyatt@w4w.dev`,
    `acct:${config.site.author.email}`,
    siteUrl,
    `${siteUrl}/`,
  ]

  if (!resource || !validResources.includes(resource)) {
    return new Response(JSON.stringify({ error: 'Resource not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const jrd = {
    subject: `acct:wyatt@w4w.dev`,
    aliases: [siteUrl, `https://github.com/${config.site.author.github}`],
    links: [
      {
        rel: 'http://webfinger.net/rel/profile-page',
        type: 'text/html',
        href: siteUrl,
      },
      {
        rel: 'http://schemas.google.com/g/2010#updates-from',
        type: 'application/atom+xml',
        href: `${siteUrl}/feed.atom`,
      },
      {
        rel: 'self',
        type: 'application/activity+json',
        href: siteUrl,
      },
    ],
  }

  return new Response(JSON.stringify(jrd), {
    headers: {
      'Content-Type': 'application/jrd+json; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
