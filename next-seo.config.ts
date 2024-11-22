import { DefaultSeoProps } from 'next-seo';

const config: DefaultSeoProps = {
  defaultTitle: "Wyatt's Personal Website",
  titleTemplate: '%s | w4w',
  description: "Wyatt's personal web app with social links, blog, and more.",
  canonical: 'https://w4w.dev',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://w4w.dev',
    siteName: 'w4w',
    images: [
      {
        url: 'https://w4w.dev/opengraph.png',
        width: 1200,
        height: 630,
        alt: 'w4w',
      },
    ],
  },
  twitter: {
    handle: '@wyattowalsh',
    site: '@wyattowalsh',
    cardType: 'summary_large_image',
  },
  additionalLinkTags: [
    {
      rel: 'icon',
      href: '/logo.webp',
    },
    {
      rel: 'manifest',
      href: '/manifest.webmanifest',
    },
  ],
};

export default config;
