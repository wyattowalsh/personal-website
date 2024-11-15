import { IConfig } from 'next-sitemap';

const config: IConfig = {
    siteUrl: 'https://w4w.dev',
    exclude: ['/favicon.icon', '/apple-icon.png', '/manifest.webmanifest', '/tags/*', '/logo.png', '/logo.webp', 'opengraph.png', 'twitter-image.png'],
    generateRobotsTxt: true,
    generateIndexSitemap: true,
    robotsTxtOptions: {
        policies: [
            {
                userAgent: '*',
                allow: '/',
            }
        ]
    }
};

export default config;