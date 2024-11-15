import withMDX from "@next/mdx";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkAdmonitions from "remark-admonitions";
import remarkEmoji from "remark-emoji";
import remarkCodeTitles from "remark-code-titles";
import remarkToc from "remark-toc";
import remarkValidateLinks from "remark-validate-links";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypePrism from "rehype-prism";
import remarkCodeBlocks from "remark-code-blocks";
import remarkCodeFrontmatter from "remark-code-frontmatter";
import remarkCodeImport from "remark-code-import";
import remarkCodeScreenshot from "remark-code-screenshot";
import remarkCodesandbox from "remark-codesandbox";
import remarkCollapse from "remark-collapse";
import remarkContributors from "remark-contributors";
import remarkCustomHeaderId from "remark-custom-header-id";
import remarkDefinitionList from "remark-definition-list";
import remarkDocx from "remark-docx";
import remarkEmbedImages from "remark-embed-images";
import remarkExtendedTable from "remark-extended-table";
import remarkFrontmatter from "remark-frontmatter";
import remarkGitContributors from "remark-git-contributors";
import remarkGithub from "remark-github";
import { remarkAlert } from "remark-github-blockquote-alert";
import remarkHint from "remark-hint";
import remarkOembed from "remark-oembed";
import remarkPrism from "remark-prism";
import remarkSmartypants from "remark-smartypants";
import remarkSources from "remark-sources";
import remarkUsage from "remark-usage";
import rehypeCallouts from "rehype-callouts";
import rehypeCitation from "rehype-citation";
import rehypeColorChips from "rehype-color-chips";
import rehypeInferReadingTimeMeta from "rehype-infer-reading-time-meta";
import rehypeJargon from "rehype-jargon";
import rehypeMathjax from "rehype-mathjax";
import rehypePrismPlus from "rehype-prism-plus";
import rehypeSemanticBlockquotes from "rehype-semantic-blockquotes";
import rehypeSortTailwindClasses from "rehype-sort-tailwind-classes";
import remarkMdxMathEnhanced from "remark-mdx-math-enhanced";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";

export default {
  experimental: {
    mdxRs: true,
  },
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  // ...other configurations...
};
