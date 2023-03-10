import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import fs from 'fs'
import matter from 'gray-matter'
import { GetStaticPaths } from 'next'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import Link from 'next/link'
import path from 'path'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import readingTime from 'reading-time'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeFigure from 'rehype-figure'
import rehypeKatex from 'rehype-katex'
import rehypeStringify from 'rehype-stringify'
import codeTitle from 'remark-code-title'
import remarkDefinitionList from 'remark-definition-list'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkHint from 'remark-hint'
import remarkMath from 'remark-math'
import remarkMermaid from 'remark-mermaidjs'
import remarkPrism from 'remark-prism'
import smartypants from 'remark-smartypants'
import remarkToc from 'remark-toc'
import Header from '../../components/BlogHeader'
import Layout from '../../components/layouts/blog'
import type { PostData } from '../../interfaces/post'
import { BLOG_PATH, blogFilePaths } from '../../lib/blog'
import styles from './[slug].module.scss'

type Props = {
  source: MDXRemoteSerializeResult
  frontMatter: PostData
  readingTime: {
    text: string
    minutes: number
    time: number
    words: number
  }
}

const components = {
  Typography,
  Header,
  Link,
  SyntaxHighlighter,
}

export default function BlogPage({ source, frontMatter, readingTime }: Props) {
  return (
    <>
      <Box className={styles.container}>
        <MDXRemote {...source} components={components} lazy />
      </Box>
    </>
  )
}

BlogPage.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>
}

export const getStaticProps = async ({ params }: any) => {
  const postFilePath = path.join(BLOG_PATH, `${params.slug}.mdx`)
  const source = fs.readFileSync(postFilePath)

  const { content, data } = matter(source)

  const mdxSource = await serialize(content, {
    // Optionally pass remark/rehype plugins
    mdxOptions: {
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
    },
  })

  const stats = readingTime(content)

  return {
    props: {
      source: mdxSource,
      frontMatter: data,
      readingTime: stats,
    },
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = blogFilePaths
    // Remove file extensions for page paths
    .map((path) => path.replace(/\.mdx?$/, ''))
    // Map the path into the static paths object required by Next.js
    .map((slug) => ({ params: { slug } }))

  return {
    paths,
    fallback: false,
  }
}
