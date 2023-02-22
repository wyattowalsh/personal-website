import Box from '@mui/material/Box'
import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'
import Layout from '../components/Layout'

export default function Blog({ allPosts }: Props) {
  return (
    <Box>
      {allPosts.map((post) => (
        <Box key={post.filePath}>
          <Box>{post.data.title}</Box>
          <Box>{post.data.description}</Box>
          <Box>{post.data.date}</Box>
          <Box>{post.data.url}</Box>
          <Box>{post.data.image}</Box>
        </Box>
      ))}
    </Box>
  )
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

Blog.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>
}
