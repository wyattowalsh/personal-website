import { Typography } from '@mui/material'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import Post from '../components/Post'
import Layout from '../components/layouts/content'
import type { PostType } from '../interfaces/post'
import styles from './blog.module.scss'

type Props = {
  allPosts: PostType[]
}
export default function Blog({ allPosts }: Props) {
  return (
    <Box className={styles.container}>
      <Box className={styles.Container}>
        <Typography
          variant="h1"
          sx={{ paddingTop: '1rem', paddingBottom: '1rem' }}
        >
          All Blog Posts:
        </Typography>
        <Stack spacing={2} direction="column">
          {allPosts.map((post: PostType) => (
            <Box key={post.filePath}>
              <Post {...post.data} />
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  )
}

Blog.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>
}

export { getStaticProps } from '../lib/blog'
