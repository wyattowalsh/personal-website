// Layout.tsx -- main layout structure for most website pages

// -- Imports ------------------------------------------------------------------
// React & NextJS imports
import * as React from 'react'
// MUI imports
import CssBaseline from '@mui/material/CssBaseline'
import {
  ThemeProvider,
  createTheme,
  responsiveFontSizes,
} from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
// Components imports
import Head from 'next/head'
import Footer from './Footer'
import Navbar from './Navbar'

const lightTheme = responsiveFontSizes(
  createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#6a9fb5',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#b5a76a',
      },
    },
    shape: {
      borderRadius: 4,
    },
    props: {
      MuiAppBar: {
        color: '#6a9fb5',
      },
      MuiTooltip: {
        arrow: true,
      },
    },
    typography: {
      fontFamily: 'Open Sans',
      h1: {
        fontWeight: 900,
        fontSize: '3.5rem',
      },
      htmlFontSize: 14,
      h2: {
        fontSize: '3rem',
      },
      h3: {
        fontSize: '2.5rem',
      },
      h4: {
        fontSize: '2rem',
      },
      h5: {
        fontSize: '1.5rem',
      },
      h6: {
        fontSize: '1.3rem',
      },
      body1: {
        fontWeight: 400,
      },
      body2: {
        fontWeight: 400,
      },
      button: {
        fontWeight: 600,
      },
    },
  }),
)

const darkTheme = responsiveFontSizes(
  createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#6a9fb5',
      },
      secondary: {
        main: '#b5a76a',
      },
    },
    shape: {
      borderRadius: 4,
    },
    props: {
      MuiAppBar: {
        color: '#6a9fb5',
      },
      MuiTooltip: {
        arrow: true,
      },
    },
    typography: {
      fontFamily: 'Open Sans',
      h1: {
        fontWeight: 900,
        fontSize: '3.5rem',
      },
      htmlFontSize: 14,
      h2: {
        fontSize: '3rem',
      },
      h3: {
        fontSize: '2.5rem',
      },
      h4: {
        fontSize: '2rem',
      },
      h5: {
        fontSize: '1.5rem',
      },
      h6: {
        fontSize: '1.3rem',
      },
      body1: {
        fontWeight: 300,
      },
      body2: {
        fontWeight: 400,
      },
      button: {
        fontWeight: 600,
      },
    },
  }),
)

function getActiveTheme(themeMode: 'light' | 'dark') {
  return themeMode === 'light' ? lightTheme : darkTheme
}

export default function Layout({ children }) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const [activeTheme, setActiveTheme] = React.useState(
    getActiveTheme(prefersDarkMode ? 'dark' : 'light'),
  )
  const [selectedTheme, setSelectedTheme] = React.useState<'light' | 'dark'>(
    prefersDarkMode ? 'dark' : 'light',
  )
  // const [activeTheme, setActiveTheme] = React.useState(lightTheme)
  // const [selectedTheme, setSelectedTheme] = React.useState<'light' | 'dark'>(
  //   'light',
  // )

  const toggleTheme: React.MouseEventHandler<HTMLAnchorElement> = () => {
    const desiredTheme = selectedTheme === 'light' ? 'dark' : 'light'

    setSelectedTheme(desiredTheme)
  }

  React.useEffect(() => {
    setActiveTheme(getActiveTheme(selectedTheme))
  }, [selectedTheme])

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <ThemeProvider theme={activeTheme}>
        <CssBaseline enableColorScheme />
        <Navbar />
        <main style={{ marginTop: '10vh' }}>{children}</main>
        <Footer />
      </ThemeProvider>
    </>
  )
}
