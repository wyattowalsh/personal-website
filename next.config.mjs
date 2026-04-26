// next.config.mjs
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import withBundleAnalyzer from '@next/bundle-analyzer'

const isDev = process.env.NODE_ENV !== 'production'
const repoRoot = path.dirname(fileURLToPath(import.meta.url))

// CSP builder
// Note: 'unsafe-inline' in script-src is required by next-themes (FOUC-prevention
// inline script) and @next/third-parties GTM/GA snippets. Removing it requires
// nonce-based CSP via Next.js middleware — tracked as a future hardening task.
// 'unsafe-inline' in style-src is required by React inline styles and Tailwind.
function buildCsp() {
  const scriptSrc = [
    "'self'", "'unsafe-inline'", "'wasm-unsafe-eval'",
    ...(isDev ? ["'unsafe-eval'"] : []),
    'https://giscus.app', 'https://www.googletagmanager.com',
    'https://www.google-analytics.com', 'https://*.sentry.io',
    'https://va.vercel-scripts.com', 'https://static.cloudflareinsights.com',
  ].join(' ')

  const connectSrc = [
    "'self'", 'https://giscus.app',
    'https://www.google-analytics.com', 'https://*.google-analytics.com',
    'https://*.analytics.google.com', 'https://vitals.vercel-insights.com',
    'https://*.sentry.io', 'https://va.vercel-scripts.com',
    'https://*.posthog.com', 'https://*.i.posthog.com',
    'https://cloudflareinsights.com',
  ].join(' ')

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    `connect-src ${connectSrc}`,
    "worker-src 'self' blob:",
    "frame-src 'self' https://giscus.app",
    "frame-ancestors 'none'",
  ].join('; ')
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 85],
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'webmention.io' },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  // Turbopack is the default bundler in Next.js 16; the webpack config below
  // is kept for compatibility when explicitly using --webpack.
  turbopack: {
    root: repoRoot,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    }
    return config
  },
  async headers() {
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
    ]
  },
}

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

export default bundleAnalyzer(nextConfig)
