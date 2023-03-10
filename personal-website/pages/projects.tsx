import { Typography } from '@mui/material'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import * as React from 'react'
import ProjectCard from '../components/ProjectCard'
import Layout from '../components/layouts/blog'
import type { ProjectType } from '../interfaces/project'
import styles from './blog.module.scss'

type Props = {
  allProjects: ProjectType[]
}
export default function Projects({ allProjects }: Props) {
  return (
    <Box className={styles.container}>
      <Box className={styles.Container}>
        <Typography
          variant="h1"
          sx={{ paddingTop: '1rem', paddingBottom: '1rem' }}
        >
          All Projects:
        </Typography>
        <Grid container spacing={2} className={styles.projectContainer}>
          {allProjects.map((project) => (
            <Grid item key={project.filePath}>
              <ProjectCard {...project.data} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  )
}

Projects.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>
}

export { getStaticProps } from '../lib/projects'
