import nextMDX from "@next/mdx";
import path from "path";
// Remark plugins
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeFigure from "rehype-figure";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import codeTitle from "remark-code-title";
import remarkDefinitionList from 'remark-definition-list';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkHint from 'remark-hint';
import remarkMath from 'remark-math';
import remarkMermaid from 'remark-mermaidjs';
import remarkPrism from 'remark-prism';
import smartypants from 'remark-smartypants';
import remarkToc from 'remark-toc';
// Rehype plugins

// next.config.mjs -- NextJS Configuration File https://nextjs.org/docs/api-reference/next.config.js/introduction
const withMDX = nextMDX({
  extension: /\.mdx?$/,
  options: {
    providerImportSource: "@mdx-js/react",
    remarkPlugins: [
        [remarkDefinitionList],
        [remarkFrontmatter],
        [remarkGfm],
        [remarkHint],
        [remarkMath],
        [
          remarkMermaid,
          {
            theme: 'dark',
            launchOptions: { executablePath: '/usr/bin/chromium-browser' },
          },
        ],
        [smartypants],
        [remarkToc],
        [codeTitle],
        [
          remarkPrism,
          {
            transformInlineCode: true,
            plugins: [
              'autolinker',
              'command-line',
              'data-uri-highlight',
              'diff-highlight',
              'inline-color',
              'keep-markup',
              'line-numbers',
              'show-invisibles',
              'treeview',
            ],
          },
        ],
      ],
      rehypePlugins: [
        [rehypeStringify],
        [rehypeKatex],
        [rehypeAutolinkHeadings],
        [rehypeFigure],
      ],
    // If you use MDXProvider, uncomment the following line.
    // providerImportSource: "@mdx-js/react",
  },
  experimental: {
    // mdxRs: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
  sassOptions: {
    includePaths: [path.join(process.cwd(), "styles")],
  },
};

export default withMDX({
  ...nextConfig,
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
});
