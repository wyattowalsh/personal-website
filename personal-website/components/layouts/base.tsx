// Layout.tsx -- main layout structure for most website pages

// -- Imports ------------------------------------------------------------------
// React & NextJS imports
// MUI imports
// Components imports
import Box from '@mui/material/Box'
import Footer from '../Footer'
import Navbar from '../Navbar'

type Props = {
  children: React.ReactNode
}

export default function Layout({ children }: Props) {
  return (
    <>
      <Navbar />
      <Box sx={{}}>{children}</Box>
      <Footer />
    </>
  )
}
