// LinksLayout.tsx -- layout structure for links page

// -- Imports ------------------------------------------------------------------
// React & NextJS imports
// MUI imports
import CssBaseline from '@mui/material/CssBaseline'
import {
  ThemeProvider,
  createTheme,
  responsiveFontSizes,
} from '@mui/material/styles'
// Components imports
import Head from 'next/head'

let theme = createTheme({
  typography: {
    h1: {
      fontSize: '1.5rem',
      fontFamily: '"Ubuntu Mono"',
      fontWeight: 900,
    },
    h2: {
      fontSize: '1.25rem',
      fontFamily: '"Ubuntu Mono"',
      fontWeight: 900,
    },
  },
})
theme = responsiveFontSizes(theme, {
  breakpoints: ['xs', 'sm', 'md', 'lg', 'xl'],
  factor: 1,
})

export default function Layout(children: any) {
  return (
    <>
      <Head>
        <title>Wyatt Walsh&apos;s Links</title>
        <meta
          name="description"
          content="Wyatt Walsh's links to online profiles"
        />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link rel="icon" href="/favicon/favicon.ico" />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <main>{children}</main>
      </ThemeProvider>
    </>
  )
}
