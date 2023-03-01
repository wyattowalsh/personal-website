import nextMDX from "@next/mdx";
import path from "path";
// Remark plugins
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeFigure from "rehype-figure";
import rehypeFormat from "rehype-format";
import rehypeInline from "rehype-inline";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import codeTitle from "remark-code-title";
import remarkDefinitionList from "remark-definition-list";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkHint from "remark-hint";
import remarkMath from "remark-math";
import remarkMermaid from "remark-mermaidjs";
import remarkParse from "remark-parse";
import remarkPrism from "remark-prism";
import remarkRehype from "remark-rehype";
import smartypants from "remark-smartypants";
import remarkToc from "remark-toc";
// Rehype plugins

// next.config.mjs -- NextJS Configuration File https://nextjs.org/docs/api-reference/next.config.js/introduction
const withMDX = nextMDX({
  extension: /\.mdx?$/,
  options: {
    providerImportSource: "@mdx-js/react",
    remarkPlugins: [
      [remarkRehype],
      [remarkDefinitionList],
      [remarkFrontmatter],
      [remarkGfm],
      [remarkHint],
      [remarkParse],
      [remarkMath],
      [remarkMermaid],
      [remarkPrism],
      [smartypants],
      [remarkToc],
      [codeTitle],
    ],
    rehypePlugins: [
      [rehypeStringify],
      [rehypeKatex],
      [rehypeAutolinkHeadings],
      [rehypeFormat],
      [rehypeFigure],
      [rehypeInline],
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
