import Typography from '@mui/material/Typography'
import fs from 'fs'
import matter from 'gray-matter'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import path from 'path'
import readingTime from 'reading-time'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeFormat from 'rehype-format'
import rehypeKatex from 'rehype-katex'
import rehypeStringify from 'rehype-stringify'
import codeTitle from 'remark-code-title'
import remarkDefinitionList from 'remark-definition-list'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkMermaid from 'remark-mermaidjs'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import smartypants from 'remark-smartypants'
import remarkToc from 'remark-toc'
import Header from '../../components/BlogHeader'
import Hero from '../../components/Hero'
import Layout from '../../components/layouts/blog'
import type { PostData } from '../../interfaces/post'
import { BLOG_PATH, blogFilePaths } from '../../utils/mdxUtils'
const rehypeFigure = require('rehype-figure')
const rehypeInline = require('rehype-inline')
const remarkHint = require('remark-hint')
const remarkPrism = require('remark-prism')

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
  Hero,
  Typography,
  Header,
}

export default function BlogPage({ source, frontMatter, readingTime }: Props) {
  return (
    <>
      <MDXRemote {...source} components={components} lazy />
    </>
  )
}

BlogPage.getLayout = function getLayout(page: React.ReactNode) {
  return <Layout>{page}</Layout>
}

export const getStaticProps = async ({
  params,
}: {
  params: { slug: string }
}) => {
  const postFilePath = path.join(BLOG_PATH, `${params.slug}.mdx`)
  const source = fs.readFileSync(postFilePath)

  const { content, data } = matter(source)

  const mdxSource = await serialize(content, {
    // Optionally pass remark/rehype plugins
    mdxOptions: {
      remarkPlugins: [
        [remarkRehype],
        [remarkDefinitionList],
        [remarkFrontmatter],
        [remarkGfm],
        [remarkHint],
        [remarkParse],
        [remarkMath],
        [
          remarkMermaid,
          {
            theme: 'dark',
            launchOptions: { executablePath: '/usr/bin/chromium-browser' },
          },
        ],
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

export const getStaticPaths = async () => {
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
