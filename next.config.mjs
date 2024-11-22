import createMDX from '@next/mdx';
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkEmoji from "remark-emoji";
import remarkCodeTitles from "remark-code-titles";
import remarkToc from "remark-toc";
// import remarkValidateLinks from "remark-validate-links";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypePrism from "rehype-prism";
import remarkCodeBlocks from "remark-code-blocks";
import remarkCodeFrontmatter from "remark-code-frontmatter";
import remarkCodeImport from "remark-code-import";
import remarkCodeScreenshot from "remark-code-screenshot";
import remarkCodesandbox from "remark-codesandbox";
import remarkCustomHeaderId from "remark-custom-header-id";
import remarkDefinitionList from "remark-definition-list";
import remarkDocx from "remark-docx";
import remarkEmbedImages from "remark-embed-images";
import remarkExtendedTable from "remark-extended-table";
import remarkFrontmatter from "remark-frontmatter";
// import remarkGitContributors from "remark-git-contributors";
// import remarkGithub from "remark-github";
import { remarkAlert } from "remark-github-blockquote-alert";
import remarkHint from "remark-hint";
import remarkOembed from "remark-oembed";
import remarkPrism from "remark-prism";
import remarkSmartypants from "remark-smartypants";
import remarkSources from "remark-sources";
import rehypeCallouts from "rehype-callouts";
import rehypeCitation from "rehype-citation";
import rehypeColorChips from "rehype-color-chips";
import rehypeInferReadingTimeMeta from "rehype-infer-reading-time-meta";
// import rehypeJargon from "rehype-jargon";
// import rehypeMathjax from "rehype-mathjax";
import rehypePrismPlus from "rehype-prism-plus";
import rehypeSemanticBlockquotes from "rehype-semantic-blockquotes";
import remarkMdxMathEnhanced from "remark-mdx-math-enhanced";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";

const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'miro.medium.com',
        pathname: '/**',
      },
    ],
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [
      remarkGfm,
      remarkMath, 
      [remarkMdxMathEnhanced, { component: 'Math' }],
      remarkEmoji,
      remarkCodeTitles,
      remarkCodeBlocks,
      remarkCodeFrontmatter,
      remarkCodeImport,
      remarkCodeScreenshot,
      remarkCodesandbox,
      remarkCustomHeaderId,
      remarkDefinitionList,
      [remarkDocx, {
        imageResolver: (src) => {
          if (src.startsWith('http')) {
            return src;
          }
          return src.startsWith('/') ? src : `/${src}`;
        }
      }],
      remarkEmbedImages,
      remarkExtendedTable,
      remarkFrontmatter,
      // remarkGitContributors,
      // remarkGithub,
      remarkAlert,
      remarkHint,
      remarkOembed,
      remarkPrism,
      remarkSmartypants,
      remarkSources,
      remarkMdxFrontmatter,
      remarkToc,
      // remarkValidateLinks,
    ],
    rehypePlugins: [
      rehypeSlug,
      rehypeAutolinkHeadings,
      rehypeKatex,
      rehypePrism,
      rehypeCallouts,
      rehypeCitation,
      rehypeColorChips,
      rehypeInferReadingTimeMeta,
      // rehypeJargon,
      // rehypeMathjax,
      [rehypePrismPlus, {
        ignoreMissing: true,
        showLineNumbers: true,
      },],
      rehypeSemanticBlockquotes,
    ],
  },
});

export default withMDX(nextConfig);
