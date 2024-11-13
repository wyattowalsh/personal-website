import 'remark-github-blockquote-alert/alert.css';

import { Space_Grotesk } from 'next/font/google';
import { Metadata } from 'next';
import siteMetadata from '@/data/siteMetadata';
import { ThemeProviders } from './theme-providers';
import "./globals.scss";

// Import shadcn/ui components
import { Container, Header, Footer, Main } from 'shadcn/ui';

const space_grotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.siteUrl),
  title: {
    default: siteMetadata.title,
    template: `%s | ${siteMetadata.title}`,
  },
  description: siteMetadata.description,
  openGraph: {
    title: siteMetadata.title,
    description: siteMetadata.description,
    url: siteMetadata.siteUrl,
    siteName: siteMetadata.title,
    images: [
      {
        url: siteMetadata.socialBanner,
        width: 800,
        height: 600,
        alt: siteMetadata.title,
      },
    ],
    type: 'website',
  },
  alternates: {
    canonical: './',
  },
  robots: {
    index: true,
    follow: true,
  },
  twitter: {
    title: siteMetadata.title,
    card: 'summary_large_image',
    images: [siteMetadata.socialBanner],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const basePath = process.env.BASE_PATH || '';

  return (
    <html lang="en" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-display">
      <body className={`${space_grotesk.variable} font-sans`}>
        <ThemeProviders>
          <Container>
            <Header />
            <Main>{children}</Main>
            <Footer />
          </Container>
        </ThemeProviders>
      </body>
    </html>
  );
}
