const DEFAULT_BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://wyattowalsh.com'

export function getEmbedUrl(sketchId: string, baseUrl?: string): string {
  const base = baseUrl ?? DEFAULT_BASE_URL
  return `${base}/studio/embed/${sketchId}`
}

export function getIframeSnippet(
  sketchId: string,
  width = 400,
  height = 400,
): string {
  const url = getEmbedUrl(sketchId)
  return `<iframe src="${url}" width="${width}" height="${height}" frameborder="0" sandbox="allow-scripts" loading="lazy"></iframe>`
}

export function getMarkdownSnippet(
  sketchId: string,
  thumbnailUrl: string,
): string {
  const url = getEmbedUrl(sketchId)
  return `[![Sketch](${thumbnailUrl})](${url})`
}
