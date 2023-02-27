import createCache from '@emotion/cache'
import { CacheProvider, EmotionCache } from '@emotion/react'
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { Open_Sans } from '@next/font/google'
import 'katex/dist/katex.min.css'
import { ThemeProvider, useTheme } from 'next-themes'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import * as React from 'react'
import darkTheme from '../components/theme/dark'
import lightTheme from '../components/theme/light'
import '../styles/main.scss'
const opensans = Open_Sans({ subsets: ['latin'], preload: true })

config.autoAddCss = false

const cache = createCache({
  key: 'css',
  prepend: true,
})

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache
}

export default function App({ Component, pageProps }: MyAppProps) {
  const getLayout = Component.getLayout || ((page) => page)

  const { resolvedTheme } = useTheme()
  const [currentTheme, setCurrentTheme] = React.useState(darkTheme)

  React.useEffect(() => {
    resolvedTheme === 'light'
      ? setCurrentTheme(lightTheme)
      : setCurrentTheme(darkTheme)
  }, [resolvedTheme])

  return (
    <ThemeProvider>
      <MuiThemeProvider theme={currentTheme}>
        <CssBaseline enableColorScheme />
        <CacheProvider value={cache}>
          <Head>
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
          </Head>
          {/* <!-- Google tag (gtag.js) --> */}
          <style jsx global>{`
            html {
              font-family: ${opensans.style.fontFamily};
            }
          `}</style>
          {getLayout(<Component {...pageProps} />)}
        </CacheProvider>
      </MuiThemeProvider>
    </ThemeProvider>
  )
}
