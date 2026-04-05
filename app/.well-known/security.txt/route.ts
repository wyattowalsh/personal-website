import { getConfig } from '@/lib/config'

export const revalidate = 86400

export async function GET() {
  const config = getConfig()
  const siteUrl = config.site.url

  // Expires 1 year from now
  const expires = new Date()
  expires.setFullYear(expires.getFullYear() + 1)

  const body = [
    `Contact: mailto:${config.site.author.email}`,
    `Contact: https://github.com/${config.site.author.github}`,
    `Expires: ${expires.toISOString()}`,
    `Preferred-Languages: en`,
    `Canonical: ${siteUrl}/.well-known/security.txt`,
  ].join('\n')

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800',
    },
  })
}
