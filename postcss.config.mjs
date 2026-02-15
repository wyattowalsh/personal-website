/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    'postcss-import': {},
    '@tailwindcss/postcss': {
      // Tailwind v4: specify config path since @config in SCSS may be stripped by preprocessor
      configPath: './tailwind.config.js',
    },
  },
};

export default config;
