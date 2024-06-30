// app/layout.tsx

import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';

export const metadata = {
  title: 'Wyatt Walsh - Personal Website & Links',
  description: 'Here, you can find my various links to learn a bit about me and connect!',
  keywords: 'Wyatt Walsh, Personal Website, Links, Socials, Projects, Blogs',
  author: 'Wyatt Walsh',
  openGraph: {
    title: 'Wyatt Walsh - Personal Website & Links',
    description: 'Here, you can find my various links to learn a bit about me and connect!',
    url: 'https://www.w4w.dev',
    type: 'website',
    images: [
      {
        url: 'https://www.w4w.dev/img/icon-nobg.png',
        width: 800,
        height: 600,
        alt: 'Wyatt Walsh',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@wyattowalsh',
    title: 'Wyatt Walsh - Personal Website & Links',
    description: 'Here, you can find my various links to learn a bit about me and connect!',
    image: 'https://www.w4w.dev/img/icon-nobg.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={metadata.keywords} />
        <meta name="author" content={metadata.author} />
        <meta property="og:title" content={metadata.openGraph.title} />
        <meta property="og:description" content={metadata.openGraph.description} />
        <meta property="og:url" content={metadata.openGraph.url} />
        <meta property="og:type" content={metadata.openGraph.type} />
        <meta property="og:image" content={metadata.openGraph.images[0].url} />
        <meta property="og:image:alt" content={metadata.openGraph.images[0].alt} />
        <meta name="twitter:card" content={metadata.twitter.card} />
        <meta name="twitter:site" content={metadata.twitter.site} />
        <meta name="twitter:title" content={metadata.twitter.title} />
        <meta name="twitter:description" content={metadata.twitter.description} />
        <meta name="twitter:image" content={metadata.twitter.image} />
        <title>{metadata.title}</title>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider withGlobalStyles withNormalizeCSS>
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
