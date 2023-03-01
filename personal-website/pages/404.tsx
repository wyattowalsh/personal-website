// pages/404.js
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import styles from './404.module.scss'

export default function Custom404() {
  return (
    <Box className={styles.outerContainer}>
      <Box className={styles.innerContainer}>
        <Typography variant="h1" component="h1" className={styles.error}>
          Error 404
        </Typography>
        <Typography variant="h2" component="h2" className={styles.message}>
          Page Not Found
        </Typography>
        <Link href="/">
          <Typography variant="h3" component="h3" className={styles.link}>
            Return to site home ↬
          </Typography>
        </Link>
      </Box>
    </Box>
  )
}
