import { faMedium } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import fs from 'fs'
import matter from 'gray-matter'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import Head from 'next/head'
import Image from 'next/image'
import path from 'path'
import Layout from '../../components/Layout'
import Post from '../../interfaces/post'
import { BLOG_PATH, blogFilePaths } from '../../utils/mdxUtils'
import styles from './[slug].module.scss'

type Props = {
  source: MDXRemoteSerializeResult
  frontMatter: Post
}

export default function BlogPage({ source, frontMatter }: Props) {
  return (
    <>
      <Head>
        <title>Wyatt Walsh&#39;s Blog | {frontMatter.title}</title>
        <meta
          name="description"
          content="Welcome to my personal website, which hosts my projects, blog, and notes."
        />
        <meta
          property="og:description"
          content="Welcome to my personal website, which hosts my projects, blog, and notes."
        />
        <meta property="og:image" content="/img/logo.webp" />
      </Head>
      <Box sx={{ maxWidth: '70%' }} className={styles.main}>
        <h1>
          {frontMatter.title} &nbsp;
          <a href={frontMatter.url} target="_blank" rel="noopener noreferrer">
            <Tooltip title="See the post on Medium" arrow>
              <a href={frontMatter.url} target="_blank" rel="noreferrer">
                <FontAwesomeIcon
                  icon={faMedium}
                  className={styles.social}
                  color="#000000"
                />
              </a>
            </Tooltip>
          </a>
        </h1>
        <Box sx={{ overflow: 'hidden' }}>
          <Image
            src={frontMatter.image}
            alt={frontMatter.title}
            width={350}
            height={350}
            sizes="(min-width: 768px) 80px, 60px"
            style={{
              width: '100%',
              height: 'auto',
            }}
          />
        </Box>
        <MDXRemote {...source} />
      </Box>
    </>
  )
}

BlogPage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>
}

type Params = {
  params: Post
}

export const getStaticProps = async ({ params }: Params) => {
  const blogFilePath = path.join(BLOG_PATH, `${params.slug}.mdx`)
  const source = fs.readFileSync(blogFilePath)

  const { content, data } = matter(source)

  const mdxSource = await serialize(content, {
    // Optionally pass remark/rehype plugins
    mdxOptions: {
      remarkPlugins: [],
      rehypePlugins: [],
    },
    scope: data,
  })

  return {
    props: {
      source: mdxSource,
      frontMatter: data,
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
