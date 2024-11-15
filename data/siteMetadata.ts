/** @type {import("pliny/config").PlinyConfig } */
const siteMetadata = {
  title: 'w4w.dev personal web app',
  author: 'Wyatt Walsh',
  headerTitle: 'w4w.dev',
  description: "Wyatt's social links, blog, and other web stuff.",
  language: 'en-us',
  theme: 'system', // system, dark or light
  siteUrl: 'https://w4w.dev',
  siteRepo: 'https://github.com/wyattowalsh/personal-website',
  siteLogo: `${process.env.BASE_PATH || ''}/logo.png`,
  socialBanner: `${process.env.BASE_PATH || ''}/logo.png`,
//   mastodon: 'https://mastodon.social/@mastodonuser',
  email: 'mail@w4w.dev',
  github: 'https://github.com/wyattowalsh',
  x: 'https://x.com/wyattowaslh',
//   facebook: 'https://facebook.com',
//   youtube: 'https://youtube.com',
  linkedin: 'https://www.linkedin.com/in/wyattowalsh',
  threads: 'https://www.threads.net/@wyattowalsh',
  instagram: 'https://www.instagram.com/wyattowalsh',
  medium: 'https://medium.com/@wyattowalsh',
  bluesky: 'https://bsky.app/profile/wyattowalsh.bsky.social',
  reddit: 'https://www.reddit.com/user/w4wdev',
  locale: 'en-US',
  // set to true if you want a navbar fixed to the top
  stickyNav: false,
  analytics: {
    // If you want to use an analytics provider you have to add it to the
    // content security policy in the `next.config.js` file.
    // supports Plausible, Simple Analytics, Umami, Posthog or Google Analytics.
    // umamiAnalytics: {
    //   // We use an env variable for this site to avoid other users cloning our analytics ID
    //   umamiWebsiteId: process.env.NEXT_UMAMI_ID, // e.g. 123e4567-e89b-12d3-a456-426614174000
      // You may also need to overwrite the script if you're storing data in the US - ex:
      // src: 'https://us.umami.is/script.js'
      // Remember to add 'us.umami.is' in `next.config.js` as a permitted domain for the CSP
    },
    // plausibleAnalytics: {
    //   plausibleDataDomain: '', // e.g. tailwind-nextjs-starter-blog.vercel.app
    // If you are hosting your own Plausible.
    //   src: '', // e.g. https://plausible.my-domain.com/js/script.js
    // },
    // simpleAnalytics: {},
    // posthogAnalytics: {
    //   posthogProjectApiKey: '', // e.g. 123e4567-e89b-12d3-a456-426614174000
    // },
    // googleAnalytics: {
    //   googleAnalyticsId: '', // e.g. G-XXXXXXX
    // },
  },
//   newsletter: {
//     // supports mailchimp, buttondown, convertkit, klaviyo, revue, emailoctopus, beehive
//     // Please add your .env file and modify it according to your selection
//     provider: 'buttondown',
//   },
  comments: {
    // If you want to use an analytics provider you have to add it to the
    // content security policy in the `next.config.js` file.
    // Select a provider and use the environment variables associated to it
    // https://vercel.com/docs/environment-variables
    provider: 'giscus', // supported providers: giscus, utterances, disqus
    giscusConfig: {
      // Visit the link below, and follow the steps in the 'configuration' section
      // https://giscus.app/
      repo: 'wyattowalsh/personal-website',
      repositoryId: 'MDEwOlJlcG9zaXRvcnkxNTgxOTI2MDk=',
      category: 'General',
      categoryId: 'DIC_kwDOCW3T4c4CkPJr',
      mapping: 'pathname', // supported options: pathname, url, title
      reactions: '1', // Emoji reactions: 1 = enable / 0 = disable
      // Send discussion metadata periodically to the parent window: 1 = enable / 0 = disable
      metadata: '1',
      // theme example: light, dark, dark_dimmed, dark_high_contrast
      // transparent_dark, preferred_color_scheme, custom
      theme: 'custom',
      // theme when dark mode
      darkTheme: 'custom',
      // If the theme option above is set to 'custom`
      // please provide a link below to your custom theme css file.
      // example: https://giscus.app/themes/custom_example.css
      themeURL: 'https://raw.githubusercontent.com/wyattowalsh/personal-website/refs/heads/master/public/giscus.css',
      // This corresponds to the `data-lang="en"` in giscus's configurations
      lang: 'en',
    },
  },
//   search: {
//     provider: 'kbar', // kbar or algolia
//     kbarConfig: {
//       searchDocumentsPath: `${process.env.BASE_PATH || ''}/search.json`, // path to load documents to search
//     },
//     // provider: 'algolia',
//     // algoliaConfig: {
//     //   // The application ID provided by Algolia
//     //   appId: 'R2IYF7ETH7',
//     //   // Public API key: it is safe to commit it
//     //   apiKey: '599cec31baffa4868cae4e79f180729b',
//     //   indexName: 'docsearch',
//     // },
//   },
};


module.exports = siteMetadata