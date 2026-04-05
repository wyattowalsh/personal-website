import { getConfig } from '@/lib/config'

export const revalidate = 86400

export async function GET() {
  const config = getConfig()
  const siteUrl = config.site.url

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
  <ShortName>${config.site.title}</ShortName>
  <Description>Search ${config.site.title}'s blog</Description>
  <InputEncoding>UTF-8</InputEncoding>
  <OutputEncoding>UTF-8</OutputEncoding>
  <Url type="text/html" template="${siteUrl}/blog?q={searchTerms}" />
  <Url type="application/rss+xml" template="${siteUrl}/feed.xml" />
  <Image height="16" width="16" type="image/x-icon">${siteUrl}/favicon.ico</Image>
  <Image height="32" width="32" type="image/png">${siteUrl}/favicon-32x32.png</Image>
</OpenSearchDescription>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/opensearchdescription+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800',
    },
  })
}
