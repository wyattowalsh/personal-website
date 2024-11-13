import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';
import typography from '@tailwindcss/typography';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{md,mdx,js,jsx,ts,tsx}',
    './components/**/*.{md,mdx,js,jsx,ts,tsx}',
    './app/**/*.{md,mdx,js,jsx,ts,tsx}',
    './posts/**/*.{md,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6a9fb5',
        secondary: '#ff9a9e',
      },
      fontFamily: {
        sans: ['Fira Code', ...fontFamily.sans],
      },
    },
  },
  plugins: [typography],
};

export default config;
