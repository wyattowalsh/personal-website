const path = require('path');

// next.config.js -- NextJS Configuration File https://nextjs.org/docs/api-reference/next.config.js/introduction
const mdxConfig = {
  extension: /.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
    // If you use MDXProvider, uncomment the following line.
    // providerImportSource: "@mdx-js/react",
  },
};

const withMDX = require("@next/mdx")(mdxConfig);

/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  webpack: (config, {isServer}) => {
    config.resolve.fallback = { fs: false, path: false };
    if (isServer) {
      require('./scripts/generate-sitemap')
    }
    return config;
  },
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
}

module.exports = withMDX(nextConfig)