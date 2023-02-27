// Layout.tsx -- main layout structure for most website pages

// -- Imports ------------------------------------------------------------------
// React & NextJS imports
// MUI imports
// Components imports
import Footer from '../Footer'
import Navbar from '../Navbar'

export default function Layout(children: any) {
  return (
    <>
      <Navbar />
      <main style={{ marginTop: '10vh' }}>{children}</main>
      <Footer />
    </>
  )
}
