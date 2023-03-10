import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import fs from 'fs'
import matter from 'gray-matter'
import langPython from 'highlight.js/lib/languages/python'
import { GetStaticPaths } from 'next'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import path from 'path'
import * as React from 'react'
import readingTime from 'reading-time'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeHighlight from 'rehype-highlight'
import rehypeKatex from 'rehype-katex'
import rehypeStringify from 'rehype-stringify'
import codeTitle from 'remark-code-title'
import remarkDefinitionList from 'remark-definition-list'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkMermaid from 'remark-mermaidjs'
import smartypants from 'remark-smartypants'
import remarkToc from 'remark-toc'
import Header from '../../components/BlogHeader'
import Hero from '../../components/Hero'
import Layout from '../../components/layouts/content'
import type { ProjectData } from '../../interfaces/project'
import { PROJECTS_PATH, projectFilePaths } from '../../lib/projects'
const rehypeFigure = require('rehype-figure')
const remarkHint = require('remark-hint')

type Props = {
  source: MDXRemoteSerializeResult
  frontMatter: ProjectData
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

export default function ProjectPage({
  source,
  frontMatter,
  readingTime,
}: Props) {
  return (
    <>
      <Box className={styles.container}>
        <MDXRemote {...source} components={components} lazy />
      </Box>
    </>
  )
}

ProjectPage.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>
}

export const getStaticProps = async ({
  params,
}: {
  params: { slug: string }
}) => {
  const postFilePath = path.join(PROJECTS_PATH, `${params.slug}.mdx`)
  const source = fs.readFileSync(postFilePath)

  const { content, data } = matter(source)

  const mdxSource = await serialize(content, {
    // Optionally pass remark/rehype plugins
    mdxOptions: {
      remarkPlugins: [
        [remarkDefinitionList],
        [remarkFrontmatter],
        [remarkGfm],
        [require('remark-hint')],
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
        [require('remark-prism')],
      ],
      rehypePlugins: [
        [rehypeStringify],
        [rehypeKatex],
        [rehypeAutolinkHeadings],
        [require('rehype-figure')],
        [
          rehypeHighlight,
          {
            languages: {
              python: langPython,
            },
          },
        ],
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
  const paths = projectFilePaths
    // Remove file extensions for page paths
    .map((path) => path.replace(/\.mdx?$/, ''))
    // Map the path into the static paths object required by Next.js
    .map((slug) => ({ params: { slug } }))

  return {
    paths,
    fallback: false,
  }
}
