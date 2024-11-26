// next.config.mjs
import createMDX from '@next/mdx'
import withBundleAnalyzer from '@next/bundle-analyzer'

// Remark plugins
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import remarkEmoji from "remark-emoji"
import remarkCodeTitles from "remark-code-titles"
import remarkToc from "remark-toc"
import remarkCodeBlocks from "remark-code-blocks"
import remarkCodeFrontmatter from "remark-code-frontmatter"
import remarkCodeImport from "remark-code-import"
import remarkCodeScreenshot from "remark-code-screenshot"
import remarkCodesandbox from "remark-codesandbox"
import remarkCustomHeaderId from "remark-custom-header-id"
import remarkDefinitionList from "remark-definition-list"
import remarkDocx from "remark-docx"
import remarkEmbedImages from "remark-embed-images"
import remarkExtendedTable from "remark-extended-table"
import remarkFrontmatter from "remark-frontmatter"
import { remarkAlert } from "remark-github-blockquote-alert"
import remarkHint from "remark-hint"
import remarkOembed from "remark-oembed"
import remarkSmartypants from "remark-smartypants"
import remarkSources from "remark-sources"
import remarkMdxMathEnhanced from "remark-mdx-math-enhanced"
import remarkMdxFrontmatter from "remark-mdx-frontmatter"

// Rehype plugins
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeKatex from "rehype-katex"
import rehypeCallouts from "rehype-callouts"
import rehypeCitation from "rehype-citation"
import rehypeColorChips from "rehype-color-chips"
import rehypeInferReadingTimeMeta from "rehype-infer-reading-time-meta"
import rehypePrismPlus from "rehype-prism-plus"
import rehypeSemanticBlockquotes from "rehype-semantic-blockquotes"

const withBundleAnalytics = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  
  // Enhanced image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // Feed/RSS rewrites with cache headers
  async rewrites() {
    return [
      {
        source: '/feed',
        destination: '/feed.xml',
        has: [{
          type: 'header',
          key: 'Accept',
          value: '(text/xml|application/xml|application/rss\\+xml)',
        }],
      },
      {
        source: '/rss',
        destination: '/feed.xml',
      },
      {
        source: '/rss.xml',
        destination: '/feed.xml',
      }
    ]
  },

  // Enhanced headers
  async headers() {
    return [
      {
        source: '/feed.xml',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/xml',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ]
  },

  // Webpack optimization
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups.styles = {
        name: 'styles',
        test: /\.(css|scss)$/,
        chunks: 'all',
        enforce: true,
      }
    }
    return config
  },
}

const withMDX = createMDX({
  options: {
    remarkPlugins: [
      remarkGfm,
      remarkMath,
      [remarkMdxMathEnhanced, { 
        component: 'Math',
        numbering: 'auto',
        labelTemplate: 'eq'
      }],
      remarkEmoji,
      remarkCodeBlocks,
      remarkCodeFrontmatter,
      remarkCodeImport,
      remarkCodeScreenshot,
      remarkCodesandbox,
      remarkCustomHeaderId,
      remarkDefinitionList,
      [remarkDocx, {
        imageResolver: (src) => {
          if (src.startsWith('http')) return src
          return src.startsWith('/') ? src : `/${src}`
        }
      }],
      remarkEmbedImages,
      remarkExtendedTable,
      remarkFrontmatter,
      remarkAlert,
      remarkHint,
      remarkOembed,
      remarkSmartypants,
      remarkSources,
      remarkMdxFrontmatter,
      remarkToc,
    ],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, {
        behavior: 'append',
        properties: {
          className: [
            'anchor-link',
            'opacity-0',
            'absolute',
            'right-0',
            'top-1/2',
            '-translate-y-1/2',
            'w-6',
            'h-6',
            'flex',
            'items-center',
            'justify-center',
            'rounded-md',
            'transition-all',
            'duration-200',
            'ease-in-out',
            'group-hover:opacity-100',
            'hover:text-primary',
            'hover:scale-125',
            'hover:bg-primary/10', 
            'dark:hover:bg-primary/20',
            'focus:outline-none',
            'focus:ring-2',
            'focus:ring-primary/20',
            'active:scale-95'
          ],
          ariaLabel: 'Direct link to heading',
          tabIndex: 0,
        },
        content: {
          type: 'element',
          tagName: 'span',
          properties: { 
            className: ['anchor-icon', 'relative']
          },
          children: [{
            type: 'element',
            tagName: 'svg',
            properties: {
              xmlns: 'http://www.w3.org/2000/svg',
              width: 16,
              height: 16,
              fill: 'none', 
              stroke: 'currentColor',
              strokeWidth: 2,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              className: [
                'transition-transform',
                'duration-200',
                'ease-out',
                'hover:stroke-width-3',
                'group-hover:animate-pulse'
              ],
              viewBox: '0 0 24 24'
            },
            children: [{
              type: 'element',
              tagName: 'path',
              properties: {
                d: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71',
              }
            }, {
              type: 'element',
              tagName: 'path',
              properties: {
                d: 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
              }
            }]
          }]
        }
      }],
      rehypeKatex,
      rehypeCallouts,
      rehypeCitation,
      rehypeColorChips,
      rehypeInferReadingTimeMeta,
      [rehypePrismPlus, {
        ignoreMissing: true,
        showLineNumbers: true,
      }],
      rehypeSemanticBlockquotes,
    ],
    format: 'mdx',
  },
})

// Compose configurations
export default withBundleAnalytics(withMDX({
  ...nextConfig,
  // Enable experimental features
  experimental: {
    mdxRs: true,
    serverActions: true
  }
}))