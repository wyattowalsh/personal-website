import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Unstable_Grid2'
import type { ProjectType } from '../interfaces/project'
import MyCard from './ProjectCard'
import styles from './Projects.module.scss'

type Props = {
  allProjects: ProjectType[]
}

export default function Projects({ allProjects }: Props) {
  return (
    <Box className={styles.section}>
      <Typography variant="h2" className={styles.title}>
        Projects
      </Typography>
      <br />
      <Grid container spacing={{ xs: 2, md: 4 }} className={styles.projects}>
        {allProjects.map((proj) => (
          <Grid key={proj.filePath} xs={12} sm={8} md={6} lg={4}>
            <MyCard
              image={proj.data.image}
              title={proj.data.title}
              link={`/projects/${proj.filePath.replace(/\.mdx?$/, '')}`}
              description={proj.data.description}
              url={proj.data.url}
              slug={proj.data.slug}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
