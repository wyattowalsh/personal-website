import { Typography } from '@mui/material'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'
import * as React from 'react'
import Post from '../components/Post'
import Layout from '../components/layouts/blog'
import type { ProjectType } from '../interfaces/project'
import { PROJECTS_PATH, projectFilePaths } from '../utils/mdxUtils'
import styles from './blog.module.scss'

type Props = {
  allProjects: ProjectType[]
}
export default function Blog({ allProjects }: Props) {
  return (
    <Box className={styles.Container}>
      <Box className={styles.blog}>
        <Typography
          variant="h1"
          sx={{ paddingTop: '1rem', paddingBottom: '1rem' }}
        >
          Projects
        </Typography>
        <Typography variant="h2">All Posts:</Typography>
        <Stack spacing={2} direction="column">
          {allProjects.map((project) => (
            <Box key={project.filePath}>
              <Post {...project.data} />
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

export function getStaticProps() {
  const allProjects = projectFilePaths.map((filePath) => {
    const source = fs.readFileSync(path.join(PROJECTS_PATH, filePath))
    const { content, data } = matter(source)

    return {
      content,
      data,
      filePath,
    }
  })

  return { props: { allProjects } }
}
