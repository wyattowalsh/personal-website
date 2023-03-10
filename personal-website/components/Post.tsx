import { faMedium } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import type { PostData } from '../interfaces/post'
import styles from './Post.module.scss'

export default function Post(Post: PostData) {
  return (
    <Link href={`/blog/${Post.slug}`}>
      <Box className={styles.post}>
        <Typography variant="body2" className={styles.date}>
          Date Written:
          {Post.date}
        </Typography>
        <Box className={styles.title}>
          <Typography variant="h6">{Post.title}</Typography>
        </Box>
        <Box className={styles.description}>
          <Typography variant="body1">{Post.description}</Typography>
        </Box>
        <Divider className={styles.divider} />
        <Box className={styles.links}>
          <Link href={`/blog/${Post.slug}`} className={styles.readMore}>
            <Button
              variant="contained"
              size="large"
              className={styles.readMore}
            >
              Read More
            </Button>
          </Link>
          <Divider
            orientation="vertical"
            flexItem
            className={styles.linksDivider}
          />
          <Tooltip title="See the post on Medium" arrow>
            <Button
              href={Post.url}
              endIcon={
                <FontAwesomeIcon
                  icon={faMedium}
                  className={styles.mediumIcon}
                  color="#000000"
                />
              }
            />
          </Tooltip>
        </Box>
      </Box>
    </Link>
  )
}
