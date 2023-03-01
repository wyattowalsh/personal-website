import { Typography } from '@mui/material'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'

import * as React from 'react'
import Post from '../components/Post'
import Layout from '../components/layouts/blog'
import type { ProjectType } from '../interfaces/project'
import styles from './blog.module.scss'

type Props = {
  allProjects: ProjectType[]
}
export default function Projects({ allProjects }: Props) {
  return (
    <Box className={styles.Container}>
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
  )
}

Projects.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>
}

export { getStaticProps } from '../lib/projects'
