// next.config.mjs
import createMDX from '@next/mdx'
import withBundleAnalyzer from '@next/bundle-analyzer'

const isDev = process.env.NODE_ENV !== 'production'

/** @returns {string | null} */
function getLinkRewriteDestination() {
  const rawTarget = process.env.LINK_REWRITE_TARGET?.trim()
  if (!rawTarget) return null

  try {
    const targetUrl = new URL(rawTarget)
    if (!['http:', 'https:'].includes(targetUrl.protocol)) return null

    const basePath = targetUrl.pathname === '/' ? '' : targetUrl.pathname.replace(/\/$/, '')
    return `${targetUrl.origin}${basePath}/l/:path*`
  } catch {
    return null
  }
}

const linkRewriteDestination = getLinkRewriteDestination()

// CSP builder — shared directives defined once, per-route overrides via extraScriptSrc
function buildCsp(extraCdnSrc = '', extraConnectSrc = '', frameAncestors = "'none'") {
  const scriptSrc = [
    "'self'", "'unsafe-inline'", "'wasm-unsafe-eval'",
    'https://giscus.app', 'https://www.googletagmanager.com',
    'https://www.google-analytics.com', 'https://*.sentry.io',
    'https://va.vercel-scripts.com',
    ...(extraCdnSrc ? [extraCdnSrc] : []),
  ].join(' ')

  const styleSrc = [
    "'self'", "'unsafe-inline'",
    ...(extraCdnSrc ? [extraCdnSrc] : []),
  ].join(' ')

  const connectSrc = [
    "'self'", 'https://giscus.app',
    'https://www.google-analytics.com', 'https://*.google-analytics.com',
    'https://*.analytics.google.com', 'https://vitals.vercel-insights.com',
    'https://*.sentry.io', 'https://va.vercel-scripts.com',
    'https://github.com', 'https://accounts.google.com',
    ...(extraCdnSrc ? [extraCdnSrc] : []),
    ...(extraConnectSrc ? [extraConnectSrc] : []),
  ].join(' ')

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    `style-src ${styleSrc}`,
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    `connect-src ${connectSrc}`,
    "worker-src 'self' blob:",
    "frame-src 'self' https://giscus.app",
    `frame-ancestors ${frameAncestors}`,
  ].join('; ')
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    }
    return config
  },
  async rewrites() {
    if (!linkRewriteDestination) return []

    return [
      {
        source: '/l/:path*',
        destination: linkRewriteDestination,
      },
    ]
  },
  async headers() {
    // Order matters: Next.js merges all matching routes, and for duplicate
    // header keys the LAST match wins. Put the catch-all first so that
    // more-specific studio routes override it.
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: buildCsp() },
        ],
      },
      {
        source: '/studio/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=()' },
          { key: 'Content-Security-Policy', value: buildCsp('https://cdn.jsdelivr.net', 'https://huggingface.co https://*.hf.co https://raw.githubusercontent.com https://cdn-lfs.huggingface.co', "'self'") },
        ],
      },
      {
        source: '/studio/embed/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=()' },
          { key: 'Content-Security-Policy', value: buildCsp('https://cdn.jsdelivr.net', 'https://huggingface.co https://*.hf.co https://raw.githubusercontent.com https://cdn-lfs.huggingface.co', "'self'") },
        ],
      },
    ]
  },
}

// MDX configuration with string-based plugin names for Turbopack compatibility
const withMdx = createMDX({
  extension: /\.mdx?$/,
  options: {
    // Use string-based plugin names for Turbopack serialization
    remarkPlugins: [
      ['remark-frontmatter'],
      ['remark-mdx-frontmatter'],
      ['remark-gfm'],
      ['remark-math'],
      ['remark-mdx-math-enhanced', { component: 'Math' }],
    ],
    rehypePlugins: [
      ['rehype-slug'],
      ['rehype-prism-plus'],
      ['rehype-callouts'],
    ],
  },
})

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

export default bundleAnalyzer(withMdx(nextConfig))
