// Layout.tsx -- main layout structure for most website pages

// -- Imports ------------------------------------------------------------------
// React & NextJS imports
// MUI imports

// Components imports
import Box from '@mui/material/Box'
import Footer from '../Footer'
import Navbar from '../Navbar'
import styles from './blog.module.scss'

type Props = {
  children: React.ReactNode
}

export default function Layout({ children }: Props) {
  return (
    <>
      <Box className={styles.container}>
        <Navbar />
        <Box className={styles.childrenContainer}>{children}</Box>
        <Footer />
      </Box>
    </>
  )
}
