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

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

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

  webpack: (config, { dev, isServer }) => {

    // Add resolve configuration for third-party-capital
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve?.fallback,
        fs: false,
        path: false
      }
    };

    // Production optimizations
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 90000,
          cacheGroups: {
            default: false,
            vendors: false,
            framework: {
              chunks: 'all',
              name: 'framework',
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|next|@next|framer-motion)[\\/]/,
              priority: 40,
              enforce: true,
              reuseExistingChunk: true
            },
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name(module) {
                const match = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
                return match ? `npm.${match[1].replace('@', '')}` : 'lib';
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true
            }
          }
        }
      }
    }

    return config
  },

  // Update Sass options at the root level
  sassOptions: {
    api: 'modern', // Use modern Sass API
    outputStyle: 'compressed',
  },

  experimental: {
    mdxRs: false,
    serverActions: {
      enabled: true
    },
    typedRoutes: true,
    optimizeCss: true,
    // esmExternals: 'loose',
  }
}

// Set up MDX configuration
const withMDX = createMDX({
  options: {
    format: 'mdx',
    remarkPlugins: [
      // Keep existing plugins but reorder them
      remarkFrontmatter,
      remarkMdxFrontmatter,
      remarkGfm,
      remarkMath,
      remarkEmoji,
      remarkCodeBlocks,
      remarkCodeFrontmatter,
      remarkCodeImport,
      remarkCodeScreenshot,
      remarkCodesandbox,
      remarkCustomHeaderId,
      remarkDefinitionList,
      [remarkDocx, { imageResolver: (src) => src.startsWith('http') ? src : src.startsWith('/') ? src : `/${src}` }],
      remarkEmbedImages,
      remarkExtendedTable,
      remarkAlert,
      remarkHint,
      remarkOembed,
      remarkSmartypants,
      remarkSources,
      remarkToc
    ],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: 'append' }],
      rehypeKatex,
      rehypeCallouts,
      rehypeCitation,
      rehypeColorChips,
      rehypeInferReadingTimeMeta,
      [rehypePrismPlus, { ignoreMissing: true, showLineNumbers: true }],
      rehypeSemanticBlockquotes
    ]
  }
})

// Initialize bundle analyzer
const withBundleAnalytics = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
})

// Compose and export config
export default withBundleAnalytics(withMDX(nextConfig))