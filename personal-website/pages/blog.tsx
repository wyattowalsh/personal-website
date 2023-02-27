import { Typography } from '@mui/material'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'
import Post from '../components/Post'
import Layout from '../components/layouts/blog'
import { BLOG_PATH, blogFilePaths } from '../utils/mdxUtils'
import styles from './blog.module.scss'
export default function Blog({ allPosts }: Props) {
  return (
    <Box className={styles.Container}>
      <Box className={styles.blog}>
        <Typography
          variant="h1"
          sx={{ paddingTop: '1rem', paddingBottom: '1rem' }}
        >
          Blog
        </Typography>
        <Typography variant="h2">All Posts:</Typography>
        <Stack spacing={2} direction="column">
          {allPosts.map((post) => (
            <Box key={post.filePath}>
              <Post {...post.data} />
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  )
}

Blog.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>
}

export function getStaticProps() {
  const allPosts = blogFilePaths.map((filePath) => {
    const source = fs.readFileSync(path.join(BLOG_PATH, filePath))
    const { content, data } = matter(source)

    return {
      content,
      data,
      filePath,
    }
  })

  return { props: { allPosts } }
}
