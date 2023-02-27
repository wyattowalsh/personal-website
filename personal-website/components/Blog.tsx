import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Unstable_Grid2'
import type { PostType } from '../interfaces/post'
import MyCard from './MyCard'
import styles from './Projects.module.scss'

type Props = {
  allPosts: PostType[]
}

export default function Blog({ allPosts }: Props) {
  return (
    <Box className={styles.section}>
      <Typography variant="h2" className={styles.title}>
        Blog
      </Typography>
      <br />
      <Grid container spacing={{ xs: 2, md: 4 }} className={styles.projects}>
        {allPosts.map((post) => (
          <Grid key={post.filePath} xs={12} sm={8} md={6} lg={4}>
            <MyCard
              image={post.data.image}
              title={post.data.title}
              description={post.data.description}
              link={`/blog/${post.filePath.replace(/\.mdx?$/, '')}`}
              url={post.data.url}
              slug={post.data.slug}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
