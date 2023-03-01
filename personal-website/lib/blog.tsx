import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

// POSTS_PATH is useful when you want to get the path to a specific file
export const BLOG_PATH = path.join(process.cwd(), 'blog')

// postFilePaths is the list of all mdx files inside the POSTS_PATH directory
export const blogFilePaths = fs
  .readdirSync(BLOG_PATH)
  // Only include md(x) files
  .filter((path) => /\.mdx?$/.test(path))

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
