// Layout.tsx -- main layout structure for most website pages

// -- Imports ------------------------------------------------------------------
// React & NextJS imports
// MUI imports
// Components imports
import Footer from '../Footer'
import Navbar from '../Navbar'

type Props = {
  children: React.ReactNode
}

export default function Layout({ children }: Props) {
  return (
    <>
      <Navbar />
      <body style={{ paddingTop: '10vh' }}>{children}</body>
      <Footer />
    </>
  )
}
