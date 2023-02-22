import createCache from '@emotion/cache'
import { CacheProvider, EmotionCache } from '@emotion/react'
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import { PaletteMode } from '@mui/material'
import { Open_Sans } from '@next/font/google'
import type { AppProps } from 'next/app'
import Script from 'next/script'

const opensans = Open_Sans({ subsets: ['latin'], preload: true })

import '../styles/main.scss'

config.autoAddCss = false

const cache = createCache({
  key: 'css',
  prepend: true,
})

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache
  themeSetting: PaletteMode
}

export default function App({ Component, pageProps }: MyAppProps) {
  const getLayout = Component.getLayout || ((page) => page)

  return (
    <>
      {/* <!-- Google tag (gtag.js) --> */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-17PRGFZN0C"
        strategy="afterInteractive"
      />
      <Script src="/scripts/gtag.js" strategy="afterInteractive" />
      <style jsx global>{`
        html {
          font-family: ${opensans.style.fontFamily};
        }
      `}</style>
      <CacheProvider value={cache}>
        {getLayout(<Component {...pageProps} />)}
      </CacheProvider>
    </>
  )
}
