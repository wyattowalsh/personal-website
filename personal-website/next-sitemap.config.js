/** @type {import('next-sitemap').IConfig} */
const options = {
  siteUrl: process.env.SITE_URL || 'https://w4w.dev',
  generateRobotsTxt: true, // (optional)
  // ...other options
  changefreq: 'daily',
  generateIndexSitemap: false,
}

export default options