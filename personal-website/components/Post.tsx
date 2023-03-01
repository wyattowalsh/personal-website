import { faMedium } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import type { PostData } from '../interfaces/post'
import styles from './Post.module.scss'

export default function Post(Post: PostData) {
  return (
    <Link href={`/blog/${Post.slug}`}>
      <Box className={styles.post}>
        <Box className={styles.title}>
          <Typography variant="h6">{Post.title}</Typography>
        </Box>
        <Box className={styles.description}>
          <Typography variant="body1">{Post.description}</Typography>
        </Box>
        <Box className={styles.date}>
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
          <Typography variant="body2">
            <b>Date Written: </b>
            {Post.date}
          </Typography>
        </Box>
      </Box>
    </Link>
  )
}
